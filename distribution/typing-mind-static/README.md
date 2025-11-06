# Typing Mind Static Files

This directory contains the self-hosted version of Typing Mind from the official GitHub repository.

## Source

These files are from: https://github.com/TypingMind/typingmind

**License:** Proprietary - You may use and deploy the compiled code, but you may not modify or redistribute it.

## Contents

- **729 files** (~63MB)
- Compiled static web application
- Includes: HTML, CSS, JavaScript, images, fonts, and icons

## Setup

These files are already in place and ready to use!

1. **Start Docker stack:**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Access Typing Mind:**
   - Open browser to: http://localhost:3000

3. **First-time setup:**
   - Enter your API keys for AI models (ChatGPT, Claude, etc.)
   - Enter your Typing Mind license key (if you have one)
   - Configure MCP Connector:
     - URL: `http://localhost:50880`
     - Token: (from `.env` file - `MCP_AUTH_TOKEN`)

## Requirements

- **License Key:** Required for full features (get from https://www.typingmind.com)
- **API Keys:** OpenAI, Anthropic, or other AI provider API keys
- **MCP Connector:** Already configured in docker-compose.yml

## Community License

With the **Community License**, you get:
- Self-hosted version (these files)
- Full access to Typing Mind features
- Local deployment
- MCP integration support

## Updating

To update to the latest version:

```bash
cd /tmp
git clone https://github.com/TypingMind/typingmind.git
cp -r typingmind/src/* /path/to/distribution/typing-mind-static/
cd /path/to/distribution/docker
docker-compose restart typing-mind-web
```

## Structure

```
typing-mind-static/
├── index.html           # Main entry point
├── 404.html            # Error page
├── _next/              # Next.js build artifacts
├── app/                # Application pages
├── assets/             # Fonts, images, CSS, JS
├── *.png              # Various icons and images
└── *.ico              # Favicons
```

## Served By

The `typing-mind-web` service in docker-compose.yml serves these files using nginx:
- **Port:** 3000
- **Image:** nginx:alpine
- **Config:** ../docker/nginx.conf
- **Mode:** Read-only

## Troubleshooting

### Blank page or 404

Make sure index.html exists:
```bash
ls -la distribution/typing-mind-static/index.html
```

### "License key required" error

This is normal. You need to enter your license key in the Typing Mind UI on first use.

### Can't connect to MCP Connector

Check that MCP Connector is running:
```bash
curl http://localhost:50880/ping
# Should return: {"status":"ok"}
```

---

**Full Documentation:** See `TYPING-MIND-SETUP.md` in parent directory
