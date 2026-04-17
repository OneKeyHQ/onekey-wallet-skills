# CLAUDE.md

Guidance for Claude Code when working inside this repository.

## Project overview

This is a **Claude Code plugin** — four OneKey wallet skills for on-chain
operations. See `AGENTS.md` for the skill routing table and CLI interface
discovery rules; that file is the canonical skill reference and applies to
every agent environment.

## Plugin structure

- `skills/` — four `SKILL.md` definitions (wallet, swap, market, security),
  each with its own `references/common.md`.
- `.claude-plugin/marketplace.json` — Claude Code marketplace entry.
- `.claude-plugin/plugin.json` — Claude Code plugin manifest.
- `.github/workflows/validate.yml` — CI validation (shell checks + JSON
  validation, no Node/TS dependencies).

## Skill routing

Use the skill table in `AGENTS.md`. When a user request could match more than
one skill, honor the `Do NOT use for X` exclusions inside each skill's
frontmatter `description`.

## Contributing

Authoring conventions, CI rules, and publishing notes live in
`CONTRIBUTING.md`. Do not add them back to this file.
