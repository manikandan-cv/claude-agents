# Changelog

All notable changes to the JIRA MCP integration.

## [1.2.0] - 2026-03-17

### Enhanced - JQL Query Support

**Clarified Email and Date Formats**: Updated tool descriptions and documentation to explicitly show correct formats.

#### Email-Based Searches

```jql
assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17
```

**Key Points:**
- ✅ Use email addresses directly in JQL
- ✅ Always wrap email in double quotes
- ✅ Works for any JIRA user

#### Date Format

**Correct Format:** `YYYY-MM-DD`
```jql
updated >= 2025-07-17  # Year-Month-Day with hyphens
```

#### Files Updated

- `mcp-server/src/index.ts`: Enhanced search_issues tool description with examples
- `docs/JQL-Guide.md`: Complete guide for JQL queries with correct formats

### Added - Beautiful Formatting

**Issue Display**: JIRA issues now display in beautiful, readable box format.

#### Search Results

Issues are displayed in a clean list format with emojis:
```
Found 3 issues:

1. 🔄 PROJ-123: Bug in login flow
   🐛 Bug | 🔴 High | 👤 John Doe
   🏷️  backend, security

2. ✅ PROJ-456: Implement feature X
   🎫 Task | 🟡 Medium | 👤 Jane Smith
```

#### Issue Details

Single issues display in a beautiful box layout with:
- Status, priority, type, project
- Assignee, reporter, dates
- Full description
- All comments with timestamps

#### Files Updated

- `mcp-server/src/utils/issue-formatter.ts`: New formatter with emoji support
- `mcp-server/src/index.ts`: Updated to use formatter for all issue responses

### Added - User Mentions and URL Linking

**Mentions in Comments**: You can now mention users in comments using `[~accountId]` syntax.
**Automatic URL Linking**: Any `http://` or `https://` URL automatically becomes a clickable link.

#### How It Works

```
add_comment(
  issueIdOrKey: "PROJ-123",
  body: "[~615af9eb7a6be40071e7ad95] Review done https://github.com/org/repo/pull/456 please check."
)
```

This renders in JIRA as:
- **@User Name** (clickable mention with notification)
- Text: "Review done"
- **https://github.com/org/repo/pull/456** (clickable link)
- Text: "please check."

#### Features

**Mentions:**
- ✅ Supports `[~accountId]` syntax
- ✅ Supports `[~accountid:accountId]` verbose format
- ✅ Multiple mentions in one comment
- ✅ Converts to proper ADF (Atlassian Document Format)
- ✅ Users receive notifications

**URLs:**
- ✅ Auto-detects `http://` and `https://` URLs
- ✅ Converts to clickable links
- ✅ Multiple URLs in one comment
- ✅ Works alongside mentions

#### Files Updated

- `mcp-server/src/services/jira-cloud-api.ts`: Enhanced ADF converter with mention support
- `docs/Mentions-Guide.md`: Complete guide for using mentions

#### Usage

1. Look up user's accountId: `get_user_by_email(email: "user@example.com")`
2. Add comment with mention: `[~accountId] message here`

See [Mentions-Guide.md](docs/Mentions-Guide.md) for complete documentation.

---

## [1.1.0] - 2026-03-17

### Changed - API Endpoint Update (Critical)

**Breaking Change:** Updated to new JIRA Cloud API endpoints per Atlassian Change-2046.

#### API Changes

- **Search endpoint**: `/rest/api/3/search` → `/rest/api/3/search/jql`
- **Pagination**: Now uses `nextPageToken` instead of deprecated `startAt` parameter
- **Response format**: Returns `SearchAndReconcileResults` (more concise)
- **Total count**: Removed from standard response (use `/rest/api/3/search/approximate-count` if needed)

#### Files Updated

- `mcp-server/src/services/jira-cloud-api.ts`: Updated search endpoint to `/rest/api/3/search/jql`
- `mcp-server/src/types/jira.ts`: Added `nextPageToken` field, made `total` and `startAt` optional

#### Migration Required

If you installed before March 17, 2026, you must rebuild the MCP server:

```bash
cd /path/to/JIRA/mcp-server
git pull  # if using git
bun run build
# Restart Claude Code
```

### Changed - Configuration Simplification

**Simplified setup** using direct MCP configuration instead of plugin system.

#### New Approach

- **Configuration file**: `~/.mcp.json` (auto-loaded by Claude Code)
- **No plugin registration** required
- **Simpler setup** process

#### Old Approach (Still works but not recommended)

- Configuration in `~/.claude/plugins/jira-query/.mcp.json`
- Requires plugin registration in multiple config files
- More complex setup

#### Migration Path

If you're using the old plugin approach, you can migrate to the simpler approach:

1. Copy your MCP server configuration from `~/.claude/plugins/jira-query/.mcp.json` to `~/.mcp.json`
2. Update the path in `args` array to absolute path
3. Restart Claude Code
4. Optionally remove the plugin files

### Updated

- **Documentation**: All docs updated to reflect simplified setup
- **Setup Guide**: Rewritten for clarity and simplicity
- **Troubleshooting**: Removed plugin-related issues, added API deprecation section
- **Architecture docs**: Updated endpoint references

---

## [1.0.0] - 2026-03-15

### Added

- Initial release
- Custom MCP server with 6 JIRA tools
- Claude Code skill for natural language interface
- Support for JIRA Cloud and Server
- API version fallback (v3 → v2)
- ADF (Atlassian Document Format) handling
- Comprehensive documentation
- JQL pattern reference
- Usage examples
- Troubleshooting guide

### Features

- Search issues using JQL
- Get issue details with comments
- Look up users by email
- Create new issues
- Update existing issues
- Add comments to issues
- Natural language to JQL conversion
- Smart date parsing
- User email to accountId lookup

---

## Migration Guide

### From v1.0.0 to v1.1.0

#### Required: Update API Endpoints

1. **Pull latest changes:**
   ```bash
   cd /path/to/JIRA
   git pull
   ```

2. **Rebuild MCP server:**
   ```bash
   cd mcp-server
   bun install
   bun run build
   ```

3. **Restart Claude Code:**
   ```bash
   # Exit Claude Code
   exit

   # Start fresh
   claude
   ```

#### Optional: Migrate to Simplified Configuration

If using the old plugin approach, migrate to `~/.mcp.json`:

1. **Check your current config:**
   ```bash
   cat ~/.claude/plugins/jira-query/.mcp.json
   ```

2. **Create `~/.mcp.json`:**
   ```bash
   nano ~/.mcp.json
   ```

3. **Copy configuration:**
   ```json
   {
     "mcpServers": {
       "jira": {
         "type": "stdio",
         "command": "bun",
         "args": [
           "/absolute/path/to/JIRA/mcp-server/build/index.js"
         ],
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

4. **Restart Claude Code**

---

## Known Issues

### v1.1.0

- None currently

### v1.0.0

- ❌ **Search endpoint deprecated** - Fixed in v1.1.0
- ⚠️ Complex plugin setup - Simplified in v1.1.0

---

## Deprecation Notices

### Removed in v1.1.0

- None (backward compatible)

### Deprecated in v1.1.0

- Plugin-based configuration (still works but not recommended)

---

## References

- **Atlassian Change-2046**: JIRA Cloud API search endpoint deprecation
- **JIRA REST API v3**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **MCP Specification**: https://modelcontextprotocol.io/
