# OneKey Wallet — CLI Agent Skills

Use the `onekey` CLI schema output and skill files to understand the available commands.

## Interface Discovery

- `onekey schema <cmd>`: exact JSON Schema for a command's input and output.
- `onekey schema --list`: list all available commands.
- `onekey schema --all`: dump the full command registry.
- `onekey <cmd> --help`: inspect command-specific usage help.

## Skills

| Skill | Path | Use When |
| --- | --- | --- |
| `onekey-market` | `skills/onekey-market/` | Researching tokens, price action, trends, and chart data |
| `onekey-security` | `skills/onekey-security/` | Auditing token safety and reviewing transaction risk |
| `onekey-swap` | `skills/onekey-swap/` | Executing swaps, getting quotes, and following swap status |
| `onekey-wallet` | `skills/onekey-wallet/` | Checking balances, sending assets, and managing wallets |

## Authoring Conventions

- Each `skills/<name>/SKILL.md` file should start with YAML frontmatter that includes `name`, `description`, `license`, and `metadata` (`author`, `version`, `homepage`).
- Keep standalone skill docs free of monorepo-only paths like `apps/cli/...` and route cross-skill handoffs with the published `onekey-` skill names.
- Fund-moving skills should route audit prerequisites to `onekey-security`, while wallet and swap docs should route token research or pricing intents to `onekey-market`.

## Quick Start

```bash
onekey <command>
```
