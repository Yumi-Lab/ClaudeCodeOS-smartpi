# ClaudeCodeOS-smartpi

**Pre-built Armbian image for SmartPi One with Claude Code CLI and Claude Code Board service pre-installed.**

Flash to SD card, boot, and start coding with Claude directly from your embedded device. Includes both the CLI for terminal access and a web-based API server for integrations.

[![GitHub Release](https://img.shields.io/github/v/release/Yumi-Lab/ClaudeCodeOS-smartpi?include_prereleases)](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/releases)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Yumi-Lab/ClaudeCodeOS-smartpi/BuildImages.yml)](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/actions)

## ✨ Features

### Claude Integration
- **Claude Code CLI** — Full command-line access to Claude Code
- **Claude Code Board** — OpenAI-compatible API server for programmatic access
- **JWT Authentication** — Secure API access with admin credentials
- **Web UI** — Optional dashboard for managing sessions and API keys

### System Optimization
- **Node.js 20 LTS** — Pre-installed and verified for armhf (32-bit ARM)
- **1 GB RAM Optimized** — Swap configuration, kernel tuning, memory limits
- **Systemd Services** — `claude-code-board` auto-starts on boot
- **SSH Hardened** — Non-interactive first-login, password authentication

### Base System
- **Debian 13 Trixie** — Latest stable Debian release
- **SmartPi-armbian** — Lightweight, optimized for AllWinner H3 SoCs
- **Custom Modules** — Modular installation via CustomPiOS

---

## 🚀 Quick Start

### 1. Download & Flash

```bash
# Download latest image
wget https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/releases/download/latest/smartpi-claudecode.img.xz

# Flash to SD card (adjust /dev/sdX to your device)
xzcat smartpi-claudecode.img.xz | sudo dd of=/dev/sdX bs=4M && sync

# Or use Balena Etcher (GUI)
# https://www.balena.io/etcher/
```

### 2. Boot & Connect

```bash
# Wait ~30 seconds for boot
ssh pi@smartpi.local  # or use IP address
# Password: yumi
```

### 3. Start Coding with Claude

#### Via CLI
```bash
# Authenticate on first run (opens browser)
claude

# Or use directly with environment variable
ANTHROPIC_API_KEY=sk-... claude <command>
```

#### Via API (Claude Code Board)
```bash
# Service is running on port 8905
curl -X POST http://localhost:8905/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Get session info
curl http://localhost:8905/api/sessions/list \
  -H "Authorization: Bearer <token>"
```

---

## 📋 Hardware Requirements

| Component | Specification | Notes |
|-----------|---------------|-------|
| **Board** | SmartPi One | AllWinner H3 (ARM Cortex-A7) |
| **CPU** | Quad-core ARMv7 | 1.2 GHz |
| **RAM** | 1 GB DDR3 | Sufficient with 512MB swap |
| **Storage** | 16 GB+ SD Card | Class 10 recommended for better I/O |
| **Network** | Ethernet or WiFi | Wired preferred for reliability |
| **Power** | 5V/2A USB | USB-C or barrel jack depending on board revision |

**Tested on:**
- SmartPi One (original and updated variants)
- Debian 13 Trixie (armhf)
- Node.js 20.19.2

---

## 🛠️ System Architecture

### Layer Model

```
┌─────────────────────────────────────────────────────────┐
│ ClaudeCodeOS-smartpi (This Project)                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Modules: claudecode, board, armbian, ...            │ │
│ │ Services: claude-code-board.service                 │ │
│ │ Configuration: /etc/default/claude-code-board       │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ SmartPi-armbian (Armbian Customization)                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Armbian build, u-boot, kernel, base system         │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Base: Debian 13 Trixie (armhf)                          │
└─────────────────────────────────────────────────────────┘
```

### Build System

Uses **CustomPiOS-Yumi** for modular OS composition:
- Each feature (Claude Code CLI, Board service, etc.) is a separate **module**
- Modules are applied in sequence during image build
- Enables easy updates and feature toggling without full rebuilds

---

## 📦 Services & Configuration

### Claude Code Board Service

**Service file:** `/etc/systemd/system/claude-code-board.service`

```bash
# Check status
systemctl status claude-code-board

# View logs
journalctl -u claude-code-board -f

# Restart service
sudo systemctl restart claude-code-board
```

**Configuration:** `/etc/default/claude-code-board`

```bash
# API server settings
PORT=8905
NODE_ENV=production
DATA_DIR=/root/.local/share/claude-code-board

# Default admin credentials (change on first access!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Authenticate and get JWT token |
| `/api/sessions/create` | POST | Create new Claude Code session |
| `/api/sessions/list` | GET | List all sessions |
| `/api/sessions/{id}` | GET | Get session details |
| `/health` | GET | Health check |

See [Claude Code Board Documentation](https://github.com/Yumi-Lab/Claude-Code-Board) for complete API reference.

---

## 🔐 Security & Credentials

### Default Credentials

| Component | Username | Password | Notes |
|-----------|----------|----------|-------|
| **SSH** | `pi` | `yumi` | Change immediately after first login |
| **Claude Code Board** | `admin` | `admin` | Change via API after authentication |

### Security Best Practices

```bash
# 1. Change SSH password immediately
ssh pi@smartpi.local
passwd  # Enter new password

# 2. Disable SSH password auth (use keys instead)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# 3. Change Claude Code Board admin credentials
curl -X POST http://localhost:8905/api/auth/change-password \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"<secure_password>"}'

# 4. Enable HTTPS/TLS (set reverse proxy like nginx)
# See: Deployment section below
```

### Network Isolation

- Claude Code Board listens on **localhost:8905** by default
- Expose via reverse proxy (nginx/Caddy) only if needed
- Use firewall rules to restrict API access
- Enable HTTPS/TLS for any public-facing access

---

## 🏗️ Building from Source

### Prerequisites

```bash
# Ubuntu/Debian
sudo apt-get install -y \
  git curl ca-certificates \
  qemu-user-static binfmt-support \
  dosfstools fdisk parted

# macOS (requires Docker or qemu via Homebrew)
brew install qemu
```

### Build Steps

```bash
# Clone repository
git clone https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi.git
cd ClaudeCodeOS-smartpi

# Initialize submodules
git submodule update --init --recursive

# Start build (requires sudo)
cd src
sudo bash build_dist
# or for specific board
sudo bash build_dist --board smartpi1
```

**Build output:**
- `repository/pi-gen/deploy/` — Compiled `.img.xz` image
- `repository/pi-gen/deploy/` — SHA256 checksums
- Build logs in `repository/src/build.log`

**Build time:** ~30-45 minutes on modern hardware (varies by system)

### Customization

Edit `config/smartpi.conf` to:
- Add/remove modules
- Configure Node.js version
- Adjust RAM/swap settings
- Add custom packages

```bash
# Example: config/smartpi.conf
MODULES="base(udev_fix,armbian(armbian_net,yumios,claudecode,board))"
BOARD_PORT=8905
BOARD_ADMIN_PASSWORD=<secure_password>
```

---

## 📡 Deployment & Production

### Running in Docker (Development)

```bash
# Not recommended for production, but useful for testing
docker run -it -p 8905:8905 \
  -e ADMIN_PASSWORD=<secure_password> \
  yumi-lab/claudecodeos-smartpi
```

### Reverse Proxy Setup (HTTPS)

**nginx configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name board.example.com;

    ssl_certificate /etc/letsencrypt/live/board.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/board.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8905;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### System Integration

**Use systemd timer for backups:**

```bash
# Create backup timer
sudo nano /etc/systemd/system/board-backup.timer
```

```ini
[Unit]
Description=Daily backup of Claude Code Board data
Requires=board-backup.service

[Timer]
OnCalendar=daily
OnBootSec=10min
Persistent=true

[Install]
WantedBy=timers.target
```

---

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check if port 8905 is in use
sudo lsof -i :8905

# View detailed logs
sudo journalctl -u claude-code-board -n 50

# Restart service
sudo systemctl restart claude-code-board

# Verify Node.js is installed
node --version  # Should be v20.x.x
npm --version
```

### Out of Memory Errors

```bash
# Check memory usage
free -h

# Check swap status
swapon --show

# Increase swap if needed (temporary)
sudo dd if=/dev/zero of=/var/swap bs=1M count=512
sudo mkswap /var/swap
sudo swapon /var/swap
```

### SSH Connection Issues

```bash
# Reset SSH keys
sudo dpkg-reconfigure openssh-server

# Check SSH is listening
sudo netstat -tulpn | grep ssh

# Try verbose SSH
ssh -vvv pi@smartpi.local
```

### Claude Code CLI Not Found

```bash
# Verify installation
which claude

# Reinstall CLI
npm install -g @anthropic-ai/cli

# Verify Node.js
node --version  # Must be v20+
```

---

## 🤝 Contributing

### Report Issues

[Open an issue](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/issues) with:
- Error messages and logs
- Hardware configuration
- Reproduction steps

### Submit Changes

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open Pull Request

**Code style:**
- Bash scripts: Follow [ShellCheck](https://www.shellcheck.net/) standards
- Configuration: POSIX shell syntax
- Documentation: Markdown with clear examples

---

## 📚 Related Projects

| Project | Purpose |
|---------|---------|
| [Claude Code Board](https://github.com/Yumi-Lab/Claude-Code-Board) | OpenAI-compatible API server |
| [SmartPi-armbian](https://github.com/Yumi-Lab/SmartPi-armbian) | Base Armbian image for SmartPi |
| [CustomPiOS-Yumi](https://github.com/Maxime3d77/CustomPiOS-Yumi) | Modular OS build system |
| [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) | Official Claude Code documentation |

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0** — See [LICENSE](LICENSE) for details.

**Summary:** You are free to use, modify, and distribute this software under the same license terms.

---

## 🙏 Acknowledgments

- **Anthropic** — Claude Code CLI and LLM models
- **Armbian** — Lightweight Linux distributions
- **SmartPi Community** — Hardware platform
- **CustomPiOS** — Modular OS composition framework

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/discussions)
- **Organization**: [Yumi Lab](https://github.com/Yumi-Lab)

---

**Last Updated:** 2026-05-08  
**Latest Release:** [View Releases](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/releases)
