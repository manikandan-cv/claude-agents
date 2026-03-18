# JIRA MCP Integration

Complete, reusable JIRA integration for Claude Code using a custom MCP server.

## 🚨 Update Notice (March 2026)

**API Update Required:** Atlassian deprecated the old search endpoint. If you installed before March 17, 2026, please update:

```bash
cd /path/to/JIRA/mcp-server
git pull && bun run build
# Restart Claude Code
```

See [UPDATE-GUIDE.md](UPDATE-GUIDE.md) for details.

---

## Overview

This project provides a full-featured JIRA integration that lets you search, create, and manage JIRA issues through Claude Code. Built from scratch with no external dependencies on existing JIRA MCP servers.

### Key Features

- 🎨 **Beautiful Formatting** - Issues display in clean, readable box format with emojis
- 💬 **User Mentions** - Tag users in comments with `[~accountId]` syntax
- 🔍 **Natural Language Queries** - "show my open bugs" → JQL
- 📝 **Issue Management** - Create, update, and comment on issues
- 👤 **Smart User Lookup** - Automatically convert emails to JIRA account IDs
- 📅 **Date Intelligence** - Parse "last week", "this month" into JQL
- 🔄 **API Fallback** - Tries v3, falls back to v2 (Cloud + Server support)
- 🛡️ **Secure** - Local execution, environment variables, no hardcoded secrets
- ⚡ **Fast** - stdio transport for instant communication

## Quick Start

### Prerequisites

- Bun runtime installed
- JIRA Cloud or Server instance
- JIRA API token
- Claude Code CLI

### Installation (5 minutes)

1. **Set environment variables in `~/.zshrc`:**
   ```bash
   export JIRA_API_TOKEN="your-token-here"
   export JIRA_USER_EMAIL="your-email@example.com"
   export JIRA_BASE_URL="https://your-org.atlassian.net"
   ```
   Then reload: `source ~/.zshrc`

2. **Build MCP server:**
   ```bash
   cd mcp-server
   bun install
   bun run build
   ```

3. **Configure Claude Code (`~/.mcp.json`):**
   ```json
   {
     "mcpServers": {
       "jira": {
         "type": "stdio",
         "command": "bun",
         "args": ["/absolute/path/to/JIRA/mcp-server/build/index.js"],
         "env": {
           "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
           "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
           "JIRA_BASE_URL": "${JIRA_BASE_URL}",
           "JIRA_TYPE": "${JIRA_TYPE:-cloud}",
           "JIRA_AUTH_TYPE": "${JIRA_AUTH_TYPE:-basic}"
         }
       }
     }
   }
   ```

4. **Test:**
   ```bash
   # Open fresh terminal
   claude
   # Then: "Search JIRA for my open issues"
   ```

See [docs/Setup-Guide.md](docs/Setup-Guide.md) for detailed instructions.

## Project Structure

```
JIRA/
├── mcp-server/              # Custom MCP server (TypeScript/Bun)
│   ├── src/
│   │   ├── index.ts         # MCP server with 6 tool handlers
│   │   ├── services/        # JIRA API service (updated for Change-2046)
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Error handling, logging
│   ├── build/               # Compiled output
│   └── package.json
│
├── skill/                   # Claude Code skill (optional)
│   ├── SKILL.md             # Main skill instructions
│   ├── .mcp.json            # MCP server configuration
│   ├── .claude-plugin/      # Plugin metadata
│   └── reference/           # JQL patterns, date conversion, examples
│
├── docs/                    # Comprehensive documentation
│   ├── README.md            # Documentation hub
│   ├── Setup-Guide.md       # Installation guide (updated)
│   ├── MCP-Architecture.md  # Architecture diagrams
│   ├── Usage-Examples.md    # Real-world examples
│   ├── API-Reference.md     # Tool schemas
│   └── Troubleshooting.md   # Common issues
│
└── config/                  # Configuration templates
    ├── env-template         # Environment variables
    └── mcp-config-examples.md
```

## Components

### 1. Custom MCP Server
**Location:** `mcp-server/`

TypeScript/Bun-based MCP server providing 6 core tools:
- `search_issues` - Execute JQL queries (updated for `/rest/api/3/search/jql`)
- `get_issue` - Get issue details with comments
- `get_user_by_email` - Look up users by email
- `create_issue` - Create new issues
- `update_issue` - Update existing issues
- `add_comment` - Add comments to issues

**Transport:** stdio (local process communication)
**Configuration:** `~/.mcp.json` (automatically loaded by Claude Code)

### 2. Claude Code Skill (Optional)
**Location:** `skill/`

Optional natural language interface that converts user requests into JIRA tool calls.

**Note:** The MCP server works without the skill - you can call tools directly from Claude Code.

### 3. Documentation
**Location:** `docs/`

Complete documentation covering:
- Installation and setup
- Architecture and design
- Usage examples and workflows
- API reference
- Troubleshooting

### 4. Configuration Templates
**Location:** `config/`

Ready-to-use templates for:
- Environment variables
- Claude Code configuration
- Alternative MCP configurations

## Usage Examples

### Search for Issues

```
show me my open bugs
find issues assigned to john@example.com
what tickets were created this week?
high priority issues in PROJECT-X
```

### Get Issue Details

```
show me PROJ-123
what's the status of PROJ-456?
```

### Create Issues

```
create a bug in PROJ: Login button not working
file a task to update documentation
```

### Update Issues

```
assign PROJ-123 to jane@example.com
change PROJ-456 priority to high
```

### Add Comments

```
comment on PROJ-789: Fixed in latest release
```

See [docs/Usage-Examples.md](docs/Usage-Examples.md) for 15+ detailed examples.

## Architecture

```
Claude Code CLI
    ↓
~/.mcp.json (auto-loaded MCP configuration)
    ↓
Custom MCP Server (6 tools, stdio)
    ↓
JIRA REST API (v3 /search/jql with v2 fallback)
```

**Key Update (March 2026):** The server now uses the new `/rest/api/3/search/jql` endpoint per Atlassian's Change-2046 deprecation notice.

See [docs/MCP-Architecture.md](docs/MCP-Architecture.md) for detailed architecture.

## Available Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `search_issues` | Execute JQL queries | jql, maxResults |
| `get_issue` | Get issue details | issueIdOrKey |
| `get_user_by_email` | Look up users | email |
| `create_issue` | Create issues | projectKey, issueType, summary |
| `update_issue` | Update issues | issueKey, fields |
| `add_comment` | Add comments | issueIdOrKey, body |

See [docs/API-Reference.md](docs/API-Reference.md) for complete schemas.

## Documentation

### Quick Start
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Essential patterns and formats ⭐

### Getting Started
- **[Setup Guide](docs/Setup-Guide.md)** - Installation and configuration
- **[UPDATE-GUIDE.md](UPDATE-GUIDE.md)** - Update instructions (March 2026)
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

### Using the Integration
- **[JQL Guide](docs/JQL-Guide.md)** - Query syntax with email and date formats
- **[Usage Examples](docs/Usage-Examples.md)** - Real-world scenarios
- **[Mentions Guide](docs/Mentions-Guide.md)** - How to mention users in comments
- **[Team Members Guide](docs/Team-Members-Guide.md)** - Managing team info for quick mentions
- **[Formatting Examples](docs/Formatting-Examples.md)** - Beautiful issue display formats
- **[API Reference](docs/API-Reference.md)** - Tool specifications
- **[Troubleshooting](docs/Troubleshooting.md)** - Common issues

### Technical Details
- **[MCP Architecture](docs/MCP-Architecture.md)** - Technical design

## Key Capabilities

### Natural Language Processing
Converts plain English to JQL:
- "my open bugs" → `assignee = currentUser() AND type = Bug AND status != Closed`
- "last week" → `created >= -7d`
- "high priority" → `priority IN (Highest, High)`

### Smart Date Parsing
- "this week" → `>= startOfWeek()`
- "last 3 months" → `>= -90d`
- "overdue" → `duedate < now() AND status != Closed`

### User Lookup
Automatically converts emails to JIRA account IDs:
- "assign to john@example.com" → looks up accountId → assigns issue

### API Version Fallback
- Tries JIRA API v3 first
- Falls back to v2 if needed
- Supports both Cloud and Server

## Requirements

- **Bun:** v1.0+
- **JIRA:** Cloud or Server/Data Center
- **Claude Code:** Latest version
- **Permissions:** JIRA account with appropriate project access

## Environment Variables

### Required
- `JIRA_API_TOKEN` - Your JIRA API token
- `JIRA_USER_EMAIL` - Your JIRA account email
- `JIRA_BASE_URL` - JIRA instance URL

### Optional
- `JIRA_TYPE` - "cloud" or "server" (default: cloud)
- `JIRA_AUTH_TYPE` - "basic" or "bearer" (default: basic)
- `MCP_DEBUG` - Set to "1" to enable debug logging

See [config/env-template](config/env-template) for setup.

## Security

- ✅ API tokens stored in environment variables only
- ✅ Never committed to version control
- ✅ All requests use HTTPS
- ✅ Tokens sanitized from error messages
- ✅ Local execution (no third-party servers)
- ✅ Respects JIRA user permissions

## Performance

- **Fast:** stdio transport for local communication
- **Efficient:** JSON-RPC protocol
- **Configurable:** Result limits to control response size
- **Smart:** API version fallback for compatibility

## Limitations

- Maximum 100 results per search (JIRA API limit)
- Email lookup requires exact match
- Cannot transition workflow states (requires transition IDs)
- Respects JIRA permissions (you only see what you can access)
- Rate limits apply (300/min for Cloud API tokens)

## Extending

### Add New Tools

1. Define tool in `mcp-server/src/index.ts`
2. Implement in `mcp-server/src/services/jira-cloud-api.ts`
3. Add handler in `index.ts`
4. Update `skill/SKILL.md` documentation
5. Rebuild: `bun run build`

### Customize Queries

1. Edit JQL patterns in `skill/reference/jql-patterns.md`
2. Modify date conversion in `skill/reference/date-conversion.md`
3. Add examples to `skill/reference/examples.md`

## Troubleshooting

### Common Issues

- **"MCP server not found"** → Run `bun run build` in `mcp-server/`
- **"Authentication failed"** → Verify API token and email
- **"Environment variable not set"** → Run `source ~/.zshrc`
- **"User not found"** → Check email spelling and user status

See [docs/Troubleshooting.md](docs/Troubleshooting.md) for complete guide.

### Enable Debug Mode

```bash
export MCP_DEBUG=1
claude
```

## Testing

Verify installation:

```bash
# 1. Test environment variables
echo $JIRA_API_TOKEN
echo $JIRA_USER_EMAIL
echo $JIRA_BASE_URL

# 2. Test MCP server
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun mcp-server/build/index.js

# 3. Test JIRA API
curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
     "$JIRA_BASE_URL/rest/api/3/myself"

# 4. Test in Claude Code
claude
# Then: "show my JIRA issues"
```

## Use Cases

- **Daily Workflows** - Check assigned issues, track progress
- **Sprint Planning** - Find unassigned stories, review backlog
- **Bug Triage** - Identify new bugs, assign priorities
- **Reporting** - Count issues, track velocity, analyze trends
- **Team Coordination** - Update statuses, add comments, assign work

## Version

1.0.0

## License

Custom implementation - use freely for your own projects.

## Resources

### JIRA
- [JIRA REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Documentation](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [Generate API Token](https://id.atlassian.com/manage-profile/security/api-tokens)

### MCP
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

### Claude Code
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)

## Contributing

This is a template project designed for customization:
- Fork and modify for your needs
- Add new tools for additional JIRA features
- Enhance error handling and validation
- Improve date parsing logic
- Add support for custom fields

## Support

For issues:
1. Check [Troubleshooting Guide](docs/Troubleshooting.md)
2. Review error messages with debug mode enabled
3. Test JIRA API directly with curl
4. Verify environment variables are correctly set

## Next Steps

1. **New users:** Start with [Setup Guide](docs/Setup-Guide.md)
2. **Learn by example:** See [Usage Examples](docs/Usage-Examples.md)
3. **Understand design:** Review [MCP Architecture](docs/MCP-Architecture.md)
4. **API details:** Check [API Reference](docs/API-Reference.md)
5. **Having issues:** Read [Troubleshooting](docs/Troubleshooting.md)

## Acknowledgments

Built following Claude Code skill patterns and MCP specification. Designed as a reusable template for others to customize and extend.
