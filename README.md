# onekey-wallet-skills

OneKey wallet skills for AI coding assistants. Four skills covering wallet
operations, swap execution, market research, and security auditing, designed
to work across Claude Code, Cursor, Codex, OpenCode, and OpenClaw.

## Skills

| Skill | Path | Purpose |
| --- | --- | --- |
| `onekey-wallet` | `skills/onekey-wallet/` | Wallet balances, transfers, history, import/logout |
| `onekey-swap` | `skills/onekey-swap/` | Swap quotes, execution, cross-chain bridges, swap status |
| `onekey-market` | `skills/onekey-market/` | Token prices, trending, K-line, liquidity, holders, research |
| `onekey-security` | `skills/onekey-security/` | Token audit, honeypot check, transaction simulation |

`AGENTS.md` carries the canonical skill routing table and CLI interface
discovery rules. `CLAUDE.md` is the Claude Code-specific entry point.
Maintenance rules are in `CONTRIBUTING.md`.

## Prerequisites

All skills call the `onekey` CLI (npm package `@onekeyfe/cli`). The skill's
`references/common.md` pre-flight section auto-installs it on first use via
`npm install -g @onekeyfe/cli`, so end users do not have to install the CLI
separately.

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
