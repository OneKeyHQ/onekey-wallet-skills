# OneKey Wallet — Agent Skills

Skill collection for AI coding assistants operating the OneKey wallet CLI.
Five skills cover wallet operations, swap execution, market research,
security auditing, and hardware-device management.

## Available skills

| Skill | Purpose | When to use |
| --- | --- | --- |
| `onekey-wallet` | Wallet balances, transfers, history, import/logout | User checks balance, sends or withdraws assets, views transaction history, imports a wallet, or logs out |
| `onekey-swap` | Swap quotes, execution, bridges, swap status | User wants to swap, trade, buy, sell, convert tokens, or bridge cross-chain |
| `onekey-market` | Token prices, trending, K-line, liquidity, holders, research | User asks for token prices, trending tokens, search, K-line, liquidity, holders, or market research |
| `onekey-security` | Token audits, transaction simulation, risk review | User asks for honeypot check, token audit, approval safety, or transaction simulation |
| `onekey-hardware` | Hardware device lifecycle, `auth login --hardware`, PIN/passphrase toggles | User wants to connect or verify a OneKey device, change PIN, enable hidden wallets, check firmware, or log in with hardware |

Each skill's `SKILL.md` defines domain rules, safety gates, and fast patterns.
Each skill's `references/common.md` carries shared pre-flight, safety,
scam-stop, chain-inference, and response-contract rules.

## Interface discovery

The `onekey` CLI is self-describing via JSON Schema — never guess parameters:

- `onekey schema --list` — list all available commands.
- `onekey schema <cmd>` — JSON Schema for a command's input and output.
- `onekey schema --all` — full command registry.
- `onekey <cmd> --help` — command-specific usage help.

## Quick start

```bash
onekey <command>
```

If the binary is missing, the skill's `references/common.md` explains how to
install via `npm install -g @onekeyfe/cli`.

## Repository conventions

Authoring and CI rules for maintainers live in `CONTRIBUTING.md`. Platform
install instructions live in `README.md` and the per-platform directories
(`.claude-plugin/`, `.cursor-plugin/`, `.opencode/`, `.codex/`, `.openclaw/`).
