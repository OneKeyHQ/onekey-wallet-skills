---
name: onekey-swap
description: "Use when the user asks to swap tokens, trade ETH for USDC, buy tokens, sell tokens, exchange crypto, get a swap quote, check swap status, perform a cross-chain swap or bridge, swap SOL/SPL, swap BTC/TBTC, sign a BTC PSBT, 换币, 买币, 卖币, 兑换, 交易, or 跨链. Do NOT use for token research or prices — use onekey-market. Do NOT use for security audits — use onekey-security. Do NOT use for wallet balances or transfers — use onekey-wallet."
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.3.0
  homepage: https://onekey.so
---
Before any operation, read `references/common.md` for safety, chain, and scam rules.

# Swap Skill

## Direct Invocation Fallback
- If this skill is directly invoked for a read-only wallet or market request, discover the schema-backed command and apply Cross-Domain Fallback instead of only saying another skill is needed.
- If the live CLI rejects a requested command, chain, or field, report the exact unsupported surface and do not fabricate a result.

## Domain Rules
- This skill owns `swap-quote`, `swap-build`, `swap-execute`, `swap-status`, `swap-networks`, and `swap-history`.
- `convert` is a swap alias and preserves the stated source asset, destination asset, amount, and chain.
- Standard spot flow is balance check when needed, internal `security-audit`, quote, confirmation, build, then execute.
- Never merge quote confirmation and execution into the same assistant turn.
- Cross-chain requests must preserve source chain, destination chain, and bridge intent; never silently collapse a bridge into a same-chain swap.
- Solana swaps are supported for SOL and SPL tokens. Preserve Solana chain context and SPL mint addresses; do not convert them to EVM addresses.
- BTC swaps are supported for native BTC. Preserve `fromAddressType` and `toAddressType` when provided; if a required BTC address type is missing, ask only for the missing address type.
- BTC `swap-execute` supports `signOnly`; a sign-only PSBT response is `Preview ready:` style output, not a broadcasted `Submitted:` swap.
- `swap-networks --bridge` is the discovery path for cross-chain support. Do not invent a bridge network if discovery does not list it.
- Exact-amount approvals are preferred; unlimited approvals need a separate warning and should stay separate from the trade.
- BTC and Solana swaps do not use ERC-20 approval. Do not warn about EVM allowances for BTC native or SOL native routes unless the route actually includes an EVM token approval.
- Spot limit orders are discovery-first flows that preserve side, size, price, and chain exactly.

## Domain Routing
| Intent | Handling |
|---|---|
| Spot swap, bridge, buy, sell, approval, BTC/Solana swap, BTC sign-only PSBT, and spot limit order | Keep in this skill. |
| Other intents (wallet reads, market research, audits) when no external router is available | Defer to Cross-Domain Fallback in `references/common.md`; answer safely instead of refusing or saying another skill is needed. |

## Error Handling
- If quote/build/execute returns an error, report the exact route, chain, provider/order field if known, and whether funds were not moved, only signed, or submitted.
- Never recover from swap errors by silently changing chain, source token, destination token, address type, slippage, provider, or recipient.

## Fast Patterns
- `swap 1 ETH to USDC` -> quote on the stated or inferred chain, then confirm before build and execute.
- `convert 2 SOL to USDC on Solana` -> confirm it as a Solana swap instead of reopening the route.
- `swap 0.2 SOL to BONK` -> keep Solana, resolve BONK as SPL token, quote, then confirm before build/execute.
- `swap 0.01 BTC to USDC` -> use native Bitcoin if no EVM context exists; require/preserve BTC address type before build or execute.
- `swap 0.01 BTC to USDC using taproot and sign only` -> quote/build with taproot, then after confirmation execute with sign-only and return signed PSBT details, not a broadcast hash.
- `swap BTC to USDC on Ethereum` -> clarify native BTC vs WBTC; never silently substitute WBTC.
- `buy $200 of ARB` -> default the funding asset to `USDC`; if Ethereum context already exists, keep Ethereum instead of auto-switching to Arbitrum.
- `buy $200 of PEPE` with Ethereum context -> keep Ethereum and confirm the buy instead of re-asking the chain.
- `bridge 500 USDC from Ethereum to Base` -> keep both chains explicit and confirm the bridge route.
- `bridge 500 USDC from Solana to Ethereum` -> preserve source Solana and destination Ethereum in route context, use `swap-networks --bridge` for discovery first, then quote only if a supported route is listed; otherwise report unsupported.
- `buy 1000 USDC of LINK at 0x5149... on Ethereum` -> confirm the Ethereum trade and keep the audit as an internal next safety step.
- `swap 0.5 BTC to USDC on Ethereum` -> clarify `WBTC` versus native `BTC` before quoting.
- `approve unlimited USDC spending for 0x...69` -> warn that unlimited approval is dangerous and prefer an exact-amount approval.
- `swap 500 USDC to WETH at 0x4E15...` -> stop on the WETH or contract mismatch; do not suggest a replacement route.
- `place a limit buy order for 0.5 ETH at $3000` -> treat it as a spot limit-order intent and confirm side, size, price, and chain.
- `yes, confirm the swap` after a complete swap confirmation -> respond with `Submitted:` using only the already-confirmed fields, not another preview.
