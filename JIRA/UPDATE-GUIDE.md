# Update Guide - March 2026

## What Changed

Two major updates were released on March 17, 2026:

### 1. ✅ JIRA API Endpoint Update (Critical)

Atlassian deprecated the old search endpoint. The MCP server has been updated to use the new endpoint.

- **Old**: `/rest/api/3/search`
- **New**: `/rest/api/3/search/jql`

### 2. ✅ Simplified Configuration

Setup process simplified using `~/.mcp.json` instead of plugin system.

- **Old**: Complex plugin registration in multiple files
- **New**: Single `~/.mcp.json` configuration file

---

## Do I Need to Update?

### If you're seeing errors:

**Yes, update immediately** if you see:
- "404 Not Found" on search
- "Endpoint deprecated" messages
- "Search endpoint removed" errors

### If everything is working:

**Still recommended** to update for:
- Future compatibility
- Simpler configuration
- Latest bug fixes

---

## Quick Update (5 minutes)

### Step 1: Update Code

```bash
cd /path/to/JIRA
git pull  # or download latest version
```

### Step 2: Rebuild MCP Server

```bash
cd mcp-server
bun install
bun run build
```

### Step 3: Update Configuration (Optional but Recommended)

**If you have `~/.claude/plugins/jira-query/.mcp.json`**, migrate to simpler approach:

Create `~/.mcp.json`:

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

**Replace** `/absolute/path/to/` with your actual path.

### Step 4: Restart Claude Code

```bash
# Exit Claude Code completely
exit

# Open fresh terminal
claude
```

### Step 5: Test

```
Search JIRA for my open issues
```

**Done!** ✅

---

## Detailed Update Instructions

### For Plugin Users (Old Setup)

If you installed using the plugin method before March 17, 2026:

#### Option A: Migrate to New Method (Recommended)

1. **Create `~/.mcp.json`:**
   ```bash
   nano ~/.mcp.json
   ```

2. **Add configuration:**
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

3. **Update MCP server:**
   ```bash
   cd /path/to/JIRA/mcp-server
   git pull
   bun run build
   ```

4. **Clean up old plugin files (optional):**
   ```bash
   # Remove plugin references from settings.json
   # Remove plugin references from installed_plugins.json
   # Or just leave them - they won't interfere
   ```

5. **Restart Claude Code**

#### Option B: Keep Plugin Method

If you prefer to keep the plugin approach:

1. **Update MCP server code:**
   ```bash
   cd /path/to/JIRA/mcp-server
   git pull
   bun run build
   ```

2. **Copy updated files:**
   ```bash
   cp -r ../skill ~/.claude/plugins/jira-query
   ```

3. **Restart Claude Code**

---

## Verify Update Worked

### 1. Check MCP Server Version

The new endpoint should be in the code:

```bash
grep "search/jql" /path/to/JIRA/mcp-server/src/services/jira-cloud-api.ts
```

Should show: `let endpoint = `/rest/api/3/search/jql`;`

### 2. Test Search

```
Search JIRA for open issues
```

Should work without errors.

### 3. Check Logs (Optional)

```bash
export MCP_DEBUG=1
claude
# Try a search
# Check logs show /search/jql endpoint
```

---

## Troubleshooting Updates

### Error: "Still getting 404 on search"

**Cause:** Old MCP server build still running.

**Solution:**
```bash
# Rebuild
cd /path/to/JIRA/mcp-server
bun run build

# Verify build timestamp
ls -la build/index.js

# Should be recent (today's date)
```

### Error: "MCP server not loading"

**Cause:** Wrong path in `~/.mcp.json`.

**Solution:**
```bash
# Check path
cat ~/.mcp.json | jq -r '.mcpServers.jira.args[0]'

# Verify file exists
ls -la /path/shown/above
```

### Error: "Environment variables not found"

**Cause:** Terminal session not reloaded.

**Solution:**
```bash
# Open brand new terminal
# Verify variables
echo $JIRA_API_TOKEN
echo $JIRA_USER_EMAIL
echo $JIRA_BASE_URL

# If empty, reload
source ~/.zshrc
```

---

## What if I Don't Update?

### Short term:

- Search will fail with 404 errors
- Other tools (get issue, create, update, comment) still work
- JIRA removed the old endpoint, so search is broken

### Long term:

- Missing bug fixes
- Missing future improvements
- Potentially more endpoints deprecated

**Recommendation:** Update now (takes 5 minutes).

---

## Need Help?

### 1. Check Documentation

- [Setup Guide](docs/Setup-Guide.md) - Updated installation instructions
- [Troubleshooting](docs/Troubleshooting.md) - Common issues and fixes
- [Changelog](CHANGELOG.md) - Full change details

### 2. Debug Mode

```bash
export MCP_DEBUG=1
claude
# Try the failing operation
# Check logs for errors
```

### 3. Test Components

**Test MCP server:**
```bash
cd /path/to/JIRA/mcp-server
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun run start
```

**Test JIRA API:**
```bash
curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"jql":"project=PROJ","maxResults":5}' \
  "$JIRA_BASE_URL/rest/api/3/search/jql"
```

---

## Summary

### What You Need to Do

✅ **Required:**
1. Update code (`git pull`)
2. Rebuild server (`bun run build`)
3. Restart Claude Code

✅ **Recommended:**
4. Migrate to `~/.mcp.json` (simpler)

### Time Required

- **Basic update**: 5 minutes
- **With migration**: 10 minutes

### Result

- ✅ Search works again
- ✅ Simpler configuration
- ✅ Future-proof setup

**Questions?** Check [Troubleshooting.md](docs/Troubleshooting.md)
