### Plugin manifest notes

The `.claude-plugin/plugin.json` follows the Claude Code plugin validator
requirements:

- `version` is mandatory.
- Component fields (`skills`, `agents`, `commands`) must be arrays.
- `skills` accepts directory paths when wrapped in arrays.
- There is no `hooks` field — Claude Code auto-loads `hooks/hooks.json` by
  convention (not applicable here since this plugin has no hooks).

This plugin only declares `skills` since the project ships no agents,
commands, or hooks.
