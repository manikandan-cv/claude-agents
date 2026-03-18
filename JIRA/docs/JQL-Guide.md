# JQL Query Guide

Complete guide to constructing JQL queries for the JIRA MCP server.

## Overview

JQL (JIRA Query Language) is a flexible query language for searching JIRA issues. This guide shows the correct formats for common searches.

---

## ✅ Correct Formats (Working Examples)

### Email-Based Assignee Search

**✅ Correct:**
```jql
assignee = "jagruti.jain@chargebee.com"
```

**✅ With conditions:**
```jql
assignee = "jagruti.jain@chargebee.com" AND status = "In Progress"
```

**❌ Incorrect:**
```jql
assignee = jagruti.jain@chargebee.com  # Missing quotes
```

**Key Points:**
- ✅ Use email addresses directly: `"user@company.com"`
- ✅ Always wrap email in double quotes
- ✅ Works for any JIRA user with email access

### Date Format

**✅ Correct:**
```jql
updated >= 2025-07-17
```

**Format:** `YYYY-MM-DD`
- Year: 4 digits (2025)
- Month: 2 digits (07)
- Day: 2 digits (17)

**Date Operators:**
```jql
created >= 2025-07-17        # On or after
updated <= 2025-12-31        # On or before
duedate = 2025-08-15         # Exact date
resolved > 2025-01-01        # After (not including)
```

**❌ Incorrect formats:**
```jql
updated >= 2025/07/17        # Wrong separator
updated >= 07-17-2025        # Wrong order (MM-DD-YYYY)
updated >= 17-07-2025        # Wrong order (DD-MM-YYYY)
updated >= 2025-7-17         # Missing leading zeros
```

---

## Common Query Patterns

### 1. Email + Date Range

**Working format from your system:**
```jql
assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17
```

**Breakdown:**
- `assignee = "jagruti.jain@chargebee.com"` - Email with quotes
- `AND` - Logical operator
- `updated >= 2025-07-17` - Date in YYYY-MM-DD format

**More examples:**
```jql
# Last 6 months of updates
assignee = "user@company.com" AND updated >= 2025-09-17

# Created in date range
assignee = "user@company.com" AND created >= 2025-01-01 AND created <= 2025-12-31

# Updated after specific date, still open
assignee = "user@company.com" AND updated >= 2025-07-17 AND resolution = Unresolved
```

### 2. Current User Queries

**Without email (using current user):**
```jql
assignee = currentUser() AND resolution = Unresolved
```

**With dates:**
```jql
assignee = currentUser() AND updated >= 2025-07-17
```

### 3. Project + Email + Date

```jql
project = FRAMENGG AND assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17
```

### 4. Status + Email + Date

```jql
assignee = "user@company.com" AND status IN ("In Progress", "In Code Review") AND updated >= 2025-07-17
```

---

## Date Shortcuts

### Relative Dates (Alternative to YYYY-MM-DD)

```jql
# Last 7 days
created >= -7d

# Last 30 days
updated >= -30d

# Last 3 months (90 days)
created >= -90d

# Last week
created >= startOfWeek()

# This month
created >= startOfMonth()
```

**When to use:**
- ✅ Relative dates: Good for recurring queries
- ✅ Absolute dates: Good for historical analysis

**Example combining both:**
```jql
# Issues assigned to user, updated in last 6 months
assignee = "user@company.com" AND updated >= -180d
```

---

## Email Formats

### Different Email Scenarios

**1. Standard email:**
```jql
assignee = "first.last@company.com"
```

**2. Email with numbers:**
```jql
assignee = "user123@company.com"
```

**3. Email with special characters:**
```jql
assignee = "first-last@company.com"
assignee = "first_last@company.com"
```

**4. Multiple domains:**
```jql
assignee = "user@subdomain.company.com"
```

**Important:**
- ✅ Always use double quotes around email
- ✅ Include the full email address
- ✅ Case-insensitive (JIRA handles this)

---

## Advanced Examples

### 1. Team Search (Multiple Assignees)

```jql
assignee IN ("user1@company.com", "user2@company.com", "user3@company.com") AND updated >= 2025-07-17
```

### 2. Date Range Search

```jql
assignee = "user@company.com" AND updated >= 2025-07-17 AND updated <= 2025-10-17
```

### 3. Exclude Resolved

```jql
assignee = "user@company.com" AND resolution = Unresolved AND updated >= 2025-07-17
```

### 4. Priority Filter

```jql
assignee = "user@company.com" AND priority IN (Highest, High) AND updated >= 2025-07-17
```

### 5. Issue Type Filter

```jql
assignee = "user@company.com" AND type = Bug AND updated >= 2025-07-17
```

---

## Date Fields Available

### Common Date Fields

```jql
created >= 2025-07-17        # When issue was created
updated >= 2025-07-17        # Last time issue was modified
resolved >= 2025-07-17       # When issue was resolved
duedate >= 2025-07-17        # Due date of issue
```

### Date Comparisons

```jql
# Overdue issues
duedate < now() AND resolution = Unresolved

# Recently created
created >= -7d

# Updated this week
updated >= startOfWeek()

# Created last month
created >= startOfMonth(-1) AND created < startOfMonth()
```

---

## Real-World Examples

### Example 1: Your Pattern

```jql
assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17
```

**What it does:**
- Finds all issues assigned to Jagruti
- Updated on or after July 17, 2025
- Returns 55 issues (in your case)

### Example 2: Sprint Planning

```jql
assignee = "developer@company.com" AND status = "To Do" AND sprint IS EMPTY
```

### Example 3: Bug Triage

```jql
type = Bug AND assignee = "qa@company.com" AND created >= -7d AND priority IN (Highest, High)
```

### Example 4: Code Review

```jql
status = "In Code Review" AND assignee = "reviewer@company.com" AND updated >= 2025-07-17
```

### Example 5: Monthly Report

```jql
assignee = "employee@company.com" AND resolved >= 2025-10-01 AND resolved <= 2025-10-31
```

---

## Testing Your Queries

### In MCP Server

```
Search JIRA with JQL: assignee = "user@company.com" AND updated >= 2025-07-17
```

### In JIRA Web UI

1. Go to JIRA → Issues → Search
2. Click "Advanced" to switch to JQL mode
3. Paste your query
4. Verify results

If it works in JIRA web UI, it will work in the MCP server.

---

## Common Mistakes

### ❌ Mistake 1: Missing Quotes on Email

```jql
assignee = user@company.com  # ❌ Wrong
assignee = "user@company.com"  # ✅ Correct
```

### ❌ Mistake 2: Wrong Date Format

```jql
updated >= 2025/07/17  # ❌ Wrong (slash separator)
updated >= 07-17-2025  # ❌ Wrong (MM-DD-YYYY)
updated >= 2025-07-17  # ✅ Correct (YYYY-MM-DD)
```

### ❌ Mistake 3: Missing Leading Zeros

```jql
updated >= 2025-7-17  # ❌ Wrong
updated >= 2025-07-17  # ✅ Correct
```

### ❌ Mistake 4: Wrong Status Quotes

```jql
status = In Progress  # ❌ Wrong (spaces need quotes)
status = "In Progress"  # ✅ Correct
```

---

## Quick Reference

### Email Search Template

```jql
assignee = "EMAIL@DOMAIN.COM"
```

### Date Search Template

```jql
DATEFIELD >= YYYY-MM-DD
```

### Combined Template

```jql
assignee = "EMAIL@DOMAIN.COM" AND DATEFIELD >= YYYY-MM-DD
```

### Replace:
- `EMAIL@DOMAIN.COM` → Actual email
- `DATEFIELD` → created, updated, resolved, duedate
- `YYYY-MM-DD` → Actual date (2025-07-17)

---

## Tool Usage in MCP Server

### search_issues Tool

```typescript
search_issues({
  jql: 'assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17',
  maxResults: 100
})
```

**Parameters:**
- `jql` (string, required) - JQL query string
- `maxResults` (number, optional) - Max results (default: 50, max: 100)

**Returns:**
- List of matching issues
- Formatted with emojis and colors

---

## Debugging Queries

### If Query Fails

1. **Check email format:**
   ```jql
   # Make sure quotes are present
   assignee = "user@company.com"
   ```

2. **Check date format:**
   ```jql
   # Must be YYYY-MM-DD
   updated >= 2025-07-17
   ```

3. **Test in JIRA web UI first**
   - If it works there, it should work in MCP

4. **Check for typos:**
   - Field names (assignee, updated, etc.)
   - Operators (=, >=, IN, etc.)
   - Logical operators (AND, OR)

### Common Errors

**"Field does not exist"**
- Check spelling: `assignee` not `assigned`

**"Invalid date format"**
- Use YYYY-MM-DD: `2025-07-17`

**"User not found"**
- Email might not exist in JIRA
- User might be deactivated

---

## Best Practices

### 1. Always Quote Emails

```jql
✅ assignee = "user@company.com"
❌ assignee = user@company.com
```

### 2. Use YYYY-MM-DD for Dates

```jql
✅ updated >= 2025-07-17
❌ updated >= 2025/07/17
```

### 3. Quote Multi-Word Values

```jql
✅ status = "In Progress"
❌ status = In Progress
```

### 4. Use Relative Dates for Recurring Queries

```jql
# Better for daily use
updated >= -7d

# Better for specific analysis
updated >= 2025-07-17
```

### 5. Test Incrementally

```jql
# Start simple
assignee = "user@company.com"

# Add conditions one at a time
assignee = "user@company.com" AND updated >= 2025-07-17

# Add more
assignee = "user@company.com" AND updated >= 2025-07-17 AND status != Closed
```

---

## Summary

### Key Formats to Remember

**Email:**
```jql
assignee = "user@company.com"
```

**Date:**
```jql
updated >= 2025-07-17
```

**Combined:**
```jql
assignee = "user@company.com" AND updated >= 2025-07-17
```

### Your Working Pattern

```jql
assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17
```

This is the correct format! ✅

---

## Related Documentation

- [API Reference](./API-Reference.md) - search_issues tool details
- [Usage Examples](./Usage-Examples.md) - More query examples
- [Troubleshooting](./Troubleshooting.md) - Common issues

---

**Questions?** Test your queries in JIRA web UI first, then use them in the MCP server!
