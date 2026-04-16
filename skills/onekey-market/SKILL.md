---
name: onekey-market
description: "Use when the user asks about token price, trending tokens, search token, kline chart, candlestick data, trading volume, top holders, liquidity, token info, 代币价格, 热门代币, K线, or 搜索代币. Do NOT use for swap execution — use onekey-swap. Do NOT use for security audits — use onekey-security."
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.2.0
  homepage: https://onekey.so
---

# Market & Token Discovery Skill

## Pre-flight
1. `onekey version` - if not installed -> `npm i -g @onekeyfe/cli`
2. `npm view @onekeyfe/cli version` - if not latest -> `npm update -g @onekeyfe/cli`

## Interface Discovery
- Run `onekey schema <cmd>` for exact input/output JSON Schema
- Run `onekey schema --list` for all available commands
- Run `onekey schema --all` for the full command registry
- Run `onekey <cmd> --help` for human-readable usage

## Commands
- `token search` - search by keyword, symbol, or address
- `token info` - detailed metadata and market data
- `token price` - price with multi-timeframe changes
- `token trending` - top trending tokens
- `token trades` - buy/sell activity and volume
- `token liquidity` - top holders and distribution
- `market price` - single token price
- `market prices` - batch pricing (`chain:address` pairs)
- `market kline` - candlestick OHLCV data

## Domain Knowledge
- Kline intervals: lowercase = minutes (`1m`, `5m`, `15m`, `30m`), uppercase = hours or days (`1H`, `4H`, `1D`, `1W`)
- Token identification: pass a contract address or symbol and let the CLI resolve it via search
- Chain identifiers: use aliases (`eth`, `bsc`, `polygon`, `sol`), not `networkId` values like `evm--1`
- Price data freshness: on-chain DEX data may lag centralized exchange prices
- `market prices` uses `chain:address` format for batch queries

## Workflow: Token Research (Due Diligence)
1. `token search` - find the token
2. `token info` - check fundamentals like holders, liquidity, and supply
3. Use onekey-security to run `security audit` for risk assessment before any fund-moving step
4. `token price` - check current pricing and momentum
5. `token trades` - inspect buy/sell activity patterns
6. `token liquidity` - review concentration risk from top holders
