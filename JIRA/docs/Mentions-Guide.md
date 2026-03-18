# User Mentions and Links in Comments

Guide to using @mentions and clickable URLs in JIRA comments via the MCP server.

## Overview

The JIRA MCP server automatically enhances your comments with:
- **User mentions** using `[~accountId]` syntax → proper user tags with notifications
- **Clickable URLs** - any `http://` or `https://` URL → clickable links in JIRA

---

## Mention Syntax

### Supported Formats

The MCP server supports these mention formats:

```
[~accountId]                    # Standard JIRA mention
[~accountid:accountId]          # Verbose format (also works)
```

### Example

```
First round of review done [~615af9eb7a6be40071e7ad95] please review the PR.
```

This will render in JIRA as:
```
First round of review done @Jagruti Jain please review the PR.
```

---

## How to Get AccountId

### Method 1: Use get_user_by_email Tool

```
Get the JIRA user by email: user@example.com
```

Response:
```json
{
  "accountId": "615af9eb7a6be40071e7ad95",
  "displayName": "User Name",
  "emailAddress": "user@example.com",
  "active": true
}
```

### Method 2: From JIRA Web UI

1. Go to JIRA and navigate to the user's profile
2. Check the URL: `https://yoursite.atlassian.net/people/ACCOUNT_ID`
3. The `ACCOUNT_ID` in the URL is what you need

### Method 3: From Issue Assignee

When you get an issue, the assignee's accountId is included (though not shown in the formatted output, it's in the internal data).

---

## Usage Examples

### Example 1: Mention User in Comment

**Step 1: Look up user's accountId**
```
Get JIRA user by email jagruti@company.com
```

**Step 2: Add comment with mention**
```
Add comment to JIRA issue PROJ-123:
"[~615af9eb7a6be40071e7ad95] First round of review is done, please check the PR."
```

### Example 2: Multiple Mentions

```
Add comment to JIRA issue PROJ-456:
"[~user1accountid] and [~user2accountid] - please review this before EOD."
```

### Example 3: Mention with URL (Automatic Linking)

```
Add comment to JIRA issue PROJ-789:
"[~615af9eb7a6be40071e7ad95] Review complete: https://github.com/org/repo/pull/123"
```

Result in JIRA:
- `[~615af9eb7a6be40071e7ad95]` → **@User Name** (clickable mention)
- `https://github.com/org/repo/pull/123` → **https://github.com/org/repo/pull/123** (clickable link)

---

---

## Automatic URL Linking

### URL Support

Any URL in your comment is automatically converted to a clickable link:

**Supported URL Schemes:**
- `https://` - Secure URLs
- `http://` - Standard URLs

**Examples:**
```
# GitHub PR
https://github.com/org/repo/pull/123

# Documentation
https://docs.example.com/page

# JIRA link
https://yoursite.atlassian.net/browse/PROJ-456

# Any other URL
https://example.com/path?query=value
```

All these URLs become clickable links in JIRA automatically!

### Mixed Content

Combine mentions and URLs naturally:

```
add_comment(
  issueIdOrKey: "PROJ-123",
  body: "[~615af9eb7a6be40071e7ad95] First round of review for PR is done https://github.com/chargebee/chargebee-app/pull/112177 please look into it."
)
```

Result in JIRA:
- **@Jagruti Jain** (clickable mention)
- Text: "First round of review for PR is done"
- **https://github.com/chargebee/chargebee-app/pull/112177** (clickable link)
- Text: "please look into it."

---

## How It Works

### ADF Conversion

The MCP server automatically converts mentions and URLs to Atlassian Document Format (ADF):

**Input (Plain Text):**
```
Hello [~615af9eb7a6be40071e7ad95] check https://example.com please review.
```

**Output (ADF):**
```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Hello "
        },
        {
          "type": "mention",
          "attrs": {
            "id": "615af9eb7a6be40071e7ad95",
            "text": "@615af9eb7a6be40071e7ad95",
            "accessLevel": ""
          }
        },
        {
          "type": "text",
          "text": " check "
        },
        {
          "type": "text",
          "text": "https://example.com",
          "marks": [
            {
              "type": "link",
              "attrs": {
                "href": "https://example.com"
              }
            }
          ]
        },
        {
          "type": "text",
          "text": " please review."
        }
      ]
    }
  ]
}
```

### What Happens in JIRA

**Mentions:**
1. ✅ Render as clickable user tags
2. ✅ Mentioned users receive notifications
3. ✅ Click mention to view user profile
4. ✅ Appear in user's notification center

**URLs:**
1. ✅ Render as clickable blue links
2. ✅ Click to open in new tab
3. ✅ Hover shows full URL
4. ✅ Works with any http/https URL

---

## Common Workflows

### Workflow 1: PR Review Request (with URL)

```bash
# 1. Look up reviewer's accountId
get_user_by_email(email: "reviewer@company.com")

# 2. Add comment with mention and PR link
add_comment(
  issueIdOrKey: "PROJ-123",
  body: "[~accountId] First round of review done https://github.com/org/repo/pull/456 please review."
)
```

Result:
- @Reviewer gets notification
- PR link is clickable
- Clean, professional comment

### Workflow 2: Assign and Notify

```bash
# 1. Update issue assignee
update_issue(
  issueKey: "PROJ-456",
  assigneeEmail: "dev@company.com"
)

# 2. Add comment mentioning them
add_comment(
  issueIdOrKey: "PROJ-456",
  body: "[~accountId] Assigned to you, please prioritize."
)
```

### Workflow 3: Team Notification

```bash
# Get accountIds for team members
# user1: 615af9eb7a6be40071e7ad95
# user2: 712bg0fc8b7cf51082f8be06

# Mention entire team
add_comment(
  issueIdOrKey: "PROJ-789",
  body: "[~615af9eb7a6be40071e7ad95] [~712bg0fc8b7cf51082f8be06] FYI - deployment scheduled for tonight."
)
```

---

## Troubleshooting

### Mention Not Working

**Symptom:** Mention appears as plain text `[~accountId]` instead of user tag.

**Causes:**
1. Invalid accountId
2. User doesn't have access to the project
3. User is deactivated

**Solution:**
```bash
# Verify user exists and is active
get_user_by_email(email: "user@company.com")

# Check response:
# - active: true (user is active)
# - accountId matches what you used
```

### User Not Getting Notification

**Symptom:** Mention renders correctly but user doesn't get notified.

**Causes:**
1. User has disabled JIRA notifications
2. User doesn't watch the project
3. Notification settings filtered out mention

**Solution:**
- Ask user to check JIRA notification settings
- Verify user has email notifications enabled
- Check user's project watch settings

### Permission Error

**Symptom:** "User does not exist or you do not have permission"

**Cause:** You don't have permission to mention users in that project.

**Solution:**
- Contact JIRA admin to verify your permissions
- Check if you have "Add Comments" permission
- Verify project access

---

## Best Practices

### 1. Always Verify AccountId

```bash
# Good: Verify first
get_user_by_email(email: "user@company.com")
# Use returned accountId

# Bad: Guess accountId
add_comment(body: "[~randomAccountId] ...")
```

### 2. Keep Mentions Relevant

```bash
# Good: Mention relevant people
"[~reviewer] Please review section 3."

# Bad: Spam mentions
"[~user1] [~user2] [~user3] [~user4] ..."
```

### 3. Combine with Clear Context

```bash
# Good: Clear context
"[~dev] Bug found in login flow. Steps to reproduce: ..."

# Bad: Vague
"[~dev] Issue"
```

### 4. Use for Action Items

```bash
# Good: Clear action
"[~qa] Ready for testing. Test cases: link"

# Bad: Just notification
"[~qa] FYI"
```

---

## Limitations

### Current Limitations

**Mentions:**
1. **Email mentions not supported**: `@user@example.com` won't work, must use `[~accountId]`
2. **No group mentions**: Can't mention entire teams like `@developers`
3. **No autocomplete**: Must know exact accountId beforehand
4. **No display name in syntax**: Can't use `[~displayName]`, must use accountId

**URLs:**
1. **Only http/https**: Other schemes (ftp, mailto) not auto-linked
2. **No custom text**: Can't do `[link text](url)` style links
3. **Trailing punctuation**: URLs ending with `)` may not parse correctly

### Workarounds

**For teams:**
```bash
# Mention multiple individuals
"[~user1] [~user2] [~user3] Team: please review"
```

**For unknown accountIds:**
```bash
# Use get_user_by_email first
get_user_by_email(email: "unknown@company.com")
```

---

## Examples from Real Usage

### Code Review Request (With Clickable Link)

```
[~615af9eb7a6be40071e7ad95] First round of review for PR is done https://github.com/chargebee/chargebee-app/pull/112177 please look into it.
```

**Renders in JIRA as:**
- **@Jagruti Jain** First round of review for PR is done **[clickable PR link]** please look into it.
- Jagruti receives notification
- PR link opens in new tab when clicked

### Bug Assignment

```
[~qa-lead-accountid] QA issue found during testing.
Severity: High
Steps to reproduce: [attached document]
Please investigate ASAP.
```

### Deployment Notification (With Multiple Links)

```
[~devops-accountid] Deployment to production scheduled for 2026-03-18 10:00 UTC.
Checklist: https://docs.company.com/deploy/checklist
Runbook: https://wiki.company.com/runbooks/prod-deploy
Please confirm infrastructure is ready.
```

Both URLs become clickable links automatically!

### Sprint Planning

```
[~product-manager-accountid] Story grooming complete for PROJ-123.
Estimates added, ready for sprint planning.
Acceptance criteria in description.
```

---

## API Reference

### add_comment with Mentions

```typescript
add_comment({
  issueIdOrKey: "PROJ-123",
  body: "[~accountId] Comment text here"
})
```

**Parameters:**
- `issueIdOrKey` (string): Issue key or ID
- `body` (string): Comment text with optional mentions using `[~accountId]` syntax

**Returns:**
```
Comment added successfully (ID: 123456)
```

**Mention Format:**
- `[~accountId]` - Standard mention
- `[~accountid:accountId]` - Verbose format (also supported)

**URL Format:**
- `https://example.com` - Automatic clickable link
- `http://example.com` - Also supported

**Combined:**
```
"[~user1] review https://github.com/org/repo/pull/123 and [~user2] check https://docs.example.com"
```

---

## Summary

### Quick Reference

| Task | Syntax |
|------|--------|
| Get accountId | `get_user_by_email(email: "user@example.com")` |
| Mention user | `[~accountId]` |
| Multiple mentions | `[~user1] and [~user2]` |
| Mention with URL | `[~accountId] check: https://link` |

### Key Points

**Mentions:**
✅ Use `[~accountId]` format for mentions
✅ Look up accountId with `get_user_by_email` tool
✅ Mentions work in multi-line comments
✅ Users get notifications when mentioned
✅ Mentions render as clickable user tags

❌ Email format `@user@example.com` not supported
❌ Display names `[~John Doe]` don't work
❌ Group mentions not available

**URLs:**
✅ Any `http://` or `https://` URL auto-converts to link
✅ Multiple URLs in one comment supported
✅ URLs work with mentions in same comment
✅ Works in multi-line comments

❌ Other URL schemes (ftp, mailto) not supported
❌ Custom link text not available

---

## Related Documentation

- [API Reference](./API-Reference.md) - Full tool specifications
- [Usage Examples](./Usage-Examples.md) - More usage patterns
- [Troubleshooting](./Troubleshooting.md) - Common issues

---

**Need Help?** Check [Troubleshooting.md](./Troubleshooting.md) or test mentions in a non-production JIRA project first.
