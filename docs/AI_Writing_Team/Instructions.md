# Getting Started with Your First Claude Project: AI Writing Team Setup

## Prerequisites
- You must be on the **MCP 7 branch**
- All migrations must already be run

---

## Step 1: Update Your Code with Git Pull

1. Open your terminal in VS Code (or your preferred terminal)
2. Run: `git pull`

**Troubleshooting Git Errors:**

If you see an error like "Please commit your changes or stash them before you merge," this means you have local files that Git is tracking.

Common files causing this:
- **Mac users**: `.DS_Store` files (auto-created by Mac)
- **All users**: `claude-desktop.json` files

**Fix (Step-by-Step):**

1. **Stash your changes** (this temporarily saves them out of the way):
   - In your terminal, type: `git stash`
   - Press Enter
   - You should see a message like "Saved working directory..."

2. **Now run git pull again**:
   - Type: `git pull`
   - Press Enter
   - You should see the new files being downloaded

3. **Prevent this in the future** by adding files to `.gitignore`:
   - In VS Code's file explorer (left sidebar), find the file called `.gitignore` at the root of your project
   - Click to open it
   - Scroll to the bottom and add these two lines:
     ```
     .DS_Store
     **/claude-desktop.json
     ```
   - Save the file (Ctrl+S on Windows, Cmd+S on Mac)

Once the pull is successful, you'll see the new files downloaded.

---

## Step 2: Create a New Project in Claude Desktop

1. **Open Claude Desktop**
2. Click to **create a new project**
3. Name it something like "AI Writing Team" or your book series name

---

## Step 3: Add Documentation Files to Project Knowledge

You need to add 5 documentation files to your project. These files provide Claude with the context it needs to help you.

**Files to add:**
- `book_writing_servers_guide.md`
- `mcp_quick_reference.md`
- `plot_world_servers_guide.md`
- `character_server_guide.md`
- `timeline_integration_guide.md`

**How to find and add these files:**

1. In your project window, look for the **"Add content"** or **project knowledge** section
2. Click to add files
3. Navigate to: **MCP-Tutorial � docs � AI_Writing_Team** folder

   =� **Tip:** These are the same files you see in VS Code's file explorer. You're just adding them to Claude's project context so it can reference them.

4. Select all 5 files and add them

---

## Step 4: Upload the AI Writing Team Prompt

1. In your first chat message, **attach a file** using the paperclip/attachment icon
2. Find and upload: **AI writing team -V6.md** (or the highest version number available)
   - This is also in the **docs/AI_Writing_Team** folder

� **Important:** This is a large prompt. Before sending:
- Check your model selection (bottom of chat)
- Use a **good value model like Sonnet 3.7** (not Opus unless you need maximum quality)
- Click in the chat box and press **Enter** to send (or click the send button)

---

## Step 5: Answer Claude's Questions

Claude will ask you questions about your series.

**How to respond:**
- Answer as thoroughly as you can
- Or just describe your series in your own words
- Press **Enter** or click **Send** when done

Claude will create an **artifact** with customized project instructions.

---

## Step 6: Set Your Project Instructions

1. **Review the artifact** Claude created
2. Copy the entire contents
3. return to your **Project Settings** (by selecting the project name or selecting projects from the menu bar and finding the project)
4. Find **Custom Instructions** or **Project Instructions** select edit button
5. **Paste** the artifact contents there
6. Save

---

## Step 7: Start Planning Your Series!

You can start new chat. You're now ready to work with the AI Writing Team.

---

## Troubleshooting & Tips

### If the AI Writing Team Isn't Working Right

Tell Claude exactly what went wrong:

> "These instructions are not working the way I need them to. I asked for [example of what you requested] and I wanted [what you expected], but instead it gave me [what actually happened]. Please fix the instructions."

Claude will revise the project instructions. Copy the new version and update your project instructions again.

### Use the IDs Cheat Sheet

There's an **IDs Cheat Sheet** file you should keep updated with important IDs (character IDs, location IDs, plot thread IDs, etc.). This ensures the AI Writing Team always uses the correct IDs when referencing your story elements.

---

You're all set! Happy writing! =�(
