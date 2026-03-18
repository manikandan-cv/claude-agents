# JIRA MCP Server - Quick Reference

Essential patterns and formats for daily use.

---

## 🔍 Search Queries (JQL)

### Email-Based Search (✅ Correct Format)

```jql
assignee = "user@company.com"
```

**With date:**
```jql
assignee = "jagruti.jain@chargebee.com" AND updated >= 2025-07-17
```

### Date Format (✅ Correct: YYYY-MM-DD)

```jql
updated >= 2025-07-17
created >= 2025-01-01
resolved <= 2025-12-31
```

### Common Patterns

```jql
# My open issues
assignee = currentUser() AND resolution = Unresolved

# Team member's recent work
assignee = "user@company.com" AND updated >= 2025-07-17

# High priority bugs
type = Bug AND priority IN (Highest, High) AND status != Closed

# Project + assignee
project = PROJ AND assignee = "user@company.com"
```

---

## 💬 Comments with Mentions and Links

### Mention User

```
[~615af9eb7a6be40071e7ad95] Please review
```

### With URL (Auto-Clickable)

```
[~accountId] PR ready https://github.com/org/repo/pull/123 please check
```

### Real Example

```
Add comment to FRAMENGG-11983:
"[~615af9eb7a6be40071e7ad95] First round of review done https://github.com/chargebee/chargebee-app/pull/112177 please review"
```

**Result in JIRA:**
- **@Jagruti Jain** ← Clickable mention, notification sent
- **https://github.com/...** ← Clickable link

---

## 👥 Team Members File

### Setup (~/.claude_team_members.json)

```json
{
  "team": [
    {
      "name": "Jagruti Jain",
      "email": "jagruti@company.com",
      "accountId": "615af9eb7a6be40071e7ad95",
      "role": "Developer"
    }
  ]
}
```

### Usage

```
Use my team members file

Then: Tag Jagruti in PROJ-123
```

---

## 🛠️ MCP Server Tools

### 1. search_issues

```typescript
search_issues({
  jql: 'assignee = "user@company.com" AND updated >= 2025-07-17',
  maxResults: 100
})
```

### 2. get_issue

```typescript
get_issue({
  issueIdOrKey: "PROJ-123"
})
```

### 3. get_user_by_email

```typescript
get_user_by_email({
  email: "user@company.com"
})
```

### 4. create_issue

```typescript
create_issue({
  projectKey: "PROJ",
  issueType: "Bug",
  summary: "Issue title",
  description: "Details here"
})
```

### 5. update_issue

```typescript
update_issue({
  issueKey: "PROJ-123",
  priority: "High"
})
```

### 6. add_comment

```typescript
add_comment({
  issueIdOrKey: "PROJ-123",
  body: "[~accountId] Comment with mention"
})
```

---

## 📋 Date Formats

### Absolute Dates

```jql
YYYY-MM-DD

Examples:
2025-07-17
2025-01-01
2025-12-31
```

### Relative Dates

```jql
-7d        # Last 7 days
-30d       # Last 30 days
-90d       # Last 3 months
startOfWeek()
startOfMonth()
```

---

## ⚙️ Configuration Files

### ~/.mcp.json

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}"
      }
    }
  }
}
```

### ~/.zshrc (Environment Variables)

```bash
export JIRA_API_TOKEN="your-token"
export JIRA_USER_EMAIL="your-email@company.com"
export JIRA_BASE_URL="https://yourorg.atlassian.net"
```

---

## 🎨 Output Formats

### Search Results (List)

```
Found 3 issues:

1. 🔄 PROJ-123: Fix bug
   🐛 Bug | 🔴 High | 👤 John Doe

2. ✅ PROJ-456: Add feature
   ✨ Feature | 🟡 Medium | 👤 Jane Smith
```

### Issue Details (Box)

```
╔═══════════════════════════════════════════════════════╗
║  🎫  Issue Title                                      ║
╠═══════════════════════════════════════════════════════╣
║  🔄 Status:  Open        │  🔴 Priority:  High        ║
║  🐛 Type:    Bug         │  🗂️  Project:  PROJ        ║
║  👤 Assignee: John Doe   │  📊 Subtasks: 0            ║
║  📅 Created: 2025-07-17  │  🔄 Updated: 2025-10-17    ║
╠═══════════════════════════════════════════════════════╣
║  📖 DESCRIPTION                                       ║
║    Issue description here...                          ║
╠═══════════════════════════════════════════════════════╣
║  💬 COMMENTS (2)                                      ║
║    ▸ Author • Date                                    ║
║      Comment text...                                  ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🚀 Common Workflows

### 1. PR Review Request

```bash
# Get reviewer's accountId
get_user_by_email(email: "reviewer@company.com")

# Add comment with mention and PR link
add_comment(
  issueIdOrKey: "PROJ-123",
  body: "[~accountId] Review ready https://github.com/org/repo/pull/456"
)
```

### 2. Search Team's Work

```bash
search_issues(
  jql: 'assignee = "teammate@company.com" AND updated >= 2025-07-17',
  maxResults: 100
)
```

### 3. Update and Notify

```bash
# Update issue
update_issue(
  issueKey: "PROJ-123",
  status: "In Review"
)

# Notify reviewer
add_comment(
  issueIdOrKey: "PROJ-123",
  body: "[~reviewerAccountId] Ready for review"
)
```

---

## ❌ Common Mistakes

### 1. Email Without Quotes

```jql
❌ assignee = user@company.com
✅ assignee = "user@company.com"
```

### 2. Wrong Date Format

```jql
❌ updated >= 2025/07/17
❌ updated >= 07-17-2025
✅ updated >= 2025-07-17
```

### 3. Missing Leading Zeros

```jql
❌ updated >= 2025-7-17
✅ updated >= 2025-07-17
```

### 4. Status Without Quotes

```jql
❌ status = In Progress
✅ status = "In Progress"
```

---

## 📚 Full Documentation

- [JQL Guide](docs/JQL-Guide.md) - Complete query syntax
- [Mentions Guide](docs/Mentions-Guide.md) - User mentions and URLs
- [Team Members Guide](docs/Team-Members-Guide.md) - Team management
- [Setup Guide](docs/Setup-Guide.md) - Installation
- [API Reference](docs/API-Reference.md) - All tools
- [Troubleshooting](docs/Troubleshooting.md) - Common issues

---

## 💡 Tips

1. **Test queries in JIRA web UI first** - If it works there, it works in MCP
2. **Use email format for assignee** - More intuitive than accountId
3. **Use YYYY-MM-DD for dates** - Standard ISO format
4. **Quote multi-word values** - `status = "In Progress"`
5. **Keep team file updated** - Makes mentions easier
6. **Use formatting for readability** - Emojis make scanning faster

---

**Need more details?** Check the full documentation in the `docs/` folder.

**Quick start:**
```bash
claude
> Use my team members file
> Search JIRA for assignee = "user@company.com" AND updated >= 2025-07-17
```
