# JIRA Query Skill

Natural language interface for searching and managing JIRA issues through Claude Code.

## Overview

This skill allows you to interact with JIRA using natural language queries instead of writing JQL manually. Simply ask Claude to find issues, and the skill will convert your request to the appropriate JIRA queries.

## Features

- 🔍 **Natural Language Search** - "Show my open bugs" → JQL query
- 👤 **User Lookup** - Convert email addresses to JIRA account IDs
- 📝 **Issue Management** - Create, update, and comment on issues
- 📅 **Smart Date Parsing** - "last week", "this month" → JQL date functions
- 🎯 **Complex Queries** - Combine assignee, status, date, priority filters

## Installation

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- JIRA Cloud or Server instance
- JIRA API token

### Steps

1. **Clone/Copy this skill to Claude Code plugins directory:**
   ```bash
   cp -r /Users/manikandan/Documents/personal/code/claude-agents/JIRA/skill \
         ~/.claude/plugins/jira-query
   ```

2. **Set environment variables in `~/.zshrc` or `~/.bashrc`:**
   ```bash
   export JIRA_API_TOKEN="your-api-token-here"
   export JIRA_USER_EMAIL="your-email@example.com"
   export JIRA_BASE_URL="https://your-org.atlassian.net"
   ```

3. **Generate JIRA API token:**
   - Cloud: https://id.atlassian.com/manage-profile/security/api-tokens
   - Server: User settings → Personal Access Tokens

4. **Build the MCP server:**
   ```bash
   cd /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server
   bun install
   bun run build
   ```

5. **Reload your shell:**
   ```bash
   source ~/.zshrc
   ```

6. **Restart Claude Code** (if running)

## Usage

### Basic Examples

**Search for issues:**
```
show me my open bugs
find issues assigned to john@example.com
what tickets were created this week?
```

**Get issue details:**
```
show me PROJ-123
what's the status of PROJ-456?
```

**Create issues:**
```
create a bug in PROJ: Login button not working
file a task to update documentation
```

**Update issues:**
```
assign PROJ-123 to jane@example.com
change PROJ-456 priority to high
```

**Add comments:**
```
comment on PROJ-789: Fixed in latest release
```

### Trigger Phrases

The skill activates on phrases like:
- "search JIRA"
- "find issues"
- "query JIRA"
- "show JIRA issue"
- "get tickets assigned to"
- "create issue in"
- "update JIRA ticket"

## Documentation

- **[SKILL.md](./SKILL.md)** - Main skill documentation with tool references
- **[CONNECTORS.md](./CONNECTORS.md)** - Connector configuration and setup
- **[reference/jql-patterns.md](./reference/jql-patterns.md)** - Comprehensive JQL reference
- **[reference/date-conversion.md](./reference/date-conversion.md)** - Date parsing guide
- **[reference/examples.md](./reference/examples.md)** - Usage examples

## Architecture

```
Claude Code CLI
    ↓
JIRA Query Skill (natural language processing)
    ↓
.mcp.json (MCP server configuration)
    ↓
Custom JIRA MCP Server (stdio transport)
    ↓
JIRA REST API (v3 with v2 fallback)
```

## Available Tools

1. **search_issues** - Execute JQL queries
2. **get_issue** - Get issue details with comments
3. **get_user_by_email** - Look up users by email
4. **create_issue** - Create new issues
5. **update_issue** - Update existing issues
6. **add_comment** - Add comments to issues

## Configuration

The skill is configured through `.mcp.json` which specifies:
- MCP server location
- Transport type (stdio)
- Environment variables
- Server command and arguments

## Troubleshooting

### Skill doesn't activate

1. Check skill is installed:
   ```bash
   ls -la ~/.claude/plugins/jira-query
   ```

2. Verify environment variables:
   ```bash
   echo $JIRA_API_TOKEN
   echo $JIRA_USER_EMAIL
   echo $JIRA_BASE_URL
   ```

### Authentication errors

1. Test API token:
   ```bash
   curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/myself"
   ```

2. Regenerate API token if expired

### MCP server not found

1. Verify server is built:
   ```bash
   ls -la /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js
   ```

2. Rebuild if missing:
   ```bash
   cd /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server
   bun run build
   ```

### Enable debug mode

```bash
export MCP_DEBUG=1
claude
```

## Examples

### Find my open bugs
```
User: show me my open bugs
Skill: Executes JQL: assignee = currentUser() AND type = Bug AND status != Closed
Result: List of your open bugs
```

### Create issue with assignee
```
User: create a task in PROJ: Update API docs, assign to jane@example.com
Skill:
  1. Looks up jane@example.com → accountId
  2. Creates issue with assignee
Result: Created PROJ-789
```

### Complex search
```
User: find high-priority stories created last week in PROJECT-X
Skill: Executes JQL: project = PROJECT-X AND type = Story AND priority = High AND created >= -7d
Result: Matching stories
```

## Limitations

- Maximum 100 results per search
- Email lookup requires exact match
- Cannot transition workflow states (requires transition IDs)
- Respects JIRA permissions (you only see what you can access)

## Contributing

To extend this skill:

1. Add new tools to `mcp-server/src/index.ts`
2. Implement in `mcp-server/src/services/jira-cloud-api.ts`
3. Update `SKILL.md` with new tool documentation
4. Rebuild: `bun run build`

## License

Custom implementation - use freely for your own projects.

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation in `reference/` directory
3. Enable debug mode to see detailed logs
4. Test JIRA API connection directly with curl

## Version

1.0.0

## Author

Custom implementation following Claude Code skill patterns.
