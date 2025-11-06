# How to Access Typing Mind with MCP Servers

**IMPORTANT:** If you have a **Typing Mind Community License**, you need to set up the local web server.
👉 **See `TYPING-MIND-SETUP.md` for complete setup instructions!**

You have **two options** for using Typing Mind with your MCP servers:

## Option 1: Host Typing Mind Locally (Community License - Recommended)

**Best for:** Community license holders who want the full integrated experience

This option is **enabled by default** in the docker-compose.yml.

### Quick Setup:

1. **Download Typing Mind static files** from your account
2. **Extract into `typing-mind-static/` folder**
3. **Start Docker:** `docker-compose up -d`
4. **Access at:** http://localhost:3000

The MCP Connector will be **pre-configured and ready to use!**

📖 **Full instructions:** See `TYPING-MIND-SETUP.md` for detailed setup steps

## Option 2: Use Typing Mind in Your Browser

If you have a Typing Mind license, you can use it in any browser:

1. **Open Typing Mind** in your browser:
   - Typing Mind Custom: https://custom.typingmind.com
   - OR use your self-hosted version if you have one

2. **Configure MCP Connection:**
   - Go to **Settings → Advanced Settings → Model Context Protocol**
   - Click **"Add MCP Connector"**
   - Enter the following:
     - **URL:** `http://localhost:50880`
     - **Auth Token:** (find this in your `.env` file as `MCP_AUTH_TOKEN`)

3. **Click "Connect"**
   - You should see all 9 MCP servers become available!
   - Servers: book-planning, chapter-planning, character-planning, etc.

4. **Start Using MCPs**
   - Create a new chat
   - The MCP tools will be available in your prompts


## Testing Your Connection

Test that the MCP Connector is running:

```bash
# Should return {"status":"ok"}
curl http://localhost:50880/ping
```

Test with authentication:

```bash
# Replace YOUR_TOKEN with your actual MCP_AUTH_TOKEN
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:50880/clients
```

## Finding Your Auth Token

Your auth token is in the `.env` file:

```bash
# View your token
cat .env | grep MCP_AUTH_TOKEN

# Or on Windows PowerShell
Get-Content .env | Select-String "MCP_AUTH_TOKEN"
```

## Troubleshooting

### "Connection Failed" in Typing Mind

1. Verify MCP Connector is running:
   ```bash
   docker ps
   # Should show mcp-connector container
   ```

2. Check connector logs:
   ```bash
   cd docker
   docker-compose logs mcp-connector
   ```

3. Test health endpoint:
   ```bash
   curl http://localhost:50880/ping
   ```

### "Unauthorized" Error

- Double-check your auth token matches between `.env` and Typing Mind settings
- The token is case-sensitive and should be copied exactly

### Container Not Running

```bash
cd docker
docker-compose up -d
docker-compose logs -f mcp-connector
```

## Available MCP Servers

Once connected, you'll have access to:

1. **book-planning-server** - Plan and structure books
2. **chapter-planning-server** - Chapter organization
3. **character-planning-server** - Character development
4. **core-continuity-server** - Series continuity management
5. **reporting-server** - Analytics and reports
6. **review-server** - Review and revision tools
7. **scene-server** - Scene management
8. **series-planning-server** - Multi-book series planning
9. **author-server** - Author information

## Next Steps

- Check out the [Quick Start Guide](QUICK-START.md) for usage examples
- See [README-distribution.md](README-distribution.md) for full documentation
- Review [SETUP-COMPLETE.md](SETUP-COMPLETE.md) for verification steps
