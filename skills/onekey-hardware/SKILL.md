---
name: onekey-hardware
description: "Use when the user asks about their OneKey hardware device: connecting, verifying authenticity, checking firmware, locking, changing PIN, toggling passphrase protection, renaming the device, logging in with hardware, signing with hardware, or 硬件钱包, 连接设备, 固件, 修改PIN, 锁定设备, 隐藏钱包, 设备签名. Do NOT use for App Bot Wallet login — that is the default path in onekey-wallet."
license: Apache-2.0
metadata:
  author: OneKey
  version: 0.2.0
  homepage: https://onekey.so
---
Before any operation, read `references/common.md` for safety, chain, and scam rules.

# Hardware Skill

## Domain Rules
- This skill owns hardware-device lifecycle commands (`onekey device search`, `lock`, `verify`, `firmware`, `change-pin`, `toggle-passphrase`, `settings`) and the `--hardware` path of `onekey auth login`.
- Once the user authenticates with `onekey auth login --hardware`, every subsequent balance, transfer, swap, or history command automatically uses the hardware device; do NOT add any `--hardware` flag to wallet or swap commands — they read the wallet kind from the active session.
- Reconfirm device connectivity with `onekey device search` before any signing request, and if `unlocked: false` instruct the user to enter PIN on device, then re-search.
- Passphrase protection is a device capability, not a CLI flag: if `passphrase_protection: true` and the user has not yet logged in, walk them through `onekey auth login --hardware` once; the login flow prompts for the passphrase mode (standard / on-host / on-device).
- The passphrase value itself is NEVER persisted: pinentry collects it in memory, the CLI exchanges it for a device session token, and only the mode is written to `~/.onekey/auth-session.json`.
- Firmware updates and full factory reset are NOT available via CLI — direct the user to the OneKey desktop app or `firmware.onekey.so`.
- All signing operations require physical confirmation on the device; surface that expectation when a command is about to sign.

## Domain Routing
| Intent | Handling |
|---|---|
| Device management, firmware check, device verification, PIN change, passphrase toggle, device rename, device lock, hardware login | Keep in this skill. |
| Balance, transfer, history, swap, deposit of a wallet that is already hardware-backed | Run the normal `onekey-wallet` / `onekey-swap` flow; the active session already targets the device. |
| Device firmware upgrade, full wipe/reset | Decline in this skill and direct the user to the OneKey App or `firmware.onekey.so`. |

## Fast Patterns
- `find my device` or `is my hardware wallet connected` -> `onekey device search` and report connect id, device label, firmware, unlocked state, and passphrase-protection state directly.
- `is my OneKey genuine` or `verify my device` -> `onekey device verify` and relay the authenticity result; if the device returns a non-genuine response, stop and tell the user not to use the device.
- `check firmware` or `what's my firmware version` -> `onekey device firmware` and return the installed + latest version, marking `update available` only when the CLI output says so.
- `change my PIN` or `set a new PIN` -> `onekey device change-pin`, remind the user they will enter the new PIN on the device screen.
- `remove my PIN` -> `onekey device change-pin --remove`, warn once that removing the PIN weakens wallet security, and ask for explicit `yes` before running.
- `enable hidden wallet` or `turn on passphrase` -> `onekey device toggle-passphrase --enable true`; clarify that the passphrase itself is entered later at login time, not here.
- `disable hidden wallet` -> `onekey device toggle-passphrase --enable false`, warn that any funds in a previously-accessed hidden wallet remain on-chain but become invisible to this device until re-enabled.
- `rename my device to "My OneKey"` -> `onekey device settings --label "My OneKey"`.
- `set auto-lock to 60 seconds` -> `onekey device settings --auto-lock-delay 60`.
- `lock my device` -> `onekey device lock`.
- `login with my hardware wallet` or `connect my OneKey` -> `onekey auth login --hardware`; the CLI itself prompts for the passphrase mode.
- `send from my hardware wallet` after the user is already authenticated with `--hardware` -> run the standard `onekey transfer` flow; do NOT add `--hardware` or any passphrase flag.
- `i want to use a hidden wallet for this session` -> ensure `onekey auth status` shows `login_method: hardware`; if not, run `onekey auth logout` first, then `onekey auth login --hardware` and let the user pick the hidden-wallet mode during the flow.
- `update my firmware from the CLI` -> decline and direct the user to the OneKey desktop app.
- `factory reset my device from the CLI` -> decline and direct the user to the OneKey desktop app.

## Interface Discovery
- `onekey schema --list` lists every command, including the `device` subcommands.
- `onekey schema device <subcommand>` returns the exact JSON schema for `search`, `lock`, `verify`, `firmware`, `change-pin`, `toggle-passphrase`, and `settings`.
- `onekey schema auth login` covers the `--app-transfer` and `--hardware` mutually-exclusive flags.
- Never invent flags or arguments — rely on `schema` output.

## Safety Rules — Hardware-Specific
- Never ask the user to paste their passphrase or PIN into chat; use the CLI's interactive prompt which routes to pinentry or the device screen.
- Never log a passphrase value, even once, even partially, even for debugging.
- If `onekey device verify` fails authenticity, stop the flow and tell the user to contact OneKey support before further use.
- If `onekey device search` returns no devices, do not retry blindly; surface "device not found" and ask the user to plug in, unlock, or allow USB access.
- Long-running device commands (PIN change, passphrase toggle, firmware check) can take up to two minutes while the user interacts with the device; explain that the prompt is on the device screen and wait for completion before reporting status.
- Do not combine `onekey auth login --hardware` with `--app-transfer` — the CLI rejects the combination; surface that to the user as "pick one method".
