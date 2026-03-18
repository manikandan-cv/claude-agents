/**
 * JIRA Cloud API Service
 * Handles REST API calls with v3 → v2 fallback
 * Supports both Cloud and Server deployments
 */

import {
  JiraConfig,
  JiraIssue,
  JiraSearchResult,
  JiraUser,
  JiraCreateIssueInput,
  JiraUpdateIssueInput,
  JiraErrorResponse,
  CleanedIssue,
  JiraComment
} from '../types/jira.js';
import { JiraApiError } from '../utils/error-handler.js';
import { logger } from '../utils/logger.js';

export class JiraCloudApiService {
  private baseUrl: string;
  private authHeader: string;
  private preferredApiVersion: number = 3;

  constructor(config: JiraConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash

    // Build authentication header
    if (config.authType === 'bearer') {
      this.authHeader = `Bearer ${config.apiToken}`;
    } else {
      // Basic auth (default)
      const credentials = Buffer.from(`${config.userEmail}:${config.apiToken}`).toString('base64');
      this.authHeader = `Basic ${credentials}`;
    }

    logger.info('JIRA API Service initialized', {
      baseUrl: this.baseUrl,
      authType: config.authType,
      type: config.type
    });
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchJson<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    logger.debug('Fetching:', url, options.method || 'GET');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      await this.handleFetchError(response, endpoint);
    }

    const data = await response.json();
    logger.debug('Response received:', { status: response.status, endpoint });

    return data as T;
  }

  /**
   * Handle fetch errors with JIRA-specific error parsing
   */
  private async handleFetchError(response: Response, endpoint: string): Promise<never> {
    let errorData: JiraErrorResponse = {};

    try {
      errorData = await response.json();
    } catch {
      // Response body is not JSON
    }

    const message = errorData.errorMessages?.[0]
      || errorData.message
      || `HTTP ${response.status}: ${response.statusText}`;

    throw new JiraApiError(message, response.status, errorData);
  }

  /**
   * Extract plain text from Atlassian Document Format (ADF)
   */
  private extractTextContent(adf: any): string {
    if (!adf) return '';

    if (typeof adf === 'string') return adf;

    if (adf.type === 'doc' && Array.isArray(adf.content)) {
      return adf.content.map((node: any) => this.extractTextContent(node)).join('\n');
    }

    if (adf.type === 'paragraph' && Array.isArray(adf.content)) {
      return adf.content.map((node: any) => this.extractTextContent(node)).join('');
    }

    if (adf.type === 'text') {
      return adf.text || '';
    }

    if (adf.type === 'hardBreak') {
      return '\n';
    }

    if (Array.isArray(adf.content)) {
      return adf.content.map((node: any) => this.extractTextContent(node)).join('');
    }

    return '';
  }

  /**
   * Convert plain text to Atlassian Document Format (ADF)
   * Supports:
   * - User mentions: [~accountId]
   * - URLs: https://... (converted to clickable links)
   */
  private createAdfFromBody(text: string): any {
    if (!text) {
      return {
        type: 'doc',
        version: 1,
        content: []
      };
    }

    const paragraphs = text.split('\n').map(line => {
      if (!line.trim()) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: ' ' }]
        };
      }

      // Parse line for mentions and text
      const content = this.parseLineWithMentions(line);

      return {
        type: 'paragraph',
        content
      };
    });

    return {
      type: 'doc',
      version: 1,
      content: paragraphs
    };
  }

  /**
   * Parse a line of text and convert mentions and URLs to ADF nodes
   * Supports:
   * - Mentions: [~accountId], [~accountid:accountId]
   * - URLs: http://, https:// (converted to clickable links)
   */
  private parseLineWithMentions(line: string): any[] {
    const content: any[] = [];

    // Combined regex for mentions and URLs
    // Match: [~accountId], [~accountid:accountId], or http(s):// URLs
    const combinedRegex = /(\[~(?:accountid:)?([a-zA-Z0-9]+)\])|(https?:\/\/[^\s]+)/g;

    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(line)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        const textBefore = line.substring(lastIndex, match.index);
        if (textBefore) {
          content.push({
            type: 'text',
            text: textBefore
          });
        }
      }

      // Check if it's a mention or URL
      if (match[1]) {
        // It's a mention: [~accountId]
        const accountId = match[2];
        content.push({
          type: 'mention',
          attrs: {
            id: accountId,
            text: `@${accountId}`,
            accessLevel: ''
          }
        });
      } else if (match[3]) {
        // It's a URL: https://...
        const url = match[3];
        content.push({
          type: 'text',
          text: url,
          marks: [
            {
              type: 'link',
              attrs: {
                href: url
              }
            }
          ]
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < line.length) {
      const remainingText = line.substring(lastIndex);
      if (remainingText) {
        content.push({
          type: 'text',
          text: remainingText
        });
      }
    }

    // If no matches found, return plain text
    if (content.length === 0) {
      content.push({
        type: 'text',
        text: line
      });
    }

    return content;
  }

  /**
   * Clean and format JIRA issue for display
   */
  private cleanIssue(issue: JiraIssue, comments: JiraComment[] = []): CleanedIssue {
    const fields = issue.fields;

    return {
      key: issue.key,
      summary: fields.summary || '',
      description: this.extractTextContent(fields.description) || 'No description',
      status: fields.status?.name || 'Unknown',
      priority: fields.priority?.name || 'None',
      assignee: fields.assignee?.displayName || 'Unassigned',
      reporter: fields.reporter?.displayName || 'Unknown',
      created: fields.created || '',
      updated: fields.updated || '',
      issueType: fields.issuetype?.name || 'Unknown',
      project: fields.project?.name || fields.project?.key || 'Unknown',
      labels: fields.labels || [],
      comments: comments.map(comment => ({
        author: comment.author?.displayName || 'Unknown',
        body: this.extractTextContent(comment.body) || '',
        created: comment.created || ''
      }))
    };
  }

  /**
   * Search for issues using JQL
   * Uses new /rest/api/3/search/jql endpoint (Change-2046)
   * Falls back to v2 on error for older JIRA instances
   */
  async searchIssues(jql: string, maxResults: number = 50): Promise<CleanedIssue[]> {
    logger.info('Searching issues with JQL:', jql);

    let endpoint = `/rest/api/3/search/jql`;
    let tryV2Fallback = false;

    try {
      const result = await this.fetchJson<JiraSearchResult>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          jql,
          maxResults,
          fields: ['summary', 'status', 'assignee', 'reporter', 'priority', 'issuetype', 'project', 'created', 'updated', 'description', 'labels']
        })
      });

      logger.info(`Found ${result.issues.length} issues${result.nextPageToken ? ' (more results available)' : ''}`);
      return result.issues.map(issue => this.cleanIssue(issue));

    } catch (error) {
      if (error instanceof JiraApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        tryV2Fallback = true;
      } else {
        throw error;
      }
    }

    // Try v2 fallback for older JIRA instances
    if (tryV2Fallback) {
      logger.warn('API v3 /search/jql failed, trying v2 fallback');
      endpoint = `/rest/api/2/search`;

      const result = await this.fetchJson<JiraSearchResult>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          jql,
          maxResults,
          fields: ['summary', 'status', 'assignee', 'reporter', 'priority', 'issuetype', 'project', 'created', 'updated', 'description', 'labels']
        })
      });

      logger.info(`Found ${result.issues.length} issues using v2 (total: ${result.total || 'unknown'})`);
      return result.issues.map(issue => this.cleanIssue(issue));
    }

    return [];
  }

  /**
   * Get issue details with comments
   */
  async getIssueWithComments(issueIdOrKey: string): Promise<CleanedIssue> {
    logger.info('Getting issue:', issueIdOrKey);

    const endpoint = `/rest/api/3/issue/${issueIdOrKey}`;

    try {
      const issue = await this.fetchJson<JiraIssue>(endpoint, {
        method: 'GET'
      });

      // Fetch comments separately
      const commentsEndpoint = `/rest/api/3/issue/${issueIdOrKey}/comment`;
      const commentsResult = await this.fetchJson<{ comments: JiraComment[] }>(commentsEndpoint);

      return this.cleanIssue(issue, commentsResult.comments || []);

    } catch (error) {
      // Try v2 fallback
      if (error instanceof JiraApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        logger.warn('API v3 failed, trying v2 fallback');

        const v2Endpoint = `/rest/api/2/issue/${issueIdOrKey}`;
        const issue = await this.fetchJson<JiraIssue>(v2Endpoint);

        const commentsEndpoint = `/rest/api/2/issue/${issueIdOrKey}/comment`;
        const commentsResult = await this.fetchJson<{ comments: JiraComment[] }>(commentsEndpoint);

        return this.cleanIssue(issue, commentsResult.comments || []);
      }

      throw error;
    }
  }

  /**
   * Get user by email address
   * Returns accountId which is needed for assignee field
   */
  async getUserByEmail(email: string): Promise<JiraUser | null> {
    logger.info('Looking up user by email:', email);

    // Try v3 first (Cloud)
    try {
      const endpoint = `/rest/api/3/user/search?query=${encodeURIComponent(email)}`;
      const users = await this.fetchJson<JiraUser[]>(endpoint);

      const user = users.find(u => u.emailAddress?.toLowerCase() === email.toLowerCase());

      if (user) {
        logger.info('Found user:', { accountId: user.accountId, displayName: user.displayName });
        return user;
      }

    } catch (error) {
      // Try v2 fallback
      if (error instanceof JiraApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        logger.warn('API v3 failed, trying v2 fallback');

        const endpoint = `/rest/api/2/user/search?username=${encodeURIComponent(email)}`;
        const users = await this.fetchJson<JiraUser[]>(endpoint);

        const user = users.find(u => u.emailAddress?.toLowerCase() === email.toLowerCase());

        if (user) {
          logger.info('Found user (v2):', { key: user.key, displayName: user.displayName });
          return user;
        }
      } else {
        throw error;
      }
    }

    logger.warn('User not found:', email);
    return null;
  }

  /**
   * Create a new issue
   */
  async createIssue(input: JiraCreateIssueInput): Promise<CleanedIssue> {
    logger.info('Creating issue:', input);

    const fields: any = {
      project: { key: input.projectKey },
      summary: input.summary,
      issuetype: { name: input.issueType }
    };

    if (input.description) {
      fields.description = this.createAdfFromBody(input.description);
    }

    if (input.assigneeEmail) {
      const user = await this.getUserByEmail(input.assigneeEmail);
      if (user) {
        fields.assignee = { accountId: user.accountId || user.key };
      } else {
        logger.warn('Assignee not found, creating without assignee');
      }
    }

    if (input.priority) {
      fields.priority = { name: input.priority };
    }

    if (input.labels && input.labels.length > 0) {
      fields.labels = input.labels;
    }

    if (input.dueDate) {
      fields.duedate = input.dueDate;
    }

    if (input.parentKey) {
      fields.parent = { key: input.parentKey };
    }

    const endpoint = `/rest/api/3/issue`;

    try {
      const result = await this.fetchJson<{ key: string; id: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ fields })
      });

      logger.info('Issue created:', result.key);

      // Fetch the created issue to return full details
      return await this.getIssueWithComments(result.key);

    } catch (error) {
      // Try v2 fallback
      if (error instanceof JiraApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        logger.warn('API v3 failed, trying v2 fallback');

        const v2Endpoint = `/rest/api/2/issue`;
        const result = await this.fetchJson<{ key: string; id: string }>(v2Endpoint, {
          method: 'POST',
          body: JSON.stringify({ fields })
        });

        logger.info('Issue created (v2):', result.key);
        return await this.getIssueWithComments(result.key);
      }

      throw error;
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueKey: string, input: JiraUpdateIssueInput): Promise<CleanedIssue> {
    logger.info('Updating issue:', issueKey, input);

    const fields: any = {};

    if (input.summary) {
      fields.summary = input.summary;
    }

    if (input.description !== undefined) {
      fields.description = this.createAdfFromBody(input.description);
    }

    if (input.assigneeEmail) {
      const user = await this.getUserByEmail(input.assigneeEmail);
      if (user) {
        fields.assignee = { accountId: user.accountId || user.key };
      }
    }

    if (input.priority) {
      fields.priority = { name: input.priority };
    }

    if (input.labels) {
      fields.labels = input.labels;
    }

    // Handle custom fields
    Object.keys(input).forEach(key => {
      if (!['summary', 'description', 'assigneeEmail', 'priority', 'labels', 'status'].includes(key)) {
        fields[key] = input[key];
      }
    });

    const endpoint = `/rest/api/3/issue/${issueKey}`;

    try {
      await this.fetchJson(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ fields })
      });

      logger.info('Issue updated:', issueKey);

      // Fetch updated issue
      return await this.getIssueWithComments(issueKey);

    } catch (error) {
      // Try v2 fallback
      if (error instanceof JiraApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        logger.warn('API v3 failed, trying v2 fallback');

        const v2Endpoint = `/rest/api/2/issue/${issueKey}`;
        await this.fetchJson(v2Endpoint, {
          method: 'PUT',
          body: JSON.stringify({ fields })
        });

        logger.info('Issue updated (v2):', issueKey);
        return await this.getIssueWithComments(issueKey);
      }

      throw error;
    }
  }

  /**
   * Add a comment to an issue
   */
  async addCommentToIssue(issueIdOrKey: string, body: string): Promise<string> {
    logger.info('Adding comment to issue:', issueIdOrKey);

    const adfBody = this.createAdfFromBody(body);
    const endpoint = `/rest/api/3/issue/${issueIdOrKey}/comment`;

    try {
      const result = await this.fetchJson<JiraComment>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ body: adfBody })
      });

      logger.info('Comment added:', result.id);
      return `Comment added successfully (ID: ${result.id})`;

    } catch (error) {
      // Try v2 fallback
      if (error instanceof JiraApiError && (error.statusCode === 404 || error.statusCode === 400)) {
        logger.warn('API v3 failed, trying v2 fallback');

        const v2Endpoint = `/rest/api/2/issue/${issueIdOrKey}/comment`;
        const result = await this.fetchJson<JiraComment>(v2Endpoint, {
          method: 'POST',
          body: JSON.stringify({ body: adfBody })
        });

        logger.info('Comment added (v2):', result.id);
        return `Comment added successfully (ID: ${result.id})`;
      }

      throw error;
    }
  }
}
