# Docker Compose V2 Syntax Update

## What Changed

Docker Compose V2 (installed with Docker Desktop 4.x) uses `docker compose` instead of `docker-compose`.

### Old Syntax (V1)
```bash
docker-compose up -d
docker-compose down
docker-compose ps
```

### New Syntax (V2)
```bash
docker compose up -d
docker compose down
docker compose ps
```

## Why This Matters

- **V2** is integrated into Docker CLI (faster, better integration)
- **V1** is a separate Python tool (legacy, still works)
- Docker Desktop 4.x+ includes V2 by default
- V1 still available but deprecated

## For Students: Which Should I Use?

**Use whichever works on your system!** Both work identically.

### Check What You Have

```bash
# Try V2 first (recommended)
docker compose version

# If that fails, try V1
docker-compose version
```

### Quick Test
```bash
# Try this
docker compose ps

# If you get "unknown command", use this instead
docker-compose ps
```

## Command Reference

All documentation shows **both versions** where applicable:

| Task | V2 Syntax | V1 Syntax |
|------|-----------|-----------|
| Start services | `docker compose up -d` | `docker-compose up -d` |
| Stop services | `docker compose down` | `docker-compose down` |
| View status | `docker compose ps` | `docker-compose ps` |
| View logs | `docker compose logs -f` | `docker-compose logs -f` |
| Restart | `docker compose restart` | `docker-compose restart` |

## Updated Scripts

All scripts in this repository now:
1. Auto-detect which version you have
2. Use the appropriate command
3. Work with both V1 and V2

No changes needed from you - the scripts handle it automatically!

## For Instructors

When writing documentation or scripts, use this pattern:

```bash
# Detect which compose command to use
if docker compose version &>/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Use it
$COMPOSE_CMD up -d
```

Or in documentation, show both:

```markdown
**Docker Compose V2 (recommended):**
\`\`\`bash
docker compose up -d
\`\`\`

**Docker Compose V1 (legacy):**
\`\`\`bash
docker-compose up -d
\`\`\`
```

## Migration Guide

If you want to standardize on V2:

1. **Check you have it:**
   ```bash
   docker compose version
   ```

2. **If not, update Docker Desktop:**
   - Download latest from https://www.docker.com/products/docker-desktop
   - V2 is included in Docker Desktop 4.0+

3. **Optionally remove V1:**
   ```bash
   # macOS/Linux
   sudo rm /usr/local/bin/docker-compose

   # Windows - uninstall via Add/Remove Programs if standalone
   ```

4. **Update muscle memory:**
   - Replace `docker-compose` with `docker compose`
   - No dash!

## Compatibility

Our scripts support both because:
- Some systems may still have only V1
- Students may be on older Docker Desktop versions
- No reason to force everyone to upgrade immediately
- Both work identically for our use case

## Future

Docker Compose V1 is deprecated but still maintained. Eventually (2025+), it may be removed entirely. For now, both work fine.

**Recommendation:** Use V2 if you have it, but don't worry if you have V1.
