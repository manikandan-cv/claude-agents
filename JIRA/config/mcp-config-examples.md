# MCP Configuration Examples

Alternative configurations for the JIRA MCP server.

## Standard Configuration (stdio)

**File:** `skill/.mcp.json`

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "JIRA_TYPE": "${JIRA_TYPE:-cloud}",
        "JIRA_AUTH_TYPE": "${JIRA_AUTH_TYPE:-basic}"
      }
    }
  }
}
```

## JIRA Server Configuration

For JIRA Server/Data Center instances:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "https://jira.your-company.com",
        "JIRA_TYPE": "server",
        "JIRA_AUTH_TYPE": "basic"
      }
    }
  }
}
```

## Multiple JIRA Instances

To connect to multiple JIRA instances, create separate skills:

**skill-prod/.mcp.json:**
```json
{
  "mcpServers": {
    "jira-prod": {
      "type": "stdio",
      "command": "bun",
      "args": ["/path/to/build/index.js"],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_PROD_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_PROD_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_PROD_BASE_URL}"
      }
    }
  }
}
```

**skill-staging/.mcp.json:**
```json
{
  "mcpServers": {
    "jira-staging": {
      "type": "stdio",
      "command": "bun",
      "args": ["/path/to/build/index.js"],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_STAGING_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_STAGING_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_STAGING_BASE_URL}"
      }
    }
  }
}
```

Then set environment variables:
```bash
export JIRA_PROD_API_TOKEN="..."
export JIRA_PROD_USER_EMAIL="..."
export JIRA_PROD_BASE_URL="https://prod.atlassian.net"

export JIRA_STAGING_API_TOKEN="..."
export JIRA_STAGING_USER_EMAIL="..."
export JIRA_STAGING_BASE_URL="https://staging.atlassian.net"
```

## Debug Configuration

Enable detailed logging:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "MCP_DEBUG": "1"
      }
    }
  }
}
```

## Using Node Instead of Bun

If you prefer Node.js:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}"
      }
    }
  }
}
```

**Note:** You'll need to adjust the build script in `package.json` to target Node instead of Bun.

## Bearer Token Authentication

For instances using Bearer tokens instead of Basic auth:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_BEARER_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "JIRA_AUTH_TYPE": "bearer"
      }
    }
  }
}
```

## Custom Server Path

If you want to use a different server location:

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "bun",
      "args": [
        "/custom/path/to/jira-mcp-server/build/index.js"
      ],
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_USER_EMAIL": "${JIRA_USER_EMAIL}",
        "JIRA_BASE_URL": "${JIRA_BASE_URL}"
      }
    }
  }
}
```

## Environment Variable Reference

### Variable Expansion Syntax

- `${VAR_NAME}` - Required variable, error if not set
- `${VAR_NAME:-default}` - Optional with default value
- `${VAR_NAME:?error message}` - Required with custom error

### Examples

```json
{
  "env": {
    "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
    "JIRA_TYPE": "${JIRA_TYPE:-cloud}",
    "JIRA_AUTH_TYPE": "${JIRA_AUTH_TYPE:-basic}",
    "MCP_DEBUG": "${MCP_DEBUG:-0}"
  }
}
```

## Troubleshooting Configuration

### Issue: Variables Not Expanding

Make sure variables are set in your shell environment:

```bash
export JIRA_API_TOKEN="your-token"
source ~/.zshrc
echo $JIRA_API_TOKEN
```

### Issue: Wrong Path to Server

Verify the path exists:

```bash
ls -la /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js
```

### Issue: Permission Denied

Make the script executable:

```bash
chmod +x /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js
```

## Best Practices

1. **Use absolute paths** - Don't use `~` or relative paths
2. **Test with echo** - Verify environment variables: `echo $JIRA_API_TOKEN`
3. **Keep secrets in environment** - Never hardcode tokens in .mcp.json
4. **Use defaults** - Provide sensible defaults with `:-` syntax
5. **Document custom configs** - Add comments explaining changes

## Configuration Validation

Test your configuration:

```bash
# 1. Verify environment variables
echo $JIRA_API_TOKEN
echo $JIRA_USER_EMAIL
echo $JIRA_BASE_URL

# 2. Test MCP server directly
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
bun /Users/manikandan/Documents/personal/code/claude-agents/JIRA/mcp-server/build/index.js

# 3. Test in Claude Code
claude
# Then: "show my JIRA issues"
```

## Security Considerations

- Never commit `.mcp.json` files with hardcoded tokens
- Use environment variables for all sensitive data
- Keep shell profiles (`.zshrc`) secure: `chmod 600 ~/.zshrc`
- Rotate API tokens regularly
- Use minimal permissions for API tokens
