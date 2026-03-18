---
name: jira-query
description: Search JIRA, find issues, and query tickets using natural language. Trigger with "search JIRA", "find issues", "query JIRA", "get tickets assigned to", "show JIRA issue".
---

# JIRA Query Skill

Search and manage JIRA issues using natural language queries. This skill converts your requests into JQL (JIRA Query Language) and retrieves relevant tickets from your JIRA instance.

## Connectors (Required)

| Connector | What It Provides |
|-----------|------------------|
| **~~project tracker** | JIRA search, issue retrieval, user lookup, issue creation/updates |

## How It Works

1. **Parse Request** - Understand the natural language query
2. **Convert to JQL** - Map phrases to JIRA Query Language syntax
3. **Lookup Users** - Convert email addresses to JIRA account IDs when needed
4. **Execute Search** - Use ~~project tracker search_issues to query JIRA
5. **Format Results** - Present issues in a readable format

## Supported Query Patterns

### By Assignee
- "tickets assigned to me"
- "issues for john@example.com"
- "show my open bugs"
- "what's assigned to the team"

### By Date
- "created in the last 3 months"
- "updated this week"
- "issues from last sprint"
- "bugs filed today"

### By Status
- "open bugs"
- "in progress stories"
- "resolved issues"
- "closed tickets"

### By Project
- "all PROJ tickets"
- "issues in PROJECT-X"
- "bugs in my-project"

### Combined Queries
- "my bugs from last sprint"
- "open high-priority tickets in PROJ"
- "unassigned issues created this month"
- "stories updated in the last week"

## Available Tools

### search_issues
Execute JQL queries to find matching issues.

**When to use:**
- Finding issues by assignee, status, date, project
- Filtering tickets by priority, labels, components
- Any complex query requiring JQL

**Parameters:**
- `jql` (string, required): JQL query string
- `maxResults` (number, optional): Max results to return (default: 50, max: 100)

**Example:**
```
~~project tracker search_issues
jql: "project = PROJ AND assignee = currentUser() AND status = Open"
maxResults: 20
```

### get_issue
Retrieve detailed information about a specific issue including all fields and comments.

**When to use:**
- Getting full details of a specific ticket
- Viewing comments on an issue
- Checking all custom fields

**Parameters:**
- `issueIdOrKey` (string, required): Issue key (e.g., "PROJ-123") or ID

**Example:**
```
~~project tracker get_issue
issueIdOrKey: "PROJ-123"
```

### get_user_by_email
Look up a JIRA user by email address to get their accountId.

**When to use:**
- Before assigning issues to someone
- Converting email addresses to JIRA user IDs
- Validating user exists

**Parameters:**
- `email` (string, required): User email address

**Example:**
```
~~project tracker get_user_by_email
email: "john@example.com"
```

### create_issue
Create a new JIRA issue.

**When to use:**
- Creating bugs, tasks, stories
- Filing new tickets from conversations
- Creating subtasks

**Parameters:**
- `projectKey` (string, required): Project key (e.g., "PROJ")
- `issueType` (string, required): Issue type (e.g., "Bug", "Task", "Story")
- `summary` (string, required): Issue title
- `description` (string, optional): Issue description
- `assigneeEmail` (string, optional): Email of assignee
- `priority` (string, optional): Priority (e.g., "High", "Medium", "Low")
- `labels` (array, optional): Array of label strings
- `dueDate` (string, optional): Due date in YYYY-MM-DD format
- `parentKey` (string, optional): Parent issue key for subtasks

**Example:**
```
~~project tracker create_issue
projectKey: "PROJ"
issueType: "Bug"
summary: "Login button not working"
description: "Users report the login button is unresponsive on mobile devices"
assigneeEmail: "dev@example.com"
priority: "High"
labels: ["mobile", "urgent"]
```

### update_issue
Update an existing JIRA issue.

**When to use:**
- Changing issue summary or description
- Reassigning tickets
- Updating priority or labels

**Parameters:**
- `issueKey` (string, required): Issue key (e.g., "PROJ-123")
- `summary` (string, optional): New summary
- `description` (string, optional): New description
- `assigneeEmail` (string, optional): New assignee email
- `priority` (string, optional): New priority
- `labels` (array, optional): New labels (replaces existing)

**Example:**
```
~~project tracker update_issue
issueKey: "PROJ-123"
assigneeEmail: "jane@example.com"
priority: "High"
```

### add_comment
Add a comment to a JIRA issue.

**When to use:**
- Adding notes or updates to tickets
- Communicating progress
- Documenting decisions

**Parameters:**
- `issueIdOrKey` (string, required): Issue key (e.g., "PROJ-123") or ID
- `body` (string, required): Comment text

**Example:**
```
~~project tracker add_comment
issueIdOrKey: "PROJ-123"
body: "Fixed in latest release. Testing now."
```

## JQL Conversion Reference

### Common Field Mappings

| Natural Language | JQL Field |
|-----------------|-----------|
| "assigned to me" | `assignee = currentUser()` |
| "unassigned" | `assignee is EMPTY` |
| "created by me" | `reporter = currentUser()` |
| "high priority" | `priority = High` |
| "open" / "in progress" | `status in (Open, "In Progress")` |
| "closed" / "done" | `status in (Closed, Done, Resolved)` |
| "bugs" | `type = Bug` |
| "stories" | `type = Story` |
| "tasks" | `type = Task` |

### Date Functions

| Natural Language | JQL Syntax |
|-----------------|------------|
| "last 7 days" | `>= -7d` |
| "this week" | `>= startOfWeek()` |
| "this month" | `>= startOfMonth()` |
| "last month" | `>= startOfMonth(-1) AND < startOfMonth()` |
| "last 3 months" | `>= -90d` |
| "today" | `>= startOfDay()` |

### Special Functions

- `currentUser()` - The logged-in user
- `now()` - Current date/time
- `startOfDay()`, `startOfWeek()`, `startOfMonth()`, `startOfYear()`
- `endOfDay()`, `endOfWeek()`, `endOfMonth()`, `endOfYear()`

## Example Workflows

### Workflow 1: Find My Open Bugs

**User Request:** "Show me my open bugs"

**Steps:**
1. Convert to JQL: `assignee = currentUser() AND type = Bug AND status != Closed`
2. Execute search_issues with JQL
3. Format and display results

**Implementation:**
```
~~project tracker search_issues
jql: "assignee = currentUser() AND type = Bug AND status != Closed"
```

### Workflow 2: Find Issues Assigned to Team Member

**User Request:** "What issues are assigned to john@example.com?"

**Steps:**
1. Look up user by email: `get_user_by_email("john@example.com")`
2. Get accountId from result
3. Convert to JQL: `assignee = <accountId>`
4. Execute search_issues
5. Display results

**Implementation:**
```
~~project tracker get_user_by_email
email: "john@example.com"

# Then use the accountId in JQL
~~project tracker search_issues
jql: "assignee = '70121:abcd1234-...'"
```

### Workflow 3: Find Recent High-Priority Issues

**User Request:** "Show high-priority issues created in the last week"

**Steps:**
1. Convert to JQL: `priority = High AND created >= -7d`
2. Execute search_issues
3. Display results sorted by created date

**Implementation:**
```
~~project tracker search_issues
jql: "priority = High AND created >= -7d ORDER BY created DESC"
```

### Workflow 4: Create a Bug from Description

**User Request:** "Create a bug in PROJ: Login fails on mobile Safari"

**Steps:**
1. Extract project key (PROJ), issue type (Bug), summary
2. Create issue with details
3. Return created issue key

**Implementation:**
```
~~project tracker create_issue
projectKey: "PROJ"
issueType: "Bug"
summary: "Login fails on mobile Safari"
description: "Users on iOS Safari cannot complete login process"
priority: "High"
labels: ["mobile", "browser-specific"]
```

### Workflow 5: Update Issue with New Assignee

**User Request:** "Assign PROJ-123 to jane@example.com"

**Steps:**
1. Validate issue exists (optional)
2. Update issue with assignee email
3. Confirm update

**Implementation:**
```
~~project tracker update_issue
issueKey: "PROJ-123"
assigneeEmail: "jane@example.com"
```

## Date Parsing Strategy

When converting natural language dates to JQL:

1. **Relative Dates:**
   - "last N days" → `>= -Nd`
   - "next N days" → `<= Nd`
   - "today" → `>= startOfDay()`
   - "yesterday" → `>= startOfDay(-1) AND < startOfDay()`

2. **Period References:**
   - "this week" → `>= startOfWeek()`
   - "last week" → `>= startOfWeek(-1) AND < startOfWeek()`
   - "this month" → `>= startOfMonth()`
   - "this year" → `>= startOfYear()`

3. **Specific Dates:**
   - Convert to YYYY-MM-DD format
   - Use `created = "2024-01-15"` or `created >= "2024-01-15"`

## Error Handling

### Common Errors

1. **Invalid JQL Syntax**
   - Error: "The JQL query is invalid"
   - Solution: Check field names, operators, and syntax
   - Use proper quoting for multi-word values

2. **User Not Found**
   - Error: "User not found: email@example.com"
   - Solution: Verify email address is correct and user exists in JIRA
   - Check user is active (not deactivated)

3. **Project Not Found**
   - Error: "Project does not exist or you do not have permission"
   - Solution: Verify project key is correct
   - Check user has access to the project

4. **Authentication Failed**
   - Error: "Unauthorized" or "Invalid credentials"
   - Solution: Verify JIRA_API_TOKEN is valid
   - Check JIRA_USER_EMAIL matches token owner

### Debugging

Enable debug mode by setting `MCP_DEBUG=1` environment variable to see detailed logs.

## Best Practices

1. **Start Simple:** Begin with basic queries and add filters incrementally
2. **Use Limits:** Set reasonable maxResults to avoid overwhelming output
3. **Validate Users:** Always use get_user_by_email before assigning issues
4. **Quote Values:** Use quotes for multi-word values in JQL (e.g., `status = "In Progress"`)
5. **Order Results:** Add `ORDER BY` clauses for consistent sorting
6. **Test Queries:** Test complex JQL in JIRA's issue navigator first

## Performance Tips

- Limit results with maxResults parameter (default: 50)
- Use specific project filters to reduce search scope
- Avoid searching across all projects when possible
- Cache user lookups if assigning multiple issues to same person

## Security Notes

- API tokens are stored in environment variables (never in code)
- All requests are authenticated via JIRA_API_TOKEN
- Users can only see issues they have permission to view in JIRA
- Tool respects JIRA's permission model

## Reference Files

For more detailed information, see:
- `reference/jql-patterns.md` - Comprehensive JQL reference
- `reference/date-conversion.md` - Date parsing guide with examples
- `reference/examples.md` - Additional usage examples

## Troubleshooting

If the skill isn't working:

1. Verify environment variables are set:
   ```bash
   echo $JIRA_API_TOKEN
   echo $JIRA_USER_EMAIL
   echo $JIRA_BASE_URL
   ```

2. Test JIRA API connection:
   ```bash
   curl -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/myself"
   ```

3. Check MCP server is running:
   ```bash
   echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | \
   bun /path/to/build/index.js
   ```

4. Enable debug logging:
   ```bash
   export MCP_DEBUG=1
   ```

## Limitations

- Maximum 100 results per search (use pagination for more)
- Email-based user lookup requires exact match
- Advanced JQL features (functions, custom fields) may need manual JQL input
- Transition workflow states requires specific transition IDs (not included in update_issue)
