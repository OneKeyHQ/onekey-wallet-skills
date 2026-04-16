---
name: onekey-swap
description: "Use when the user asks to swap tokens, trade ETH for USDC, buy tokens, sell tokens, exchange crypto, get a swap quote, check swap status, perform a cross-chain swap, 换币, 买币, 卖币, 兑换, 交易, or 跨链. Do NOT use for token research or prices — use onekey-market. Do NOT use for security audits — use onekey-security."
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.2.0
  homepage: https://onekey.so
---

# Swap Skill

## Pre-flight
1. `onekey version` - if not installed -> `npm i -g @onekeyfe/cli`
2. `npm view @onekeyfe/cli version` - if not latest -> `npm update -g @onekeyfe/cli`

## Interface Discovery
- Run `onekey schema <cmd>` for exact input/output JSON Schema
- Run `onekey schema --list` for all available commands
- Run `onekey schema --all` for the full command registry
- Run `onekey <cmd> --help` for human-readable usage

## Commands
- `swap quote` - get real-time quotes (read-only, NOT commitment)
- `swap build` - build unsigned tx, returns orderId
- `swap execute` - sign + broadcast built tx
- `swap status` - query order/tx status, optional `--watch` for polling
- `swap networks` - list supported chains
- `swap history` - local swap order records

## Security Rules - ABSOLUTE
- NEVER output private keys, seeds, or mnemonics in any form
- Fund-moving operations (`build`, `execute`) MUST use onekey-security to run `security audit` first
- If audit fails for ANY reason -> DENY the operation (fail-safe principle)
- Native tokens (ETH, BNB, MATIC) are inherently safe, skip audit
- `quote` and `networks` are read-only - no security check needed

## Domain Knowledge
- amount is always human-readable (0.2 USDC), never smallest unit (200000)
- CLI handles unit conversion internally - swap API receives human-readable values
- quote != commitment - prices change between quote and execution
- Cross-chain swaps use `--to-chain` parameter
- Provider sorting: `--sort` controls quote ranking strategy

## Mandatory Trade Flow
1. Check balance - ensure sufficient funds
2. Audit destination token - use onekey-security to run `security audit` (skip for native tokens)
3. Get quote - `swap quote` (read-only preview)
4. Classify risk - if `overallRisk: high` -> DENY; `caution` -> warn user
5. Confirm with user - show amount, rate, fees, slippage
6. Build unsigned tx - `swap build`
7. Sign + broadcast - `swap execute --order <orderId>`
8. Track status - `swap status --order <orderId> --watch`
