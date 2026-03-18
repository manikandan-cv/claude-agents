# Formatting Examples

Visual examples of how JIRA issues are displayed by the MCP server.

## Issue List Format

When searching for issues, results display in a clean list:

```
Found 3 issues:

1. 🔄 FRAMENGG-11983: Calculate hmac-sha of the data we send via webhook
   🎫 Task | 🟡 Medium | 👤 Jagruti Jain
   🏷️  EG-Webhook, PLAT-EVENTS

2. ✅ PROJ-456: Login flow bug fixed
   🐛 Bug | 🔴 High | 👤 John Doe
   🏷️  backend, security

3. 📝 PROJ-789: Add dark mode support
   ✨ Improvement | 🟢 Low | 👤 Jane Smith
```

### Emoji Legend

**Status:**
- ✅ Done / Closed / Resolved
- 🔄 In Progress / In Review
- 🚫 Blocked / Stuck
- 📝 Todo / Open / Backlog
- 🧪 Testing / QA

**Issue Type:**
- 🐛 Bug
- 🎫 Task
- 📖 Story
- 🎯 Epic
- 📌 Sub-task
- ✨ Improvement
- 🚀 New Feature
- ⚙️ Technical task

**Priority:**
- 🔴 Highest / Critical
- 🟠 High / Major
- 🟡 Medium
- 🟢 Low / Minor
- ⚪ Lowest / Trivial

---

## Issue Detail Format (Box Layout)

When viewing a single issue, it displays in a beautiful box:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║  🎫  Calculate hmac-sha of the data we send via webhook                       ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  🔄 Status:    In Code Review      │  ⚡ Priority:  Medium                    ║
║  ─────────────────────────────────────────────────────────────────────────   ║
║  📋 Type:      Task                │  🗂️  Project:   Framework                ║
║  ─────────────────────────────────────────────────────────────────────────   ║
║  👤 Assignee:  Jagruti Jain        │  📊 Subtasks:  0                         ║
║  ─────────────────────────────────────────────────────────────────────────   ║
║  🏷️  Labels:    EG-Webhook, PLAT-EVENTS                                       ║
║  ─────────────────────────────────────────────────────────────────────────   ║
║  📅 Created:   2025-11-13          │  🔄 Updated:   2026-03-16                ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📖 DESCRIPTION                                                               ║
║                                                                               ║
║    Why verify webhooks?                                                       ║
║    Signature calculation algorithm:                                           ║
║    Site for testing our implementation:                                       ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  💬 COMMENTS (3)                                                              ║
║                                                                               ║
║  ▸ Manikandan Chellamuthu • Dec 4, 2025                                       ║
║    Can this be implemented at the merchant end?                               ║
║                                                                               ║
║  ▸ Jagruti Jain • Feb 3, 2026                                                 ║
║    To implement the changes in cb-app I need these details:                   ║
║    1. Do merchants need granular security per webhook, or site-wide secret?   ║
║    2. How do we share this secret with the merchant? AWS is an option.        ║
║                                                                               ║
║  ▸ Jagruti Jain • Feb 20, 2026                                                ║
║    Document: [link provided]                                                  ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Compact Format

For inline references, issues can be shown in compact format:

```
🔄 PROJ-123: Fix login bug (🐛 Bug, 🔴 High, 👤 John Doe)
```

---

## Format Usage

### When You Get List Format

- ✅ `search_issues` tool
- ✅ Searching for multiple issues

### When You Get Box Format

- ✅ `get_issue` tool (single issue)
- ✅ `create_issue` tool (returns created issue)
- ✅ `update_issue` tool (returns updated issue)

### When You Get Compact Format

- Currently not auto-used, but available if needed

---

## Customization

The formatting is handled in `mcp-server/src/utils/issue-formatter.ts`.

### Available Functions

```typescript
// Box format for single issue
formatIssueAsBox(issue: CleanedIssue): string

// List format for multiple issues
formatIssuesList(issues: CleanedIssue[]): string

// Compact single-line format
formatIssueCompact(issue: CleanedIssue): string
```

### Adding Custom Emojis

Edit `issue-formatter.ts` emoji maps:

```typescript
const typeMap: Record<string, string> = {
  'Bug': '🐛',
  'Task': '🎫',
  'YourCustomType': '🎨',  // Add here
  // ...
};
```

---

## Benefits

### Readability

✅ Easy to scan visually
✅ Key information highlighted
✅ Consistent layout
✅ Color-coded with emojis

### Information Density

✅ Shows most important fields
✅ Hides internal IDs
✅ Formatted dates
✅ Clean text extraction from ADF

### Terminal Friendly

✅ Works in any terminal
✅ Box characters render correctly
✅ Fixed-width layout (79 characters)
✅ Copy-paste friendly

---

## Comparison

### Old Format (Raw JSON)

```json
{
  "key": "PROJ-123",
  "summary": "Fix bug",
  "status": "Open",
  "priority": "High",
  "assignee": "John Doe",
  "reporter": "Jane Smith",
  "created": "2026-03-01T10:00:00.000Z",
  "updated": "2026-03-15T14:30:00.000Z",
  "issueType": "Bug",
  "project": "My Project",
  "labels": ["backend", "urgent"],
  "description": "Long description here...",
  "comments": [...]
}
```

### New Format (Box)

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  🐛  Fix bug                                      ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  📝 Status:    Open        │  🔴 Priority:  High  ║
║  ────────────────────────────────────────────    ║
║  🐛 Type:      Bug         │  🗂️  Project:  PROJ  ║
║  ────────────────────────────────────────────    ║
║  👤 Assignee:  John Doe    │  📊 Subtasks:  0     ║
║  ────────────────────────────────────────────    ║
║  🏷️  Labels:    backend, urgent                  ║
║  ────────────────────────────────────────────    ║
║  📅 Created:   2026-03-01  │  🔄 Updated: 03-15   ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  📖 DESCRIPTION                                   ║
║                                                   ║
║    Long description here...                       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

Much more readable! 🎉

---

## Technical Details

### Box Drawing Characters

```
╔ ═ ╗  Top border
║   ║  Sides
╠ ═ ╣  Divider
╚ ═ ╝  Bottom border
─      Horizontal line
│      Vertical separator
```

### Width

- Fixed at 79 characters
- Works on standard 80-column terminals
- Leaves 1 character margin

### Text Wrapping

Long descriptions and comments automatically wrap to fit:

```
║  This is a very long description that will automatically wrap to   ║
║  multiple lines to ensure it fits within the 79 character width    ║
║  constraint without breaking words awkwardly.                      ║
```

---

## Related Documentation

- [Mentions Guide](./Mentions-Guide.md) - User mentions in comments
- [API Reference](./API-Reference.md) - Tool specifications
- [Usage Examples](./Usage-Examples.md) - Real-world usage

---

**Enjoy the beautiful formatting!** 🎨
