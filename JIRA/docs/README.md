# JIRA MCP Integration Documentation

Complete documentation for the custom JIRA MCP server and Claude Code skill.

## Quick Links

- **[Setup Guide](./Setup-Guide.md)** - Installation and configuration instructions
- **[MCP Architecture](./MCP-Architecture.md)** - System architecture and design
- **[Usage Examples](./Usage-Examples.md)** - Real-world usage scenarios
- **[API Reference](./API-Reference.md)** - Tool schemas and parameters
- **[Troubleshooting](./Troubleshooting.md)** - Common issues and solutions

## What's Included

This integration consists of four main components:

### 1. Custom MCP Server
Location: `../mcp-server/`

A TypeScript/Bun-based MCP server that provides six core tools for JIRA integration:
- `search_issues` - Execute JQL queries
- `get_issue` - Get issue details
- `get_user_by_email` - Look up users
- `create_issue` - Create new issues
- `update_issue` - Update existing issues
- `add_comment` - Add comments

**Transport:** stdio (local process communication)

### 2. Claude Code Skill
Location: `../skill/`

A natural language interface that converts user requests into appropriate JIRA tool calls. Includes:
- SKILL.md - Main skill instructions
- JQL conversion logic
- Date parsing
- User lookup workflows

**Trigger phrases:** "search JIRA", "find issues", "show JIRA issue", etc.

### 3. Documentation
Location: `../docs/` (this directory)

Comprehensive guides covering:
- Architecture diagrams
- Installation steps
- Usage examples
- API reference
- Troubleshooting

### 4. Configuration Templates
Location: `../config/`

Ready-to-use templates for:
- Environment variables
- Claude Code configuration
- Alternative MCP server configs

## Getting Started

### Prerequisites

- Bun runtime installed
- JIRA Cloud or Server instance
- JIRA API token
- Claude Code CLI

### Quick Start

1. **Set environment variables:**
   ```bash
   export JIRA_API_TOKEN="your-token"
   export JIRA_USER_EMAIL="your-email@example.com"
   export JIRA_BASE_URL="https://your-org.atlassian.net"
   ```

2. **Build MCP server:**
   ```bash
   cd ../mcp-server
   bun install
   bun run build
   ```

3. **Install skill:**
   ```bash
   cp -r ../skill ~/.claude/plugins/jira-query
   ```

4. **Test:**
   ```bash
   claude
   # Then: "show me my open JIRA issues"
   ```

See [Setup Guide](./Setup-Guide.md) for detailed instructions.

## Architecture Overview

```
┌─────────────────────┐
│   Claude Code CLI   │
│                     │
│  User: "show my     │
│   open bugs"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  JIRA Query Skill   │
│                     │
│  • Parse request    │
│  • Convert to JQL   │
│  • Call tools       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   .mcp.json Config  │
│                     │
│  Server: jira       │
│  Type: stdio        │
│  Cmd: bun build/    │
│       index.js      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Custom MCP Server  │
│                     │
│  • 6 tool handlers  │
│  • ADF parsing      │
│  • v3→v2 fallback   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   JIRA REST API     │
│                     │
│  • v3 (preferred)   │
│  • v2 (fallback)    │
└─────────────────────┘
```

See [MCP Architecture](./MCP-Architecture.md) for detailed explanation.

## Key Features

### Natural Language Queries
Convert plain English to JQL:
- "my open bugs" → `assignee = currentUser() AND type = Bug AND status != Closed`
- "last week" → `created >= -7d`
- "high priority" → `priority IN (Highest, High)`

### Smart User Lookup
Automatically convert emails to JIRA account IDs:
- "assign to john@example.com" → looks up accountId → assigns issue

### Date Intelligence
Parse natural language dates:
- "this week" → `>= startOfWeek()`
- "last 3 months" → `>= -90d`
- "overdue" → `duedate < now() AND status != Closed`

### API Version Fallback
Automatically tries v3 API, falls back to v2 if needed:
- Supports both JIRA Cloud and Server
- Handles API version differences transparently

### Comprehensive Error Handling
- Validates environment variables
- Parses JIRA error responses
- Sanitizes sensitive data from logs

## Use Cases

### Daily Workflows
- Check your assigned issues
- Find issues updated recently
- Track team progress
- Triage new bugs

### Sprint Planning
- Find unassigned stories
- Check sprint progress
- Identify blockers
- Create sprint tasks

### Reporting
- Count issues by type
- Track resolution time
- Analyze bug trends
- Generate status reports

### Issue Management
- Create bugs from descriptions
- Bulk assign issues
- Add status updates
- Update priorities

See [Usage Examples](./Usage-Examples.md) for detailed scenarios.

## Documentation Structure

```
docs/
├── README.md                 # This file - documentation hub
├── MCP-Architecture.md       # Architecture diagrams and design
├── Setup-Guide.md            # Step-by-step installation
├── Usage-Examples.md         # Real-world usage scenarios
├── API-Reference.md          # Tool schemas and parameters
└── Troubleshooting.md        # Common issues and solutions
```

## API Reference

### Tools Available

| Tool | Purpose | Required Params |
|------|---------|----------------|
| search_issues | Execute JQL queries | jql |
| get_issue | Get issue details | issueIdOrKey |
| get_user_by_email | Look up user | email |
| create_issue | Create new issue | projectKey, issueType, summary |
| update_issue | Update issue | issueKey |
| add_comment | Add comment | issueIdOrKey, body |

See [API Reference](./API-Reference.md) for complete schemas.

## Environment Variables

### Required
- `JIRA_API_TOKEN` - Your JIRA API token
- `JIRA_USER_EMAIL` - Your JIRA account email
- `JIRA_BASE_URL` - JIRA instance URL

### Optional
- `JIRA_TYPE` - "cloud" or "server" (default: cloud)
- `JIRA_AUTH_TYPE` - "basic" or "bearer" (default: basic)
- `MCP_DEBUG` - Set to "1" to enable debug logging

## Security

- API tokens stored in environment variables only
- Never committed to version control
- All requests use HTTPS
- Tokens sanitized from error messages
- Local execution (no third-party servers)

## Performance

- Stdio transport (fast local communication)
- Efficient JSON-RPC protocol
- Configurable result limits
- Smart API version fallback
- Minimal dependencies

## Limitations

- Maximum 100 results per search (JIRA limit)
- Email lookup requires exact match
- Cannot transition workflow states (needs transition IDs)
- Respects JIRA user permissions
- Rate limits apply (300/min for Cloud)

## Extending

### Add New Tools

1. Define tool in `mcp-server/src/index.ts`
2. Implement in `jira-cloud-api.ts`
3. Add handler in index.ts
4. Update SKILL.md documentation
5. Rebuild server

### Customize Queries

1. Edit JQL patterns in `skill/reference/jql-patterns.md`
2. Modify date conversion in `date-conversion.md`
3. Add examples to `examples.md`

### Support Other Systems

Use this as a template:
1. Replace JIRA API with your system's API
2. Update type definitions
3. Modify tool schemas
4. Adjust skill instructions

## Troubleshooting

Common issues:

- **"MCP server not found"** → Verify build/index.js exists, rebuild if needed
- **"Authentication failed"** → Check API token, verify email matches token owner
- **"Environment variable not set"** → Source shell profile, verify exports
- **"User not found"** → Check email spelling, verify user is active
- **"Invalid JQL"** → Test query in JIRA's issue navigator first

See [Troubleshooting Guide](./Troubleshooting.md) for solutions.

## Version History

### v1.0.0 (Current)
- Initial release
- 6 core tools
- stdio transport
- v3/v2 API fallback
- Natural language skill
- Comprehensive documentation

## Contributing

This is a custom implementation designed as a template. Feel free to:
- Fork and modify for your needs
- Add new tools
- Improve error handling
- Enhance date parsing
- Add custom fields support

## License

Custom implementation - use freely.

## Resources

### JIRA Resources
- [JIRA REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Documentation](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

### MCP Resources
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

### Claude Code
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Skill Development Guide](https://docs.anthropic.com/claude/docs/skills)

## Support

For issues:
1. Check [Troubleshooting Guide](./Troubleshooting.md)
2. Review error messages with debug mode enabled
3. Test JIRA API directly with curl
4. Verify environment variables are set correctly

## Next Steps

1. **New users:** Start with [Setup Guide](./Setup-Guide.md)
2. **Want examples:** See [Usage Examples](./Usage-Examples.md)
3. **API details:** Check [API Reference](./API-Reference.md)
4. **Having issues:** Read [Troubleshooting](./Troubleshooting.md)
5. **Understanding design:** Review [MCP Architecture](./MCP-Architecture.md)
