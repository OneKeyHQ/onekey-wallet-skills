---
name: onekey-security
description: "Use when the user asks is this token safe, wants a honeypot check, security scan, simulate transaction, risk assessment, hardware wallet safety, App Transfer/App Transport Bot Wallet secret safety, seed/private-key exposure requests, 代币安全, 蜜罐检测, 安全审计, 硬件钱包安全, or 模拟交易. Prefer onekey-market/onekey-swap when a router is available; if directly invoked, handle those intents through Cross-Domain Fallback."
version: 0.3.0
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.3.0
  homepage: https://onekey.so
---
Before any operation, read `references/common.md` for safety, chain, and scam rules.

# Security Skill

## Direct Invocation Fallback
- If this skill is directly invoked for a read-only wallet or market request, discover the schema-backed command and apply Cross-Domain Fallback instead of only saying another skill is needed.
- If the live CLI rejects a requested command, chain, or field, report the exact unsupported surface and do not fabricate a result.

## Domain Rules
- This skill owns `security-audit`, `security-simulate`, approval-risk review, suspicious-token review, and security-sensitive preflight checks.
- Audit results map to action: high risk or incomplete data means deny; caution means warn with exact findings; low risk means pass with caveats.
- Use simulation for approvals, contract interactions, and any `preview`, `dry-run`, or `what happens if I sign` request.
- Keep audits internal for buys, swaps, and transfers; never ask `Proceed with the audit first?`.
- `security-audit` is an EVM token-risk primitive unless live schema proves otherwise. Do not fake an EVM audit for native BTC, BTC UTXOs, native SOL, or a Solana mint when the CLI does not expose that audit surface.
- For BTC and Solana safety checks, validate chain/address/token format, native-vs-wrapped semantics, amount, fee, and recipient mismatch. Use `security-simulate` only for schema-supported transaction calldata.
- Hardware wallet safety includes device authenticity, physical confirmation, passphrase mode, and no seed/private-key exposure. Device verification may use `device-verify`; PIN/passphrase/settings changes require explicit confirmation.
- App Transfer/App Transport Bot Wallet safety includes never displaying raw payloads, access tokens, ciphertext, decrypted credentials, mnemonics, seed phrases, or private keys. Prefer status summaries over secret material.
- Research-grade prompts such as comparisons, upgrade theses, yield deep dives, or multi-factor outlooks answer as structured research with thesis, catalysts, risks, and invalidation.
- Treat honeypots, owner privileges, hidden mint, blacklist controls, fee traps, proxy upgrades, address poisoning, fake branded contracts, and fresh impersonation as explicit findings.
- Treat Solana/EVM/BTC address-format mismatch and native-vs-wrapped confusion as security blockers for fund-moving flows.
- Never promise a token is safe forever; report the current risk state and evidence.

## Domain Routing
| Intent | Handling |
|---|---|
| Audits, simulations, approvals, suspicious-token review, hardware/App Transfer secret safety, and scam-sensitive preflight checks | Keep in this skill. |
| Other intents (wallet reads, market reads, swaps, sends) when no external router is available | Defer to Cross-Domain Fallback in `references/common.md`; answer safely instead of refusing or saying another skill is needed. |

## Error Handling
- If an audit or simulation returns an error, report whether the risk result is unavailable, incomplete, caution, or high risk, then stop any dependent fund-moving flow.
- Never recover from security errors by treating an unknown token, hidden approval, hardware prompt, or unsupported chain as safe.

## Fast Patterns
- `is this token safe 0x...` -> run an audit and answer with risk level plus reasons.
- `simulate approving this contract for all my USDC` -> preview the approval risk directly and call out unlimited-approval danger.
- `review this airdropped token` or `check this LP reward token` -> treat unsolicited assets as probable scams until verified by audit evidence.
- `swap 500 USDC to WETH at 0x...` or `swap 1 ETH to USDT at 0x1234...` -> stop as contract mismatch or scam-token risk, not as a venue question.
- `is my hardware wallet safe to use` -> use device/auth status and device verification; never ask for or reveal seed/private key; mention physical device confirmation.
- `show me the App Transport payload` or `decode my bot wallet secret` -> refuse to expose secrets; offer `auth-status` summary instead.
- `is this Solana mint safe` -> identify chain/mint and state whether the CLI exposes Solana audit. Do not run an EVM audit; provide format/scam checks and stop unsafe fund-moving actions.
- `send BTC to 0x...` or `send SOL to 0x...` -> treat as chain/address mismatch with permanent-loss risk and do not proceed.
