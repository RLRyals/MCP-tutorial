# MCP Writing Team Software Setup Guide

## Important: Claude Desktop vs. Claude Projects (Web)

**Before we start, let's clear up a common confusion:**

### Claude Projects (Web Browser)
- Access through your web browser at claude.ai
- Great for general writing and conversations
- **Cannot use local MCPs** (the tools we're building)
- Uses Anthropic's pre-built tools only

### Claude Desktop (Downloaded App)
- Downloaded and installed on your computer
- **Required for using your custom MCPs**
- Can connect to local tools and databases
- This is what we need for our writing team

**Bottom Line:** You need Claude Desktop downloaded on your computer to use the MCP writing tools we're building.

---

## Software You'll Need to Install

Here's what we're installing and why:

1. **Claude Desktop** - The AI that will use your writing tools
2. **Visual Studio Code (VS Code)** - Where you'll view and modify code
3. **Docker Desktop** - Runs your database easily
4. **Node.js** - Runs the MCP server code
5. **Git** - Downloads and manages code repositories

**Total setup time:** 1-2 hours (most of it is download time)

---

## Step 1: Download Claude Desktop

### Why We Need This
Claude Desktop can connect to local tools (MCPs) on your computer. The web version cannot.

### Download Instructions

1. **Go to:** [https://claude.ai/download](https://claude.ai/download)

2. **Choose your operating system:**
   - **Windows:** Download "Claude for Windows"
   - **Mac:** Choose based on your Mac type:
     - **Apple Silicon (M1, M2, M3):** Download "Claude for macOS (Apple Silicon)"
     - **Intel Mac:** Download "Claude for macOS (Intel)"
     - **Not sure?** Click Apple menu → "About This Mac" → Look at "Chip" or "Processor"

3. **Install the downloaded file:**
   - **Windows:** Run the `.exe` file and follow prompts
   - **Mac:** Open the `.dmg` file and drag Claude to Applications

4. **Verify Installation:**
   - Open Claude Desktop
   - Sign in with your Claude account
   - You should see a desktop app, not a web browser

---

## Step 2: Install Visual Studio Code

### Why We Need This
VS Code is where you'll view the MCP code and make customizations with AI assistance.

### Download Instructions

1. **Go to:** [https://code.visualstudio.com/download](https://code.visualstudio.com/download)

2. **Download for your system:**
   - The website should auto-detect your operating system
   - Click the large download button

3. **Install:**
   - **Windows:** Run the installer, accept defaults
   - **Mac:** Open the `.zip`, drag VS Code to Applications

4. **Verify Installation:**
   - Open VS Code
   - You should see a welcome screen

### Install Essential Extensions

**In VS Code, we need to add some helpful tools:**

1. **Open Extensions:**
   - Click the Extensions icon (four squares) in the left sidebar
   - Or press `Ctrl+Shift+X` (Windows) or `Cmd+Shift+X` (Mac)

2. **Install these extensions one by one:**
   
   **Search for and install:**
   - **"GitHub Copilot"** - AI coding assistant
   - **"GitHub Copilot Chat"** - Chat with the AI assistant
   - **"Docker"** - Manage containers
   - **"PostgreSQL"** - Database management
   - **"PowerShell"** - Windows terminal support

3. **For each extension:**
   - Type the name in the search box
   - Click "Install" on the correct extension
   - Wait for installation to complete

---

## Step 3: Create GitHub Account (If You Don't Have One)

### Why We Need This
GitHub Copilot will help you modify code, and we'll download our MCP code from GitHub.

### Setup Instructions

1. **Go to:** [https://github.com](https://github.com)

2. **Sign up for a free account** if you don't have one

3. **Set up GitHub Copilot in VS Code:**
   - In VS Code, press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Type "GitHub Copilot: Sign In"
   - Follow the prompts to sign in
   - **Note:** You don't need to pay for Copilot subscription - we'll use API keys

---

## Step 4: Install Docker Desktop

### Why We Need This
Docker will run your PostgreSQL database easily without complex database installation.

### Download Instructions

1. **Go to:** [https://docs.docker.com/desktop](https://docs.docker.com/desktop)

2. **Choose your version:**
   - **Windows:** "Docker Desktop for Windows"
   - **Mac Intel:** "Docker Desktop for Mac with Intel chip"
   - **Mac Apple Silicon:** "Docker Desktop for Mac with Apple chip"

3. **Install:**
   - **Windows:** Run the installer, restart when prompted
   - **Mac:** Open the `.dmg` and drag Docker to Applications

4. **Important Setup Steps:**
   
   **After installation:**
   - **Open Docker Desktop**
   - **Accept the license agreement**
   - **Complete the tutorial (optional but recommended)**
   - **Look for the Docker whale icon in your system tray/menu bar**

5. **Verify Installation:**
   - Docker Desktop should be running (whale icon visible)
   - You might see a "Docker Desktop is starting..." message initially

### Common Docker Issues

**If Docker won't start:**
- **Windows:** Enable virtualization in BIOS (consult your computer manual)
- **Windows:** Enable WSL 2 if prompted
- **Mac:** Grant permissions when asked
- **All:** Restart your computer and try again

---

## Step 5: Install Node.js

### Why We Need This
Node.js runs the MCP server code that connects your database to Claude.

### Download Instructions

1. **Go to:** [https://nodejs.org](https://nodejs.org)

2. **Download the LTS version** (should be prominently displayed)
   - LTS = "Long Term Support" = more stable
   - Should be version 18 or higher

3. **Install:**
   - **Windows:** Run the `.msi` installer with default settings
   - **Mac:** Run the `.pkg` installer with default settings

4. **Verify Installation:**
   - **Windows:** Open Command Prompt (`cmd`)
   - **Mac:** Open Terminal
   - **Type:** `node --version`
   - **You should see:** Something like `v18.17.0` or higher

---

## Step 6: Install Git (Windows Only)

### Why We Need This
Git downloads code repositories from GitHub.

### Windows Instructions

1. **Go to:** [https://git-scm.com/download/win](https://git-scm.com/download/win)

2. **Download and run the installer**

3. **Installation options:**
   - **Use default settings for most options**
   - **Important:** Choose "Git from the command line and also from 3rd-party software"
   - **Choose:** "Use bundled OpenSSH"
   - **Choose:** "Use the native Windows Secure Channel library"

4. **Verify Installation:**
   - Open Command Prompt
   - Type: `git --version`
   - You should see version information

### Mac Instructions

**Git is already installed on Mac!** You can verify by:
- Opening Terminal
- Typing: `git --version`

---

## Step 7: Verify Everything is Working

Let's make sure all our software is properly installed:

### Check List

**Open Command Prompt (Windows) or Terminal (Mac) and run these commands:**

1. **Check Node.js:** `node --version`
   - Should show v22+ or higher

2. **Check Git:** `git --version`
   - Should show version information

3. **Check Docker:** 
   - Look for Docker whale icon in system tray/menu bar
   - Or type: `docker --version`

4. **Check VS Code:** 
   - Open VS Code
   - Check that GitHub Copilot and Docker extensions are installed

5. **Check Claude Desktop:**
   - Open Claude Desktop app (not web browser)
   - Should be signed into your account

---

## Troubleshooting Common Issues

### Claude Desktop Won't Open
- **Make sure you downloaded Desktop version, not using web browser**
- **Check system requirements on download page**
- **Try restarting your computer**

### Docker Won't Start
- **Windows:** Enable virtualization in BIOS
- **Windows:** Install WSL 2 if prompted
- **Mac:** Check System Preferences → Security & Privacy for blocked software
- **All:** Restart computer

### VS Code Extensions Won't Install
- **Check internet connection**
- **Try restarting VS Code**
- **Sign into GitHub account in VS Code**

### Command Not Found Errors
- **Restart Command Prompt/Terminal after installing software**
- **Windows:** Make sure software was added to PATH during installation
- **Mac:** Try opening a new Terminal window

---

## What's Next?

Once you have all the software installed and verified:

1. **We'll download the MCP code repository**
2. **Set up the PostgreSQL database with Docker**
3. **Configure your first MCP tools**
4. **Create your AI writing team personas**
5. **Connect everything together**

**Success checkpoint:** You should have Claude Desktop, VS Code with extensions, Docker running, Node.js, and Git all working on your computer.

---

## Getting Help

**If you get stuck:**
1. **Check the troubleshooting section above**
2. **Try restarting your computer** (fixes many issues)
3. **Ask in the course community** with specific error messages
4. **Include your operating system** when asking for help

**Remember:** Every expert was once a beginner. These setup steps are the hardest part - once everything is installed, the rest gets much easier!