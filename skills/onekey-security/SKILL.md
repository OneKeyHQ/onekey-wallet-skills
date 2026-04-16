---
name: onekey-security
description: "Use when the user asks is this token safe, wants a honeypot check, security scan, simulate transaction, risk assessment, 代币安全, 蜜罐检测, 安全审计, or 模拟交易. Do NOT use for token prices — use onekey-market. Do NOT use for swap execution — use onekey-swap."
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.2.0
  homepage: https://onekey.so
---

# Security Skill

## Pre-flight
1. `onekey version` - if not installed -> `npm i -g @onekeyfe/cli`
2. `npm view @onekeyfe/cli version` - if not latest -> `npm update -g @onekeyfe/cli`

## Interface Discovery
- Run `onekey schema <cmd>` for exact input/output JSON Schema
- Run `onekey schema --list` for all available commands
- Run `onekey schema --all` for the full command registry
- Run `onekey <cmd> --help` for human-readable usage

## Commands
- `security audit` - token risk assessment (returns `overallRisk: high | caution | low`)
- `security simulate` - preview transaction effects before signing

## Security Rules - ABSOLUTE
- NEVER output private keys, seeds, or mnemonics
- Fail-safe principle: if the audit fails for any reason, treat it as DENY
- Native tokens like ETH, BNB, and MATIC are inherently safe and can skip audit

## Risk Classification -> Agent Action
| overallRisk | Action |
| --- | --- |
| `high` | DENY the operation. Do not proceed. |
| `caution` | WARN with the specific `cautionItems`. Proceed only with explicit confirmation. |
| `low` | Proceed normally. |
| audit fails/errors | DENY using the fail-safe rule. |

## Domain Knowledge
- `security audit` checks honeypot detection, ownership renounced, mint authority, blacklist functions, tax rates, and proxy contracts
- `security simulate` previews balance changes, approvals, and contract interactions without broadcasting
- Always audit before any fund-moving operation like transfer or swap build/execute; use onekey-swap for the actual swap execution flow
- If the user is primarily asking for token prices, trending data, or research, use onekey-market instead of this skill
