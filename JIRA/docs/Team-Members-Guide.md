# Team Members Management

Guide to managing team member information for quick mentions and assignments.

## Overview

Keep your team members' information in a centralized file for easy access across Claude Code sessions. This eliminates the need to repeatedly look up email addresses and account IDs.

---

## Setup

### Step 1: Create Team Members File

Create `~/.claude_team_members.json` in your home directory:

```bash
nano ~/.claude_team_members.json
```

### Step 2: Add Team Members

```json
{
  "team": [
    {
      "name": "Jagruti Jain",
      "email": "jagruti@company.com",
      "accountId": "615af9eb7a6be40071e7ad95",
      "role": "Developer",
      "projects": ["Framework", "Backend"]
    },
    {
      "name": "Manikandan Chellamuthu",
      "email": "manikandan@company.com",
      "accountId": "712bg0fc8b7cf51082f8be06",
      "role": "Tech Lead",
      "projects": ["Framework", "Platform"]
    },
    {
      "name": "QA Engineer",
      "email": "qa@company.com",
      "accountId": "813ch1gd9c8dg62193g9cf17",
      "role": "QA",
      "projects": ["All"]
    }
  ],
  "metadata": {
    "lastUpdated": "2026-03-17",
    "company": "MyCompany",
    "jiraInstance": "https://mycompany.atlassian.net"
  }
}
```

### Step 3: Create Profile File (Optional)

Create `~/.claude_profile.md`:

```bash
nano ~/.claude_profile.md
```

Add your preferences:

```markdown
# Claude Profile - Your Name

## Team Information
- Team members data stored at: `~/.claude_team_members.json`
- Use this file when tagging team members in JIRA or other tools

## JIRA Configuration
- JIRA Instance: https://mycompany.atlassian.net
- Primary Project: Framework (FRAMENGG)
- Team: Backend Platform Team

## Preferences
- Default priority for bugs: High
- Default issue type for tasks: Task
- Preferred notification method: JIRA mentions

## Common Workflows
1. PR reviews: Tag reviewer in JIRA with PR link
2. Bug reports: Assign to QA team lead
3. Feature requests: Tag product manager

## Team Members Quick Reference
- Tech Lead: Manikandan
- Developers: Jagruti, [others]
- QA Lead: [name]
- Product: [name]
```

---

## Usage

### In New Claude Code Sessions

Start your session with:

```
Use my team members file for this session
```

Or:

```
Load my profile
```

Claude will read `~/.claude_team_members.json` and have team info for the entire conversation.

### Mentioning Team Members

**Natural language:**

```
Tag Jagruti in FRAMENGG-11983 with the PR review request
```

Claude will:
1. Look up Jagruti's accountId from your team file
2. Add comment with proper mention: `[~615af9eb7a6be40071e7ad95] ...`

**Direct reference:**

```
Add comment to PROJ-123:
"@Jagruti and @Manikandan - please review this"
```

Claude converts @names to proper accountId mentions.

### Assigning Issues

```
Assign PROJ-456 to Jagruti
```

Claude looks up the email from team file and uses `update_issue` tool.

---

## Team File Schema

### Required Fields

```json
{
  "name": "Display Name",
  "email": "user@company.com",
  "accountId": "jira-account-id"
}
```

### Optional Fields

```json
{
  "role": "Developer | QA | Manager | Tech Lead",
  "projects": ["Project1", "Project2"],
  "timezone": "America/Los_Angeles",
  "availability": "Mon-Fri 9-5 PST",
  "slackHandle": "@username",
  "githubUsername": "username"
}
```

### Complete Example

```json
{
  "team": [
    {
      "name": "Alice Developer",
      "email": "alice@company.com",
      "accountId": "abc123xyz",
      "role": "Senior Developer",
      "projects": ["Framework", "API"],
      "timezone": "America/New_York",
      "availability": "Mon-Fri 9-6 EST",
      "slackHandle": "@alice",
      "githubUsername": "alice-dev",
      "specialties": ["Python", "Backend", "Databases"]
    },
    {
      "name": "Bob QA",
      "email": "bob@company.com",
      "accountId": "def456uvw",
      "role": "QA Lead",
      "projects": ["All"],
      "timezone": "Asia/Kolkata",
      "availability": "Mon-Fri 10-7 IST",
      "slackHandle": "@bob",
      "specialties": ["Automation", "Performance Testing"]
    }
  ],
  "groups": {
    "backend": ["Alice Developer", "Charlie Engineer"],
    "qa": ["Bob QA"],
    "frontend": ["Dana UI"]
  },
  "metadata": {
    "lastUpdated": "2026-03-17",
    "company": "ACME Corp",
    "jiraInstance": "https://acme.atlassian.net",
    "maintainer": "Tech Lead Name"
  }
}
```

---

## Getting Team Member Data

### Method 1: From JIRA UI

1. Navigate to team member's profile in JIRA
2. URL will show: `https://yoursite.atlassian.net/people/ACCOUNT_ID`
3. Copy the `ACCOUNT_ID` from URL

### Method 2: Using MCP Tool

```
Get JIRA user by email: alice@company.com
```

Response includes accountId:
```json
{
  "accountId": "abc123xyz",
  "displayName": "Alice Developer",
  "emailAddress": "alice@company.com",
  "active": true
}
```

Add to your `~/.claude_team_members.json`.

### Method 3: Bulk Export

Create a script to populate team file:

```bash
#!/bin/bash
# populate-team.sh

EMAILS=(
  "alice@company.com"
  "bob@company.com"
  "charlie@company.com"
)

echo '{"team": [' > ~/.claude_team_members.json

for email in "${EMAILS[@]}"; do
  echo "Looking up $email..."
  # Use JIRA MCP tool via Claude Code
  # Or use curl to JIRA API
done

echo ']}' >> ~/.claude_team_members.json
```

---

## Workflows

### Workflow 1: PR Review Request

```
1. Tag Jagruti in FRAMENGG-11983
2. Message: "First round of review done [PR link] please review"
```

Behind the scenes:
```typescript
// Claude reads ~/.claude_team_members.json
// Finds: Jagruti → jagruti@company.com → 615af9eb7a6be40071e7ad95

add_comment(
  issueIdOrKey: "FRAMENGG-11983",
  body: "[~615af9eb7a6be40071e7ad95] First round of review done https://github.com/org/repo/pull/123 please review"
)
```

### Workflow 2: Bug Assignment

```
Assign PROJ-789 to QA team
```

Claude:
1. Reads team file
2. Finds QA team member
3. Assigns issue:

```typescript
update_issue(
  issueKey: "PROJ-789",
  assigneeEmail: "qa@company.com"
)
```

### Workflow 3: Team Notification

```
Notify backend team about deployment
```

Claude:
1. Reads `groups.backend` from team file
2. Gets all accountIds for backend team
3. Mentions all:

```typescript
add_comment(
  issueIdOrKey: "PROJ-456",
  body: "[~alice-id] [~charlie-id] Deployment scheduled for tonight at 10pm PST"
)
```

---

## Best Practices

### 1. Keep File Updated

```bash
# Set a reminder to update quarterly
crontab -e

# Add:
# 0 9 1 */3 * echo "Update ~/.claude_team_members.json" | mail -s "Team File Update" you@company.com
```

### 2. Add New Members Immediately

When someone joins:

```bash
# Use JIRA tool to get their accountId
# Add to team file right away
```

### 3. Remove Inactive Members

Mark as inactive instead of deleting:

```json
{
  "name": "Former Employee",
  "email": "former@company.com",
  "accountId": "xyz789",
  "active": false,
  "leftDate": "2025-12-31"
}
```

### 4. Use Groups for Teams

```json
{
  "groups": {
    "backend": ["Alice", "Bob"],
    "frontend": ["Charlie", "Dana"],
    "qa": ["Eve"],
    "reviewers": ["Alice", "Bob", "Charlie"]
  }
}
```

### 5. Document in Profile

Keep `~/.claude_profile.md` updated with:
- Current projects
- Team structure
- Common workflows
- Preferences

---

## Troubleshooting

### File Not Found

```bash
# Verify file exists
ls -la ~/.claude_team_members.json

# If not, create it
touch ~/.claude_team_members.json
```

### Invalid JSON

```bash
# Validate JSON syntax
cat ~/.claude_team_members.json | jq

# If error, fix syntax
nano ~/.claude_team_members.json
```

### AccountId Not Working

1. Verify accountId is current (users can change)
2. Check user is active in JIRA
3. Verify user has project access

```
Get JIRA user by email: user@company.com
# Compare accountId with your file
```

### Claude Not Finding Team Member

Make sure you prompted:
```
Use my team members file for this session
```

Or:
```
Check my team file for Jagruti's accountId
```

---

## Advanced Usage

### Environment Variable

Set team file location as environment variable:

```bash
# In ~/.zshrc
export CLAUDE_TEAM_FILE="$HOME/.claude_team_members.json"
```

### Multiple Teams

Separate files for different teams:

```bash
~/.claude_team_backend.json
~/.claude_team_frontend.json
~/.claude_team_qa.json
```

Reference in session:
```
Use my backend team file this session
```

### Integration with Scripts

```python
#!/usr/bin/env python3
import json

# Load team file
with open(os.path.expanduser('~/.claude_team_members.json')) as f:
    team = json.load(f)

# Find member by name
def get_member(name):
    for member in team['team']:
        if member['name'] == name:
            return member
    return None

# Get accountId for mention
jagruti = get_member('Jagruti Jain')
mention = f"[~{jagruti['accountId']}]"
```

---

## Security

### File Permissions

```bash
# Protect team file
chmod 600 ~/.claude_team_members.json

# Only you can read/write
ls -la ~/.claude_team_members.json
# -rw-------  1 user  staff  1234 Mar 17 10:00 .claude_team_members.json
```

### Sensitive Data

**Don't include:**
- ❌ Passwords
- ❌ API tokens
- ❌ SSH keys
- ❌ Personal addresses
- ❌ Phone numbers (unless work phones)

**Safe to include:**
- ✅ Work emails
- ✅ JIRA accountIds
- ✅ Display names
- ✅ Roles
- ✅ Projects
- ✅ Slack handles
- ✅ GitHub usernames

### Version Control

**Don't commit to git:**

```bash
# Add to .gitignore
echo ".claude_team_members.json" >> ~/.gitignore
```

**Share template only:**

```json
{
  "team": [
    {
      "name": "Example Name",
      "email": "user@company.com",
      "accountId": "ACCOUNT_ID_HERE",
      "role": "Developer"
    }
  ]
}
```

---

## Summary

### Setup Checklist

- [ ] Create `~/.claude_team_members.json`
- [ ] Add all team members with accountIds
- [ ] Create `~/.claude_profile.md` (optional)
- [ ] Set file permissions (`chmod 600`)
- [ ] Test in Claude Code session
- [ ] Add to calendar to update quarterly

### Usage Pattern

1. **Start session:** "Use my team members file"
2. **Natural reference:** "Tag Jagruti in PROJ-123"
3. **Claude handles:** Looks up accountId, creates mention

### Benefits

✅ No need to remember accountIds
✅ Quick team member references
✅ Consistent across sessions
✅ Easy onboarding for new members
✅ Centralized team info

---

## Related Documentation

- [Mentions Guide](./Mentions-Guide.md) - Using mentions in comments
- [Usage Examples](./Usage-Examples.md) - Real-world examples
- [API Reference](./API-Reference.md) - Tool specifications

---

**Keep your team file updated and enjoy quick mentions!** 👥
