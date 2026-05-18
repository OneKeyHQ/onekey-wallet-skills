# onekey-wallet-skills

OneKey wallet skills for AI coding assistants. Four skills covering wallet
operations, App Transfer/App Transport Bot Wallet login, hardware wallet sessions, BTC and
Solana support, swap execution, market research, and security auditing,
designed to work across Claude Code, Cursor, Codex, OpenCode, and OpenClaw.

## Skills

| Skill | Path | Purpose |
| --- | --- | --- |
| `onekey-wallet` | `skills/onekey-wallet/` | Auth, App Transfer/App Transport, hardware wallet, balances, BTC/SOL transfers, history, receive/logout |
| `onekey-swap` | `skills/onekey-swap/` | Swap quotes, execution, BTC/SOL swaps, BTC sign-only PSBT, cross-chain bridges, swap status |
| `onekey-market` | `skills/onekey-market/` | Token prices, trending, K-line, liquidity, holders, BTC metrics, Solana token research |
| `onekey-security` | `skills/onekey-security/` | Token audit, transaction simulation, approval risk, hardware/App Transfer/App Transport secret safety |

`AGENTS.md` carries the canonical skill routing table and CLI interface
discovery rules. `CLAUDE.md` is the Claude Code-specific entry point.
Maintenance rules are in `CONTRIBUTING.md`.

## Prerequisites

All skills call the `onekey` CLI (npm package `@onekeyfe/cli`). The skill's
`references/common.md` pre-flight section auto-installs it on first use via
`npm install -g @onekeyfe/cli`, so end users do not have to install the CLI
separately. Agents must use `onekey schema --list` and `onekey schema <cmd>`
before choosing parameters; schema-backed capabilities include auth, BTC
address types, Solana/SPL transfers, swaps, market reads, and security checks.
If CLI help exposes hardware-device commands but `schema --list` omits them,
treat that as a CLI schema bug and do not guess device parameters.

## Installation

### Claude Code

```text
/plugin marketplace add OneKeyHQ/onekey-wallet-skills
/plugin install onekey-wallet-skills
```

### Cursor

Clone the repo and point Cursor at the plugin directory, or follow Cursor's
plugin install flow using `.cursor-plugin/plugin.json`:

```bash
git clone https://github.com/OneKeyHQ/onekey-wallet-skills
```

### Codex CLI

Tell Codex:

```text
Fetch and follow instructions from https://raw.githubusercontent.com/OneKeyHQ/onekey-wallet-skills/main/.codex/INSTALL.md
```

### OpenCode

Tell OpenCode:

```text
Fetch and follow instructions from https://raw.githubusercontent.com/OneKeyHQ/onekey-wallet-skills/main/.opencode/INSTALL.md
```

### OpenClaw

Tell OpenClaw:

```text
Fetch and follow instructions from https://raw.githubusercontent.com/OneKeyHQ/onekey-wallet-skills/main/.openclaw/INSTALL.md
```

## Learn more

- OneKey website: <https://onekey.so>
- CLI package: <https://www.npmjs.com/package/@onekeyfe/cli>
