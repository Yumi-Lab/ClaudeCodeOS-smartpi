# ClaudeCodeOS-smartpi

Pre-built Armbian image for **SmartPi One** with [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) pre-installed. Flash, boot, and start coding with Claude.

## Features

- Claude Code CLI pre-installed and ready to use
- Node.js 20 LTS (armhf)
- Optimized for 1 GB RAM (swap, sysctl tuning)
- SSH hardened, zero first-login prompt
- Based on SmartPi-armbian (Debian 13 Trixie)

## Quick Start

1. **Download** the latest `.img.xz` from [Releases](https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi/releases)
2. **Flash** to SD card (16 GB+ recommended, Class 10)
3. **Boot** the SmartPi One
4. **SSH** in: `ssh pi@<IP>` (password: `yumi`)
5. **Run**: `claude`

Claude Code handles its own authentication on first run.

## Hardware Requirements

| Component | Requirement |
|-----------|-------------|
| Board | SmartPi One (AllWinner H3, Cortex-A7) |
| RAM | 1 GB DDR3 |
| Storage | 16 GB+ SD card (Class 10) |
| Network | Ethernet or WiFi |

## Build System

This project uses [CustomPiOS-Yumi](https://github.com/Maxime3d77/CustomPiOS-Yumi) for modular OS image composition.

### Architecture (3-layer model)

```
Layer 1: SmartPi-armbian (base Armbian image)
Layer 3: ClaudeCodeOS-smartpi (this project — Claude Code overlay)
```

### Build locally

```bash
# Requires: qemu-user-static, CustomPiOS dependencies
git clone https://github.com/Yumi-Lab/ClaudeCodeOS-smartpi.git
cd ClaudeCodeOS-smartpi/src
sudo bash build_dist
```

## Default Credentials

| User | Password |
|------|----------|
| pi | yumi |

Root login is disabled via SSH. Use `sudo` from the `pi` user.

## License

GPLv3 — See [LICENSE](LICENSE)
