# OneKey Wallet — Agent Skills

Skill collection for AI coding assistants operating the OneKey wallet CLI.
Four skills cover wallet operations, App Transfer/App Transport Bot Wallet login, hardware
wallet sessions, BTC/Solana support, swap execution, market research, and
security auditing.

## Available skills

| Skill | Purpose | When to use |
| --- | --- | --- |
| `onekey-wallet` | Auth, App Transfer/App Transport, hardware wallet, balances, BTC/SOL transfers, history, receive/logout | User logs in with Bot Wallet App Transfer/App Transport or hardware wallet, checks balance, sends/withdraws assets, views transaction history, receives funds, derives BTC addresses, or logs out |
| `onekey-swap` | Swap quotes, execution, BTC/SOL swaps, BTC sign-only PSBT, bridges, swap status | User wants to swap, trade, buy, sell, convert tokens, sign a BTC PSBT, or bridge cross-chain |
| `onekey-market` | Token prices, trending, K-line, liquidity, holders, BTC metrics, Solana research | User asks for token prices, trending tokens, search, K-line, liquidity, holders, BTC metrics, or market research |
| `onekey-security` | Token audits, transaction simulation, risk review, hardware/App Transfer/App Transport secret safety | User asks for honeypot check, token audit, approval safety, transaction simulation, hardware safety, or credential/secret safety |

Each skill's `SKILL.md` defines domain rules, safety gates, and fast patterns.
Each skill's `references/common.md` carries shared pre-flight, safety,
scam-stop, chain-inference, and response-contract rules.

## Interface discovery

The `onekey` CLI is self-describing via JSON Schema — never guess parameters:

- `onekey schema --list` — list all available commands.
- `onekey schema <cmd>` — JSON Schema for a command's input and output.
- `onekey schema --all` — full command registry.
- `onekey <cmd> --help` — command-specific usage help.

Current schema-backed command families include core status/session commands
(`version`, `status`, `logout`), auth (`auth-login`, `auth-status`,
`auth-logout`), wallet (`balance`, `history`, `get-address`,
`wallet-address-types`, `wallet-address`, `transfer`), swap, market, token,
and security commands. OneKey CLI `0.1.0-alpha.6` help exposes hardware-device
commands under `onekey device`, but published `schema --list` may omit them; if
that happens, treat it as a CLI schema bug and do not guess device parameters.
After the registry fix is present, expected device schema names are
`device-search`, `device-verify`, `device-settings`,
`device-toggle-passphrase`, and `device-change-pin`.

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
