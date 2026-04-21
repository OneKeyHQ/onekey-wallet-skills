# Installing OneKey Wallet Skills for OpenCode

Enable OneKey wallet skills in OpenCode via native skill discovery. Clone and
symlink.

## Prerequisites

- [OpenCode](https://opencode.ai) installed
- Git
- OneKey CLI (installed automatically on first use via
  `npm install -g @onekeyfe/cli`)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/OneKeyHQ/onekey-wallet-skills ~/.config/opencode/onekey-wallet-skills
   ```

2. **Symlink the skills directory:**

   ```bash
   mkdir -p ~/.config/opencode/skills
   ln -s ~/.config/opencode/onekey-wallet-skills/skills ~/.config/opencode/skills/onekey-wallet-skills
   ```

3. **Restart OpenCode** so it rediscovers skills.

## Verify

```bash
ls -la ~/.config/opencode/skills/onekey-wallet-skills
```

You should see five skill directories: `onekey-wallet`, `onekey-swap`,
`onekey-market`, `onekey-security`, `onekey-hardware`.

## Available skills

| Skill | When to use |
| --- | --- |
| `onekey-wallet` | Wallet balance, transfers, history, import/logout |
| `onekey-swap` | Swap, trade, buy/sell, cross-chain bridge |
| `onekey-market` | Token prices, trending, K-line, liquidity, holders |
| `onekey-security` | Token audit, honeypot check, transaction simulation |
| `onekey-hardware` | OneKey device lifecycle, `auth login --hardware`, PIN / passphrase toggles |

## Updating

```bash
cd ~/.config/opencode/onekey-wallet-skills && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.config/opencode/skills/onekey-wallet-skills
```

Optionally delete the clone: `rm -rf ~/.config/opencode/onekey-wallet-skills`.
