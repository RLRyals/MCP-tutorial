# MCP Writing System - Distribution Package

Complete standalone Docker-based setup for the MCP Writing System with Typing Mind integration.

## 🚀 Automated Setup (Recommended)

Run the complete automated setup script:

```powershell
cd distribution

# Complete setup with Typing Mind
.\setup-all.ps1

# Or skip Typing Mind download
.\setup-all.ps1 -SkipTypingMind

# Force rebuild/regenerate everything
.\setup-all.ps1 -Force

# Verbose output
.\setup-all.ps1 -Verbose
```

**What this does:**
1. Downloads Typing Mind static files from GitHub (730 files, ~63MB)
2. Generates secure `.env` configuration with random passwords
3. Starts Docker containers (PostgreSQL, MCP Connector, Typing Mind)
4. Waits for services to be healthy
5. Runs health checks
6. Displays connection information

**Total time:** ~2-3 minutes on first run

---

## 📋 Manual Setup (Step-by-Step)

If you prefer to run each step manually:

### Step 1: Download Typing Mind Files

```powershell
# Windows
.\download-typingmind.ps1

# Mac/Linux
./download-typingmind.sh
```

### Step 2: Generate Environment Configuration

```powershell
.\generate-env.ps1
```

### Step 3: Start Docker Stack

```powershell
cd docker
docker-compose --env-file ../.env up -d
```

### Step 4: Verify Setup

```powershell
cd ..
.\test-docker-stack.ps1 -Verbose
```

**See `QUICK-START.md` for detailed manual instructions.**

---

## 🐳 What Gets Installed

### Container 1: PostgreSQL Database
- **Name:** `mcp-writing-db`
- **Port:** 5432
- **Database:** `mcp_writing_db`
- **User:** `writer`
- **Migrations:** 21 SQL migrations applied automatically

### Container 2: MCP Connector
- **Name:** `mcp-connector`
- **Port:** 50880
- **Servers:** 9 MCP writing servers
- **Auth:** Bearer token (auto-generated)

### Container 3: Typing Mind Web Server
- **Name:** `typing-mind-web`
- **Port:** 3000
- **Source:** Official TypingMind static files
- **Nginx:** Optimized configuration included

---

## 📦 Available MCP Servers

Once setup is complete, you'll have access to:

1. **author-server** - Author information management
2. **book-planning-server** - Plan and structure books
3. **chapter-planning-server** - Chapter organization
4. **character-planning-server** - Character development
5. **core-continuity-server** - Series continuity management
6. **reporting-server** - Analytics and reports
7. **review-server** - Review and revision tools
8. **scene-server** - Scene management
9. **series-planning-server** - Multi-book series planning

---

## 🔌 Connecting Typing Mind

After setup completes:

1. **Open:** http://localhost:3000
2. **Go to:** Settings → Advanced → Model Context Protocol
3. **Add MCP Connector:**
   - URL: `http://localhost:50880`
   - Auth Token: (shown in setup output, or check `.env`)
4. **Click Connect**

Your MCP auth token is in `.env`:
```powershell
# View token
Get-Content .env | Select-String "MCP_AUTH_TOKEN"
```

---

## 🛠️ Common Commands

### View Services Status
```powershell
docker ps
```

### View Logs
```powershell
cd docker
docker-compose --env-file ../.env logs -f

# Or specific service
docker-compose --env-file ../.env logs -f mcp-connector
```

### Stop Services
```powershell
cd docker
docker-compose --env-file ../.env down
```

### Restart Services
```powershell
cd docker
docker-compose --env-file ../.env restart
```

### Rebuild Everything
```powershell
cd docker
docker-compose --env-file ../.env down
docker-compose --env-file ../.env build --no-cache
docker-compose --env-file ../.env up -d
```

---

## 🔍 Troubleshooting

### Docker Not Running
```powershell
# Check Docker status
docker ps

# Start Docker Desktop
# Windows: Start Menu → Docker Desktop
# Mac: Applications → Docker.app
```

### Services Not Healthy
```powershell
# Check container status
docker ps

# View logs
cd docker
docker-compose --env-file ../.env logs mcp-connector
docker-compose --env-file ../.env logs postgres

# Restart services
docker-compose --env-file ../.env restart
```

### Can't Access Typing Mind (localhost:3000)
```powershell
# Check if static files were downloaded
ls typing-mind-static/index.html

# If missing, download them
.\download-typingmind.ps1

# Restart typing-mind-web container
cd docker
docker-compose --env-file ../.env restart typing-mind-web
```

### MCP Connector Not Responding
```powershell
# Test health endpoint
curl http://localhost:50880/ping
# Should return: {"status":"ok"}

# Check connector logs
docker logs mcp-connector

# Verify environment variables
docker exec mcp-connector env | grep DATABASE_URL
```

### Database Connection Failed
```powershell
# Test database connection
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT 1;"

# Check password in .env
Get-Content .env | Select-String "POSTGRES_PASSWORD"

# Check migrations
docker exec mcp-writing-db psql -U writer -d mcp_writing_db -c "SELECT * FROM migrations;"
```

---

## 📚 Documentation Files

- **README.md** - This file (quick reference)
- **QUICK-START.md** - Concise setup instructions
- **README-distribution.md** - Comprehensive documentation
- **TYPING-MIND-SETUP.md** - Typing Mind specific setup
- **TYPING-MIND-ACCESS.md** - Connection options
- **SETUP-COMPLETE.md** - Post-setup checklist

---

## 🔐 Security Notes

1. ✅ `.env` contains auto-generated secure passwords
2. ✅ Auth token is 48+ random characters
3. ⚠️ **Never commit `.env` to git** (already in .gitignore)
4. ⚠️ **Delete `credentials-backup.txt`** after saving elsewhere
5. ⚠️ **Don't expose ports** to the internet (use localhost only)

---

## 🔄 Updating

### Update Typing Mind
```powershell
.\download-typingmind.ps1 -Force
cd docker
docker-compose --env-file ../.env restart typing-mind-web
```

### Update MCP Connector
```powershell
cd docker
docker-compose --env-file ../.env down
docker-compose --env-file ../.env build --no-cache
docker-compose --env-file ../.env up -d
```

---

## 📦 Backup & Restore

### Backup Database
```powershell
docker exec mcp-writing-db pg_dump -U writer mcp_writing_db > backup.sql
```

### Restore Database
```powershell
Get-Content backup.sql | docker exec -i mcp-writing-db psql -U writer -d mcp_writing_db
```

### Backup Volume
```powershell
docker run --rm -v mcp-writing-data:/data -v ${PWD}:/backup alpine tar czf /backup/data-backup.tar.gz /data
```

---

## 🎯 Next Steps

After setup is complete:

1. ✅ Open Typing Mind at http://localhost:3000
2. ✅ Add your AI provider API keys
3. ✅ Configure MCP Connector connection
4. ✅ Test all 9 MCP servers
5. ✅ Create sample data (books, characters, scenes)
6. ✅ Verify database persistence
7. ✅ Ready to build Electron wrapper!

---

## 💡 Tips

- **First time?** Use `.\setup-all.ps1` for automated setup
- **Already setup?** Use `cd docker && docker-compose up -d` to start
- **Problems?** Run `.\test-docker-stack.ps1 -Verbose` for diagnostics
- **Clean slate?** Use `docker-compose down -v` to remove all data
- **Save credentials!** Check `.env` and `credentials-backup.txt`

---

## 🤝 Support

- **Issues:** Check troubleshooting section above
- **Logs:** Always start with `docker-compose logs`
- **Health Check:** Run `.\test-docker-stack.ps1 -Verbose`
- **GitHub:** Report issues in main repository

---

## 📄 License

See main repository LICENSE file. Typing Mind is proprietary - see their license at https://github.com/TypingMind/typingmind
