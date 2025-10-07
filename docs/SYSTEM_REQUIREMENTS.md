# System Requirements for MCP Tutorial

This document outlines the hardware and software requirements needed to run the MCP Tutorial successfully.

---

## 📊 Quick Reference

| Component | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| **RAM** | 6 GB | 8 GB | 16 GB |
| **CPU** | 2 cores | 4 cores | 6+ cores |
| **Storage** | 15 GB free | 25 GB free | 40 GB free |
| **Disk Type** | HDD | SSD | NVMe SSD |

---

## 💻 Detailed Requirements

### Operating System

#### Windows
- **Version**: Windows 10 (64-bit) or Windows 11
- **Build**: Version 1903 or later (for WSL 2 support)
- **Features Required**:
  - WSL 2 (Windows Subsystem for Linux 2)
  - Virtualization enabled in BIOS
  - Hyper-V capabilities

#### macOS
- **Version**: macOS 10.15 (Catalina) or later
- **Architecture**:
  - Intel (x86_64)
  - Apple Silicon (M1/M2/M3 - ARM64)

#### Linux
- **Distribution**: Any modern 64-bit distribution
- **Kernel**: 3.10 or later
- **Architecture**: x86_64 or ARM64

---

## 🧠 Memory (RAM)

### Minimum: 6 GB
**What you can do:**
- Run basic tutorial operations
- Work with small datasets
- **Limitations**:
  - Slow performance
  - May need to close other applications
  - Claude Desktop responses will be slower

### Recommended: 8 GB
**What you can do:**
- Comfortable tutorial experience
- Run multiple applications simultaneously
- Handle moderate datasets
- **Best for**: Most users

### Optimal: 16 GB or more
**What you can do:**
- Excellent performance
- Run multiple Docker containers
- Large dataset operations
- Keep many applications open
- **Best for**: Power users, developers

### Memory Breakdown

Here's where your RAM goes:

| Component | Memory Usage |
|-----------|--------------|
| Operating System | 2-3 GB |
| Docker Desktop | 2-4 GB (configurable) |
| PostgreSQL Container | 500 MB - 2 GB |
| Claude Desktop OR Typing Mind (browser) | 500 MB - 1 GB |
| VS Code | 500 MB - 1 GB |
| **Total** | **5.5-11 GB** |

> 💡 **Note**: You'll use either Claude Desktop or Typing Mind (web browser), not both simultaneously.

---

## 🔧 CPU (Processor)

### Minimum: 2 Cores
- **Examples**: Intel Core i3, AMD Ryzen 3
- **Performance**: Basic functionality works, but queries will be slow
- **Note**: Parallel query processing will be limited

### Recommended: 4 Cores
- **Examples**: Intel Core i5, AMD Ryzen 5, Apple M1
- **Performance**: Good performance for all tutorial operations
- **Benefit**: Full use of parallel query workers (max_parallel_workers=4)

### Optimal: 6+ Cores
- **Examples**: Intel Core i7/i9, AMD Ryzen 7/9, Apple M2/M3
- **Performance**: Excellent, can handle complex queries easily
- **Benefit**: Additional headroom for multi-tasking

### Why Core Count Matters

The PostgreSQL configuration uses:
- **max_worker_processes**: 4
- **max_parallel_workers**: 4
- **max_parallel_workers_per_gather**: 2

This means complex queries can use up to 4 CPU cores simultaneously for faster results.

---

## 💾 Storage (Disk Space)

### Space Breakdown

| Item | Size | Notes |
|------|------|-------|
| **PostgreSQL Docker Image** | 608 MB | One-time download |
| **Node.js Dependencies** | 50-100 MB | npm packages |
| **Database Storage (Initial)** | 50-100 MB | Empty schema |
| **Database Storage (Novel Series)** | 1-3 GB | For a typical series with multiple books |
| **Write-Ahead Log (WAL)** | Up to 4 GB | Configured max, typically 1-2 GB |
| **Docker Volumes Overhead** | 500 MB - 1 GB | Container metadata |
| **Working Space** | 2-5 GB | Logs, temp files, backups |
| **VS Code** | 500 MB | If not already installed |
| **Claude Desktop** | 300 MB | If not already installed |
| **Git** | 100 MB | If not already installed |
| **Total** | **5-15 GB** | **Typical usage** |

> 💡 **Database Growth**: A novel series typically uses 100-500 MB per book (characters, plot threads, world-building, scenes). A 5-book series might use 500 MB - 2.5 GB total.

### Minimum: 15 GB Free Space
- Enough for tutorial and a small series (1-3 books)
- Monitor disk space as you add books
- **Best for**: Learning and small projects

### Recommended: 25 GB Free Space
- Comfortable room for multiple series
- Space for backups and experiments
- Handle 5-10 book series comfortably
- **Best for**: Most users

### Optimal: 40 GB+ Free Space
- Multiple large series with extensive world-building
- Room for database backups
- Testing and development branches
- **Best for**: Professional authors, multiple projects

### Disk Type: HDD vs SSD

#### HDD (Hard Disk Drive)
- **Will it work?** Yes
- **Performance**: 2-5x slower database operations
- **Note**: Some PostgreSQL settings are optimized for SSD, but HDD is still functional

#### SSD (Solid State Drive)
- **Performance**: Good, settings are optimized for SSD
- **Recommended**: Yes
- **Most modern laptops have this**

#### NVMe SSD
- **Performance**: Excellent, fastest option
- **Benefit**: Minimal I/O bottlenecks
- **Best for**: Large datasets, heavy usage

---

## 🌐 Network Requirements

- **Internet connection required** for:
  - Initial software downloads (Docker images, npm packages)
  - Claude Desktop communication with Anthropic servers
  - Git operations (cloning repository, pushing changes)

- **Bandwidth**:
  - Minimum: 5 Mbps download
  - Recommended: 25+ Mbps download

- **Offline usage**:
  - Database operations work offline
  - Claude Desktop requires internet connection
  - Typing Mind requires internet connection

---

## 📦 Software Requirements

### Required Software

| Software | Version | Size | Purpose |
|----------|---------|------|---------|
| **Docker Desktop** | Latest stable | 500 MB - 1 GB | Run PostgreSQL container |
| **Node.js** | 18.x or 20.x LTS | 50-100 MB | Run migrations and scripts |
| **Git** | 2.x or later | 100 MB | Version control |
| **VS Code** | Latest | 300-500 MB | Code editor (recommended) |
| **Claude Desktop OR Typing Mind** | Latest | 200-400 MB | AI assistant (choose one) |

### Optional Software

- **pgAdmin** or **DBeaver**: Database management GUI (500 MB - 1 GB)
- **GitHub Desktop**: Git GUI alternative (150 MB)

---

## ⚠️ Special Considerations

### Windows-Specific

**WSL 2 Storage Location**
- Default: `C:\Users\YourName\AppData\Local\Docker\wsl`
- Can consume significant space
- Consider moving to a drive with more space

**Virtualization**
- Must be enabled in BIOS
- Required for Docker Desktop
- Check Task Manager → Performance → CPU → Virtualization: Enabled

### macOS-Specific

**Docker Desktop on Apple Silicon**
- Uses Rosetta 2 for x86 compatibility (optional)
- Native ARM64 images are faster
- Tutorial is fully compatible with ARM64

**File System**
- APFS (default on modern Macs) works well
- Case-sensitive file systems supported

### Low-End System Tips

If you're running on minimum specs:

1. **Close unnecessary applications** while using the tutorial
2. **Reduce Docker memory allocation** to 4 GB if you have exactly 6 GB RAM
3. **Use HDD** if that's all you have (it will work, just slower)
4. **Limit browser tabs** to save memory
5. **Consider cloud alternatives** if your system is below minimum specs

---

## ✅ Pre-Installation Checklist

Before starting the tutorial, verify you have:

- [ ] **RAM**: At least 6 GB (8 GB recommended)
- [ ] **CPU**: At least 2 cores (4 cores recommended)
- [ ] **Storage**: At least 15 GB free space (25 GB recommended)
- [ ] **OS**: Windows 10/11, macOS 10.15+, or modern Linux
- [ ] **Virtualization**: Enabled in BIOS (Windows/Linux)
- [ ] **Internet**: Stable connection for downloads
- [ ] **Account**: GitHub account created
- [ ] **Account**: Docker Hub account created (free)

---

## 🎯 Recommended Configurations by Use Case

### "Just Learning / Single Series" Configuration
- **RAM**: 8 GB
- **CPU**: 4 cores
- **Storage**: 15-20 GB free
- **Disk**: Any (HDD or SSD)
- **Use case**: Learning the tutorial, working on 1-2 book series
- **Example**: Most laptops from 2017+ (even budget models)

### "Active Author / Multiple Series" Configuration
- **RAM**: 8-16 GB
- **CPU**: 4 cores
- **Storage**: 25 GB free
- **Disk**: SSD recommended
- **Use case**: Multiple series (3-5), 5-10 books total, moderate world-building
- **Example**: Typical consumer laptop or desktop (most people fit here)

### "Professional Author / Heavy Usage" Configuration
- **RAM**: 16 GB
- **CPU**: 6+ cores
- **Storage**: 40 GB free
- **Disk**: SSD/NVMe
- **Use case**: Many series (5+), 10+ books, extensive world-building, frequent backups
- **Example**: Better consumer laptop (not high-end workstation needed)

---

## 📞 Still Not Sure?

### How to Check Your Current Specs

#### Windows
1. Press **Windows Key + Pause/Break** or right-click **This PC** → **Properties**
2. See: RAM, Processor
3. For storage: Open **File Explorer** → **This PC** → Check C: drive free space

#### macOS
1. Click **Apple menu** → **About This Mac**
2. See: Memory, Processor
3. Click **Storage** tab for disk space

#### Linux
```bash
# Check RAM
free -h

# Check CPU
lscpu | grep "CPU(s)"

# Check disk space
df -h
```

### Decision Tree

- **Do you have 8+ GB RAM and 4+ cores?** → ✅ You're good to go!
- **Do you have 6 GB RAM and 2 cores?** → ⚠️ Will work, but close other apps
- **Do you have less than 6 GB RAM?** → ❌ Consider upgrading or using cloud VM
- **Is your storage on SSD?** → ✅ Great! Optimized for you
- **Is your storage on HDD?** → ⚠️ Will work, expect slower performance

---

## 🆘 Below Minimum Specs?

If your system doesn't meet minimum requirements, consider:

1. **Cloud VPS**: Rent a virtual server (DigitalOcean, AWS, etc.)
2. **GitHub Codespaces**: Run the tutorial in the cloud
3. **Upgrade RAM**: Often the cheapest upgrade for older systems
4. **Use a different computer**: School/work laptop, library computer, etc.

---

**Questions about compatibility?** Check the main setup guides or open an issue on GitHub.
