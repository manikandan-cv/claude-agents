# Setup Guide

Simple step-by-step installation guide for the JIRA MCP integration.

## Prerequisites

Before starting, ensure you have:

- ✅ **Bun runtime** installed (v1.0+)
- ✅ **Claude Code CLI** installed
- ✅ **JIRA instance** (Cloud or Server)
- ✅ **JIRA account** with appropriate permissions

### Install Bun (if needed)

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify installation:
```bash
bun --version
```

### Verify Claude Code

```bash
claude --version
```

---

## Step 1: Generate JIRA API Token

### For JIRA Cloud

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Enter a label (e.g., "Claude Code Integration")
4. Click **Create**
5. **Copy the token** (you won't be able to see it again)

### For JIRA Server/Data Center

1. Go to JIRA settings → Profile
2. Navigate to **Personal Access Tokens**
3. Click **Create token**
4. Enter token name and expiry
5. **Copy the token**

---

## Step 2: Set Environment Variables

Add these to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# JIRA MCP Server Configuration
export JIRA_API_TOKEN="your-api-token-here"
export JIRA_USER_EMAIL="your-email@example.com"
export JIRA_BASE_URL="https://your-org.atlassian.net"

# Optional (defaults shown)
export JIRA_TYPE="cloud"           # or "server"
export JIRA_AUTH_TYPE="basic"      # or "bearer"
```

**Important:** Replace the placeholder values with your actual credentials.

### Apply Changes

Reload your shell configuration:

```bash
source ~/.zshrc    # or source ~/.bashrc
```

### Verify Environment Variables

```bash
echo "Token: ${JIRA_API_TOKEN:0:10}..."
echo "Email: $JIRA_USER_EMAIL"
echo "Base URL: $JIRA_BASE_URL"
```

You should see your values (token will show first 10 characters).

---

## Step 3: Clone and Build MCP Server

Clone the repository (or download it):

```bash
cd ~/Documents/personal/code/claude-agents
git clone <your-repo-url> JIRA
# Or if already downloaded, just navigate to it
```

Navigate to the MCP server directory:

```bash
cd JIRA/mcp-server
```

Install dependencies:

```bash
bun install
```

Build the server:

```bash
bun run build
```

Verify build succeeded:

```bash
ls -lh build/index.js
```

You should see a file around 200-300 KB.

---

## Step 4: Test MCP Server Standalone

Test that the server responds correctly:

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | bun run start
```

Expected output (JSON-RPC response with 6 tools):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {"name": "search_issues", ...},
      {"name": "get_issue", ...},
      {"name": "get_user_by_email", ...},
      {"name": "create_issue", ...},
      {"name": "update_issue", ...},
      {"name": "add_comment", ...}
    ]
  }
}
```

If you see this, the MCP server is working correctly.

---

## Step 5: Test JIRA API Connection

Verify your credentials work with JIRA's API:

```bash
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
     "$JIRA_BASE_URL/rest/api/3/myself" | jq
```

Expected output (your user profile):
```json
{
  "accountId": "...",
  "emailAddress": "your-email@example.com",
  "displayName": "Your Name",
  "active": true,
  ...
}
```

If you see an error:
- **401 Unauthorized:** Check API token is correct
- **404 Not Found:** Try `/rest/api/2/myself` (Server uses v2)
- **Connection refused:** Verify JIRA_BASE_URL is correct

---

## Step 6: Configure Claude Code MCP Server

Create or edit `~/.mcp.json`:

```bash
nano ~/.mcp.json
```

Add the JIRA MCP server configuration:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/Users/YOUR_USERNAME/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
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

**Important:** Replace `YOUR_USERNAME` with your actual username, or use the full absolute path to the `build/index.js` file.

**If you already have other MCP servers**, add the `jira` entry to the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      ...
    },
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/Users/YOUR_USERNAME/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
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

Save and close the file.

---

## Step 7: Restart Claude Code

**Open a fresh terminal** to ensure environment variables are loaded:

1. Close your current terminal completely
2. Open a brand new terminal window/tab
3. Verify environment variables:

```bash
echo "Token: ${JIRA_API_TOKEN:0:20}..."
echo "Email: $JIRA_USER_EMAIL"
echo "URL: $JIRA_BASE_URL"
```

You should see your actual values.

Start Claude Code:

```bash
claude
```

---

## Step 8: Test Integration

In Claude Code, try searching for issues:

```
Can you search JIRA for my open issues?
```

Or use the tools directly:

```
Use the search_issues tool to find issues where assignee = currentUser() AND resolution = Unresolved
```

Expected behavior:
1. ✅ Claude Code connects to JIRA MCP server
2. ✅ Query executes against your JIRA instance
3. ✅ Results display

**If this works, installation is complete!** ✅

---

## Additional Test Cases

### Search by Project

```
Search JIRA for open issues in project PROJ
```

### Get Issue Details

```
Get details for JIRA issue PROJ-123
```

### Create Issue

```
Create a JIRA issue in project PROJ with summary "Test issue" and type "Task"
```

### Search by Date

```
Search JIRA for issues created in the last 7 days
```

---

## Troubleshooting

### Error: "MCP server not found"

**Solution:**
```bash
cd /path/to/JIRA/mcp-server
bun run build
ls -lh build/index.js  # Verify file exists
```

### Error: "Environment variable not set"

**Solution:**
```bash
echo $JIRA_API_TOKEN
# If empty:
source ~/.zshrc
echo $JIRA_API_TOKEN
```

### Error: "Authentication failed (401)"

**Solution:**
1. Verify API token is correct
2. Check email matches your JIRA account
3. Regenerate token if needed
4. Test with curl (Step 5)

### Error: "Connection refused"

**Solution:**
1. Verify JIRA_BASE_URL format (must include `https://`)
2. Check network connectivity
3. Test JIRA URL in browser

### MCP Server Not Loading

**Solution:**
```bash
# Check ~/.mcp.json is valid JSON
cat ~/.mcp.json | jq

# Verify path in args array is correct
ls -la /path/from/mcp.json

# Restart Claude Code completely (exit and start fresh)
```

---

## Enable Debug Mode

For detailed logging:

```bash
export MCP_DEBUG=1
claude
```

This shows:
- MCP server startup messages
- Tool calls
- API requests and responses
- Errors and warnings

To disable:
```bash
unset MCP_DEBUG
```

---

## Verify Installation Checklist

- [ ] Bun installed and working (`bun --version`)
- [ ] API token generated from JIRA
- [ ] Environment variables set in `~/.zshrc`
- [ ] Environment variables verified in terminal
- [ ] MCP server built (`build/index.js` exists)
- [ ] MCP server responds to `tools/list`
- [ ] JIRA API connection works (curl test)
- [ ] `~/.mcp.json` created with correct path
- [ ] `~/.mcp.json` is valid JSON
- [ ] Fresh terminal opened
- [ ] Claude Code started
- [ ] Can search for JIRA issues

---

## Configuration Files Reference

### `~/.zshrc` (or `~/.bashrc`)

```bash
# JIRA MCP Server Configuration
export JIRA_API_TOKEN="your-api-token-here"
export JIRA_USER_EMAIL="your-email@example.com"
export JIRA_BASE_URL="https://your-org.atlassian.net"
export JIRA_TYPE="cloud"
export JIRA_AUTH_TYPE="basic"
```

### `~/.mcp.json`

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

---

## Updating

To update the integration:

```bash
# 1. Navigate to project
cd /path/to/JIRA

# 2. Pull latest changes (if using git)
git pull

# 3. Rebuild MCP server
cd mcp-server
bun install
bun run build

# 4. Restart Claude Code
# (exit and start fresh)
```

---

## Uninstalling

To remove the integration:

```bash
# 1. Remove MCP server configuration
# Edit ~/.mcp.json and remove the "jira" entry

# 2. Remove environment variables
# Edit ~/.zshrc and remove JIRA_* export lines

# 3. Reload shell
source ~/.zshrc

# 4. Optional: Remove MCP server files
rm -rf /path/to/JIRA
```

---

## Security Best Practices

1. **Never commit API tokens** to version control
2. **Rotate tokens periodically** (every 90 days recommended)
3. **Use minimal JIRA permissions** (only what's needed)
4. **Keep `.zshrc` secure** (`chmod 600 ~/.zshrc`)
5. **Monitor API usage** in JIRA admin panel
6. **Use HTTPS only** for JIRA_BASE_URL

---

## How It Works

Claude Code automatically loads MCP servers from `~/.mcp.json` at startup. The JIRA MCP server:

1. **Starts** when Claude Code launches
2. **Exposes 6 tools** for JIRA operations
3. **Uses environment variables** for authentication
4. **Communicates via stdio** (standard input/output)
5. **Supports both Cloud and Server** JIRA instances

---

## Available Tools

The JIRA MCP server provides 6 tools:

| Tool | Purpose | Example |
|------|---------|---------|
| `search_issues` | Search using JQL | Search for open bugs |
| `get_issue` | Get issue details | Get PROJ-123 details |
| `get_user_by_email` | Look up users | Find user by email |
| `create_issue` | Create new issue | Create bug in PROJ |
| `update_issue` | Update existing issue | Change priority |
| `add_comment` | Add comment to issue | Add progress note |

For detailed API specifications, see [API-Reference.md](./API-Reference.md).

---

## Next Steps

1. **Learn JQL:** See [Usage-Examples.md](./Usage-Examples.md) for query patterns
2. **Explore Tools:** Review [API-Reference.md](./API-Reference.md) for tool details
3. **Troubleshoot:** Check [Troubleshooting.md](./Troubleshooting.md) if issues arise

---

## Success Confirmation

Installation is successful when you can:

✅ Start Claude Code
✅ Search for JIRA issues
✅ See your actual JIRA data returned
✅ Create test issues
✅ Update issues and add comments

**Congratulations! Your JIRA MCP integration is ready to use.**
