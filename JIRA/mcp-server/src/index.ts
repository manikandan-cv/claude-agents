#!/usr/bin/env bun

/**
 * Custom JIRA MCP Server
 * Provides 6 core tools for JIRA integration via stdio transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { JiraCloudApiService } from './services/jira-cloud-api.js';
import { JiraConfig } from './types/jira.js';
import { parseJiraError, sanitizeErrorMessage } from './utils/error-handler.js';
import { logger } from './utils/logger.js';
import { formatIssueAsBox, formatIssuesList } from './utils/issue-formatter.js';

/**
 * Validate required environment variables
 */
function validateEnvironment(): JiraConfig {
  const apiToken = process.env.JIRA_API_TOKEN;
  const userEmail = process.env.JIRA_USER_EMAIL;
  const baseUrl = process.env.JIRA_BASE_URL;

  if (!apiToken) {
    throw new Error('JIRA_API_TOKEN environment variable is required');
  }

  if (!userEmail) {
    throw new Error('JIRA_USER_EMAIL environment variable is required');
  }

  if (!baseUrl) {
    throw new Error('JIRA_BASE_URL environment variable is required');
  }

  const type = (process.env.JIRA_TYPE || 'cloud') as 'cloud' | 'server';
  const authType = (process.env.JIRA_AUTH_TYPE || 'basic') as 'basic' | 'bearer';

  return {
    apiToken,
    userEmail,
    baseUrl,
    type,
    authType,
  };
}

/**
 * Main JIRA MCP Server class
 */
class JiraServer {
  private server: Server;
  private jiraService: JiraCloudApiService;

  constructor(config: JiraConfig) {
    this.server = new Server(
      {
        name: 'jira-mcp-custom',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.jiraService = new JiraCloudApiService(config);
    this.setupToolHandlers();
    this.setupErrorHandling();

    logger.info('JIRA MCP Server initialized');
  }

  /**
   * Define all available MCP tools
   */
  private getToolDefinitions(): Tool[] {
    return [
      {
        name: 'search_issues',
        description: 'Search for JIRA issues using JQL (JIRA Query Language). Returns a list of matching issues with key details. Use this for finding issues by assignee, status, date, project, or any JQL query.',
        inputSchema: {
          type: 'object',
          properties: {
            jql: {
              type: 'string',
              description: 'JQL query string. Examples:\n' +
                '- By email: assignee = "user@company.com" AND status = Open\n' +
                '- By date: updated >= 2025-07-17 (YYYY-MM-DD format)\n' +
                '- Combined: assignee = "user@company.com" AND updated >= 2025-07-17\n' +
                '- Current user: assignee = currentUser() AND resolution = Unresolved\n' +
                '- Relative dates: created >= -7d (last 7 days)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50, max: 100)',
              default: 50,
            },
          },
          required: ['jql'],
        },
      },
      {
        name: 'get_issue',
        description: 'Get detailed information about a specific JIRA issue including all fields and comments. Use the issue key (e.g., "PROJ-123") or issue ID.',
        inputSchema: {
          type: 'object',
          properties: {
            issueIdOrKey: {
              type: 'string',
              description: 'Issue key (e.g., "PROJ-123") or issue ID',
            },
          },
          required: ['issueIdOrKey'],
        },
      },
      {
        name: 'get_user_by_email',
        description: 'Look up a JIRA user by email address. Returns user details including accountId which is needed for assigning issues. Use this before creating or updating issues with an assignee.',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email address to look up',
            },
          },
          required: ['email'],
        },
      },
      {
        name: 'create_issue',
        description: 'Create a new JIRA issue in a project. Supports setting summary, description, assignee, priority, labels, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'Project key (e.g., "PROJ")',
            },
            issueType: {
              type: 'string',
              description: 'Issue type (e.g., "Bug", "Task", "Story")',
            },
            summary: {
              type: 'string',
              description: 'Issue summary/title',
            },
            description: {
              type: 'string',
              description: 'Issue description (plain text)',
            },
            assigneeEmail: {
              type: 'string',
              description: 'Email of user to assign the issue to',
            },
            priority: {
              type: 'string',
              description: 'Priority (e.g., "High", "Medium", "Low")',
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of labels to add',
            },
            dueDate: {
              type: 'string',
              description: 'Due date in YYYY-MM-DD format',
            },
            parentKey: {
              type: 'string',
              description: 'Parent issue key for subtasks',
            },
          },
          required: ['projectKey', 'issueType', 'summary'],
        },
      },
      {
        name: 'update_issue',
        description: 'Update an existing JIRA issue. Can update summary, description, assignee, priority, labels, and other fields.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: {
              type: 'string',
              description: 'Issue key to update (e.g., "PROJ-123")',
            },
            summary: {
              type: 'string',
              description: 'New summary/title',
            },
            description: {
              type: 'string',
              description: 'New description (plain text)',
            },
            assigneeEmail: {
              type: 'string',
              description: 'Email of user to assign the issue to',
            },
            priority: {
              type: 'string',
              description: 'New priority (e.g., "High", "Medium", "Low")',
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'New array of labels (replaces existing)',
            },
          },
          required: ['issueKey'],
        },
      },
      {
        name: 'add_comment',
        description: 'Add a comment to a JIRA issue. Use the issue key or ID.',
        inputSchema: {
          type: 'object',
          properties: {
            issueIdOrKey: {
              type: 'string',
              description: 'Issue key (e.g., "PROJ-123") or issue ID',
            },
            body: {
              type: 'string',
              description: 'Comment text (plain text)',
            },
          },
          required: ['issueIdOrKey', 'body'],
        },
      },
    ];
  }

  /**
   * Setup tool handlers
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info('Tool called:', name, args);

      try {
        switch (name) {
          case 'search_issues': {
            const { jql, maxResults = 50 } = args as { jql: string; maxResults?: number };
            const issues = await this.jiraService.searchIssues(jql, Math.min(maxResults, 100));

            return {
              content: [
                {
                  type: 'text',
                  text: formatIssuesList(issues),
                },
              ],
            };
          }

          case 'get_issue': {
            const { issueIdOrKey } = args as { issueIdOrKey: string };
            const issue = await this.jiraService.getIssueWithComments(issueIdOrKey);

            return {
              content: [
                {
                  type: 'text',
                  text: formatIssueAsBox(issue),
                },
              ],
            };
          }

          case 'get_user_by_email': {
            const { email } = args as { email: string };
            const user = await this.jiraService.getUserByEmail(email);

            if (!user) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `User not found: ${email}`,
                  },
                ],
                isError: true,
              };
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    accountId: user.accountId,
                    displayName: user.displayName,
                    emailAddress: user.emailAddress,
                    active: user.active,
                  }, null, 2),
                },
              ],
            };
          }

          case 'create_issue': {
            const issue = await this.jiraService.createIssue(args as any);

            return {
              content: [
                {
                  type: 'text',
                  text: formatIssueAsBox(issue),
                },
              ],
            };
          }

          case 'update_issue': {
            const { issueKey, ...updateFields } = args as any;
            const issue = await this.jiraService.updateIssue(issueKey, updateFields);

            return {
              content: [
                {
                  type: 'text',
                  text: formatIssueAsBox(issue),
                },
              ],
            };
          }

          case 'add_comment': {
            const { issueIdOrKey, body } = args as { issueIdOrKey: string; body: string };
            const result = await this.jiraService.addCommentToIssue(issueIdOrKey, body);

            return {
              content: [
                {
                  type: 'text',
                  text: result,
                },
              ],
            };
          }

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        const errorMessage = sanitizeErrorMessage(parseJiraError(error, `Error executing ${name}`));

        return {
          content: [
            {
              type: 'text',
              text: errorMessage,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      logger.error('Server error:', error);
    };

    process.on('SIGINT', async () => {
      logger.info('Shutting down JIRA MCP server');
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('JIRA MCP Server running on stdio');
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    const config = validateEnvironment();
    const server = new JiraServer(config);
    await server.run();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
