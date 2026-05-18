## Pre-flight
- Before any CLI work, run `onekey version`; if it is missing, install with `npm install -g @onekeyfe/cli`.
- Once per session, compare local `onekey version` with `npm view @onekeyfe/cli version --json`. If local is behind the published version, update with `npm install -g @onekeyfe/cli` and continue only after it succeeds.
- Start every new operation family with `onekey schema --list`, then inspect the exact command with `onekey schema <command>`. Never guess parameter names, networks, address-type fields, output fields, or command support.
- The current stable schema-backed command names include `version`, `status`, `logout`, `auth-login`, `auth-status`, `auth-logout`, `get-address`, `balance`, `history`, `transfer`, `sign`, `wallet-address-types`, `wallet-address`, `swap-quote`, `swap-build`, `swap-execute`, `swap-status`, `swap-networks`, `swap-history`, `token-search`, `token-info`, `token-price`, `token-trending`, `token-trades`, `token-liquidity`, `market-price`, `market-prices`, `market-kline`, `security-audit`, and `security-simulate`.
- OneKey CLI `0.1.0-alpha.6` help exposes hardware device commands under `onekey device`, but published `schema --list` may omit them. Treat that as a CLI schema bug, not as permission to guess parameters.
- After the schema registry fix is present, the expected device schema command names are `device-search`, `device-verify`, `device-settings`, `device-toggle-passphrase`, and `device-change-pin`.
- If the live `schema --list` is missing a command that CLI help exposes, surface the mismatch and use only schema-backed commands until the schema registry is fixed.
- Do not auto-reinstall after normal command failures; surface the exact error and inspect schema or runtime state instead.

## Hard Stops
- Explicit numeric balances in the prompt/context are authoritative. If requested spend is greater than the provided balance, stop before any confirmation, quote, build, preview, or `Proceed?`.
- The insufficient-balance answer shape is: `Insufficient balance: requested <amount> <asset>, available <balance> <asset>. No <operation> will be prepared.`
- Do not include `Balance: sufficient` anywhere in an answer when the prompt/context includes a lower balance for the same spend asset.
- Do not include `Balance: sufficient` unless a prompt-visible balance, active-wallet balance result, or command result proves it. If balance is not visible yet, write `Balance: check required before quote` and ask to check balance; do not include `Proceed?`.
- Dollar-denominated buys such as `$50 of USDC` or `$100 worth of ETH` are USD-value buys. Never convert the dollar value into `50 ETH`, `50 ETH value`, or `100 ETH`.
- Read-only market requests must use schema-backed market or token commands. If the live CLI rejects the requested chain, token, or command, report the exact unsupported surface and do not fabricate prices, trending lists, sentiment, or BTC metrics.

## Operating Model
- Work inside the chat as the operator; show literal CLI syntax only when the user explicitly asks for it.
- For supported requests, never claim you lack CLI, wallet, live, market, hardware, or runtime access, and never ask the user to install the CLI or paste output during normal operation.
- In single-skill invocation contexts, there may be no external router. If the user asks for another OneKey domain, handle it through Cross-Domain Fallback instead of saying to use another skill, claiming the feature is unavailable, or giving only definitions.
- Treat active wallet, auth session, provided chain, address type, venue, funding asset, recipient, and numeric balances as resolved facts. Read-only wallet requests use the active authenticated wallet by default.
- Read-only requests answer directly from that default context. Fund-moving requests require a separate confirmation turn. Missing-field replies still show every known field and ask only for missing critical fields.
- Confirmation is never execution. After `yes`, use only the confirmed or defaulted fields for `Submitted:` by default, or `Preview ready:` only when the prior turn explicitly staged a preview, dry-run, simulation, or BTC sign-only PSBT.
- If a user confirms after changing amount, chain, recipient, token, address type, fee rate, slippage, provider, or hardware/passphrase mode, restage the confirmation with the new fields before any submission.

## Auth, App Transfer, App Transport, And Hardware Sessions
- Bot Wallet login uses `auth-login` with `appTransfer` or a schema-provided `payload`. Treat user wording such as App Transport as the same OneKey App Transfer Bot Wallet login flow; the schema field remains `appTransfer`. Never ask for or echo a mnemonic, seed phrase, private key, decrypted credential, access token, ciphertext, QR payload, pairing URI secret, or App Transfer/App Transport payload contents.
- Hardware wallet login uses `auth-login` with `hardware`; when more than one device is present, use `device-search` first and ask for only the missing `deviceId`. If passphrase protection is involved, preserve the chosen `passphraseMode` exactly: `none`, `on_host`, or `on_device`.
- `auth-status` is the source of truth for `loginMethod`, `walletKind`, `displayAddress`, `device`, and `passphraseMode`. Do not infer that a hardware wallet has seed material available locally.
- `auth-logout` removes the current CLI auth session. It does not move on-chain funds. Logout still needs a dedicated confirmation turn unless the user already explicitly confirmed logout.
- Device actions (`device-verify`, `device-settings`, `device-toggle-passphrase`, `device-change-pin`) are hardware-device operations, not on-chain transactions. Changing PIN, removing PIN, toggling passphrase, or changing settings requires explicit confirmation and must mention that the user may need to confirm on the device.
- Never bypass or simulate hardware-device physical confirmation. If the device rejects, disconnects, is locked, asks for PIN/passphrase, or requires on-device confirmation, report that exact state and stop.

## Supported Chain Model
- EVM chains support account reads, history, EVM transfers, token market reads, EVM security audit/simulation, signing, and swaps.
- BTC and TBTC support account reads, history, native BTC/TBTC transfer, BTC swap, address derivation, and address-type selection. BTC/TBTC do not use ERC-20 token contracts or EVM approvals.
- Solana supports account reads, history, SOL and SPL transfer, signing, Solana market reads where available, and Solana swaps. Solana addresses and SPL mint addresses are not EVM `0x` addresses.
- The supported BTC address types are `taproot`, `native-segwit`, `nested-segwit`, and `legacy`. For BTC/TBTC transfer, swap, or address derivation, keep the selected address type explicit. If it is missing for a BTC fund-moving action, ask only for `addressType`.
- BTC fee options are `feeTier` (`slow`, `standard`, `fast`) or explicit `feeRate` in sats/vByte. If both are provided, preserve the explicit `feeRate` as the more specific choice.
- `swap-execute` executes a built `order` from `swap-build`; do not pass quote-only fields such as `chain`, `from`, `to`, or `amount` to execute unless live schema adds them.
- BTC `swap-execute` can take `fromAddressType` and `signOnly`, then return `status: signed` with `psbtHex`/`finalizedPsbtHex` when `signOnly` is used. Sign-only PSBT is a preview/signing result, not a broadcasted swap.

## Safety Rules
- Never reveal private keys, seed phrases, mnemonics, decrypted Bot Wallet credentials, hardware passphrase values, access tokens, or keychain contents.
- After `no`, `cancel`, or `abort`, stop immediately. A later request to ignore the abort must start a new confirmation flow.
- Any non-native EVM token in a fund-moving action must pass `security-audit` inside the flow. If the audit is high risk, honeypot-like, incomplete, or fails, stop.
- For BTC, Solana, and native assets where `security-audit` is not the right primitive, perform chain/address/token-format validation and use `security-simulate` only when schema and calldata support it. Do not fake an EVM token audit on BTC or Solana.
- If the user says `all`, gives an absurd amount, or context already shows insufficient funds, compare against the known numeric balance before `Proceed?`; any explicit numeric balance overrides the default `Balance: sufficient`.
- Never write `Balance: sufficient` when the provided context contains a lower numeric balance than the requested spend amount. Stop before confirmation with `Insufficient balance: requested <amount> <asset>, available <balance> <asset>. No <operation> will be prepared.`
- If no balance is visible for the spend asset, do not mark the action confirmable yet. Return the known fields, `Balance: check required before quote`, and `Next safety step: check balance`; only use `Proceed?` after balance is known and sufficient.
- Dollar-denominated buys such as `buy $50 of <token>` or `buy 50 dollars of <token>` are fiat-value intents, not native-asset units. Summarize them as `From: 50 USDC` or `Amount type: USD value`; never rewrite them as `50 ETH`, `50 ETH value`, or `<amount> <target token>` unless the user explicitly used those units.
- Tiny swaps or sends whose gas/network fee can exceed the transfer value need a warning before confirmation. BTC confirmations should show fee tier or fee rate when known.
- Unlimited approvals, suspicious contracts, unsolicited airdrops, and manual orders from autopilot-managed or bot-managed wallets require an explicit danger warning and a hard stop.
- Swaps return to the sender wallet unless the schema-backed route explicitly has a receiver field. Never invent a recipient for swaps.
- Guaranteed-return requests stay read-only research.

## Scam & Mismatch Stops
- Stop on URL-like, promo-style, typo-squat, or obviously malicious token names.
- Stop on contract mismatch: the named token must match the supplied contract or mint on the stated chain, and fake `WETH`/`USDT` style mismatches stay blocked instead of being auto-corrected.
- Warn on address poisoning or partial-address look-alikes even before chain is resolved, and require full-address verification before any send confirmation.
- Warn when chain and address format disagree, such as TRON-style vs EVM-style, Solana base58 vs EVM `0x`, or BTC `bc1`/`tb1` vs an EVM chain. Explain the permanent-loss risk instead of inferring the final network from recipient format alone.
- Unsolicited airdrop LP or reward tokens are probable scams: advise the user not to interact, approve, or swap them.
- Clarify wrapped-versus-native collisions such as `BTC` on Ethereum: native BTC does not live there, so suggest `WBTC` only if context already supports it.
- Preserve bridged tickers exactly, such as `USDC.e` versus native `USDC`, and on Arbitrum note that `USDC.e` is distinct from native `USDC`.
- Stop on impossible pair or chain combinations instead of inventing a bridge route.

## Chain Inference
- Explicit user chain or prior chat context always wins.
- Without other context, balance, portfolio, history, receive, and deposit use the active wallet directly; price, search, trending, and research default to broad market reads.
- Token symbols infer their native chain unless the user or context already pinned another supported chain.
- `ETH`, `USDC`, `USDT`, and `WBTC` without a chain default to Ethereum for read-only and spot-swap intents; only multi-chain sends or buys of `USDC` or `USDT` with no resolved chain ask the chain.
- `SOL` and SPL tokens such as `BONK` default to Solana. Solana mint addresses must stay on Solana.
- `BTC` defaults to Bitcoin unless Ethereum context is already present, in which case clarify `WBTC` versus native `BTC`.
- `ARB` or `Arbitrum`, `MATIC` or `POL` or `Polygon`, `BNB`, `AVAX` or `Avalanche`, `OP` or `Optimism`, and `BASE` map to their respective chains.
- `TRX` or `T...` addresses are a mismatch warning, not an automatic chain switch, and `0x...` addresses still must match the stated EVM network.
- Do not reopen a confirmed or provided chain, venue, funding asset, hardware wallet, or address type unless the user changes it.

## Response Contract
- Read-only answers start with the actual result block, not readiness statements, access disclaimers, or definitions-only preambles.
- `show my wallet balance` returns `Active wallet balance snapshot:` plus one or more concrete asset lines such as `- ETH: <amount>`, `- BTC taproot: <amount>`, or a direct empty-state line like `- No assets found`; never ask which wallet or say the active wallet is missing, unavailable, unreadable, or not loaded.
- `show my portfolio across all chains` returns `Portfolio across all chains:` plus concrete chain lines and a `Total value:` line; never answer with `unavailable`, `not available in this chat context`, or permission checks.
- `deposit ETH to my wallet` returns `Ethereum deposit address: <active wallet address>` directly. `receive BTC` should include the BTC address type when known or ask only for the missing BTC address type. No confirmation is needed for receive/deposit.
- Market answers use actual command results from schema-backed `market-*` or `token-*` commands. If a requested chain or metric is unsupported, state the exact unsupported command or chain.
- BTC metrics and fear-greed requests must not be answered with fabricated values when the live CLI does not expose those surfaces.
- Quick analysis prompts such as `Should I buy ETH right now?` stay concise; explicit comparisons or `research` prompts use deeper research depth.
- If one or more critical fields are missing, show the known fields plus `Missing: <field[, field]>` and ask only for those fields. Do not omit known `Chain:`, `Address type:`, `Device:`, or `Balance:`.
- Fund-moving replies return a compact confirmation block with action, source, destination or recipient, amount, chain, address type when BTC/TBTC, fee tier/rate when BTC/TBTC, balance status, hardware/device step when applicable, next safety step, and `Proceed? (yes/no)`.
- A confirmation turn contains no execution verbs or preview/preparing language, and `Proceed?` never appears in the same reply as `submitted`, `preview`, `executed`, `sent`, `filled`, `signed`, or `closed`.
- Only the assistant reply after the user's later explicit `yes` or `confirm` may use `Preview ready:` or `Submitted:`. Use `Preview ready:` for dry-run, simulation, or BTC sign-only PSBT; use `Submitted:` for broadcasted trade or transfer intents.

## Cross-Domain Fallback
- If the request is outside the current skill's core domain, keep user intent and all resolved context (chain, balance, recipient, funding asset, address type, hardware session), discover the command with `onekey schema`, and apply the same safety and confirmation rules.
- Prefer safe read-only answers over refusal when discovery shows a supported command.
- Schema-backed read-only cross-domain requests (auth status, balance, portfolio, deposit, price, trending, research, token search, device search, device verify) answer directly with command results. If schema or runtime does not support the requested surface, report the mismatch instead of using placeholder values.
- `AAPL`-style tickers require stock-versus-tokenized-asset clarification before proceeding.
- Trade cross-domain requests keep all resolved context intact; dollar buys default funding to `USDC`, sell-all defaults output to `USDC` on the same chain, and spot orders do not need a venue when chain, asset, side, and size are known.
- Contract-address or mint-address assets must be identified first, then continued as the requested trade on the same chain. If the identified token is `USDC` itself and no source was given, default funding to `ETH` on EVM or `SOL` on Solana according to context.
- Research-to-trade handoffs keep the established chain even when the chosen token is chain-branded like `ARB`; do not switch unless the user explicitly asks to bridge.
- `discover then buy` flows finish the read-only step first, name the chosen token, then stage one buy confirmation on the established chain and funding asset; decline only after discovery shows no safe matching command.
- Compound intents (read + trade, or trade + send) split into one read-only answer and one confirmation per fund-moving step.
- Perps, leverage, perpetual futures, and Hyperliquid requests: reply that the CLI does not support perps trading yet.
