# JIRA Query Skill - Connectors

This skill requires the **project tracker** connector category, which is provided by the custom JIRA MCP server.

## Required Connector: project tracker

The `~~project tracker` connector provides access to JIRA's REST API through six core tools:

### Tools Provided

1. **search_issues** - Execute JQL queries to find issues
2. **get_issue** - Retrieve detailed information about a specific issue
3. **get_user_by_email** - Look up JIRA users by email address
4. **create_issue** - Create new issues
5. **update_issue** - Update existing issues
6. **add_comment** - Add comments to issues

### Configuration

The connector is configured through the `.mcp.json` file in this skill directory. It uses stdio transport to communicate with the custom JIRA MCP server.

**Required Environment Variables:**
- `JIRA_API_TOKEN` - Your JIRA API token
- `JIRA_USER_EMAIL` - Your JIRA account email
- `JIRA_BASE_URL` - Your JIRA instance URL (e.g., https://your-org.atlassian.net)

**Optional Environment Variables:**
- `JIRA_TYPE` - Instance type: "cloud" or "server" (default: "cloud")
- `JIRA_AUTH_TYPE` - Authentication type: "basic" or "bearer" (default: "basic")

### Setup

1. Generate a JIRA API token:
   - **Cloud:** https://id.atlassian.com/manage-profile/security/api-tokens
   - **Server:** Generate a Personal Access Token in user settings

2. Set environment variables in your shell profile (`~/.zshrc` or `~/.bashrc`):
   ```bash
   export JIRA_API_TOKEN="your-api-token-here"
   export JIRA_USER_EMAIL="your-email@example.com"
   export JIRA_BASE_URL="https://your-org.atlassian.net"
   ```

3. Reload your shell:
   ```bash
   source ~/.zshrc
   ```

4. The connector will automatically start when the skill is invoked.

### Troubleshooting

If the connector fails to start:

1. **Verify environment variables are set:**
   ```bash
   echo $JIRA_API_TOKEN
   echo $JIRA_USER_EMAIL
   echo $JIRA_BASE_URL
   ```

2. **Test JIRA API access:**
   ```bash
   curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/myself"
   ```

3. **Check MCP server is built:**
   ```bash
   ls -la /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js
   ```

4. **Enable debug logging:**
   ```bash
   export MCP_DEBUG=1
   ```

### Permissions

The connector operates with the same permissions as your JIRA user account. You can:
- View issues you have permission to see
- Create issues in projects where you have create permissions
- Update issues where you have edit permissions
- Comment on issues where you have comment permissions

### Rate Limiting

JIRA Cloud has rate limits:
- 300 requests per minute for API tokens
- Higher limits for OAuth tokens

The connector does not implement rate limiting. For bulk operations, add delays between requests or use JIRA's bulk update features directly.

### Security

- API tokens are stored in environment variables (never in code)
- All requests use HTTPS
- Tokens are never logged or exposed in error messages
- The connector runs locally on your machine (no third-party servers)

## Alternative Connectors

This skill is designed specifically for the custom JIRA MCP server. It will not work with other project tracking tools without modification.

If you need to connect to other systems:
- **GitHub Issues:** Use the GitHub skill
- **Linear:** Create a custom MCP server using the same pattern
- **Azure DevOps:** Create a custom MCP server

## Architecture

```
Claude Code
    ↓
JIRA Query Skill (SKILL.md)
    ↓
.mcp.json (connector configuration)
    ↓
Custom JIRA MCP Server (stdio)
    ↓
JIRA REST API (v3 with v2 fallback)
```

The skill sends tool calls through Claude Code's MCP infrastructure, which routes them to the custom JIRA MCP server. The server translates these into JIRA REST API calls and returns formatted results.

## Tool Name Resolution

When you use `~~project tracker search_issues`, Claude Code resolves this to the actual MCP tool name:

```
~~project tracker search_issues
    ↓
mcp__plugin_jira-query_jira__search_issues
```

The naming pattern is:
```
mcp__plugin_{skill-name}_{server-name}__{tool-name}
```

Where:
- `skill-name` = "jira-query" (from plugin.json)
- `server-name` = "jira" (from .mcp.json)
- `tool-name` = "search_issues" (from MCP server tool definition)

## Extending the Connector

To add new tools:

1. Add tool definition in `mcp-server/src/index.ts`
2. Implement the tool handler in the MCP server
3. Add the tool to the JIRA API service
4. Update SKILL.md with the new tool documentation
5. Rebuild the MCP server: `bun run build`

See the MCP server README for detailed instructions on adding tools.
