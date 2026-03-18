# MCP Architecture

Understanding the Model Context Protocol (MCP) architecture for the JIRA integration.

## What is MCP?

The Model Context Protocol (MCP) is a standardized protocol that enables AI assistants to securely connect to external data sources and tools. It provides:

- **Standardized Communication** - JSON-RPC 2.0 protocol for tool calls
- **Multiple Transports** - stdio, HTTP, WebSocket support
- **Security** - Local execution, environment variable management
- **Extensibility** - Easy to add new tools and capabilities

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code CLI                        │
│                                                             │
│  User Input: "show me my open bugs in JIRA"                │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │         Skill Dispatcher                          │    │
│  │  • Matches trigger phrases                        │    │
│  │  • Loads appropriate skill                        │    │
│  │  • Manages MCP connections                        │    │
│  └─────────────────┬─────────────────────────────────┘    │
└────────────────────┼──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   JIRA Query Skill                          │
│                   (skill/SKILL.md)                          │
│                                                             │
│  1. Parse Request                                           │
│     • Identify query intent (search, create, update)       │
│     • Extract key phrases (assignee, date, status)         │
│                                                             │
│  2. Convert to JQL                                          │
│     • "my bugs" → assignee = currentUser() AND type = Bug  │
│     • "last week" → created >= -7d                         │
│     • Reference: skill/reference/jql-patterns.md           │
│                                                             │
│  3. Lookup Users (if needed)                               │
│     • Convert email → accountId                            │
│     • Use get_user_by_email tool                           │
│                                                             │
│  4. Execute Search                                          │
│     • Call ~~project tracker search_issues                 │
│     • Tool reference resolves to MCP tool                  │
│                                                             │
│  5. Format Results                                          │
│     • Parse JSON response                                  │
│     • Present readable output                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   MCP Configuration                         │
│                   (~/.mcp.json)                             │
│                                                             │
│  {                                                          │
│    "mcpServers": {                                          │
│      "jira": {                                              │
│        "type": "stdio",                                     │
│        "command": "bun",                                    │
│        "args": ["/absolute/path/to/build/index.js"],       │
│        "env": {                                             │
│          "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",            │
│          "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",          │
│          "JIRA_BASE_URL": "${JIRA_BASE_URL}",              │
│          "JIRA_TYPE": "${JIRA_TYPE:-cloud}",               │
│          "JIRA_AUTH_TYPE": "${JIRA_AUTH_TYPE:-basic}"      │
│        }                                                    │
│      }                                                      │
│    }                                                        │
│  }                                                          │
│                                                             │
│  Note: Claude Code automatically loads ~/.mcp.json         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                Custom JIRA MCP Server                       │
│              (mcp-server/build/index.js)                    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │         JSON-RPC 2.0 Handler                     │     │
│  │  • tools/list → Return tool definitions          │     │
│  │  • tools/call → Execute tool handler             │     │
│  └─────────────────┬────────────────────────────────┘     │
│                    │                                        │
│  ┌─────────────────▼────────────────────────────────┐     │
│  │         Tool Handlers (6 tools)                  │     │
│  │                                                   │     │
│  │  1. search_issues(jql, maxResults)               │     │
│  │     → jiraService.searchIssues()                 │     │
│  │                                                   │     │
│  │  2. get_issue(issueIdOrKey)                      │     │
│  │     → jiraService.getIssueWithComments()         │     │
│  │                                                   │     │
│  │  3. get_user_by_email(email)                     │     │
│  │     → jiraService.getUserByEmail()               │     │
│  │                                                   │     │
│  │  4. create_issue(projectKey, ...)                │     │
│  │     → jiraService.createIssue()                  │     │
│  │                                                   │     │
│  │  5. update_issue(issueKey, fields)               │     │
│  │     → jiraService.updateIssue()                  │     │
│  │                                                   │     │
│  │  6. add_comment(issueIdOrKey, body)              │     │
│  │     → jiraService.addCommentToIssue()            │     │
│  └─────────────────┬────────────────────────────────┘     │
│                    │                                        │
│  ┌─────────────────▼────────────────────────────────┐     │
│  │      JIRA Cloud API Service                      │     │
│  │   (mcp-server/src/services/jira-cloud-api.ts)    │     │
│  │                                                   │     │
│  │  • Authentication (Basic/Bearer)                 │     │
│  │  • API version fallback (v3 → v2)                │     │
│  │  • ADF parsing (Atlassian Document Format)       │     │
│  │  • Error handling                                │     │
│  │  • Response formatting                           │     │
│  └─────────────────┬────────────────────────────────┘     │
└────────────────────┼──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    JIRA REST API                            │
│                                                             │
│  Try v3 first (using new endpoints per Change-2046):       │
│  ┌──────────────────────────────────────────────────┐     │
│  │  /rest/api/3/search/jql  (NEW - replaces search)│     │
│  │  /rest/api/3/issue/{key}                         │     │
│  │  /rest/api/3/user/search                         │     │
│  │  /rest/api/3/issue                               │     │
│  │  /rest/api/3/issue/{key}/comment                 │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  Fallback to v2 on error (for older JIRA instances):      │
│  ┌──────────────────────────────────────────────────┐     │
│  │  /rest/api/2/search                              │     │
│  │  /rest/api/2/issue/{key}                         │     │
│  │  /rest/api/2/user/search                         │     │
│  │  /rest/api/2/issue                               │     │
│  │  /rest/api/2/issue/{key}/comment                 │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  Authentication: Basic Auth or Bearer Token                │
│  Format: Authorization: Basic base64(email:token)          │
└─────────────────────────────────────────────────────────────┘
```

## Communication Flow

### Example: Search for Issues

```
1. User Input
   │
   ▼
   "show me my open bugs"

2. Skill Processing
   │
   ├─ Parse: intent=search, assignee=me, type=bug, status=open
   ├─ Convert: assignee = currentUser() AND type = Bug AND status != Closed
   │
   ▼

3. MCP Tool Call (JSON-RPC)
   │
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "search_issues",
       "arguments": {
         "jql": "assignee = currentUser() AND type = Bug AND status != Closed",
         "maxResults": 50
       }
     },
     "id": 1
   }
   │
   ▼

4. MCP Server Processing
   │
   ├─ Validate input
   ├─ Call jiraService.searchIssues()
   │  │
   │  ├─ Build URL: /rest/api/3/search/jql (new endpoint)
   │  ├─ Add auth header
   │  ├─ Send POST request with JQL
   │  │
   │  ▼
   │  JIRA API Response (v3 or v2)
   │  │
   │  ├─ Parse JSON (includes nextPageToken for pagination)
   │  ├─ Extract text from ADF
   │  ├─ Clean issue data
   │  │
   │  ▼
   │
   ├─ Format response
   │
   ▼

5. MCP Response (JSON-RPC)
   │
   {
     "jsonrpc": "2.0",
     "result": {
       "content": [
         {
           "type": "text",
           "text": "[{issue1}, {issue2}, ...]"
         }
       ]
     },
     "id": 1
   }
   │
   ▼

6. Skill Output Formatting
   │
   ├─ Parse JSON array
   ├─ Format as readable list
   │
   ▼

7. User Output
   │
   Found 3 open bugs:
   • PROJ-123: Login button not working (High)
   • PROJ-456: Error on form submission (Medium)
   • PROJ-789: Mobile layout broken (Low)
```

## Component Responsibilities

### Claude Code CLI
- **User Interface** - Accept commands, display results
- **Skill Management** - Load and execute skills
- **MCP Client** - Manage MCP server connections
- **Tool Resolution** - Resolve `~~project tracker` to actual MCP tool names

### JIRA Query Skill
- **Natural Language Processing** - Parse user intent
- **JQL Generation** - Convert phrases to JQL syntax
- **Workflow Orchestration** - Chain multiple tool calls
- **Result Formatting** - Present data to user

### MCP Configuration (.mcp.json)
- **Server Definition** - Specify command, transport, environment
- **Environment Variables** - Map shell variables to server
- **Server Lifecycle** - Define startup and shutdown behavior

### Custom MCP Server
- **Protocol Implementation** - Handle JSON-RPC messages
- **Tool Registry** - Define and expose tools
- **Request Routing** - Route tool calls to handlers
- **Error Handling** - Catch and format errors
- **Logging** - Debug output (to stderr)

### JIRA Cloud API Service
- **HTTP Client** - Make REST API requests
- **Authentication** - Build auth headers
- **API Versioning** - Try v3, fallback to v2
- **Data Transformation** - ADF ↔ plain text
- **Response Cleaning** - Extract relevant fields

### JIRA REST API
- **Data Source** - Issue, user, project data
- **Authentication** - Validate credentials
- **Permission Enforcement** - Respect user permissions
- **Rate Limiting** - Enforce API limits

## Transport: stdio

### Why stdio?

**Advantages:**
- ✅ Simple setup (no ports, no hosting)
- ✅ Fast communication (direct process pipe)
- ✅ Secure (local only, no network exposure)
- ✅ Easy debugging (readable JSON)
- ✅ Reliable (process lifecycle managed)

**When to use:**
- Personal use
- Team/internal tools
- Local development
- Quick prototyping

### Alternative: HTTP

**Advantages:**
- ✅ Remote access
- ✅ Multiple clients
- ✅ Load balancing
- ✅ Standard deployment

**When to use:**
- Production services
- Public APIs
- Scalability needs
- Multi-user access

**This integration uses stdio** because it's designed for personal/team use with local JIRA instances or cloud accounts.

## Tool Naming Convention

Tools are referenced in skills using category syntax:
```
~~project tracker search_issues
```

This resolves to the actual MCP tool name:
```
mcp__plugin_jira-query_jira__search_issues
```

**Naming pattern:**
```
mcp__plugin_{skill-name}_{server-name}__{tool-name}
```

Where:
- `skill-name` = "jira-query" (from `.claude-plugin/plugin.json`)
- `server-name` = "jira" (from `.mcp.json` mcpServers key)
- `tool-name` = "search_issues" (from MCP server tool definition)

**Benefits:**
- **Abstraction** - Skills use semantic categories, not technical names
- **Portability** - Skills work with different server implementations
- **Clarity** - `~~project tracker` is clearer than `mcp__plugin_jira-query_jira__`

## Data Flow: ADF Handling

JIRA Cloud uses Atlassian Document Format (ADF) for rich text. The MCP server handles conversion:

### Input (Plain Text → ADF)

```typescript
// User provides plain text
body: "This is a comment\nWith multiple lines"

// Server converts to ADF
{
  type: "doc",
  version: 1,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "This is a comment" }]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "With multiple lines" }]
    }
  ]
}
```

### Output (ADF → Plain Text)

```typescript
// JIRA returns ADF
{
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Hello" }] }
  ]
}

// Server extracts plain text
"Hello"
```

**Why?**
- Skills work with simple strings
- ADF complexity hidden from users
- Consistent interface across Cloud/Server

## Error Handling Flow

```
1. Error Occurs
   │
   ├─ JIRA API Error (HTTP 400/401/403/404/500)
   ├─ Network Error (timeout, connection)
   ├─ Validation Error (missing params)
   │
   ▼

2. Error Caught
   │
   ├─ In jira-cloud-api.ts: handleFetchError()
   ├─ Parse JIRA error response
   ├─ Create JiraApiError with context
   │
   ▼

3. Error Propagated
   │
   ├─ Thrown to tool handler in index.ts
   ├─ Caught in CallToolRequestSchema handler
   │
   ▼

4. Error Formatted
   │
   ├─ parseJiraError() extracts messages
   ├─ sanitizeErrorMessage() removes sensitive data
   ├─ Build MCP error response
   │
   ▼

5. Error Returned
   │
   {
     "content": [{
       "type": "text",
       "text": "Error: Issue not found (PROJ-999)"
     }],
     "isError": true
   }
   │
   ▼

6. Skill Handles Error
   │
   ├─ Present error to user
   ├─ Suggest fixes
   ├─ Log for debugging
```

## Security Architecture

### Authentication Flow

```
1. Environment Variables
   │
   ├─ JIRA_API_TOKEN (from ~/.zshrc)
   ├─ JIRA_USER_EMAIL (from ~/.zshrc)
   ├─ JIRA_BASE_URL (from ~/.zshrc)
   │
   ▼

2. .mcp.json Configuration
   │
   ├─ References: ${JIRA_API_TOKEN}
   ├─ Shell expansion at runtime
   │
   ▼

3. MCP Server Initialization
   │
   ├─ Reads from process.env
   ├─ Validates required variables
   ├─ Creates JiraCloudApiService
   │
   ▼

4. Build Auth Header
   │
   ├─ Basic: base64(email:token)
   ├─ Bearer: token
   │
   ▼

5. Every API Request
   │
   ├─ Authorization: Basic <base64>
   ├─ HTTPS only
   ├─ No token in logs
```

### Security Measures

- **No Hardcoded Secrets** - All credentials in environment variables
- **Local Execution** - Server runs on your machine
- **HTTPS Only** - All JIRA API calls encrypted
- **Token Sanitization** - Tokens removed from error messages
- **Permission Inheritance** - Uses your JIRA user permissions
- **Stderr Logging** - Debug logs to stderr, not stdout (no JSON-RPC interference)

## Performance Considerations

### Request Optimization

1. **Minimize Round Trips**
   - Fetch comments with issue in one call
   - Use JQL to filter server-side
   - Limit results with maxResults

2. **Efficient Transport**
   - stdio is faster than HTTP for local calls
   - JSON-RPC is lightweight
   - No polling or long-polling needed

3. **Smart Caching**
   - User lookup results could be cached (not currently implemented)
   - JQL query patterns could be memoized
   - Connection reuse (handled by fetch)

### Scalability

**Current Design:**
- ✅ Fast for personal use (< 100 issues)
- ✅ Handles team workflows (< 1000 issues)
- ⚠️ Limited for bulk operations (> 1000 issues)
- ⚠️ No built-in rate limiting

**For Large Scale:**
- Add request batching
- Implement pagination
- Add rate limit handling
- Use connection pooling

## Design Decisions

### 1. stdio vs HTTP
**Decision:** stdio
**Rationale:** Simpler for local/team use, no hosting required

### 2. TypeScript vs JavaScript
**Decision:** TypeScript
**Rationale:** Type safety, better IDE support, fewer bugs

### 3. Bun vs Node
**Decision:** Bun
**Rationale:** Faster builds, single-file output, simpler tooling

### 4. v3 with v2 Fallback
**Decision:** Try v3, fallback to v2
**Rationale:** Supports both Cloud (v3) and Server (v2), graceful degradation

### 5. ADF Abstraction
**Decision:** Hide ADF from skills
**Rationale:** Skills work with plain text, complexity encapsulated

### 6. 6 Core Tools
**Decision:** search, get, user, create, update, comment
**Rationale:** Covers 90% of use cases, room to extend

## Extension Points

To extend this architecture:

### Add New Tools
1. Define tool schema in `index.ts`
2. Add handler in `setupToolHandlers()`
3. Implement in `jira-cloud-api.ts`
4. Update `SKILL.md`

### Add New Skills
1. Create new skill directory
2. Write SKILL.md with prompts
3. Reference same `.mcp.json` server
4. Use existing tools

### Support Other Systems
1. Replace JIRA API with new API
2. Keep MCP server structure
3. Update type definitions
4. Modify tool implementations

### Change Transport
1. Swap StdioServerTransport for HTTPServerTransport
2. Update `.mcp.json` with URL
3. Add authentication middleware
4. Deploy to server

## Debugging

### Debug Levels

1. **Environment Variables**
   ```bash
   echo $JIRA_API_TOKEN
   echo $JIRA_USER_EMAIL
   echo $JIRA_BASE_URL
   ```

2. **MCP Server Standalone**
   ```bash
   echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
   bun /path/to/build/index.js
   ```

3. **API Direct**
   ```bash
   curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/myself"
   ```

4. **Full Stack**
   ```bash
   export MCP_DEBUG=1
   claude
   ```

### Log Locations

- **Server logs:** stderr (visible with MCP_DEBUG=1)
- **Claude Code logs:** Terminal output
- **API errors:** Returned in MCP response

## References

- [MCP Specification](https://modelcontextprotocol.io/)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
- [JIRA REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Atlassian Document Format](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)
