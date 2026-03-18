# JIRA Query Skill - Usage Examples

Real-world examples of using the JIRA Query skill for common scenarios.

## Basic Searches

### Example 1: Find My Open Issues

**User Request:** "Show me my open issues"

**Skill Execution:**
```
~~project tracker search_issues
jql: "assignee = currentUser() AND status NOT IN (Closed, Done, Resolved)"
maxResults: 50
```

**Expected Output:**
```json
[
  {
    "key": "PROJ-123",
    "summary": "Fix login button on mobile",
    "status": "In Progress",
    "priority": "High",
    "assignee": "John Doe",
    ...
  },
  ...
]
```

### Example 2: Get Specific Issue Details

**User Request:** "Show me details for PROJ-456"

**Skill Execution:**
```
~~project tracker get_issue
issueIdOrKey: "PROJ-456"
```

**Expected Output:**
```json
{
  "key": "PROJ-456",
  "summary": "Implement user profile page",
  "description": "Create a new user profile page...",
  "status": "Open",
  "priority": "Medium",
  "assignee": "Jane Smith",
  "comments": [
    {
      "author": "John Doe",
      "body": "Started working on this",
      "created": "2024-01-15T10:30:00"
    }
  ]
}
```

## Date-Based Searches

### Example 3: Recent Bug Reports

**User Request:** "Show bugs reported in the last week"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Bug AND created >= -7d ORDER BY created DESC"
maxResults: 30
```

### Example 4: This Month's Activity

**User Request:** "What issues were updated this month?"

**Skill Execution:**
```
~~project tracker search_issues
jql: "updated >= startOfMonth() ORDER BY updated DESC"
maxResults: 50
```

### Example 5: Overdue Tasks

**User Request:** "Show me overdue tasks"

**Skill Execution:**
```
~~project tracker search_issues
jql: "duedate < now() AND status NOT IN (Done, Closed) ORDER BY duedate ASC"
maxResults: 50
```

## User-Based Searches

### Example 6: Find Issues for Team Member

**User Request:** "What's assigned to john@example.com?"

**Skill Execution:**
```
# Step 1: Look up user
~~project tracker get_user_by_email
email: "john@example.com"

# Response: { "accountId": "70121:abcd...", "displayName": "John Doe", ... }

# Step 2: Search issues
~~project tracker search_issues
jql: "assignee = '70121:abcd...'"
maxResults: 50
```

**Simplified (if email works directly):**
```
~~project tracker search_issues
jql: "assignee = 'john@example.com'"
maxResults: 50
```

### Example 7: Unassigned Critical Bugs

**User Request:** "Show unassigned critical bugs"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Bug AND priority IN (Highest, High) AND assignee IS EMPTY ORDER BY created DESC"
maxResults: 25
```

## Project-Based Searches

### Example 8: All Open Issues in Project

**User Request:** "Show all open issues in project MOBILE"

**Skill Execution:**
```
~~project tracker search_issues
jql: "project = MOBILE AND status NOT IN (Done, Closed, Resolved)"
maxResults: 100
```

### Example 9: Stories Ready for QA

**User Request:** "What stories are ready for testing in PROJ?"

**Skill Execution:**
```
~~project tracker search_issues
jql: "project = PROJ AND type = Story AND status = 'Ready for QA' ORDER BY priority DESC"
maxResults: 20
```

## Creating Issues

### Example 10: Create Simple Bug

**User Request:** "Create a bug in PROJ: Login fails on Safari"

**Skill Execution:**
```
~~project tracker create_issue
projectKey: "PROJ"
issueType: "Bug"
summary: "Login fails on Safari"
description: "Users report that the login button is unresponsive on Safari browser"
priority: "High"
labels: ["browser-bug", "login"]
```

**Expected Output:**
```json
{
  "key": "PROJ-789",
  "summary": "Login fails on Safari",
  "status": "Open",
  "priority": "High",
  ...
}
```

### Example 11: Create Task with Assignee

**User Request:** "Create a task in DEV: Update documentation, assign to jane@example.com"

**Skill Execution:**
```
~~project tracker create_issue
projectKey: "DEV"
issueType: "Task"
summary: "Update API documentation"
description: "Update REST API docs with new endpoints"
assigneeEmail: "jane@example.com"
priority: "Medium"
dueDate: "2024-02-01"
```

### Example 12: Create Story with Details

**User Request:** "Create a story: As a user, I want to export data to CSV"

**Skill Execution:**
```
~~project tracker create_issue
projectKey: "PROJ"
issueType: "Story"
summary: "Export data to CSV"
description: "As a user, I want to export my data to CSV format so that I can analyze it in Excel.\n\nAcceptance Criteria:\n- Export button on data page\n- Downloads CSV file\n- Includes all columns"
priority: "Medium"
labels: ["export", "user-story"]
```

## Updating Issues

### Example 13: Reassign Issue

**User Request:** "Assign PROJ-123 to mike@example.com"

**Skill Execution:**
```
~~project tracker update_issue
issueKey: "PROJ-123"
assigneeEmail: "mike@example.com"
```

### Example 14: Update Priority

**User Request:** "Change PROJ-456 priority to High"

**Skill Execution:**
```
~~project tracker update_issue
issueKey: "PROJ-456"
priority: "High"
```

### Example 15: Update Multiple Fields

**User Request:** "Update PROJ-789: change summary to 'Fix Safari login bug', set priority to Critical, assign to john@example.com"

**Skill Execution:**
```
~~project tracker update_issue
issueKey: "PROJ-789"
summary: "Fix Safari login bug"
priority: "Highest"
assigneeEmail: "john@example.com"
```

## Adding Comments

### Example 16: Simple Comment

**User Request:** "Add comment to PROJ-123: Fixed in latest release"

**Skill Execution:**
```
~~project tracker add_comment
issueIdOrKey: "PROJ-123"
body: "Fixed in latest release. Deployed to production."
```

### Example 17: Status Update Comment

**User Request:** "Comment on PROJ-456 that we're blocked by API team"

**Skill Execution:**
```
~~project tracker add_comment
issueIdOrKey: "PROJ-456"
body: "Blocked: Waiting for API team to deploy new endpoint. ETA: End of week."
```

## Complex Searches

### Example 18: Sprint Planning Query

**User Request:** "Show me high-priority stories that are unassigned"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Story AND priority IN (Highest, High) AND assignee IS EMPTY AND status = Open ORDER BY priority DESC"
maxResults: 25
```

### Example 19: Recently Resolved Issues

**User Request:** "What issues were resolved this week?"

**Skill Execution:**
```
~~project tracker search_issues
jql: "resolved >= startOfWeek() ORDER BY resolved DESC"
maxResults: 50
```

### Example 20: My Bugs from Last Sprint

**User Request:** "Show my bugs from the last 2 weeks"

**Skill Execution:**
```
~~project tracker search_issues
jql: "assignee = currentUser() AND type = Bug AND created >= -14d ORDER BY created DESC"
maxResults: 30
```

## Label-Based Searches

### Example 21: Find Urgent Items

**User Request:** "Show all issues with 'urgent' label"

**Skill Execution:**
```
~~project tracker search_issues
jql: "labels = urgent ORDER BY created DESC"
maxResults: 50
```

### Example 22: Security Issues

**User Request:** "Find all security-related bugs"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Bug AND labels IN (security, vulnerability) ORDER BY priority DESC"
maxResults: 30
```

## Component-Based Searches

### Example 23: Frontend Bugs

**User Request:** "Show bugs in the Frontend component"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Bug AND component = 'Frontend' AND status NOT IN (Done, Closed)"
maxResults: 50
```

## Multi-Project Searches

### Example 24: Issues Across Projects

**User Request:** "Show my issues across PROJ1 and PROJ2"

**Skill Execution:**
```
~~project tracker search_issues
jql: "assignee = currentUser() AND project IN (PROJ1, PROJ2) ORDER BY updated DESC"
maxResults: 50
```

## Reporting Queries

### Example 25: Monthly Bug Count

**User Request:** "How many bugs were created this month?"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Bug AND created >= startOfMonth()"
maxResults: 100
```

**Analysis:** Count the results returned.

### Example 26: Team Velocity

**User Request:** "How many stories did we complete last month?"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Story AND resolved >= startOfMonth(-1) AND resolved < startOfMonth()"
maxResults: 100
```

### Example 27: Quality Metrics

**User Request:** "Show me reopened bugs from this quarter"

**Skill Execution:**
```
~~project tracker search_issues
jql: "type = Bug AND status WAS Closed AND status = Reopened AND updated >= startOfYear()"
maxResults: 50
```

## Advanced Patterns

### Example 28: Issues Without Recent Updates

**User Request:** "Find stale issues (not updated in 30 days)"

**Skill Execution:**
```
~~project tracker search_issues
jql: "status NOT IN (Done, Closed) AND updated < -30d ORDER BY updated ASC"
maxResults: 50
```

### Example 29: High-Priority Items Due Soon

**User Request:** "Show critical issues due in next 7 days"

**Skill Execution:**
```
~~project tracker search_issues
jql: "priority IN (Highest, High) AND duedate >= 0d AND duedate <= 7d ORDER BY duedate ASC"
maxResults: 25
```

### Example 30: Recently Changed Status

**User Request:** "What issues changed status today?"

**Skill Execution:**
```
~~project tracker search_issues
jql: "status CHANGED AFTER startOfDay() ORDER BY updated DESC"
maxResults: 50
```

## Workflow Examples

### Workflow 1: Daily Standup Prep

**Steps:**
1. "What did I work on yesterday?"
   ```
   jql: "assignee = currentUser() AND updated >= startOfDay(-1) AND updated < startOfDay()"
   ```

2. "What am I working on today?"
   ```
   jql: "assignee = currentUser() AND status = 'In Progress'"
   ```

3. "Any blockers?"
   ```
   jql: "assignee = currentUser() AND status = Blocked"
   ```

### Workflow 2: Bug Triage

**Steps:**
1. "Show new bugs"
   ```
   jql: "type = Bug AND status = Open AND created >= -7d"
   ```

2. "Unassigned critical bugs"
   ```
   jql: "type = Bug AND priority IN (Highest, High) AND assignee IS EMPTY"
   ```

3. "Assign critical bug to developer"
   ```
   update_issue: issueKey="PROJ-123", assigneeEmail="dev@example.com", priority="Highest"
   ```

### Workflow 3: Sprint Retrospective

**Steps:**
1. "Issues completed this sprint"
   ```
   jql: "resolved >= -14d AND type IN (Story, Bug, Task)"
   ```

2. "Issues that spilled over"
   ```
   jql: "created < -14d AND status NOT IN (Done, Closed)"
   ```

3. "Bugs created during sprint"
   ```
   jql: "type = Bug AND created >= -14d"
   ```

### Workflow 4: Release Planning

**Steps:**
1. "Issues in upcoming release"
   ```
   jql: "fixVersion = '2.0.0' ORDER BY priority DESC"
   ```

2. "Unresolved critical issues"
   ```
   jql: "fixVersion = '2.0.0' AND priority = Highest AND status != Done"
   ```

3. "Create release notes task"
   ```
   create_issue: projectKey="PROJ", issueType="Task", summary="Prepare release notes for 2.0.0"
   ```

## Error Handling Examples

### Example 31: Handle User Not Found

**User Request:** "Assign PROJ-123 to unknown@example.com"

**Skill Execution:**
```
# Step 1: Validate user exists
~~project tracker get_user_by_email
email: "unknown@example.com"

# If user not found, inform user
# Response: "User not found: unknown@example.com"
```

**Result:** Inform user that email doesn't exist in JIRA, suggest checking spelling.

### Example 32: Handle Invalid JQL

**User Request:** "Show issues where status is broken"

**Skill Execution:**
```
~~project tracker search_issues
jql: "status = 'Broken'"
# Might fail if "Broken" is not a valid status
```

**Fallback:** Try alternative query or ask user for valid status names.

## Tips for Each Example Type

### Searching
- Always add `ORDER BY` for consistent results
- Use `maxResults` to limit large result sets
- Start with broad query, then add filters

### Creating
- Validate required fields first
- Use get_user_by_email before assigning
- Provide clear, descriptive summaries

### Updating
- Fetch issue first to verify it exists
- Only update fields that need to change
- Confirm update succeeded by fetching again

### Commenting
- Keep comments concise and actionable
- Include context for status updates
- Use for communication, not status changes

These examples cover the most common use cases for the JIRA Query skill. Adapt the queries based on your specific JIRA instance configuration, custom fields, and workflow.
