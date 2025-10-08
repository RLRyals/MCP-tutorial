# Security Guide for Remote Deployment

## ⚠️ IMPORTANT: This Tutorial is Designed for LOCAL USE

The default configuration is **NOT secure** for remote/production deployment. This guide shows you what to change if you need to deploy remotely.

## Table of Contents
- [Local vs Remote Security](#local-vs-remote-security)
- [Critical Security Changes Required](#critical-security-changes-required)
- [Database Security](#database-security)
- [Network Security](#network-security)
- [Authentication & Authorization](#authentication--authorization)
- [Environment Variables](#environment-variables)
- [HTTPS/TLS](#httpstls)
- [Deployment Checklist](#deployment-checklist)

---

## Local vs Remote Security

### LOCAL DEPLOYMENT (Default - SECURE)
✅ **Running on your laptop/desktop:**
- Database only accessible from localhost
- MCP servers only accessible from your machine
- No network exposure
- Simple passwords OK
- No encryption needed
- **This is what the tutorial provides**

### REMOTE DEPLOYMENT (Requires Security Hardening)
⚠️ **Running on a server accessible from internet/network:**
- Database exposed to network
- MCP servers accessible remotely
- Multiple attack vectors
- Strong passwords REQUIRED
- Encryption MANDATORY
- **Requires ALL changes in this guide**

---

## Critical Security Changes Required

### 1. Change Default Password

**Current (INSECURE for remote):**
```env
POSTGRES_USER=writer
POSTGRES_PASSWORD=postgres  # ❌ Default password
```

**Secure (for remote):**
```env
POSTGRES_USER=writer
POSTGRES_PASSWORD=YourVeryStrongPasswordHere123!@#$%  # ✅ Strong password
```

**Generate strong password:**
```powershell
# PowerShell - Generate random password
-join ((48..57) + (65..90) + (97..122) + (33,35,36,37,38,42,43,45) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

```bash
# Bash/Mac - Generate random password
openssl rand -base64 32
```

### 2. Never Use Default Credentials

**DO NOT use in production:**
- ❌ `POSTGRES_USER=postgres`
- ❌ `POSTGRES_PASSWORD=postgres`
- ❌ `POSTGRES_PASSWORD=password`
- ❌ `POSTGRES_PASSWORD=123456`
- ❌ Any password in documentation/examples

**DO use:**
- ✅ Generated strong passwords (32+ characters)
- ✅ Password managers to store them
- ✅ Different passwords per environment
- ✅ Rotate passwords regularly

---

## Database Security

### 1. Do Not Expose PostgreSQL Port

**Current docker-compose.mcp.yml (OK for local):**
```yaml
postgres:
  ports:
    - "5432:5432"  # ❌ Accessible from network
```

**Secure (for remote):**
```yaml
postgres:
  # REMOVE the ports section entirely
  # Database only accessible to MCP containers on Docker network
  # ports:
  #   - "5432:5432"  # COMMENTED OUT
```

**Why:** If you expose 5432, anyone on the network can attempt to connect to your database.

### 2. Create Read-Only User for MCP Servers

**Best Practice:** MCP servers should NOT use superuser account.

**Connect to database:**
```bash
docker exec -it mcp-tutorial-db psql -U writer -d book_series_db
```

**Create read-write user (limited permissions):**
```sql
-- Create MCP user with limited permissions
CREATE USER mcp_app WITH PASSWORD 'AnotherStrongPassword123!';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE book_series_db TO mcp_app;
GRANT USAGE ON SCHEMA public TO mcp_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mcp_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mcp_app;

-- For future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mcp_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO mcp_app;
```

**Update .env:**
```env
# Keep writer for admin tasks
POSTGRES_USER=writer
POSTGRES_PASSWORD=AdminStrongPassword123!

# Add MCP app credentials
DATABASE_URL=postgresql://mcp_app:AnotherStrongPassword123!@postgres:5432/book_series_db
```

### 3. Enable SSL/TLS for Database

**Add to postgres service in docker-compose:**
```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "ssl=on"
    - "-c"
    - "ssl_cert_file=/var/lib/postgresql/server.crt"
    - "-c"
    - "ssl_key_file=/var/lib/postgresql/server.key"
  volumes:
    - ./certs/server.crt:/var/lib/postgresql/server.crt:ro
    - ./certs/server.key:/var/lib/postgresql/server.key:ro
```

**Generate certificates:**
```bash
# Create self-signed cert (for testing)
openssl req -new -x509 -days 365 -nodes -text \
  -out certs/server.crt \
  -keyout certs/server.key \
  -subj "/CN=postgres"

chmod 600 certs/server.key
```

**Update DATABASE_URL:**
```env
DATABASE_URL=postgresql://mcp_app:password@postgres:5432/book_series_db?sslmode=require
```

---

## Network Security

### 1. Bind to Localhost Only (If Same Server)

**If MCP client is on same server:**
```yaml
# In docker-compose.mcp.yml (for Claude Desktop on same machine)
mcp-author:
  ports:
    - "127.0.0.1:3501:3501"  # ✅ Localhost only
```

**Why:** Prevents external access to MCP servers.

### 2. Use Firewall Rules

**Allow only specific IPs:**
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow from YOUR_IP_ADDRESS to any port 3501
sudo ufw allow from YOUR_IP_ADDRESS to any port 5432
sudo ufw deny 3501
sudo ufw deny 5432

# RHEL/CentOS (firewalld)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="YOUR_IP" port protocol="tcp" port="3501" accept'
```

### 3. Use VPN for Remote Access

**Best practice for remote access:**
1. Set up VPN (WireGuard, OpenVPN, Tailscale)
2. Access server through VPN only
3. No direct internet exposure
4. All traffic encrypted

**Tailscale example (easiest):**
```bash
# On server
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# On laptop
# Install Tailscale
# Connect to same network
# Access via Tailscale IP (100.x.x.x)
```

---

## Authentication & Authorization

### 1. Add API Key Authentication to MCP Servers

**Create middleware for MCP servers:**

```javascript
// src/shared/auth-middleware.js
export function requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.MCP_API_KEY;

    if (!validKey) {
        return res.status(500).json({ error: 'Server not configured for authentication' });
    }

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Invalid or missing API key' });
    }

    next();
}
```

**Add to MCP HTTP servers:**
```javascript
// In each MCP server's HTTP setup
import { requireApiKey } from '../shared/auth-middleware.js';

// Before routes
app.use(requireApiKey);
```

**Generate and configure API key:**
```bash
# Generate secure API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to .env:**
```env
MCP_API_KEY=your_generated_key_here_64_characters_long
```

**Update docker-compose:**
```yaml
mcp-author:
  environment:
    MCP_API_KEY: ${MCP_API_KEY}
```

**Client usage:**
```javascript
// Typing Mind or other HTTP clients
fetch('http://server:3501/tools', {
    headers: {
        'X-API-Key': 'your_generated_key_here'
    }
})
```

### 2. Implement Rate Limiting

**Add rate limiting middleware:**
```javascript
// src/shared/rate-limit.js
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
```

**Apply to MCP servers:**
```javascript
import { rateLimiter } from '../shared/rate-limit.js';

app.use(rateLimiter);
```

---

## Environment Variables

### 1. Never Commit Secrets to Git

**Add to .gitignore:**
```
.env
.env.local
.env.production
*.pem
*.key
*.crt
secrets/
```

### 2. Use Environment-Specific Files

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

### 3. Use Secrets Management

**For production, use:**
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Docker Secrets**

**Docker Secrets example:**
```bash
# Create secret
echo "YourStrongPassword" | docker secret create db_password -

# Use in docker-compose
services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

---

## HTTPS/TLS

### 1. Use Reverse Proxy (Nginx/Caddy)

**Nginx with Let's Encrypt:**

```nginx
# /etc/nginx/sites-available/mcp-tutorial
server {
    listen 443 ssl http2;
    server_name mcp.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/mcp.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to MCP servers
    location /mcp/author {
        proxy_pass http://localhost:3501;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Repeat for other servers
}
```

**Caddy (automatic HTTPS):**
```
mcp.yourdomain.com {
    reverse_proxy /mcp/author localhost:3501
    reverse_proxy /mcp/series localhost:3502
    reverse_proxy /mcp/book localhost:3503
}
```

### 2. Client Certificate Authentication

**For highest security:**
```nginx
server {
    ssl_client_certificate /etc/nginx/client_certs/ca.crt;
    ssl_verify_client on;

    # Rest of config
}
```

---

## Deployment Checklist

### Pre-Deployment Security Checklist

- [ ] Changed all default passwords to strong passwords (32+ chars)
- [ ] Generated unique passwords for each environment
- [ ] Passwords stored in password manager/secrets vault
- [ ] Removed PostgreSQL port exposure (5432)
- [ ] Created limited-permission database user for MCP
- [ ] Enabled SSL/TLS for database connections
- [ ] Added API key authentication to MCP servers
- [ ] Implemented rate limiting
- [ ] Configured firewall rules (only allow specific IPs)
- [ ] Set up VPN for remote access (if applicable)
- [ ] Using HTTPS/TLS for all MCP HTTP endpoints
- [ ] Reverse proxy configured with security headers
- [ ] All secrets removed from git repository
- [ ] .env files in .gitignore
- [ ] Environment-specific configs created
- [ ] Updated docker-compose to use secrets
- [ ] Tested authentication from client
- [ ] Tested that unauthorized access is blocked
- [ ] Set up monitoring/alerting for failed auth attempts
- [ ] Documented all security configurations
- [ ] Backup and disaster recovery plan in place

### Monitoring Checklist

- [ ] Log failed authentication attempts
- [ ] Monitor unusual database activity
- [ ] Set up alerts for:
  - Multiple failed login attempts
  - Unusual traffic patterns
  - Resource usage spikes
  - Certificate expiration warnings

---

## Quick Remote Deployment (Minimum Security)

**If you MUST deploy remotely quickly:**

### 1. Update .env
```env
POSTGRES_USER=writer
POSTGRES_PASSWORD=YOUR_VERY_STRONG_PASSWORD_HERE
MCP_API_KEY=YOUR_GENERATED_API_KEY_64_CHARS
```

### 2. Update docker-compose.mcp.yml
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  # Remove ports section entirely

mcp-author:
  environment:
    DATABASE_URL: postgresql://writer:${POSTGRES_PASSWORD}@postgres:5432/book_series_db?sslmode=prefer
    MCP_API_KEY: ${MCP_API_KEY}
  ports:
    - "127.0.0.1:3501:3501"  # Localhost only
```

### 3. Set up VPN
- Use Tailscale/WireGuard
- Access only through VPN

### 4. Enable firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw deny 3501:3512/tcp
sudo ufw deny 5432/tcp
```

**This gives BASIC security. For production, implement ALL recommendations above.**

---

## For Students: What Should I Know?

### If Your Instructor Deploys This Remotely

**Ask these questions:**
1. Is my data encrypted in transit? (HTTPS?)
2. Who has access to the database?
3. Are credentials shared or unique per student?
4. Is there API rate limiting?
5. What happens to my data after the course?

### Best Practice for Students

**Recommended:** Run locally on your own laptop
- ✅ Complete control
- ✅ Privacy
- ✅ No network security concerns
- ✅ Works offline

**If using remote deployment:**
- ✅ Use VPN if provided
- ✅ Never share your API keys
- ✅ Use strong passwords
- ✅ Log out when done
- ✅ Don't store sensitive data in your writing

---

## Summary

### Local Deployment (Default)
- ✅ Secure by default
- ✅ No changes needed
- ✅ Perfect for learning

### Remote Deployment
- ⚠️ Requires ALL security changes
- ⚠️ Strong passwords mandatory
- ⚠️ Encryption required
- ⚠️ Authentication required
- ⚠️ VPN recommended
- ⚠️ Firewall essential
- ⚠️ Regular security audits

**If in doubt: Run locally!**

This tutorial is designed for local development and learning. Remote deployment should only be done by experienced administrators who understand the security implications.

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Let's Encrypt for HTTPS](https://letsencrypt.org/)
- [Tailscale VPN](https://tailscale.com/)

---

**Remember: Security is not optional for remote deployments!**
