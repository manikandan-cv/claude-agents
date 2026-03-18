# JIRA MCP Server

Custom Model Context Protocol (MCP) server for JIRA integration via stdio transport.

## Overview

This MCP server provides 6 core tools for interacting with JIRA Cloud and Server instances:
- Search issues with JQL
- Get issue details with comments
- Look up users by email
- Create new issues
- Update existing issues
- Add comments to issues

## Features

- ✅ **API Version Fallback** - Tries v3, falls back to v2 automatically
- ✅ **ADF Handling** - Converts between plain text and Atlassian Document Format
- ✅ **Cloud & Server Support** - Works with both JIRA Cloud and Server/Data Center
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Error Handling** - Comprehensive error parsing and sanitization
- ✅ **Debug Logging** - Optional debug mode with MCP_DEBUG=1

## Installation

### Prerequisites

- Bun v1.0+ installed
- JIRA instance (Cloud or Server)
- JIRA API token

### Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Build the server:**
   ```bash
   bun run build
   ```

3. **Verify build:**
   ```bash
   ls -lh build/index.js
   ```

## Configuration

Set these environment variables:

```bash
# Required
export JIRA_API_TOKEN="your-api-token-here"
export JIRA_USER_EMAIL="your-email@example.com"
export JIRA_BASE_URL="https://your-org.atlassian.net"

# Optional
export JIRA_TYPE="cloud"           # or "server"
export JIRA_AUTH_TYPE="basic"      # or "bearer"
export MCP_DEBUG="1"               # enable debug logging
```

## Usage

### Standalone Testing

Test the server responds to MCP protocol:

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | bun run start
```

Expected response:
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

### With Claude Code

The server is designed to be used with Claude Code through the skill's `.mcp.json` configuration:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": ["/path/to/build/index.js"],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}"
      }
    }
  }
}
```

## Available Tools

### 1. search_issues

Execute JQL queries to find issues.

**Parameters:**
- `jql` (string, required) - JQL query string
- `maxResults` (number, optional) - Max results (default: 50, max: 100)

**Example:**
```json
{
  "jql": "assignee = currentUser() AND status = Open",
  "maxResults": 50
}
```

### 2. get_issue

Get detailed information about a specific issue.

**Parameters:**
- `issueIdOrKey` (string, required) - Issue key (e.g., "PROJ-123") or ID

**Example:**
```json
{
  "issueIdOrKey": "PROJ-123"
}
```

### 3. get_user_by_email

Look up a JIRA user by email address.

**Parameters:**
- `email` (string, required) - User email address

**Example:**
```json
{
  "email": "john@example.com"
}
```

### 4. create_issue

Create a new JIRA issue.

**Parameters:**
- `projectKey` (string, required) - Project key (e.g., "PROJ")
- `issueType` (string, required) - Issue type (e.g., "Bug", "Task", "Story")
- `summary` (string, required) - Issue summary/title
- `description` (string, optional) - Issue description
- `assigneeEmail` (string, optional) - Email of assignee
- `priority` (string, optional) - Priority (e.g., "High", "Medium", "Low")
- `labels` (array, optional) - Array of label strings
- `dueDate` (string, optional) - Due date (YYYY-MM-DD)
- `parentKey` (string, optional) - Parent issue key for subtasks

**Example:**
```json
{
  "projectKey": "PROJ",
  "issueType": "Bug",
  "summary": "Login button not working",
  "description": "Users report the login button is unresponsive",
  "priority": "High",
  "labels": ["urgent", "login"]
}
```

### 5. update_issue

Update an existing JIRA issue.

**Parameters:**
- `issueKey` (string, required) - Issue key to update
- `summary` (string, optional) - New summary
- `description` (string, optional) - New description
- `assigneeEmail` (string, optional) - New assignee email
- `priority` (string, optional) - New priority
- `labels` (array, optional) - New labels (replaces existing)

**Example:**
```json
{
  "issueKey": "PROJ-123",
  "priority": "High",
  "assigneeEmail": "jane@example.com"
}
```

### 6. add_comment

Add a comment to a JIRA issue.

**Parameters:**
- `issueIdOrKey` (string, required) - Issue key or ID
- `body` (string, required) - Comment text

**Example:**
```json
{
  "issueIdOrKey": "PROJ-123",
  "body": "Fixed in latest release"
}
```

## Architecture

### File Structure

```
mcp-server/
├── src/
│   ├── index.ts                    # Main MCP server
│   ├── services/
│   │   └── jira-cloud-api.ts      # JIRA API service
│   ├── types/
│   │   └── jira.ts                # TypeScript interfaces
│   └── utils/
│       ├── error-handler.ts       # Error handling
│       └── logger.ts              # Logging
├── build/
│   └── index.js                   # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Request Flow

```
1. MCP Client (Claude Code)
   ↓
2. JSON-RPC Request (stdin)
   ↓
3. MCP Server (index.ts)
   ↓ tools/list or tools/call
4. Tool Handler
   ↓
5. JIRA API Service
   ↓
6. JIRA REST API (v3 or v2)
   ↓
7. Response (stdout)
   ↓
8. MCP Client
```

### API Version Strategy

1. Try `/rest/api/3/` endpoint
2. On 404 or 400 error, fall back to `/rest/api/2/`
3. Log fallback for debugging

This ensures compatibility with both JIRA Cloud (v3) and Server (v2).

### ADF Handling

JIRA Cloud uses Atlassian Document Format (ADF) for rich text. The server:

**Input (Plain Text → ADF):**
- Converts user-provided plain text to ADF
- Splits on newlines for paragraphs
- Wraps in proper ADF structure

**Output (ADF → Plain Text):**
- Recursively extracts text from ADF nodes
- Preserves line breaks
- Returns simple strings to tools

## Development

### Build

```bash
bun run build
```

This compiles TypeScript and creates a minified single-file output in `build/index.js`.

### Watch Mode

For development with auto-rebuild:

```bash
bun run dev
```

### Type Checking

```bash
bunx tsc --noEmit
```

## Error Handling

### Error Types

1. **JiraApiError** - JIRA API errors (400, 401, 403, 404, 500)
2. **Network Errors** - Connection failures, timeouts
3. **Validation Errors** - Missing required parameters

### Error Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "Error message here"
  }],
  "isError": true
}
```

### Error Sanitization

Sensitive data is removed from error messages:
- API tokens → `[REDACTED]`
- Authorization headers → `[REDACTED]`
- Bearer tokens → `[REDACTED]`

## Logging

Logs are written to **stderr** to avoid interfering with JSON-RPC on stdout.

### Log Levels

- `DEBUG` - Detailed information (only when MCP_DEBUG=1)
- `INFO` - General information
- `WARN` - Warnings and fallbacks
- `ERROR` - Errors and exceptions

### Enable Debug Logging

```bash
export MCP_DEBUG=1
bun run start
```

## Security

- ✅ Environment variables for secrets
- ✅ HTTPS only for API requests
- ✅ Token sanitization in logs
- ✅ No hardcoded credentials
- ✅ Basic Auth or Bearer Token support

## Performance

- **Fast builds:** Bun bundler
- **Single file output:** Minimal overhead
- **Efficient transport:** stdio communication
- **Connection reuse:** Handled by fetch API

## Extending

### Add a New Tool

1. **Define tool in `index.ts`:**
   ```typescript
   {
     name: 'my_new_tool',
     description: 'What it does',
     inputSchema: {
       type: 'object',
       properties: { ... },
       required: [ ... ]
     }
   }
   ```

2. **Add handler:**
   ```typescript
   case 'my_new_tool': {
     const { param1, param2 } = args as { param1: string; param2: number };
     const result = await this.jiraService.myNewMethod(param1, param2);
     return { content: [{ type: 'text', text: JSON.stringify(result) }] };
   }
   ```

3. **Implement in `jira-cloud-api.ts`:**
   ```typescript
   async myNewMethod(param1: string, param2: number): Promise<SomeType> {
     const endpoint = `/rest/api/3/some-endpoint`;
     const result = await this.fetchJson<SomeType>(endpoint, {
       method: 'GET',
       // ...
     });
     return result;
   }
   ```

4. **Rebuild:**
   ```bash
   bun run build
   ```

## Testing

### Manual Testing

```bash
# Test tools/list
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun run start

# Test search_issues
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search_issues","arguments":{"jql":"project=PROJ","maxResults":5}},"id":2}' | bun run start

# Test with debug logging
MCP_DEBUG=1 echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun run start
```

### JIRA API Testing

```bash
# Test authentication
curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
     "$JIRA_BASE_URL/rest/api/3/myself"

# Test search
curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jql":"project=PROJ","maxResults":5}' \
     "$JIRA_BASE_URL/rest/api/3/search"
```

## Troubleshooting

### Issue: "Environment variable not set"

**Solution:**
```bash
export JIRA_API_TOKEN="your-token"
export JIRA_USER_EMAIL="your-email"
export JIRA_BASE_URL="your-url"
```

### Issue: "Authentication failed"

**Causes:**
- Invalid API token
- Email doesn't match token owner
- Token expired

**Solution:**
1. Regenerate API token
2. Verify email matches
3. Test with curl

### Issue: "Build fails"

**Solution:**
```bash
rm -rf node_modules build
bun install
bun run build
```

### Issue: "JIRA API returns 404"

**Cause:** API v3 not available (JIRA Server)

**Solution:** Server automatically falls back to v2. Check logs for fallback message.

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `typescript` - Type checking
- `bun-types` - Bun runtime types
- `@types/node` - Node.js types

## Version

1.0.0

## License

Custom implementation - use freely.
