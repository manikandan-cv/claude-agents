# Usage Examples

This guide provides real-world examples of using the JIRA MCP integration with Claude. These examples demonstrate common workflows, queries, and automation scenarios.

## Table of Contents

- [Daily Workflows](#daily-workflows)
- [Issue Management](#issue-management)
- [Sprint Planning](#sprint-planning)
- [Reporting and Analytics](#reporting-and-analytics)
- [Advanced Scenarios](#advanced-scenarios)

---

## Daily Workflows

### 1. Morning Standup Preparation

**Goal**: Get a summary of your work from yesterday and today's tasks.

```
Show me all issues I worked on yesterday and my tasks for today
```

Claude will execute:
```javascript
// Yesterday's work
search_issues({
  jql: "assignee = currentUser() AND updated >= -1d",
  maxResults: 50
})

// Today's tasks
search_issues({
  jql: "assignee = currentUser() AND status != Done ORDER BY priority DESC",
  maxResults: 20
})
```

**Output**: A formatted summary of completed work and pending tasks, ready for standup.

---

### 2. Check Blocked Issues

**Goal**: Find all issues currently blocked in your project.

```
Find all blocked issues in the PROJ project
```

Claude will execute:
```javascript
search_issues({
  jql: "project = PROJ AND status = Blocked ORDER BY priority DESC",
  maxResults: 50
})
```

---

### 3. Bug Triage

**Goal**: Review new bugs that need attention.

```
Show me all critical and high priority bugs reported in the last 3 days
```

Claude will execute:
```javascript
search_issues({
  jql: "type = Bug AND priority in (Critical, High) AND created >= -3d ORDER BY created DESC",
  maxResults: 50
})
```

---

## Issue Management

### 4. Create a Bug Report

**Goal**: Create a detailed bug report with proper categorization.

```
Create a bug in PROJ: "Login page crashes on Safari 17"
Description: "When users try to log in using Safari 17 on macOS, the page crashes after entering credentials. Chrome and Firefox work fine."
Assign it to john@company.com with High priority and add label "safari-bug"
```

Claude will execute:
```javascript
// First, look up the assignee
get_user_by_email({
  email: "john@company.com"
})

// Then create the issue
create_issue({
  projectKey: "PROJ",
  issueType: "Bug",
  summary: "Login page crashes on Safari 17",
  description: "When users try to log in using Safari 17 on macOS, the page crashes after entering credentials. Chrome and Firefox work fine.",
  assigneeEmail: "john@company.com",
  priority: "High",
  labels: ["safari-bug"]
})
```

---

### 5. Update Issue with Progress

**Goal**: Update an issue with current progress and change priority.

```
Update PROJ-456: Add a comment saying "Fixed the authentication flow, testing in progress"
and change priority to Medium
```

Claude will execute:
```javascript
// Add the comment
add_comment({
  issueIdOrKey: "PROJ-456",
  body: "Fixed the authentication flow, testing in progress"
})

// Update priority
update_issue({
  issueKey: "PROJ-456",
  priority: "Medium"
})
```

---

### 6. Create a Subtask

**Goal**: Break down a large task into smaller subtasks.

```
Create a subtask under PROJ-789: "Write unit tests for login validation"
Assign it to me with labels "testing" and "unit-tests"
```

Claude will execute:
```javascript
create_issue({
  projectKey: "PROJ",
  issueType: "Sub-task",
  summary: "Write unit tests for login validation",
  parentKey: "PROJ-789",
  assigneeEmail: "your-email@company.com",
  labels: ["testing", "unit-tests"]
})
```

---

### 7. Bulk Comment on Related Issues

**Goal**: Add the same comment to multiple related issues.

```
Find all issues labeled "migration-2024" and add a comment: "Migration postponed to Q2 2026"
```

Claude will execute:
```javascript
// First, find all issues
search_issues({
  jql: "labels = migration-2024",
  maxResults: 100
})

// Then add comment to each (Claude will iterate)
add_comment({
  issueIdOrKey: "PROJ-123",
  body: "Migration postponed to Q2 2026"
})
// ... repeat for each issue
```

---

## Sprint Planning

### 8. Sprint Backlog Review

**Goal**: Review all items in the current sprint.

```
Show me all issues in sprint "Sprint 24" ordered by priority
```

Claude will execute:
```javascript
search_issues({
  jql: "sprint = 'Sprint 24' ORDER BY priority DESC, created ASC",
  maxResults: 100
})
```

---

### 9. Capacity Planning

**Goal**: See team workload distribution.

```
Show me issue count by assignee for all In Progress tasks in PROJ
```

Claude will execute:
```javascript
search_issues({
  jql: "project = PROJ AND status = 'In Progress' ORDER BY assignee",
  maxResults: 100
})
```

Claude will then group and count issues by assignee for you.

---

### 10. Sprint Scope Changes

**Goal**: Track what was added or removed during sprint.

```
Find all issues added to Sprint 24 in the last 7 days
```

Claude will execute:
```javascript
search_issues({
  jql: "sprint = 'Sprint 24' AND updated >= -7d ORDER BY updated DESC",
  maxResults: 50
})
```

---

## Reporting and Analytics

### 11. Velocity Tracking

**Goal**: See completed work over time.

```
Show me all issues completed in the last 30 days grouped by week
```

Claude will execute:
```javascript
search_issues({
  jql: "status = Done AND resolutiondate >= -30d ORDER BY resolutiondate ASC",
  maxResults: 100
})
```

---

### 12. Aging Issues Report

**Goal**: Find stale issues that need attention.

```
Find issues in PROJ that haven't been updated in 90 days and are still open
```

Claude will execute:
```javascript
search_issues({
  jql: "project = PROJ AND updated <= -90d AND status != Done ORDER BY updated ASC",
  maxResults: 50
})
```

---

### 13. Release Readiness

**Goal**: Check if all release-critical items are done.

```
Show me all issues targeted for version "2.5.0" that aren't resolved
```

Claude will execute:
```javascript
search_issues({
  jql: "fixVersion = '2.5.0' AND status != Done ORDER BY priority DESC",
  maxResults: 100
})
```

---

## Advanced Scenarios

### 14. Cross-Project Dependencies

**Goal**: Find dependencies between two projects.

```
Show me all issues in FRONTEND that are blocked by issues in BACKEND
```

Claude will execute:
```javascript
search_issues({
  jql: "project = FRONTEND AND status = Blocked AND issueFunction in linkedIssuesOf('project = BACKEND')",
  maxResults: 50
})
```

---

### 15. Technical Debt Tracking

**Goal**: Identify and prioritize technical debt.

```
Find all issues labeled "tech-debt" created this quarter, ordered by priority
```

Claude will execute:
```javascript
search_issues({
  jql: "labels = tech-debt AND created >= startOfQuarter() ORDER BY priority DESC, created ASC",
  maxResults: 100
})
```

---

## Common JQL Patterns

Here are useful JQL patterns you can use in your requests:

| Pattern | Description |
|---------|-------------|
| `assignee = currentUser()` | Your assigned issues |
| `reporter = currentUser()` | Issues you created |
| `created >= -7d` | Created in last 7 days |
| `updated >= -1w` | Updated in last week |
| `duedate <= now()` | Overdue issues |
| `status in (Open, "In Progress")` | Multiple statuses |
| `priority in (Critical, High)` | High priority items |
| `labels = urgent` | Tagged issues |
| `text ~ "authentication"` | Full text search |
| `project = PROJ AND sprint = activeSprint()` | Current sprint |

---

## Tips for Effective Usage

1. **Be Specific**: Include project keys, assignee emails, and specific criteria in your requests
2. **Use Natural Language**: Claude understands context - you don't need to know JQL syntax
3. **Combine Operations**: Ask Claude to search and then update multiple issues in one request
4. **Request Summaries**: Ask Claude to analyze and summarize large result sets
5. **Iterate**: Start broad, then narrow down based on results
6. **Use Labels**: Organize issues with labels for easier querying later
7. **Set Due Dates**: When creating issues, include due dates for better tracking
8. **Check Details**: Use `get_issue` to see full details including comments and history

---

## Workflow Automation Examples

### Daily Digest Email Prep

```
Create a summary of:
1. My completed issues yesterday
2. My in-progress tasks
3. Any high-priority issues assigned to me
Format it for an email update
```

### Weekly Team Report

```
For the PROJ project:
1. Show issues completed this week
2. List any critical bugs opened
3. Show overdue issues
4. Summarize by team member
```

### Pre-Release Checklist

```
For release 3.0.0:
1. Find all unresolved issues
2. List any critical or high priority items
3. Show test coverage tasks
4. Check for open security issues
```

---

## Next Steps

- Explore the [API Reference](./API-Reference.md) for detailed tool specifications
- Check [Troubleshooting](./Troubleshooting.md) if you encounter issues
- Review the [Setup Guide](./Setup-Guide.md) for configuration options
