# JIRA MCP Integration - Verification Checklist

Use this checklist to verify the complete installation and functionality.

## ✅ Pre-Installation Verification

- [ ] Bun is installed: `bun --version`
- [ ] Claude Code is installed: `claude --version`
- [ ] JIRA instance is accessible
- [ ] Have JIRA account with appropriate permissions

## ✅ Environment Setup

- [ ] API token generated from JIRA
- [ ] Environment variables set in ~/.zshrc or ~/.bashrc:
  - [ ] JIRA_API_TOKEN
  - [ ] JIRA_USER_EMAIL
  - [ ] JIRA_BASE_URL
- [ ] Shell reloaded: `source ~/.zshrc`
- [ ] Variables verified: `echo $JIRA_API_TOKEN` (shows value)

## ✅ MCP Server Build

- [ ] Dependencies installed: `cd mcp-server && bun install`
- [ ] Server built: `bun run build`
- [ ] Build file exists: `ls -lh build/index.js` (200-300 KB)
- [ ] File is executable: `ls -l build/index.js` shows execute permission

## ✅ MCP Server Testing

- [ ] Server responds to tools/list:
  ```bash
  echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun mcp-server/build/index.js
  ```
  Should return JSON with 6 tools

- [ ] No startup errors in stderr

## ✅ JIRA API Connection

- [ ] API connection works:
  ```bash
  curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
       "$JIRA_BASE_URL/rest/api/3/myself"
  ```
  Should return your user profile

- [ ] No authentication errors (401, 403)

## ✅ Skill Installation

- [ ] Skill directory copied: `ls -la ~/.claude/plugins/jira-query/`
- [ ] Required files exist:
  - [ ] SKILL.md
  - [ ] .mcp.json
  - [ ] .claude-plugin/plugin.json
  - [ ] reference/jql-patterns.md
  - [ ] reference/date-conversion.md
  - [ ] reference/examples.md

- [ ] .mcp.json has correct path to build/index.js

## ✅ Plugin Registration (CRITICAL)

**This step is required or the skill won't load!**

- [ ] Plugin enabled in settings.json:
  ```bash
  grep "jira-query" ~/.claude/settings.json
  ```
  Should return: `"jira-query": true`

- [ ] Plugin registered in installed_plugins.json:
  ```bash
  grep "jira-query" ~/.claude/plugins/installed_plugins.json
  ```
  Should return entry with installPath

- [ ] Both configuration files updated:
  - [ ] ~/.claude/settings.json has `"jira-query": true`
  - [ ] ~/.claude/plugins/installed_plugins.json has jira-query entry

## ✅ Environment Reload

**Variables must be loaded BEFORE starting Claude Code!**

- [ ] Environment variables verified in current terminal:
  ```bash
  echo "Token: ${JIRA_API_TOKEN:0:20}..."
  echo "Email: $JIRA_USER_EMAIL"
  echo "URL: $JIRA_BASE_URL"
  ```
  All three should show values (not empty)

- [ ] Either:
  - [ ] Opened brand new terminal window/tab, OR
  - [ ] Ran `source ~/.zshrc` in current terminal

## ✅ Claude Code Integration

- [ ] Claude Code completely restarted (not just new session)
- [ ] Claude Code starts without errors: `claude`
- [ ] Skill loads (no error messages on startup)
- [ ] No "Install JIRA CLI" prompt when asking about JIRA

## ✅ Functional Testing

### Test 1: Basic Search

- [ ] Query: "show me my open JIRA issues"
- [ ] Expected: Returns list of your open issues (or "no issues found")
- [ ] No errors displayed

### Test 2: Specific Issue

- [ ] Query: "show me JIRA issue [YOUR-ISSUE-KEY]"
- [ ] Expected: Returns issue details with description and comments
- [ ] Displays correctly formatted output

### Test 3: User Lookup

- [ ] Query: "find issues assigned to [colleague-email]"
- [ ] Expected: Returns issues or "user not found" if invalid email
- [ ] No authentication errors

### Test 4: Date Query

- [ ] Query: "show bugs created in the last week"
- [ ] Expected: Returns recent bugs with creation dates
- [ ] Dates are within last 7 days

### Test 5: Create Issue (Optional)

- [ ] Query: "create a test issue in [PROJECT-KEY]: Testing JIRA integration"
- [ ] Expected: Issue created successfully with returned key
- [ ] Can verify in JIRA web interface

### Test 6: Update Issue (Optional)

- [ ] Query: "change priority of [ISSUE-KEY] to High"
- [ ] Expected: Issue updated successfully
- [ ] Can verify change in JIRA

### Test 7: Add Comment (Optional)

- [ ] Query: "comment on [ISSUE-KEY]: Testing comment functionality"
- [ ] Expected: Comment added successfully
- [ ] Can verify comment in JIRA

## ✅ Error Handling

- [ ] Invalid JQL query shows helpful error message
- [ ] Non-existent issue key shows "not found" error
- [ ] Invalid email shows "user not found" error
- [ ] Errors don't expose API tokens or sensitive data

## ✅ Debug Mode

- [ ] Debug mode enables: `export MCP_DEBUG=1`
- [ ] Shows detailed logs in Claude Code
- [ ] Logs include:
  - [ ] MCP server startup
  - [ ] Tool calls
  - [ ] API requests
  - [ ] No sensitive data (tokens redacted)

## ✅ Documentation

- [ ] README.md is clear and complete
- [ ] Setup-Guide.md has accurate installation steps
- [ ] Usage-Examples.md has relevant examples
- [ ] API-Reference.md documents all 6 tools
- [ ] Troubleshooting.md addresses common issues

## ✅ Configuration Files

- [ ] config/env-template has correct format
- [ ] config/claude-config-template.json is valid JSON
- [ ] config/mcp-config-examples.md has useful examples

## ✅ Security

- [ ] No hardcoded API tokens in any file
- [ ] .gitignore includes sensitive files (build/, .env)
- [ ] Environment variables are properly scoped
- [ ] API tokens don't appear in logs

## ✅ Performance

- [ ] Searches return in < 3 seconds
- [ ] MCP server starts quickly (< 1 second)
- [ ] No memory leaks or hanging processes
- [ ] Can handle multiple queries in succession

## Common Issues Checklist

If something doesn't work, check:

### Authentication Issues
- [ ] API token is valid (not expired)
- [ ] Email matches token owner
- [ ] Base URL is correct (no trailing slash)
- [ ] Using correct auth type (basic vs bearer)

### MCP Server Issues
- [ ] Build file exists and is executable
- [ ] Environment variables are set
- [ ] Path in .mcp.json is absolute (not relative)
- [ ] No syntax errors in TypeScript files

### Skill Issues
- [ ] Skill is in correct directory (~/.claude/plugins/jira-query)
- [ ] SKILL.md has valid YAML frontmatter
- [ ] .mcp.json has valid JSON syntax
- [ ] Tool references use correct syntax (~~project tracker)

### Network Issues
- [ ] Can reach JIRA URL from terminal
- [ ] No proxy blocking requests
- [ ] SSL certificates are valid
- [ ] Firewall allows outbound HTTPS

## Success Criteria

Installation is successful when ALL of these work:

✅ Environment variables are set correctly
✅ MCP server builds without errors
✅ MCP server responds to tools/list
✅ JIRA API connection works (curl test)
✅ Skill loads in Claude Code
✅ Can search for JIRA issues
✅ Can get specific issue details
✅ Can create test issue
✅ No sensitive data in logs
✅ Documentation is accurate

## Performance Benchmarks

Expected performance:

- **MCP Server Build:** < 5 seconds
- **MCP Server Startup:** < 1 second
- **Search Query (< 50 results):** < 3 seconds
- **Get Single Issue:** < 2 seconds
- **Create Issue:** < 3 seconds
- **User Lookup:** < 2 seconds

If slower, check:
- Network latency to JIRA
- JIRA instance performance
- MCP_DEBUG mode enabled (adds overhead)

## Debug Commands Reference

```bash
# Test environment variables
echo "Token: ${JIRA_API_TOKEN:0:10}..."
echo "Email: $JIRA_USER_EMAIL"
echo "URL: $JIRA_BASE_URL"

# Test MCP server standalone
cd /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun run start

# Test JIRA API directly
curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
     "$JIRA_BASE_URL/rest/api/3/myself" | jq

# Test search endpoint
curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jql":"project=PROJ","maxResults":5}' \
     "$JIRA_BASE_URL/rest/api/3/search" | jq

# Enable debug mode
export MCP_DEBUG=1
claude

# Check skill installation
ls -la ~/.claude/plugins/jira-query/

# Verify skill files
cat ~/.claude/plugins/jira-query/.mcp.json
head -20 ~/.claude/plugins/jira-query/SKILL.md
```

## Final Verification

Once all checkboxes are complete, the JIRA MCP integration is fully operational and ready for daily use.

**Date Verified:** _______________

**Verified By:** _______________

**Notes:**
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
