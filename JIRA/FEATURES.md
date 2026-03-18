# JIRA MCP Server - Features Overview

Complete feature list for the JIRA MCP integration.

## 🎨 Beautiful Formatting (v1.2.0)

### Issue Display

Issues now display in beautiful, readable formats:

**Search Results (List):**
```
Found 3 issues:

1. 🔄 PROJ-123: Fix login bug
   🐛 Bug | 🔴 High | 👤 John Doe
   🏷️  backend, security

2. ✅ PROJ-456: Add dark mode
   ✨ Feature | 🟡 Medium | 👤 Jane Smith
```

**Issue Details (Box):**
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  🎫  Calculate hmac-sha of webhook data               ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  🔄 Status:  In Review    │  ⚡ Priority:  Medium     ║
║  🎫 Type:    Task         │  🗂️  Project:  Framework  ║
║  👤 Assignee: Jagruti     │  📊 Subtasks: 0          ║
║  📅 Created: 2025-11-13   │  🔄 Updated: 2026-03-16  ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║  📖 DESCRIPTION                                       ║
║    Why verify webhooks?                               ║
║    Signature calculation algorithm...                 ║
╠═══════════════════════════════════════════════════════╣
║  💬 COMMENTS (3)                                      ║
║    ▸ Author • Date                                    ║
║      Comment text here...                             ║
╚═══════════════════════════════════════════════════════╝
```

### Features

- ✅ Emoji indicators for status, type, priority
- ✅ Clean box layout for single issues
- ✅ Organized list view for search results
- ✅ Automatic text wrapping
- ✅ Formatted dates
- ✅ Comments with timestamps

📖 **Documentation:** [Formatting-Examples.md](docs/Formatting-Examples.md)

---

## 💬 User Mentions (v1.2.0)

### Mention Users in Comments

Tag users in JIRA comments with proper notifications:

```
Add comment to PROJ-123:
"[~615af9eb7a6be40071e7ad95] Please review the PR."
```

### Supported Formats

- `[~accountId]` - Standard format
- `[~accountid:accountId]` - Verbose format
- Multiple mentions in one comment

### Features

- ✅ Converts to proper ADF (Atlassian Document Format)
- ✅ Users receive JIRA notifications
- ✅ Mentions render as clickable user tags
- ✅ Works with multi-line comments

### Example Workflow

```bash
# 1. Look up user's accountId
get_user_by_email(email: "colleague@company.com")

# 2. Add comment with mention
add_comment(
  issueIdOrKey: "PROJ-123",
  body: "[~accountId] PR review ready: https://github.com/org/repo/pull/456"
)
```

📖 **Documentation:** [Mentions-Guide.md](docs/Mentions-Guide.md)

---

## 👥 Team Members Management (v1.2.0)

### Centralized Team Information

Keep team member info in `~/.claude_team_members.json`:

```json
{
  "team": [
    {
      "name": "Jagruti Jain",
      "email": "jagruti@company.com",
      "accountId": "615af9eb7a6be40071e7ad95",
      "role": "Developer",
      "projects": ["Framework"]
    }
  ]
}
```

### Usage

Start any session with:
```
Use my team members file
```

Then reference naturally:
```
Tag Jagruti in PROJ-123 with PR review request
```

Claude automatically:
1. Reads team file
2. Finds accountId
3. Creates proper mention

### Features

- ✅ No need to remember accountIds
- ✅ Quick team member references
- ✅ Profile file support (`~/.claude_profile.md`)
- ✅ Group management for teams

📖 **Documentation:** [Team-Members-Guide.md](docs/Team-Members-Guide.md)

---

## 🔄 Modern API Endpoints (v1.1.0)

### Updated for Change-2046

Using latest JIRA Cloud API endpoints:

- ✅ `/rest/api/3/search/jql` (new)
- ✅ `nextPageToken` pagination
- ✅ Optimized response format
- ✅ Future-proof implementation

### API Fallback

Automatic fallback to v2 for older JIRA instances:

```
Try v3 → If fails → Try v2
```

Supports both:
- JIRA Cloud (v3)
- JIRA Server/Data Center (v2)

📖 **Documentation:** [UPDATE-GUIDE.md](UPDATE-GUIDE.md)

---

## 🔍 Core JIRA Tools

### 6 Essential Tools

1. **search_issues** - Search using JQL
   ```
   Search JIRA for open issues assigned to me
   ```

2. **get_issue** - Get issue details with comments
   ```
   Get details for PROJ-123
   ```

3. **get_user_by_email** - Look up user accountId
   ```
   Get JIRA user by email: user@company.com
   ```

4. **create_issue** - Create new issues
   ```
   Create bug in PROJ: Login button not working
   ```

5. **update_issue** - Update existing issues
   ```
   Update PROJ-456 priority to High
   ```

6. **add_comment** - Add comments to issues
   ```
   Add comment to PROJ-789: Deployment complete
   ```

📖 **Documentation:** [API-Reference.md](docs/API-Reference.md)

---

## 🛡️ Security Features

### Secure Configuration

- ✅ Environment variables for credentials
- ✅ Local execution (no external servers)
- ✅ HTTPS-only API calls
- ✅ Token sanitization in logs
- ✅ Permission-based access

### File Protection

```bash
# Protect team file
chmod 600 ~/.claude_team_members.json

# Protect environment variables
chmod 600 ~/.zshrc
```

---

## ⚡ Performance

### Fast Communication

- ✅ stdio transport (local process)
- ✅ No network latency
- ✅ Instant tool availability
- ✅ Efficient JSON-RPC protocol

### Smart Caching

- ✅ Connection reuse
- ✅ Minimal API calls
- ✅ Optimized queries

---

## 🎯 Use Cases

### 1. PR Review Workflow

```
1. Search for issues in review
2. Add comment with PR link
3. Mention reviewer
4. Update status
```

### 2. Bug Triage

```
1. Search for new bugs
2. Assign to developers
3. Set priorities
4. Add reproduction steps
```

### 3. Sprint Planning

```
1. Search backlog items
2. Get detailed requirements
3. Assign to team members
4. Update sprint field
```

### 4. Status Reports

```
1. Search completed issues this week
2. Generate summary
3. Add status comments
4. Update stakeholders
```

---

## 📋 Comparison Matrix

| Feature | v1.0.0 | v1.1.0 | v1.2.0 |
|---------|--------|--------|--------|
| Search Issues | ✅ | ✅ | ✅ |
| Get Issue Details | ✅ | ✅ | ✅ |
| Create/Update Issues | ✅ | ✅ | ✅ |
| Add Comments | ✅ | ✅ | ✅ |
| User Lookup | ✅ | ✅ | ✅ |
| API v3 Support | ❌ | ✅ | ✅ |
| Modern Endpoints | ❌ | ✅ | ✅ |
| Beautiful Formatting | ❌ | ❌ | ✅ |
| User Mentions | ❌ | ❌ | ✅ |
| Team Management | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start

### 1. Setup (5 minutes)

```bash
# Set environment variables
export JIRA_API_TOKEN="your-token"
export JIRA_USER_EMAIL="your-email@company.com"
export JIRA_BASE_URL="https://yourorg.atlassian.net"

# Build MCP server
cd mcp-server
bun install && bun run build

# Configure Claude Code
nano ~/.mcp.json
# Add JIRA MCP server config
```

### 2. Optional: Team Setup (5 minutes)

```bash
# Create team file
nano ~/.claude_team_members.json
# Add team members with accountIds

# Create profile
nano ~/.claude_profile.md
# Add your preferences
```

### 3. Start Using

```bash
claude
```

Then:
```
Search JIRA for my open issues
```

📖 **Documentation:** [Setup-Guide.md](docs/Setup-Guide.md)

---

## 📚 Documentation

### Getting Started
- [Setup Guide](docs/Setup-Guide.md) - Installation
- [UPDATE-GUIDE.md](UPDATE-GUIDE.md) - Update instructions

### Features
- [Formatting Examples](docs/Formatting-Examples.md) - Beautiful displays
- [Mentions Guide](docs/Mentions-Guide.md) - User mentions
- [Team Members Guide](docs/Team-Members-Guide.md) - Team management

### Reference
- [Usage Examples](docs/Usage-Examples.md) - Real scenarios
- [API Reference](docs/API-Reference.md) - Tool specs
- [Troubleshooting](docs/Troubleshooting.md) - Common issues
- [MCP Architecture](docs/MCP-Architecture.md) - Technical design

### History
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

## 🎉 Highlights

### What Makes This Special

1. **Beautiful UX** - Issues look great in terminal
2. **Smart Mentions** - Tag users naturally
3. **Team-Friendly** - Share accountIds easily
4. **Modern API** - Latest JIRA endpoints
5. **Secure** - Local execution only
6. **Fast** - Instant tool responses
7. **Complete** - All essential JIRA operations
8. **Well-Documented** - Comprehensive guides

---

## 🔮 Future Ideas

Potential enhancements (not yet implemented):

- [ ] Email-based mentions (`@user@company.com`)
- [ ] Group mentions for teams
- [ ] Custom field support
- [ ] Workflow transitions
- [ ] Attachment handling
- [ ] Issue linking
- [ ] Advanced JQL builder
- [ ] Batch operations

---

## 📊 Stats

- **Tools:** 6 core tools
- **Lines of Code:** ~2500
- **Documentation Pages:** 11
- **Supported Formats:** JSON, ADF, Plain Text
- **API Versions:** v2 + v3
- **Emoji Types:** 40+ unique emojis

---

**Ready to get started?** See [Setup-Guide.md](docs/Setup-Guide.md)

**Questions?** Check [Troubleshooting.md](docs/Troubleshooting.md)

**Happy JIRA-ing!** 🎫✨
