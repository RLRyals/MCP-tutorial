# Typing Mind Static Files

This directory should contain the Typing Mind static files for local hosting.

## Setup Required

**This directory is currently empty.** You need to:

1. **Purchase Typing Mind** (if you haven't already)
   - Visit: https://www.typingmind.com/pricing
   - Get the Community License for self-hosting

2. **Download the static files** from your Typing Mind account

3. **Extract the files here** so the structure looks like:
   ```
   typing-mind-static/
   ├── index.html          ← Must be here!
   ├── assets/
   │   ├── css/
   │   ├── js/
   │   └── images/
   ├── favicon.ico
   └── (other files)
   ```

## Full Instructions

See **`TYPING-MIND-SETUP.md`** in the parent directory for complete setup instructions.

## Quick Start

```bash
# After downloading Typing Mind ZIP file:

# Windows PowerShell
Expand-Archive -Path "$env:USERPROFILE\Downloads\typingmind-static.zip" -DestinationPath "."

# Mac/Linux
unzip ~/Downloads/typingmind-static.zip -d .

# Verify
ls index.html
# Should exist!
```

## Access After Setup

Once files are in place and Docker is running:

**Access Typing Mind at:** http://localhost:3000

The MCP Connector will be pre-configured at `http://localhost:50880`

---

**Note:** This directory is intentionally empty in the repository. Each user must download their own Typing Mind files based on their license.
