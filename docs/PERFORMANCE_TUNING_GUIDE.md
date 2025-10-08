# MCP Tutorial Performance Tuning Guide

Is Claude responding slowly? Is the database taking a long time to load? This guide will help you make your MCP Tutorial run faster. Don't worry—we'll walk through each step with clear explanations.

> 💡 **New to terminals?** A "terminal" is a text-based window where you type commands. On Windows, use PowerShell (search for it in the Start menu). On Mac, use Terminal (find it in Applications → Utilities).

## ⚡ Built-in Performance Optimizations

**Good news!** This tutorial includes automatic performance optimizations that work for everyone:

✅ **PostgreSQL is pre-configured** with optimized settings for modern systems
✅ **Connection pooling** is enabled for faster database access
✅ **SSD-optimized** settings are applied by default
✅ **Parallel query processing** is enabled

These work automatically when you run `docker compose up`. No extra setup needed!

> 📝 **If you already have the tutorial running**: You need to recreate your container to get these optimizations:
> ```bash
> docker compose down
> docker compose up -d
> ```
> This is safe and won't delete your data!

---

## 🚩 Start Here: Is Your Setup Running Slow?

Let's figure out what's causing the slowness. Open your terminal and follow along.

### Step 1: Check if Docker is Running Properly

**What this does:** This command shows all the running Docker containers (think of containers as mini-computers running inside your computer).

**Type this command and press Enter:**
```bash
docker ps
```

**What to look for:** You should see a line with `mcp-series-db` in it. Look at the **STATUS** column:
- ✅ **Good:** `Up 5 minutes (healthy)`
- ❌ **Problem:** `Up 5 minutes` (no "healthy"), or `Restarting`, or `Exited`

**If you see a problem:**
- No "healthy" in status → Jump to [Fix: Container is Unhealthy](#fix-container-is-unhealthy)
- Container keeps restarting → Jump to [Give Docker More Resources](#step-2-give-docker-more-power)

### Step 2: Check How Much Power Docker is Using

**What this does:** This shows you real-time information about how hard Docker is working.

**Type this command and press Enter:**
```bash
docker stats mcp-series-db
```

**What to look for:** You'll see numbers updating in real-time. Press `Ctrl + C` to stop watching.

- **CPU%** shows how much processing power is being used
  - Over 80%? Docker needs more CPU power
- **MEM%** shows how much memory (RAM) is being used
  - Over 90%? Docker needs more memory
- **BLOCK I/O** shows disk reading/writing
  - Very high numbers? Your disk might be slow

**Next step:** If any of these numbers look high, continue below to give Docker more resources.

---

## 💪 Give Docker More Power

Docker needs enough computer resources (CPU and memory) to run smoothly. Let's give it what it needs!

### 🍎 If You're Using a Mac

#### Step-by-Step: Increase Docker Resources

**What we're doing:** Giving Docker more of your computer's power so it can run faster.

1. **Find and open Docker Desktop**
   - Look for the Docker whale icon in your menu bar (top of your screen)
   - Click it, then click the gear icon (⚙️) or "Settings"

2. **Go to the Resources section**
   - Click **"Resources"** in the left sidebar
   - You'll see sliders that control how much power Docker can use

3. **Adjust the sliders** (use these recommended settings):
   - **CPUs**: Move the slider to **4 or 6**
     - *What this means:* How many processor cores Docker can use
   - **Memory**: Move the slider to **6 GB or 8 GB**
     - *What this means:* How much RAM Docker can use
   - **Swap**: Set to **1 GB**
     - *What this means:* Extra memory space on your hard drive
   - **Disk image size**: Set to at least **60 GB**
     - *What this means:* Maximum storage space for Docker

4. **Save your changes**
   - Click **"Apply & Restart"** at the bottom
   - Docker will restart (this takes about 30 seconds)

#### 🔋 Extra Tips for Mac Users

- **Which terminal should you use?**
  - Built-in Terminal app works great (Applications → Utilities → Terminal)
  - VS Code's built-in terminal is also excellent

- **Don't run things in background tabs**
  - When running commands, keep that terminal window visible
  - macOS can slow down background processes

- **Apple Silicon (M1/M2/M3) Users:**
  - Your chip uses ARM architecture, which is usually faster
  - The tutorial should work automatically, but if you see warnings about ARM64, that's normal

---

### 🪟 If You're Using Windows

#### Step 1: Make Sure Virtualization is Turned On

**What this is:** A feature that lets Docker run efficiently. It should already be on, but let's check.

1. Right-click the taskbar → Click **"Task Manager"**
2. Click the **"Performance"** tab
3. Click **"CPU"** in the left sidebar
4. Look at the bottom-right for **"Virtualization"**
   - ✅ If it says **"Enabled"** → Great! Skip to Step 2
   - ❌ If it says **"Disabled"** → You'll need to enable it in BIOS

**Enabling virtualization in BIOS** (only if needed):
- Restart your computer
- During startup, press the BIOS key (usually **F2**, **F10**, **Del**, or **F12**)
- Look for settings called "Virtualization", "Intel VT-x", or "AMD-V"
- Enable it, save, and restart
- *Not sure how?* Search online for "enable virtualization [your computer brand]"

#### Step 2: Use WSL 2 (Makes Docker Much Faster)

**What this is:** WSL 2 is a Windows feature that makes Docker run way faster.

1. **Open Docker Desktop**
   - Find the Docker whale icon in your system tray (bottom-right of screen)
   - Right-click it → Click **"Settings"**

2. **Check WSL 2 is enabled**
   - Click **"General"** in the left sidebar
   - Find the checkbox that says **"Use the WSL 2 based engine"**
   - If it's not checked, check it
   - Click **"Apply & Restart"**

#### Step 3: Give Docker More Resources

1. **In Docker Desktop Settings**
   - Click **"Resources"** in the left sidebar
   - You'll see sliders

2. **Adjust the sliders** (recommended settings):
   - **CPUs**: Move to **4 or more**
   - **Memory**: Move to **6 GB or 8 GB**
   - **Swap**: Move to **1 GB or 2 GB**

3. **Click "Apply & Restart"**

#### 🎯 Extra Windows Performance Tips

**Make sure Docker uses your fast drive (SSD, not HDD):**
1. In Docker Desktop → Settings → Resources → Advanced
2. Look for **"Disk image location"**
3. It should point to your SSD (usually your C: drive)
4. If it's on a different drive and you have an SSD, change it

**For advanced users** (optional - skip if unsure):
- You can create a file called `.wslconfig` in your user folder to give WSL more memory
- Open Notepad and paste:
  ```ini
  [wsl2]
  memory=8GB
  processors=4
  swap=2GB
  ```
- Save as `.wslconfig` in `C:\Users\YourUsername\`

---

### 🪟 Windows ARM64 (Surface Pro X and similar devices)

If you have a Windows computer with an ARM processor (like some Surface devices):

1. **Open Docker Desktop** → **Settings** → **Resources** → **Advanced**
2. Set these:
   - **CPUs**: 4 or more
   - **Memory**: 6–8 GB
   - **Swap**: 1 GB
3. Click **"Apply & Restart"**

That's it! ARM processors are usually pretty efficient.

---

## 🩺 Fix: Container is Unhealthy

If `docker ps` showed your container as "unhealthy" or it keeps restarting, follow these steps.

### What We're Fixing

Docker containers have "health checks" that make sure everything is working. If the check fails, the container is marked unhealthy. Let's fix it!

### Step 1: Look at the Error Messages

**What this does:** Shows you any error messages from the database.

**Type this command:**
```bash
docker logs mcp-series-db
```

**What you'll see:** A bunch of text will appear. Scroll up to look for any lines that say "ERROR" or "FATAL". These tell you what's wrong.

Common errors and what they mean:
- `could not connect` → Database isn't starting properly
- `authentication failed` → Password problem (see troubleshooting in the main setup guide)
- `out of memory` → Docker doesn't have enough memory (go back to [Give Docker More Power](#-give-docker-more-power))

### Step 2: Try Restarting the Container

**What this does:** Like restarting your computer when something's not working, this restarts just the database container.

**Type this command:**
```bash
docker restart mcp-series-db
```

**Wait 10 seconds**, then check if it's healthy now:
```bash
docker ps
```

Look for `(healthy)` in the STATUS column.

### Step 3: If Still Broken, Rebuild Everything

**What this does:** Completely stops and rebuilds the container from scratch.

**⚠️ Warning:** This won't delete your data, but write down any custom settings first.

**Type these commands one at a time:**
```bash
docker compose down
```
*(This stops the container)*

```bash
docker compose up -d
```
*(This rebuilds and starts it)*

**Wait about 30 seconds**, then check:
```bash
docker ps
```

### Step 4: Container Won't Start (Out of Memory)

If the container keeps exiting or won't start, and `docker logs mcp-series-db` shows memory errors:

**Problem**: Your system doesn't have enough RAM for the default PostgreSQL settings.

**Solution**: Reduce the memory settings for low-RAM systems.

#### For Systems with 4-6 GB RAM

1. **Open `docker-compose.yml` in VS Code**
   ```bash
   code docker-compose.yml
   ```

2. **Find the line that says `shared_buffers=256MB`** (appears twice)

3. **Change BOTH occurrences from `256MB` to `128MB`**:

   Before:
   ```yaml
   POSTGRES_INITDB_ARGS: "-c shared_buffers=256MB -c max_connections=100"
   ```

   After:
   ```yaml
   POSTGRES_INITDB_ARGS: "-c shared_buffers=128MB -c max_connections=100"
   ```

   And in the `command:` section:

   Before:
   ```yaml
   - "shared_buffers=256MB"
   ```

   After:
   ```yaml
   - "shared_buffers=128MB"
   ```

4. **Also reduce `work_mem`** from `16MB` to `8MB`:

   Before:
   ```yaml
   - "work_mem=16MB"
   ```

   After:
   ```yaml
   - "work_mem=8MB"
   ```

5. **Save the file** (Ctrl+S or Cmd+S)

6. **Recreate the container**:
   ```bash
   docker compose down
   docker compose up -d
   ```

**What this does**: Reduces PostgreSQL's memory usage by about 130MB, making it work on lower-end systems.

---

### Step 5: Still Having Issues?

If you're still seeing problems:

1. **Check if you're in the right folder**
   ```bash
   pwd
   ```
   You should be in something like `/Users/YourName/Documents/GitHub/MCP-tutorial` (Mac) or `C:\Users\YourName\Documents\GitHub\MCP-tutorial` (Windows)

2. **Make sure Docker Desktop is actually running**
   - Look for the Docker whale icon in your system tray (Windows) or menu bar (Mac)
   - If you don't see it, open Docker Desktop

3. **Check Docker Desktop has enough memory allocated**
   - See [Give Docker More Power](#-give-docker-more-power) section above
   - If you have 6GB total RAM, give Docker 3-4GB (not more!)

4. **Go back to the main setup guide** and check your `.env` file is configured correctly

---

## ⚡ Make the Database Run Faster

If your container is healthy but Claude is still slow when looking up information, the database configuration might need tuning.

> 💡 **Note:** Database indexes are already included in the tutorial migrations, so you don't need to create them manually!

### Advanced: Custom Database Configuration

**⚠️ This section is for advanced users.** If the above simple fix didn't help enough, or if you're comfortable editing configuration files, try this.

#### What This Does

PostgreSQL (the database software) has settings that control how it uses memory and disk. We'll create a custom configuration file that tells it to be more aggressive about performance.

#### Step-by-Step Instructions

**Step 1:** Open VS Code in your MCP tutorial folder:
```bash
code .
```

**Step 2:** Create a new folder called `config` if it doesn't exist:
- In VS Code, right-click in the file explorer
- Click "New Folder"
- Name it `config`

**Step 3:** Create a new file inside `config` called `postgresql.conf`:
- Right-click the `config` folder → "New File"
- Name it `postgresql.conf`

**Step 4:** Copy and paste this into the file:

```conf
# Memory Configuration
shared_buffers = 512MB
effective_cache_size = 2GB
work_mem = 64MB
maintenance_work_mem = 256MB

# SSD Optimization (use these if you have an SSD)
random_page_cost = 1.1
effective_io_concurrency = 200

# Write Performance
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Connection Settings
max_connections = 100

# Logging (helps you see slow queries)
log_min_duration_statement = 1000
```

**What these settings mean:**
- `shared_buffers`: How much RAM to use for caching data
- `work_mem`: Memory for sorting and joining data
- `random_page_cost`: Lower for SSDs (faster drives)
- `log_min_duration_statement`: Log any query that takes longer than 1 second

**Step 5:** Save the file (Ctrl+S or Cmd+S)

**Step 6:** Open your `docker-compose.yml` file and find the `postgres:` section. Add these two lines under `volumes:` and add the `command:` line:

```yaml
services:
  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

**Step 7:** Restart Docker to use the new configuration:
```bash
docker compose down
docker compose up -d
```

**Wait 30 seconds** and your database will now use these optimized settings!

---

## 📊 How to Check if Things Got Faster

After making changes, it's good to test if things actually improved!

### Simple Test: Connection Speed

**What this does:** Tests how quickly you can connect to the database.

```bash
docker exec mcp-series-db psql -U writer -d mcp_series -c "SELECT 1;"
```

**What to expect:** You should see the number `1` appear almost instantly (less than a second).

### Test Query Speed

**Step 1:** Connect to the database:
```bash
docker exec -it mcp-series-db psql -U writer -d mcp_series
```

**Step 2:** Turn on timing (shows how long each query takes):
```sql
\timing on
```

**Step 3:** Run a test query:
```sql
SELECT COUNT(*) FROM characters;
```

**What you'll see:** Something like `Time: 45.123 ms` (milliseconds). Lower is better!
- **Under 100ms:** Great!
- **100-500ms:** Pretty good
- **Over 1000ms (1 second):** Still room for improvement

**Step 4:** Exit:
```sql
\q
```

---

## 🎯 Quick Checklist: Did I Do Everything?

Go through this list and check off what you've done:

**Basic Performance (Everyone should do this):**
- [ ] Gave Docker at least 6 GB of memory
- [ ] Gave Docker at least 4 CPU cores
- [ ] Container shows as "healthy" when running `docker ps`

**Windows Users Only:**
- [ ] Virtualization is enabled (checked in Task Manager)
- [ ] Using WSL 2 backend (checked in Docker Desktop settings)
- [ ] Docker is storing data on an SSD, not a slow HDD

**Mac Users Only:**
- [ ] Running commands in the foreground (not background tabs)

**Advanced (Optional - only if still having issues):**
- [ ] Created custom PostgreSQL configuration file
- [ ] Tested query speeds to measure improvement

---

## 🔧 Expert-Level Optimizations

**⚠️ These sections are for advanced users who have already tried everything above.**

### Connection Pooling with PgBouncer

If you're running many Claude requests at once and hitting connection limits, you can add a connection pooler.

**What this does:** Instead of opening a new database connection for every request, PgBouncer reuses connections, making things much faster under heavy load.

**How to set it up:**
1. Add this to your `docker-compose.yml` file under `services:`:
   ```yaml
   pgbouncer:
     image: edoburu/pgbouncer
     environment:
       DATABASE_URL: "postgres://writer:your_secure_password@postgres:5432/mcp_series"
       POOL_MODE: transaction
       MAX_CLIENT_CONN: 100
       DEFAULT_POOL_SIZE: 25
     ports:
       - "6432:5432"
     depends_on:
       - postgres
   ```

2. Update your `.env` file to connect through PgBouncer (note the port changed from 5432 to 6432):
   ```env
   DATABASE_URL=postgresql://writer:your_secure_password@localhost:6432/mcp_series
   ```

3. Restart everything:
   ```bash
   docker compose down
   docker compose up -d
   ```

### Find Slow Queries

Want to see which database queries are taking the longest? This helps you identify bottlenecks.

**Connect to the database:**
```bash
docker exec -it mcp-series-db psql -U writer -d mcp_series
```

**Enable logging for slow queries:**
```sql
ALTER DATABASE mcp_series SET log_min_duration_statement = 500;
\q
```

**View the slow queries:**
```bash
docker logs mcp-series-db | grep "duration:"
```

This shows any query that took longer than 500 milliseconds.

---

## ❓ Common Questions

### "The container won't start after I updated docker-compose.yml. What do I do?"

This usually means your system doesn't have enough RAM for the default settings. See [Step 4: Container Won't Start (Out of Memory)](#step-4-container-wont-start-out-of-memory) above for how to reduce memory settings.

Quick fix for low-RAM systems:
- Change `shared_buffers=256MB` to `shared_buffers=128MB` (in 2 places)
- Change `work_mem=16MB` to `work_mem=8MB`
- Then run `docker compose down && docker compose up -d`

### "How do I know if my changes actually helped?"

Use the testing section above! Run `docker stats mcp-series-db` before and after your changes to see if CPU% and MEM% numbers are better. Also, time how long Claude takes to respond to typical requests.

### "I did everything and it's still slow. What now?"

Check these:
1. **Your internet connection** - Claude Desktop needs to communicate with Anthropic's servers
2. **Your computer's overall performance** - Close other heavy programs
3. **The complexity of your requests** - Very complex queries with lots of data will always take some time
4. **Your computer's specs** - If you have less than 8 GB of total RAM or an older computer, performance may be limited

### "I'm getting 'out of memory' errors"

Your computer doesn't have enough RAM available. Try:
1. Close other applications
2. Reduce the memory allocated to Docker to match your system (if you have 8 GB total, give Docker 4 GB, not 8)
3. Consider upgrading your computer's RAM

### "What's the difference between an SSD and HDD?"

- **SSD (Solid State Drive)**: Fast, no moving parts, expensive per GB. Most modern computers have these.
- **HDD (Hard Disk Drive)**: Slower, has spinning disks, cheaper. Older computers have these.

To check what you have (Windows):
1. Open "Defragment and Optimize Drives" (search in Start menu)
2. Look at the "Media type" column

### "Docker Desktop won't start" or "Container won't run"

This is usually a system-level issue. Try:
1. Restart your computer
2. Update Docker Desktop to the latest version
3. On Windows, make sure WSL 2 is installed: Open PowerShell as Administrator and run `wsl --update`

---

## 📚 Want to Learn More?

These resources have more detailed information:

- **Docker Desktop Settings**: [Official Docker Documentation](https://docs.docker.com/desktop/)
- **PostgreSQL Performance**: [PostgreSQL Performance Wiki](https://wiki.postgresql.org/wiki/Performance_Optimization)
- **WSL 2 (Windows users)**: [Microsoft WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)

---

## 🆘 Still Need Help?

**First, gather this information:**
1. What operating system are you using? (Windows 10/11, macOS version, etc.)
2. How much RAM does your computer have?
3. What error messages are you seeing? (copy the exact text)
4. What does `docker ps` show?
5. What does `docker logs mcp-series-db` show? (copy the last 20 lines)

**Then:**
- Check the main [COMPLETE_WINDOWS_SETUP_GUIDE_V2.md](COMPLETE_WINDOWS_SETUP_GUIDE_V2.md) troubleshooting section
- Post in the MCP tutorial community with the information above
- Search for your specific error message online

---

**Good luck, and may your queries be fast!** 🚀
