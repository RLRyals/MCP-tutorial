# Complete Mac Setup Guide for MCP Tutorial

This comprehensive guide will help Mac users set up their environment to run the MCP Tutorial successfully with both Claude Desktop and Typing Mind.

## 1. Install Prerequisites

### Install Node.js

#### Option A: Using Homebrew (Recommended)

1. Install Homebrew if you haven't already:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install Node.js:
```bash
brew install node
```

3. Verify installation:
```bash
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher
```

#### Option B: Direct Download

1. Visit [Node.js official website](https://nodejs.org/)
2. Download the LTS version for macOS
3. Run the installer package (.pkg file)

### Install Docker Desktop

1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Install the application
3. Start Docker Desktop from Applications
4. Verify installation:
```bash
docker --version
docker-compose --version
```

### Install Git (if not already installed)

```bash
brew install git
```

## 2. Clone and Setup the Repository

### Clone the Repository

```bash
mkdir -p ~/Documents/GitHub
cd ~/Documents/GitHub
git clone https://github.com/RLRyals/MCP-tutorial.git
cd MCP-tutorial
```

### Install Dependencies

```bash
npm install
```

### Create Environment File

```bash
cp template.env .env
```

Edit `.env` if needed with your preferred text editor.

## 3. Start PostgreSQL Database

```bash
cd ~/Documents/GitHub/MCP-tutorial
# Option 1: Use the provided script
npm run start:db

# Option 2: Run Docker Compose directly
docker-compose up -d
```

Verify the database is running:
```bash
docker ps
```

## 4. Generate Configuration Files

```bash
cd ~/Documents/GitHub/MCP-tutorial

# Generate both Claude Desktop and Typing Mind configs
node scripts/generate-configs.js

# If the above doesn't work, try:
NODE_PATH=$(which node) node scripts/generate-configs.js
```

This creates two config files:
- `config/claude-desktop.json` - For Claude Desktop
- `config/typing-mind.json` - For Typing Mind

## 5. Set up Claude Desktop

1. Open Claude Desktop
2. Go to Settings > MCP Configuration
3. Click "Add Configuration" (or edit existing one)
4. Open the generated config file:
```bash
cat ~/Documents/GitHub/MCP-tutorial/config/claude-desktop.json
```
5. Copy the entire contents and paste into Claude Desktop configuration
6. Click Save
7. Restart Claude Desktop

## 6. Set up Typing Mind (Optional)

### Start the HTTP Server

```bash
cd ~/Documents/GitHub/MCP-tutorial
npm run start:http
```

The server runs on http://localhost:3500 by default.

### Configure Typing Mind

1. Open Typing Mind
2. Navigate to Settings > Tools
3. Import `config/typing-mind.json` 
4. Test your connections

## 7. Troubleshooting Common Issues

### Node.js PATH Issues

If you get "command not found: node", check your PATH:
```bash
echo $SHELL              # Identify your shell
echo $PATH               # Check current PATH
which node               # Where is node installed?
```

Add Node.js to your PATH:

For Zsh (default on newer Macs):
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

For Bash:
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

### Claude Desktop Server Issues

If servers won't start in Claude Desktop:

1. Verify config path matches your actual repository location:
```bash
# Check your actual path
echo ~/Documents/GitHub/MCP-tutorial
ls -l ~/Documents/GitHub/MCP-tutorial/src/mcps/author-server/index.js
```

2. Try setting NODE_PATH explicitly in your config:
```bash
# Find node path
which node

# Update command in claude-desktop.json to use full path, for example:
# "command": "/usr/local/bin/node",
# or
# "command": "/opt/homebrew/bin/node",
```

3. Generate a new config with your node path:
```bash
NODE_PATH=$(which node) node scripts/generate-configs.js --claude
```

### Database Connection Issues

If servers fail to connect to the database:

1. Make sure Docker is running and the database container is up
2. Check database logs:
```bash
docker logs mcp-tutorial-postgres
```

3. Verify database connection in `.env` file:
```bash
cat .env | grep DATABASE_URL
```

## Need More Help?

If you're still experiencing issues:

1. Gather system information:
```bash
sw_vers                  # macOS version
node --version           # Node.js version
npm --version            # npm version
docker --version         # Docker version
which node               # Node.js path
echo $PATH               # PATH environment variable
```

2. Check Claude Desktop logs by clicking on the server error message

3. Contact repository maintainers with the above information and error logs