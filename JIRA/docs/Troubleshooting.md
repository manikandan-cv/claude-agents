# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the JIRA MCP integration.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Authentication Issues](#authentication-issues)
- [Environment Variables](#environment-variables)
- [MCP Server Errors](#mcp-server-errors)
- [MCP Configuration Issues](#mcp-configuration-issues)
- [API Deprecation Issues](#api-deprecation-issues)
- [JQL Syntax Errors](#jql-syntax-errors)
- [Network and Connectivity](#network-and-connectivity)
- [Debug Strategies](#debug-strategies)
- [Common Error Messages](#common-error-messages)

---

## Quick Diagnostics

### Step 1: Check Environment Variables

```bash
# Verify all required variables are set
echo $JIRA_API_TOKEN     # Should show your token
echo $JIRA_USER_EMAIL    # Should show your email
echo $JIRA_BASE_URL      # Should show your JIRA URL
```

### Step 2: Test JIRA API Access

```bash
# Test basic authentication (replace with your values)
curl -u "your-email@company.com:YOUR_API_TOKEN" \
  -H "Accept: application/json" \
  "https://your-domain.atlassian.net/rest/api/3/myself"
```

Expected response: Your user details in JSON format.

### Step 3: Verify MCP Server Build

```bash
cd /path/to/mcp-server
bun run build
ls -la build/index.js  # Should exist and be executable
```

### Step 4: Check MCP Configuration

```bash
cat ~/.mcp.json

# Should show your JIRA MCP server configuration
```

---

## Authentication Issues

### Error: "401 Unauthorized"

**Symptom**: All API calls fail with 401 error.

**Causes**:
1. Invalid API token
2. Incorrect email address
3. Token expired or revoked
4. Wrong authentication type

**Solutions**:

1. **Regenerate API Token**:
   ```
   1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
   2. Click "Create API token"
   3. Copy the new token
   4. Update JIRA_API_TOKEN environment variable
   5. Restart Claude Desktop
   ```

2. **Verify Email Address**:
   ```bash
   # Must match your Atlassian account email exactly
   echo $JIRA_USER_EMAIL
   ```

3. **Check Authentication Type**:
   ```json
   {
     "mcpServers": {
       "jira": {
         "env": {
           "JIRA_AUTH_TYPE": "basic"  // Use "basic" for API tokens
         }
       }
     }
   }
   ```

### Error: "403 Forbidden"

**Symptom**: Authentication succeeds but operations fail.

**Causes**:
1. Insufficient JIRA permissions
2. Project restrictions
3. Issue-level security

**Solutions**:

1. **Check Your Permissions**:
   - Log into JIRA web interface
   - Try performing the action manually
   - Contact your JIRA admin for required permissions

2. **Common Required Permissions**:
   - Browse Projects (for search)
   - Create Issues (for create_issue)
   - Edit Issues (for update_issue)
   - Add Comments (for add_comment)

3. **Verify Project Access**:
   ```bash
   # Test if you can access a specific project
   curl -u "your-email:token" \
     "https://your-domain.atlassian.net/rest/api/3/project/PROJ"
   ```

---

## Environment Variables

### Error: "JIRA_API_TOKEN environment variable is required"

**Symptom**: Server won't start, shows environment variable error.

**Solution**:

1. **Check Configuration File**:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Verify Format**:
   ```json
   {
     "mcpServers": {
       "jira": {
         "command": "/path/to/bun",
         "args": ["run", "/path/to/mcp-server/build/index.js"],
         "env": {
           "JIRA_API_TOKEN": "your-api-token-here",
           "JIRA_USER_EMAIL": "your-email@company.com",
           "JIRA_BASE_URL": "https://your-domain.atlassian.net"
         }
       }
     }
   }
   ```

3. **Common Mistakes**:
   - Missing quotes around values
   - Trailing commas in JSON
   - Extra spaces in environment variable names
   - Wrong file path to MCP server

### Invalid JIRA_BASE_URL

**Symptoms**:
- Connection timeouts
- 404 errors on all requests

**Common Issues**:

| Wrong | Correct |
|-------|---------|
| `http://domain.atlassian.net` | `https://domain.atlassian.net` |
| `https://domain.atlassian.net/` | `https://domain.atlassian.net` |
| `domain.atlassian.net` | `https://domain.atlassian.net` |

**Solution**:
```json
{
  "JIRA_BASE_URL": "https://your-domain.atlassian.net"
}
```

Note: No trailing slash, must use HTTPS.

---

## MCP Server Errors

### Error: "Server failed to start"

**Symptom**: Claude can't connect to JIRA MCP server.

**Debug Steps**:

1. **Check Server Logs**:
   ```bash
   # On macOS, check Console.app for Claude logs
   # Or run server manually to see errors:
   cd /path/to/mcp-server
   JIRA_API_TOKEN="token" \
   JIRA_USER_EMAIL="email" \
   JIRA_BASE_URL="url" \
   bun run build/index.js
   ```

2. **Verify Build**:
   ```bash
   cd /path/to/mcp-server
   rm -rf build
   bun run build
   chmod +x build/index.js
   ```

3. **Check Bun Installation**:
   ```bash
   which bun
   bun --version
   ```

4. **Test Manually**:
   ```bash
   # Set environment variables
   export JIRA_API_TOKEN="your-token"
   export JIRA_USER_EMAIL="your-email@company.com"
   export JIRA_BASE_URL="https://your-domain.atlassian.net"

   # Run server
   cd /path/to/mcp-server
   bun run build/index.js
   ```

### Error: "Tool not found" or "Unknown tool"

**Symptom**: Claude says it doesn't have access to JIRA tools.

**Solutions**:

1. **Restart Claude Desktop**:
   - Completely quit Claude Desktop
   - Reopen and try again

2. **Verify Server Registration**:
   - Check `claude_desktop_config.json` has correct server configuration
   - Ensure server name matches in config

3. **Check Server Status**:
   - Ask Claude: "What MCP servers are available?"
   - Verify JIRA server appears in the list

---

## MCP Configuration Issues

### Issue: "MCP server not loading"

**Symptom**: JIRA tools are not available in Claude Code.

**Diagnosis**:

```bash
# 1. Check ~/.mcp.json exists
ls -la ~/.mcp.json

# 2. Validate JSON syntax
cat ~/.mcp.json | jq

# 3. Check environment variables are loaded
echo $JIRA_API_TOKEN
echo $JIRA_USER_EMAIL
echo $JIRA_BASE_URL

# 4. Verify MCP server file exists
ls -la /path/to/JIRA/mcp-server/build/index.js
```

**Solution**:

1. **Verify ~/.mcp.json exists and is valid**:

```bash
cat ~/.mcp.json
```

Should contain:
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

2. **Ensure absolute path is correct**:
   - Replace `/absolute/path/to/` with your actual path
   - Example: `/Users/username/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js`

3. **Reload environment variables**:

```bash
# Option A: Open a brand new terminal window/tab (recommended)

# Option B: Reload in current terminal
source ~/.zshrc

# Verify they're loaded
echo "Token: ${JIRA_API_TOKEN:0:20}..."
echo "Email: $JIRA_USER_EMAIL"
echo "URL: $JIRA_BASE_URL"
```

4. **Restart Claude Code completely**:

```bash
# Exit current session (not just /clear)
exit

# Start fresh in new terminal
claude
```

### Issue: "Environment variables not loaded"

**Symptom**: Variables show empty even though they're in ~/.zshrc

```bash
echo $JIRA_API_TOKEN   # Shows nothing
```

**Cause**: Current terminal session doesn't have variables loaded yet.

**Solution**:

**Option A (Recommended):**
1. Close terminal completely
2. Open a brand new terminal window/tab
3. Verify: `echo $JIRA_API_TOKEN`
4. Start Claude Code: `claude`

**Option B:**
```bash
source ~/.zshrc
echo $JIRA_API_TOKEN  # Should now show your token
```

**Important**: Claude Code inherits environment from the terminal it's launched from. If variables aren't in the terminal, Claude Code won't see them either.

### Issue: "MCP server starts but no tools available"

**Symptom**: Server runs but Claude says "no JIRA tools available"

**Diagnosis**:

```bash
# Test server manually with environment loaded
cd /path/to/mcp-server
source ~/.zshrc
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun run start
```

**Expected**: JSON response with 6 tools (search_issues, get_issue, etc.)

**If tools appear in manual test but not in Claude Code**:
1. Wrong path in `~/.mcp.json`
2. Environment variables not loaded in Claude Code session
3. MCP server build is outdated

**Solutions**:

1. **Verify ~/.mcp.json path**:
```bash
cat ~/.mcp.json
```

Check the `args` array has correct absolute path to build/index.js.

2. **Check environment variables syntax**:
```json
{
  "mcpServers": {
    "jira": {
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}"
      }
    }
  }
}
```

Variables must use `${VAR_NAME}` syntax.

3. **Rebuild MCP server**:
```bash
cd /path/to/JIRA/mcp-server
bun run build
```

4. **Restart with debug mode**:
```bash
export MCP_DEBUG=1
claude
```

Check logs for MCP server startup errors.

---

## API Deprecation Issues

### Error: "404 Not Found" on search endpoint

**Symptom**: Search queries fail with 404 error.

**Cause**: The old `/rest/api/3/search` endpoint has been deprecated by Atlassian (Change-2046).

**Solution**:

The MCP server has been updated to use the new `/rest/api/3/search/jql` endpoint. Ensure you have the latest version:

```bash
cd /path/to/JIRA/mcp-server

# Pull latest changes if using git
git pull

# Rebuild
bun run build

# Restart Claude Code
```

**Key Changes in New API**:
- Endpoint changed: `/rest/api/3/search` → `/rest/api/3/search/jql`
- Pagination uses `nextPageToken` instead of `startAt`
- Response format is more concise

### Error: "Search endpoint removed"

**Symptom**: Error message mentions deprecated or removed search endpoint.

**Solution**:

Verify you're running the updated MCP server:

```bash
# Check the service file for the new endpoint
grep "search/jql" /path/to/JIRA/mcp-server/src/services/jira-cloud-api.ts

# Should show: let endpoint = `/rest/api/3/search/jql`;
```

If not found, update the code:

1. Update `jira-cloud-api.ts` line ~189:
   ```typescript
   let endpoint = `/rest/api/3/search/jql`;
   ```

2. Update v2 fallback line ~216:
   ```typescript
   endpoint = `/rest/api/2/search/jql`;
   ```

3. Rebuild and restart:
   ```bash
   bun run build
   # Restart Claude Code
   ```

---

## JQL Syntax Errors

### Error: "Invalid JQL query"

**Common JQL Mistakes**:

| Wrong | Correct | Issue |
|-------|---------|-------|
| `status = In Progress` | `status = "In Progress"` | Spaces need quotes |
| `project = proj` | `project = PROJ` | Case sensitive |
| `assignee = me` | `assignee = currentUser()` | Wrong function |
| `created > 7 days` | `created >= -7d` | Wrong date syntax |
| `priority = high` | `priority = High` | Case sensitive |

### Common JQL Errors and Fixes

**Error**: `Field 'xyz' does not exist`

**Solution**: Check field name spelling and case:
```sql
-- Wrong
summery ~ "bug"

-- Correct
summary ~ "bug"
```

**Error**: `The value 'xyz' does not exist for the field 'status'`

**Solution**: Use exact status names from your JIRA:
```sql
-- Check valid statuses in JIRA UI first
-- Common statuses:
status = "To Do"
status = "In Progress"
status = "Done"
```

**Error**: `Cannot parse date`

**Solution**: Use proper date format:
```sql
-- Wrong
created > 2026/03/01

-- Correct
created >= 2026-03-01
created >= -7d
created >= startOfWeek()
```

### JQL Testing Tips

1. **Test in JIRA First**:
   - Go to JIRA web interface
   - Use Advanced Issue Search
   - Verify JQL works there first

2. **Start Simple**:
   ```sql
   -- Start with basic query
   project = PROJ

   -- Add conditions one at a time
   project = PROJ AND status = Open

   -- Add more filters
   project = PROJ AND status = Open AND assignee = currentUser()
   ```

3. **Use JQL Builder**:
   - In JIRA, use "Basic" search mode
   - Add filters using UI
   - Switch to "Advanced" to see generated JQL

---

## Network and Connectivity

### Error: "Connection timeout" or "ECONNREFUSED"

**Causes**:
1. Network connectivity issues
2. Firewall blocking requests
3. Incorrect base URL
4. JIRA instance down

**Solutions**:

1. **Test Network**:
   ```bash
   # Ping JIRA domain
   ping your-domain.atlassian.net

   # Test HTTPS connection
   curl -I https://your-domain.atlassian.net
   ```

2. **Check Proxy Settings**:
   ```json
   {
     "mcpServers": {
       "jira": {
         "env": {
           "HTTP_PROXY": "http://proxy.company.com:8080",
           "HTTPS_PROXY": "http://proxy.company.com:8080"
         }
       }
     }
   }
   ```

3. **Verify Firewall**:
   - Check if corporate firewall blocks Atlassian domains
   - Contact IT if needed

### Error: "SSL certificate verification failed"

**Symptom**: Connection fails with SSL/TLS errors.

**Solutions**:

1. **Update System Certificates**:
   ```bash
   # macOS
   sudo security update-certs
   ```

2. **For Self-Signed Certificates** (JIRA Server only):
   ```javascript
   // Not recommended for production
   // Add to server code only if absolutely necessary
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   ```

---

## Debug Strategies

### Enable Detailed Logging

The JIRA MCP server includes built-in logging. Check logs for details:

**Log Locations**:
- macOS: Console.app → Filter for "Claude"
- Manual run: Logs printed to terminal

**Log Levels**:
- INFO: Normal operations
- WARN: API fallbacks, non-critical issues
- ERROR: Failures and exceptions

### Manual Testing Workflow

1. **Export Environment Variables**:
   ```bash
   export JIRA_API_TOKEN="your-token"
   export JIRA_USER_EMAIL="your-email@company.com"
   export JIRA_BASE_URL="https://your-domain.atlassian.net"
   ```

2. **Run Server Manually**:
   ```bash
   cd /path/to/mcp-server
   bun run build/index.js
   ```

3. **Check Output**:
   - Look for "JIRA MCP Server initialized"
   - Look for "JIRA MCP Server running on stdio"
   - Check for any ERROR messages

### Using cURL for Direct API Testing

Test JIRA API directly to isolate issues:

```bash
# Search issues
curl -u "email:token" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"jql":"project = PROJ","maxResults":5}' \
  "https://your-domain.atlassian.net/rest/api/3/search"

# Get issue
curl -u "email:token" \
  "https://your-domain.atlassian.net/rest/api/3/issue/PROJ-123"

# Get user
curl -u "email:token" \
  "https://your-domain.atlassian.net/rest/api/3/user/search?query=email@company.com"
```

### API Version Fallback Debugging

The server auto-falls back from v3 to v2. Check logs for:

```
API v3 failed, trying v2 fallback
```

If you see this repeatedly:
1. Your JIRA may be using older API version
2. Consider setting default to v2 in code
3. Check JIRA instance version

---

## Common Error Messages

### "User not found"

**Full Error**: `User not found: email@company.com`

**Causes**:
- Email doesn't exist in JIRA
- User is deactivated
- Typo in email address

**Solutions**:
1. Verify email in JIRA user management
2. Check if user is active
3. Use exact email address from JIRA profile

### "Project not found"

**Full Error**: `Project does not exist or you do not have permission to see it`

**Causes**:
- Wrong project key
- No access to project
- Project archived/deleted

**Solutions**:
1. Verify project key in JIRA (e.g., "PROJ")
2. Check project permissions
3. Ask project admin for access

### "Issue type not valid"

**Full Error**: `Issue type 'XYZ' is not valid for project PROJ`

**Causes**:
- Issue type doesn't exist
- Issue type not enabled for project
- Case sensitivity

**Solutions**:
1. Check available issue types in project settings
2. Use exact case: "Bug" not "bug"
3. Common types: "Bug", "Task", "Story", "Sub-task", "Epic"

### "Priority does not exist"

**Full Error**: `Priority 'XYZ' does not exist`

**Causes**:
- Invalid priority name
- Custom priority scheme

**Solutions**:
1. Check valid priorities in JIRA
2. Common priorities: "Highest", "High", "Medium", "Low", "Lowest"
3. Use exact case

### "Field is required"

**Full Error**: `Field 'summary' is required`

**Causes**:
- Missing required field
- Field required by workflow/screen

**Solutions**:
1. Always include required fields: projectKey, issueType, summary
2. Check project configuration for additional required fields
3. Ask JIRA admin about custom required fields

---

## Performance Issues

### Slow Search Results

**Symptoms**: Searches take a long time or timeout.

**Solutions**:

1. **Limit Results**:
   ```javascript
   search_issues({
     jql: "project = PROJ",
     maxResults: 25  // Instead of default 50
   })
   ```

2. **Optimize JQL**:
   ```sql
   -- Slow
   text ~ "bug"

   -- Faster
   project = PROJ AND summary ~ "bug"
   ```

3. **Add Date Ranges**:
   ```sql
   -- Searches entire history (slow)
   project = PROJ AND status = Open

   -- Limits scope (faster)
   project = PROJ AND status = Open AND created >= -90d
   ```

---

## Getting Help

### Information to Provide

When asking for help, include:

1. **Environment**:
   - Operating system
   - Claude Desktop version
   - Bun version

2. **Configuration**:
   - JIRA type (Cloud or Server)
   - JIRA base URL (redact specifics)
   - Authentication type

3. **Error Details**:
   - Exact error message
   - Tool being used
   - Steps to reproduce

4. **Logs**:
   - Relevant log entries
   - Any console output

### Support Resources

- **JIRA API Documentation**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **MCP Documentation**: https://modelcontextprotocol.io/
- **GitHub Issues**: Report bugs in the repository

---

## Preventive Measures

### Regular Maintenance

1. **Update API Token Regularly**:
   - Set reminders to rotate tokens
   - Document token creation date

2. **Monitor Permissions**:
   - Verify access to critical projects
   - Test after JIRA permission changes

3. **Keep Dependencies Updated**:
   ```bash
   cd /path/to/mcp-server
   bun update
   bun run build
   ```

4. **Backup Configuration**:
   ```bash
   cp ~/Library/Application\ Support/Claude/claude_desktop_config.json \
      ~/claude_desktop_config.backup.json
   ```

### Testing Checklist

Before deploying to team, verify:

- [ ] Authentication works
- [ ] Can search issues
- [ ] Can get issue details
- [ ] Can create issues
- [ ] Can update issues
- [ ] Can add comments
- [ ] JQL queries work
- [ ] User lookup works
- [ ] Error messages are clear

---

## Next Steps

- Review [API Reference](./API-Reference.md) for tool specifications
- Check [Usage Examples](./Usage-Examples.md) for working examples
- See [Setup Guide](./Setup-Guide.md) for initial configuration
