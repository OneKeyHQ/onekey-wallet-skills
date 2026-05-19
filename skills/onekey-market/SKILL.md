---
name: onekey-market
description: "Use when the user asks about token price, BTC/SOL market questions, trending tokens, search token, kline chart, candlestick data, trading volume, top holders, liquidity, token info, 代币价格, 热门代币, K线, BTC 行情, SOL 行情, or 搜索代币. Do NOT use for swap execution — use onekey-swap. Do NOT use for security audits — use onekey-security. Do NOT use for wallet balances or transfers — use onekey-wallet."
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.3.0
  homepage: https://onekey.so
---
Before any operation, read `references/common.md` for safety, chain, and scam rules.

# Market Skill

## Direct Invocation Fallback
- If this skill is directly invoked for a wallet, swap, or security request, handle it through Cross-Domain Fallback instead of saying another skill is needed.
- `show my wallet balance` starts with `Active wallet balance snapshot:`.
- `deposit ETH to my wallet` starts with `Ethereum deposit address: <active wallet address>`; add `Network: Ethereum` and `Send only ETH/ERC-20 assets on Ethereum to this address.`
- Fund-moving fallback requests still require a separate confirmation turn and all safety checks.

## Domain Rules
- This skill owns token search, token info, price, trending, trades, liquidity, kline, fear-greed, BTC metrics, quick analysis, and deep market research.
- Price, trending, BTC metrics, fear-greed, kline, trades, liquidity, and token lookup are read-only and answer with the result first.
- In-scope read-only market requests use schema-backed market or token commands. If the live CLI rejects the requested chain, token, or command, report that exact unsupported surface instead of fabricating a quote.
- Single-asset price checks should use `market-price` when the requested chain/token is supported and return the actual command result.
- Price and trending answers should end with one concise next option, such as `Next: I can show kline, liquidity, recent trades, or token info.` Keep the answer read-only.
- Search by ticker, token name, or contract should identify the asset before offering follow-up detail; stock tickers like `AAPL` need stock-versus-tokenized-asset clarification.
- Multi-chain token search must preserve chain when provided. EVM contract addresses stay on the stated EVM chain; Solana mint addresses stay on Solana; BTC native market requests are broad BTC market reads, not token-contract lookups.
- `token-trending` can be broad or chain-filtered only for chains the live CLI supports. Do not silently substitute Ethereum when a requested chain is unsupported.
- `market-prices` handles multiple `chain:address` pairs; keep each pair's chain attached instead of merging same tickers across chains.
- Quick analysis should give directional bias, main catalyst, main risk, and one optional next step.
- Deep research should structure thesis, catalysts, risks, and invalidation.
- Research stays read-only; if the user adds execution, finish the analysis first, show confirmation only on the first trade turn, and allow only a later `yes` to change the status to `Submitted:` or `Preview ready:`.
- If a named token and supplied contract already disagree on the stated chain, stop with `contract mismatch`; do not reopen the chain question.
- Never convert research into guaranteed outcome claims.

## Domain Routing
| Intent | Handling |
|---|---|
| Price, discovery, charts, order-flow reads, BTC metrics, sentiment, quick ask, and deep research | Keep in this skill. |
| Other intents (wallet reads, swaps, sends, audits) when no external router is available | Defer to Cross-Domain Fallback in `references/common.md`; answer safely instead of refusing or saying another skill is needed. |

## Error Handling
- If a market lookup returns an error or no match, report the queried symbol/address/mint and chain, then ask for the missing chain or exact contract/mint only when needed.
- Never recover from market errors by silently substituting a same-ticker token on another chain.

## Fast Patterns
- `what's the BTC price` or `what's the SOL price` -> inspect schema and run a supported market command; if the chain is unsupported by the live CLI, report that exact chain support gap.
- `what tokens are trending right now` -> answer with `Route: token-trending` plus actual command results.
- `what Solana tokens are trending` -> run chain-filtered trending only if supported; otherwise report that the live CLI does not currently support Solana trending instead of defaulting to Ethereum.
- For read-only market patterns, finish with one read-only follow-up line; do not start a swap or ask for trading confirmation unless the user asks to trade in a later turn.
- `what is DOGE` or `search DOGE` -> identify Dogecoin first, then offer price, chart, liquidity, or chain-specific follow-up.
- `search BONK on Solana` -> preserve Solana and identify BONK/SPL token before offering price, trades, kline, liquidity, or swap handoff.
- `price for this Solana mint <base58>` -> treat the identifier as a Solana mint, not an EVM address.
- `compare native USDC and USDC.e on Arbitrum` -> keep them distinct and describe chain/bridge differences.
- `show ETH liquidity`, `show recent trades for PEPE`, and `show BTC 1d kline` -> return the requested market view directly.
- `what are BTC hashrate and dominance right now` -> use a schema-backed command if one exists; otherwise state that the current CLI does not expose BTC metrics.
- `what's the crypto fear and greed index` -> use a schema-backed command if one exists; otherwise state that the current CLI does not expose fear-greed data.
- `give me a quick ETH analysis right now` -> provide bias, main catalyst, main risk, and one optional next step.
- `compare ETH and SOL for the next 6 months` or deeper ETH-vs-SOL research -> treat as research, not a refusal or a quick guess.
- `what's your take on SOL right now` followed by `ok buy $300 worth` -> keep the first turn read-only, then stage a Solana `USDC -> SOL` buy using the known balance, and only a later `yes` may switch the status to `Submitted:`.
