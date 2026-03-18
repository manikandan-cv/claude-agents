# JQL Patterns Reference

Comprehensive guide to JIRA Query Language (JQL) patterns for the JIRA Query skill.

## Basic Syntax

```
field operator value
```

Multiple conditions can be combined with `AND`, `OR`, and `NOT`.

## Common Fields

### Issue Identification
- `key` - Issue key (e.g., `key = PROJ-123`)
- `id` - Issue ID (e.g., `id = 10000`)
- `issuekey` - Alias for key

### Issue Properties
- `summary` - Issue title (e.g., `summary ~ "login bug"`)
- `description` - Issue description (e.g., `description ~ "error message"`)
- `type` - Issue type (e.g., `type = Bug`)
- `status` - Current status (e.g., `status = Open`)
- `priority` - Priority level (e.g., `priority = High`)
- `resolution` - Resolution status (e.g., `resolution = Fixed`)

### People
- `assignee` - Assigned user (e.g., `assignee = currentUser()`)
- `reporter` - User who created issue (e.g., `reporter = "john@example.com"`)
- `creator` - Alias for reporter
- `watcher` - Users watching issue

### Project and Organization
- `project` - Project key (e.g., `project = PROJ`)
- `component` - Component name (e.g., `component = "Frontend"`)
- `labels` - Issue labels (e.g., `labels = urgent`)
- `fixVersion` - Target version (e.g., `fixVersion = "1.0.0"`)
- `affectedVersion` - Version with issue

### Dates
- `created` - Creation date (e.g., `created >= -7d`)
- `updated` - Last update date (e.g., `updated > startOfWeek()`)
- `resolved` - Resolution date (e.g., `resolved >= startOfMonth()`)
- `duedate` - Due date (e.g., `duedate <= 7d`)

### Sprint and Agile
- `sprint` - Sprint name/ID (e.g., `sprint = "Sprint 23"`)
- `epic` - Epic link
- `parent` - Parent issue for subtasks

## Operators

### Equality
- `=` - Equal to
- `!=` - Not equal to
- `IN` - In list (e.g., `status IN (Open, "In Progress")`)
- `NOT IN` - Not in list

### Comparison
- `>` - Greater than
- `>=` - Greater than or equal
- `<` - Less than
- `<=` - Less than or equal

### Text Search
- `~` - Contains (e.g., `summary ~ "bug"`)
- `!~` - Does not contain

### Empty/Null
- `IS EMPTY` - Field is empty (e.g., `assignee IS EMPTY`)
- `IS NOT EMPTY` - Field has a value

### Membership
- `WAS` - Historical value (e.g., `status WAS "In Progress"`)
- `WAS IN` - Was in list
- `WAS NOT` - Was not value
- `CHANGED` - Field changed (e.g., `status CHANGED`)

## Functions

### User Functions
- `currentUser()` - Logged-in user
- `membersOf("group-name")` - Users in group

### Date/Time Functions
- `now()` - Current date/time
- `startOfDay([offset])` - Start of day (e.g., `startOfDay(-1)` = yesterday)
- `endOfDay([offset])` - End of day
- `startOfWeek([offset])` - Start of week
- `endOfWeek([offset])` - End of week
- `startOfMonth([offset])` - Start of month
- `endOfMonth([offset])` - End of month
- `startOfYear([offset])` - Start of year
- `endOfYear([offset])` - End of year

### List Functions
- `currentLogin()` - Current user (Cloud only)
- `lastLogin()` - User's last login

## Date Formats

### Relative Dates
- `-Nd` - N days ago (e.g., `-7d` = 7 days ago)
- `-Nw` - N weeks ago
- `-Nm` - N months ago
- `-Ny` - N years ago
- `Nd` - N days from now

### Absolute Dates
- `"YYYY-MM-DD"` - Specific date (e.g., `"2024-01-15"`)
- `"YYYY-MM-DD HH:mm"` - Date with time

## Common Query Patterns

### By Assignee

```jql
# My issues
assignee = currentUser()

# Specific user (by email)
assignee = "john@example.com"

# Specific user (by accountId - Cloud)
assignee = "70121:abcd1234-..."

# Unassigned
assignee IS EMPTY

# Assigned to anyone
assignee IS NOT EMPTY
```

### By Status

```jql
# Open issues
status = Open

# Multiple statuses
status IN (Open, "In Progress", Reopened)

# Not closed
status != Closed

# Resolved or closed
status IN (Resolved, Closed, Done)
```

### By Date

```jql
# Created in last 7 days
created >= -7d

# Updated this week
updated >= startOfWeek()

# Created this month
created >= startOfMonth()

# Due in next 7 days
duedate <= 7d AND duedate >= 0d

# Overdue
duedate < now() AND status != Closed

# Created between dates
created >= "2024-01-01" AND created < "2024-02-01"
```

### By Priority

```jql
# High priority
priority = High

# High or critical
priority IN (Highest, High)

# Not low priority
priority NOT IN (Low, Lowest)
```

### By Type

```jql
# Bugs
type = Bug

# Stories and tasks
type IN (Story, Task)

# Not subtasks
type != Sub-task

# Epics
type = Epic
```

### By Project

```jql
# Specific project
project = PROJ

# Multiple projects
project IN (PROJ1, PROJ2)

# All projects except one
project != ADMIN
```

### By Labels

```jql
# Has specific label
labels = urgent

# Has any of these labels
labels IN (urgent, critical)

# Has no labels
labels IS EMPTY
```

### By Text

```jql
# Summary contains "login"
summary ~ "login"

# Description contains "error"
description ~ "error"

# Summary or description contains "bug"
text ~ "bug"

# Case-insensitive contains
summary ~ "Login" OR summary ~ "login"
```

### By Reporter

```jql
# Created by me
reporter = currentUser()

# Created by specific user
reporter = "jane@example.com"
```

### By Component

```jql
# In component
component = "Frontend"

# In any of these components
component IN ("Frontend", "Backend")

# No component
component IS EMPTY
```

## Complex Queries

### My Open Bugs from Last Sprint

```jql
assignee = currentUser()
AND type = Bug
AND status != Closed
AND sprint = "Sprint 23"
```

### High-Priority Unassigned Issues Created Recently

```jql
priority IN (Highest, High)
AND assignee IS EMPTY
AND created >= -14d
ORDER BY created DESC
```

### Issues Updated This Week (Excluding Mine)

```jql
updated >= startOfWeek()
AND assignee != currentUser()
AND status IN (Open, "In Progress")
ORDER BY updated DESC
```

### Overdue Bugs in Project

```jql
project = PROJ
AND type = Bug
AND duedate < now()
AND status NOT IN (Resolved, Closed, Done)
ORDER BY duedate ASC
```

### Stories Resolved This Month

```jql
type = Story
AND resolved >= startOfMonth()
AND resolution = Done
ORDER BY resolved DESC
```

### Recently Changed High-Priority Items

```jql
priority IN (Highest, High)
AND status CHANGED DURING (startOfWeek(), now())
ORDER BY updated DESC
```

## Sorting

Add `ORDER BY` clause to sort results:

```jql
# Sort by creation date (newest first)
ORDER BY created DESC

# Sort by priority (highest first), then created date
ORDER BY priority DESC, created DESC

# Multiple sort fields
ORDER BY status ASC, priority DESC, updated DESC
```

### Common Sort Fields
- `created` - Creation date
- `updated` - Last updated
- `priority` - Priority level
- `duedate` - Due date
- `key` - Issue key
- `status` - Status

### Sort Direction
- `ASC` - Ascending (A-Z, 0-9, oldest first)
- `DESC` - Descending (Z-A, 9-0, newest first)

## Parentheses and Precedence

Use parentheses to control query logic:

```jql
# Without parentheses (priority is evaluated first)
status = Open OR status = "In Progress" AND priority = High

# With parentheses (explicit grouping)
(status = Open OR status = "In Progress") AND priority = High

# Complex grouping
project = PROJ AND (
  (type = Bug AND priority = High)
  OR
  (type = Story AND labels = urgent)
)
```

## Escaping Special Characters

Use quotes for values with spaces or special characters:

```jql
# Status with space
status = "In Progress"

# Label with dash
labels = "needs-review"

# Project with underscore
project = "MY_PROJECT"
```

## Limitations

- Text search (`~`) is case-insensitive
- Some fields require exact match (no wildcards)
- Custom fields use `cf[XXXXX]` syntax
- Historical queries (WAS, CHANGED) may be slower
- Maximum query length varies by instance

## Best Practices

1. **Start simple** - Add filters incrementally
2. **Use parentheses** - Make complex logic explicit
3. **Test in JIRA** - Validate queries in issue navigator
4. **Limit results** - Use maxResults to avoid large responses
5. **Add sorting** - Always include ORDER BY for consistent results
6. **Quote values** - Use quotes for multi-word values
7. **Index awareness** - Common fields (project, status, assignee) are faster

## Resources

- Official JIRA JQL Documentation: https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/
- JQL Cheat Sheet: Available in JIRA's advanced search
- Field Reference: System → Fields in JIRA admin
