# API Reference

Complete technical reference for all JIRA MCP tools, including schemas, parameters, response formats, and error handling.

## Table of Contents

- [Tool Overview](#tool-overview)
- [Tool Specifications](#tool-specifications)
  - [search_issues](#search_issues)
  - [get_issue](#get_issue)
  - [get_user_by_email](#get_user_by_email)
  - [create_issue](#create_issue)
  - [update_issue](#update_issue)
  - [add_comment](#add_comment)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [JQL Reference](#jql-reference)

---

## Tool Overview

The JIRA MCP server provides 6 core tools for interacting with JIRA:

| Tool | Purpose | Use Case |
|------|---------|----------|
| `search_issues` | Search using JQL | Find issues by criteria |
| `get_issue` | Get issue details | View full issue information |
| `get_user_by_email` | Look up user | Get accountId for assignments |
| `create_issue` | Create new issue | Report bugs, create tasks |
| `update_issue` | Modify existing issue | Update fields, change priority |
| `add_comment` | Add comment | Provide updates, feedback |

---

## Tool Specifications

### search_issues

Search for JIRA issues using JQL (JIRA Query Language).

#### Input Schema

```typescript
{
  jql: string;           // Required: JQL query string
  maxResults?: number;   // Optional: Max results (default: 50, max: 100)
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `jql` | string | Yes | - | JQL query string |
| `maxResults` | number | No | 50 | Maximum results to return (max: 100) |

#### Example Input

```json
{
  "jql": "project = PROJ AND status = Open",
  "maxResults": 25
}
```

#### Response Format

```typescript
Array<{
  key: string;           // Issue key (e.g., "PROJ-123")
  summary: string;       // Issue title
  description: string;   // Issue description (plain text)
  status: string;        // Current status
  priority: string;      // Priority level
  assignee: string;      // Assignee display name
  reporter: string;      // Reporter display name
  created: string;       // ISO 8601 timestamp
  updated: string;       // ISO 8601 timestamp
  issueType: string;     // Issue type (Bug, Task, etc.)
  project: string;       // Project name
  labels: string[];      // Array of labels
  comments: Array<{      // Empty array for search results
    author: string;
    body: string;
    created: string;
  }>;
}>
```

#### Example Response

```json
[
  {
    "key": "PROJ-456",
    "summary": "Fix login authentication bug",
    "description": "Users unable to login with SSO",
    "status": "In Progress",
    "priority": "High",
    "assignee": "John Doe",
    "reporter": "Jane Smith",
    "created": "2026-03-15T10:30:00.000Z",
    "updated": "2026-03-17T14:22:00.000Z",
    "issueType": "Bug",
    "project": "PROJ",
    "labels": ["authentication", "sso"],
    "comments": []
  }
]
```

#### Common JQL Examples

```javascript
// Your open issues
"assignee = currentUser() AND status != Done"

// Recent bugs
"type = Bug AND created >= -7d ORDER BY priority DESC"

// Sprint issues
"sprint = 'Sprint 24' ORDER BY priority DESC"

// Overdue tasks
"duedate < now() AND status != Done"
```

---

### get_issue

Get detailed information about a specific JIRA issue, including all comments.

#### Input Schema

```typescript
{
  issueIdOrKey: string;  // Required: Issue key or ID
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueIdOrKey` | string | Yes | Issue key (e.g., "PROJ-123") or numeric ID |

#### Example Input

```json
{
  "issueIdOrKey": "PROJ-123"
}
```

#### Response Format

```typescript
{
  key: string;           // Issue key
  summary: string;       // Issue title
  description: string;   // Full description (plain text)
  status: string;        // Current status
  priority: string;      // Priority level
  assignee: string;      // Assignee display name
  reporter: string;      // Reporter display name
  created: string;       // ISO 8601 timestamp
  updated: string;       // ISO 8601 timestamp
  issueType: string;     // Issue type
  project: string;       // Project name
  labels: string[];      // Array of labels
  comments: Array<{      // All comments on the issue
    author: string;      // Comment author
    body: string;        // Comment text (plain text)
    created: string;     // ISO 8601 timestamp
  }>;
}
```

#### Example Response

```json
{
  "key": "PROJ-123",
  "summary": "Implement OAuth 2.0 authentication",
  "description": "Add OAuth 2.0 support for third-party login providers including Google, GitHub, and Microsoft.",
  "status": "In Progress",
  "priority": "High",
  "assignee": "John Doe",
  "reporter": "Jane Smith",
  "created": "2026-03-10T09:00:00.000Z",
  "updated": "2026-03-17T11:30:00.000Z",
  "issueType": "Story",
  "project": "Authentication Platform",
  "labels": ["oauth", "security", "authentication"],
  "comments": [
    {
      "author": "John Doe",
      "body": "Started implementation. Google OAuth is working.",
      "created": "2026-03-15T14:20:00.000Z"
    },
    {
      "author": "Jane Smith",
      "body": "Great progress! Make sure to add unit tests.",
      "created": "2026-03-16T10:15:00.000Z"
    }
  ]
}
```

---

### get_user_by_email

Look up a JIRA user by email address. Returns the user's accountId, which is required for assigning issues.

#### Input Schema

```typescript
{
  email: string;  // Required: User email address
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User email address to look up |

#### Example Input

```json
{
  "email": "john.doe@company.com"
}
```

#### Response Format

```typescript
{
  accountId: string;      // User's account ID (for assignments)
  displayName: string;    // User's display name
  emailAddress: string;   // User's email address
  active: boolean;        // Whether user is active
}
```

#### Example Response

```json
{
  "accountId": "5f8a9b1c2d3e4f5a6b7c8d9e",
  "displayName": "John Doe",
  "emailAddress": "john.doe@company.com",
  "active": true
}
```

#### Error Response

If user is not found:

```json
{
  "error": "User not found: john.doe@company.com"
}
```

---

### create_issue

Create a new JIRA issue in a project.

#### Input Schema

```typescript
{
  projectKey: string;      // Required: Project key (e.g., "PROJ")
  issueType: string;       // Required: Issue type (e.g., "Bug", "Task", "Story")
  summary: string;         // Required: Issue title
  description?: string;    // Optional: Issue description (plain text)
  assigneeEmail?: string;  // Optional: Assignee email address
  priority?: string;       // Optional: Priority (e.g., "High", "Medium", "Low")
  labels?: string[];       // Optional: Array of labels
  dueDate?: string;        // Optional: Due date (YYYY-MM-DD format)
  parentKey?: string;      // Optional: Parent issue key (for subtasks)
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectKey` | string | Yes | - | Project key (e.g., "PROJ") |
| `issueType` | string | Yes | - | Issue type (Bug, Task, Story, Sub-task, etc.) |
| `summary` | string | Yes | - | Issue title/summary |
| `description` | string | No | - | Detailed description (plain text) |
| `assigneeEmail` | string | No | - | Email of user to assign |
| `priority` | string | No | - | Priority (Highest, High, Medium, Low, Lowest) |
| `labels` | string[] | No | [] | Array of label strings |
| `dueDate` | string | No | - | Due date in YYYY-MM-DD format |
| `parentKey` | string | No | - | Parent issue key (required for Sub-task) |

#### Example Input

```json
{
  "projectKey": "PROJ",
  "issueType": "Bug",
  "summary": "Application crashes on mobile Safari",
  "description": "The application crashes when users tap the submit button on mobile Safari browsers. Desktop browsers work fine.",
  "assigneeEmail": "jane.smith@company.com",
  "priority": "High",
  "labels": ["mobile", "safari", "crash"],
  "dueDate": "2026-03-25"
}
```

#### Response Format

Returns the created issue in the same format as `get_issue` (see above).

#### Example Response

```json
{
  "key": "PROJ-789",
  "summary": "Application crashes on mobile Safari",
  "description": "The application crashes when users tap the submit button on mobile Safari browsers. Desktop browsers work fine.",
  "status": "Open",
  "priority": "High",
  "assignee": "Jane Smith",
  "reporter": "System User",
  "created": "2026-03-17T15:45:00.000Z",
  "updated": "2026-03-17T15:45:00.000Z",
  "issueType": "Bug",
  "project": "PROJ",
  "labels": ["mobile", "safari", "crash"],
  "comments": []
}
```

---

### update_issue

Update an existing JIRA issue. You can update any combination of fields.

#### Input Schema

```typescript
{
  issueKey: string;        // Required: Issue key to update
  summary?: string;        // Optional: New summary
  description?: string;    // Optional: New description (plain text)
  assigneeEmail?: string;  // Optional: New assignee email
  priority?: string;       // Optional: New priority
  labels?: string[];       // Optional: New labels (replaces existing)
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueKey` | string | Yes | Issue key to update (e.g., "PROJ-123") |
| `summary` | string | No | New issue title |
| `description` | string | No | New description (plain text) |
| `assigneeEmail` | string | No | Email of new assignee |
| `priority` | string | No | New priority level |
| `labels` | string[] | No | New labels (replaces all existing labels) |

#### Example Input

```json
{
  "issueKey": "PROJ-456",
  "summary": "Fix login authentication bug - Safari only",
  "priority": "Critical",
  "labels": ["authentication", "safari", "urgent"]
}
```

#### Response Format

Returns the updated issue in the same format as `get_issue` (see above).

---

### add_comment

Add a comment to an existing JIRA issue.

#### Input Schema

```typescript
{
  issueIdOrKey: string;  // Required: Issue key or ID
  body: string;          // Required: Comment text (plain text)
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueIdOrKey` | string | Yes | Issue key (e.g., "PROJ-123") or ID |
| `body` | string | Yes | Comment text (plain text) |

#### Example Input

```json
{
  "issueIdOrKey": "PROJ-123",
  "body": "I've tested the fix on Safari 17 and it works correctly. Ready for deployment."
}
```

#### Response Format

```typescript
string  // Success message with comment ID
```

#### Example Response

```json
"Comment added successfully (ID: 10052)"
```

---

## Response Formats

### Common Field Types

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `key` | string | PROJECT-NUMBER | "PROJ-123" |
| `created` | string | ISO 8601 | "2026-03-17T10:30:00.000Z" |
| `updated` | string | ISO 8601 | "2026-03-17T14:22:00.000Z" |
| `duedate` | string | YYYY-MM-DD | "2026-03-25" |
| `labels` | string[] | Array | ["bug", "urgent"] |

### Date/Time Formats

- **Input dates**: YYYY-MM-DD (e.g., "2026-03-25")
- **Output timestamps**: ISO 8601 (e.g., "2026-03-17T10:30:00.000Z")
- **JQL date literals**: -7d, -2w, startOfWeek(), etc.

---

## Error Handling

### Error Response Format

All errors return a response with `isError: true` and descriptive error message.

```typescript
{
  content: [{
    type: "text",
    text: string  // Error message
  }],
  isError: true
}
```

### Common Error Codes

| HTTP Code | Error Type | Cause | Solution |
|-----------|------------|-------|----------|
| 400 | Bad Request | Invalid JQL, missing required fields | Check syntax, verify field names |
| 401 | Unauthorized | Invalid credentials | Check API token and email |
| 403 | Forbidden | Insufficient permissions | Verify user has required permissions |
| 404 | Not Found | Issue/project doesn't exist | Check issue key and project |
| 429 | Rate Limited | Too many requests | Reduce request frequency |
| 500 | Server Error | JIRA internal error | Retry, contact JIRA admin |

### Error Messages

#### Authentication Errors

```
"JIRA_API_TOKEN environment variable is required"
"JIRA_USER_EMAIL environment variable is required"
"JIRA_BASE_URL environment variable is required"
```

#### JQL Errors

```
"Invalid JQL query: Field 'xyz' does not exist"
"JQL syntax error: unexpected token at position 15"
```

#### Field Errors

```
"Field errors: priority: Priority 'Invalid' does not exist"
"Field errors: assignee: User not found"
"Field errors: issuetype: Issue type 'InvalidType' is not valid"
```

#### Not Found Errors

```
"User not found: invalid@email.com"
"Issue does not exist: PROJ-999"
"Project not found: INVALID"
```

### API Version Fallback

The server automatically falls back from v3 to v2 API when:
- Endpoint returns 404 (not found)
- Endpoint returns 400 (bad request) for version-specific issues

This fallback is transparent and logged for debugging.

---

## JQL Reference

### Quick JQL Syntax

#### Basic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `status = Open` |
| `!=` | Not equals | `priority != Low` |
| `>`, `<`, `>=`, `<=` | Comparison | `created >= -7d` |
| `IN` | Multiple values | `status IN (Open, "In Progress")` |
| `NOT IN` | Exclude values | `priority NOT IN (Low, Trivial)` |
| `~` | Contains (text) | `summary ~ "authentication"` |
| `IS` | Is null/empty | `assignee IS EMPTY` |
| `IS NOT` | Is not null | `assignee IS NOT EMPTY` |

#### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `AND` | Both conditions | `project = PROJ AND status = Open` |
| `OR` | Either condition | `priority = High OR priority = Critical` |
| `NOT` | Negate condition | `NOT assignee = currentUser()` |

#### Functions

| Function | Description | Example |
|----------|-------------|---------|
| `currentUser()` | Current authenticated user | `assignee = currentUser()` |
| `now()` | Current date/time | `duedate < now()` |
| `startOfDay()` | Start of current day | `created >= startOfDay()` |
| `startOfWeek()` | Start of current week | `created >= startOfWeek()` |
| `endOfMonth()` | End of current month | `duedate <= endOfMonth()` |

#### Date Ranges

| Format | Description | Example |
|--------|-------------|---------|
| `-Nd` | N days ago | `created >= -7d` |
| `-Nw` | N weeks ago | `updated >= -2w` |
| `-Nm` | N months ago | `created >= -3m` |
| `YYYY-MM-DD` | Specific date | `created >= 2026-01-01` |

### Complex JQL Examples

```sql
-- Sprint progress
project = PROJ AND sprint = "Sprint 24" AND status != Done
ORDER BY priority DESC

-- Overdue high priority
priority IN (High, Critical) AND duedate < now() AND status != Done
ORDER BY duedate ASC

-- Recent team activity
assignee IN (john@co.com, jane@co.com) AND updated >= -7d
ORDER BY updated DESC

-- Unassigned bugs
type = Bug AND assignee IS EMPTY AND status = Open
ORDER BY created ASC
```

---

## Best Practices

1. **Limit Results**: Always set appropriate `maxResults` to avoid overwhelming responses
2. **Order Results**: Use `ORDER BY` in JQL for consistent, useful ordering
3. **Cache User Lookups**: Store accountIds to avoid repeated `get_user_by_email` calls
4. **Validate Before Create**: Check project keys and issue types before creating issues
5. **Handle Errors Gracefully**: Check for error responses and provide user feedback
6. **Use Specific Queries**: More specific JQL = faster queries and better results

---

## Next Steps

- See [Usage Examples](./Usage-Examples.md) for real-world scenarios
- Check [Troubleshooting](./Troubleshooting.md) for common issues
- Review [Setup Guide](./Setup-Guide.md) for configuration details
