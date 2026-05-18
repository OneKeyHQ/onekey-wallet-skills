---
name: onekey-wallet
description: "Use when the user asks to log in with OneKey App Transfer/App Transport Bot Wallet or hardware wallet, check balance/assets, receive or derive BTC/Solana addresses, send/transfer BTC/SOL/tokens, view history, check wallet status, 查余额, 登录钱包, 硬件钱包, 转账, 发送, 收款, 导入钱包, or 交易记录. Prefer onekey-swap/onekey-market when a router is available; if directly invoked, handle those intents through Cross-Domain Fallback."
version: 0.3.0
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.3.0
  homepage: https://onekey.so
---
Before any operation, read `references/common.md` for safety, chain, and scam rules.

# Wallet Skill

## Direct Invocation Fallback
- If this skill is directly invoked for another OneKey domain, discover the schema-backed command and apply the same safety rules instead of only saying another skill is needed.
- If the live CLI rejects a requested command, chain, or field, report the exact unsupported surface and do not fabricate a result.

## Domain Rules
- This skill owns `auth-login`, `auth-status`, `auth-logout`, `get-address`, `balance`, `portfolio`, `history`, `deposit` or `receive`, `transfer`, `wallet-address-types`, `wallet-address`, and wallet-facing hardware device discovery.
- App Transfer Bot Wallet login is a first-class login flow; user wording such as App Transport refers to this same CLI flow. Use `auth-login` with `appTransfer` or schema-provided `payload`; never ask the user for seed phrases, private keys, decrypted credentials, access tokens, or raw App Transfer/App Transport payload secrets.
- Hardware wallet login is a first-class login flow. Use `auth-login` with `hardware`; if multiple devices are connected, use `device-search` and ask only for the missing `deviceId`; preserve `passphraseMode` exactly.
- `auth-status` answers the current session directly, including `loginMethod`, `walletKind`, `displayAddress`, `device`, and `passphraseMode` when present.
- `auth-logout` and legacy `logout` are local session lifecycle actions and need a dedicated confirmation turn. They do not move on-chain funds.
- Wallet-state reads start with the result itself and use the active wallet automatically; never ask which wallet or say the wallet, session, or live data is unavailable.
- Deposit or receive requests return the active-wallet address on the stated or inferred chain directly; no confirmation. For BTC/TBTC receive, include the selected address type or ask only for the missing address type.
- BTC/TBTC wallet reads can use `wallet-address-types`, `wallet-address`, `balance`, and `history` with `addressType`. For aggregate BTC reads, show each address type when the CLI returns per-type items.
- BTC/TBTC transfers require `addressType` (`taproot`, `native-segwit`, `nested-segwit`, or `legacy`) plus optional `feeTier`/`feeRate`. If `addressType` is missing, preserve all other fields and ask only for the BTC address type.
- Solana wallet actions support SOL and SPL token transfers. Preserve Solana base58 addresses and SPL mint addresses; never coerce them into EVM `0x` contracts.
- Transfer, send, and withdraw confirmations must show asset, amount, recipient, chain, BTC address type and fee when applicable, balance status, next safety step, and `Proceed? (yes/no)`; if context already provides the chain, keep it instead of marking it missing.
- Address-poisoning lookalikes, partial addresses, and chain-format mismatches must be warned about inside the confirmation, and a provided chain must stay in that warning block.
- Token transfers with suspicious recipients or contract-address assets still run `security-audit` inside the flow before execution.
- Device settings, PIN, passphrase toggle, and authenticity verification are hardware-device operations. They may require physical confirmation and must not be presented as on-chain transactions.
- Never echo imported secrets back to the user, including partial mnemonic recovery hints.
- Exporting a private key, seed phrase, or mnemonic is always refused.

## Domain Routing
| Intent | Handling |
|---|---|
| Auth login/status/logout, balance, portfolio, history, deposit or receive, BTC address derivation, transfer or send, hardware device discovery, and logout | Keep in this skill. |
| Other intents from wallet context, including price, research, swap, and security checks when no external router is available | Defer to Cross-Domain Fallback in `references/common.md`; answer safely instead of refusing or saying another skill is needed. |

## Error Handling
- If a CLI command returns an error, report the exact failed action, chain, and missing or invalid field, then give one concrete next step.
- Never recover from auth, hardware, chain, or address errors by guessing a different wallet, chain, address type, or recipient.

## Fast Patterns
- `show my wallet balance` or `check my balance` -> return the active-wallet balance directly; never mention missing wallet access or unavailable live data.
- `login with my OneKey App Bot Wallet using App Transport` -> use App Transfer/App Transport login, do not ask for mnemonic or private key, and show authenticated source/address after success.
- `connect my hardware wallet` -> use hardware auth; if multiple devices exist, ask only for the target device ID; preserve passphrase mode.
- `what wallet am I using` or `auth status` -> answer from `auth-status` with login method, wallet kind, display address, and device/passphrase mode if present.
- `show me my portfolio across all chains` -> return the active-wallet portfolio across all chains directly.
- `show my transaction history` -> answer directly and preserve any asset, chain, address, limit, detail, or BTC address type filter the user gave.
- `deposit ETH to my wallet` or `receive ETH` -> return `Ethereum deposit address: <active wallet address>` directly with no extra wallet question.
- `receive BTC` -> return a BTC address with the selected address type; if missing, ask only `Which BTC address type: taproot, native-segwit, nested-segwit, or legacy?`.
- `show my BTC address types` -> list `taproot`, `native-segwit`, `nested-segwit`, and `legacy` with labels/paths returned by `wallet-address-types`.
- `send 0.01 BTC to bc1...` -> confirm Bitcoin transfer with address type and fee tier/rate before sending.
- `send 0.2 SOL to <base58>` -> confirm Solana transfer directly; do not ask for an EVM chain.
- `send 10 BONK to <base58> on Solana` -> keep Solana and treat BONK as an SPL token/mint-resolved transfer.
- `send 50 USDC to 0x742d...` with Ethereum context -> confirm the Ethereum transfer directly instead of reopening the chain.
- `withdraw 100 USDC to my external wallet` with Ethereum context -> ask only for the missing recipient address.
- `send all ETH to 0x742d...` with known balance -> confirm the exact transferable balance, not just `all ETH`.
- `send all BTC from taproot with fast fee` -> compare against the taproot BTC balance and show `Address type: taproot` plus `Fee tier: fast`.
- `send 5000 USDT to TJ...` with Ethereum or EVM context -> warn about ERC20-vs-TRON mismatch risk and ask `TRC20 on TRON or ERC20 on which EVM chain?`.
- `send SOL to 0x742d...` -> warn Solana/EVM address mismatch and do not infer Ethereum.
- `send 2000 USDC to 0x742d...D19` -> warn about address poisoning and require full-address verification before any confirmation.
- `check my balance and then swap all my ETH to USDC and send it to 0xDEAD...` -> answer the balance first, then stage the swap only; the send is a second confirmation after the swap completes.
- `import a wallet from mnemonic` -> do not collect or echo the mnemonic; prefer App Transfer Bot Wallet login when available.
- `logout this wallet` -> explain the local logout side effect, remind the user that on-chain funds stay on the blockchain, and ask for confirmation.
- `export my seed phrase` -> refuse because wallet secrets cannot be revealed.
