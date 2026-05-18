# Installing OneKey Wallet Skills for Codex

Enable OneKey wallet skills in Codex via native skill discovery. Clone and
symlink.

## Prerequisites

- Git
- OneKey CLI (installed automatically on first use via
  `npm install -g @onekeyfe/cli`)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/OneKeyHQ/onekey-wallet-skills ~/.codex/onekey-wallet-skills
   ```

2. **Symlink skills into the agent skills directory:**

   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/onekey-wallet-skills/skills ~/.agents/skills/onekey-wallet-skills
   ```

   **Windows (PowerShell):**

   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\onekey-wallet-skills" "$env:USERPROFILE\.codex\onekey-wallet-skills\skills"
   ```

3. **Restart Codex** (quit and relaunch the CLI) to discover the skills.

## Verify

```bash
ls -la ~/.agents/skills/onekey-wallet-skills
```

You should see four skill directories: `onekey-wallet`, `onekey-swap`,
`onekey-market`, `onekey-security`.

## Available skills

| Skill | When to use |
| --- | --- |
| `onekey-wallet` | Auth, App Transfer/App Transport Bot Wallet login, hardware wallet, balance, BTC/SOL transfers, history, receive/logout |
| `onekey-swap` | Swap, trade, buy/sell, BTC/SOL swap, BTC sign-only PSBT, cross-chain bridge |
| `onekey-market` | Token prices, trending, K-line, liquidity, holders, BTC metrics, Solana token research |
| `onekey-security` | Token audit, honeypot check, transaction simulation, approval risk, hardware/App Transfer/App Transport secret safety |

## Updating

```bash
cd ~/.codex/onekey-wallet-skills && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.agents/skills/onekey-wallet-skills
```

Optionally delete the clone: `rm -rf ~/.codex/onekey-wallet-skills`.
