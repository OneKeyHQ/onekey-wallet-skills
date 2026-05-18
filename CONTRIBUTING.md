# Contributing to onekey-wallet-skills

Internal authoring and maintenance rules. Readers running the skills do not need
this file — see `AGENTS.md` and `CLAUDE.md` instead.

## Skill file conventions

- Each `skills/<name>/SKILL.md` must start with YAML frontmatter that includes
  `name`, `description`, `license`, and `metadata` (`author`, `version`,
  `homepage`).
- Keep standalone skill docs free of monorepo-only paths like `apps/cli/...`.
  Route cross-skill handoffs via the published `onekey-*` skill names.
- Fund-moving skills (`onekey-wallet`, `onekey-swap`) route audit prerequisites
  to `onekey-security`. Wallet and swap docs route token research or pricing
  intents to `onekey-market`.
- Shared operator, safety, response, and cross-domain routing rules live in
  each skill's `references/common.md`. Shared benchmark response-shape
  examples live in each skill's `references/examples.md`. Keep all four
  copies of each shared reference file in sync when editing shared policy or
  benchmark guidance.

## CI & validation

- `.github/workflows/validate.yml` stays dependency-light: shell checks for
  skill/frontmatter presence and `python -m json.tool` for plugin manifests.
- Do not reintroduce Node/TypeScript scaffolding unless a CI requirement
  actually depends on it.
- Benchmark changes should be validated in
  `/Users/leon/Documents/onekey/crypto-skill-benchmark`. The OneKey target is
  `>=75/100` with `Safety Gate: PASS`. Use `npm run onekey:dry-run` before a
  paid run, then `npm run onekey:evaluate` and
  `npm run onekey:gate -- <report-dir>` for the targeted OneKey suite. Run
  broader public scenarios when changing shared behavior.
- Until the `device-*` schema registry fix is published in `@onekeyfe/cli`, run
  `ONEKEY_BIN=/Users/leon/Documents/onekey/app-monorepo/apps/cli/bin/onekey npm run onekey:schema-fixture`
  in the benchmark repository before trusting device-schema dry-runs.

## Multi-platform plugin manifests

The repo ships manifests for five agent platforms. When adding or removing
skills, update each one:

- `.claude-plugin/marketplace.json` — Claude Code marketplace entry.
- `.claude-plugin/plugin.json` — Claude Code plugin manifest.
- `.cursor-plugin/plugin.json` — Cursor plugin manifest.
- `.opencode/opencode.json` — OpenCode `instructions` array (lists each
  `SKILL.md` path explicitly).
- `.codex/INSTALL.md` / `.openclaw/INSTALL.md` — user-facing install docs;
  update the skill table at the bottom.

## Publishing notes

- If `main` is rebuilt as an orphan root commit during first publication,
  merge `main` back into the feature branch before opening a GitHub PR.
  GitHub rejects PR creation for unrelated histories.
