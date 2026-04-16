import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

function readSkill(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.equal(
    existsSync(fullPath),
    true,
    `Expected ${relativePath} to exist.`,
  );

  return readFileSync(fullPath, "utf8");
}

function getFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "Expected YAML frontmatter.");
  return match[1];
}

function assertCommonFrontmatter(frontmatter, expectedName, phrases) {
  assert.match(frontmatter, new RegExp(`name:\\s*${expectedName}`));
  assert.match(frontmatter, /license:\s*Apache-2\.0/);
  assert.match(frontmatter, /metadata:\n\s+author:\s*OneKey/);
  assert.match(frontmatter, /metadata:\n[\s\S]*?\n\s+version:\s*0\.2\.0/);
  assert.match(frontmatter, /metadata:\n[\s\S]*?\n\s+homepage:\s*https:\/\/onekey\.so/);

  for (const phrase of phrases) {
    assert.ok(
      frontmatter.includes(phrase),
      `Expected frontmatter to include trigger phrase "${phrase}".`,
    );
  }
}

test("onekey-swap skill content matches US-003 requirements", () => {
  const content = readSkill("skills/onekey-swap/SKILL.md");
  const frontmatter = getFrontmatter(content);

  assertCommonFrontmatter(frontmatter, "onekey-swap", [
    "swap tokens",
    "trade ETH for USDC",
    "buy tokens",
    "sell tokens",
    "exchange crypto",
    "swap quote",
    "swap status",
    "cross-chain swap",
    "换币",
    "买币",
    "卖币",
    "兑换",
    "交易",
    "跨链",
    "Do NOT use for token research or prices — use onekey-market.",
    "Do NOT use for security audits — use onekey-security.",
  ]);

  assert.match(content, /^## Pre-flight$/m);
  assert.match(content, /^## Interface Discovery$/m);
  assert.match(content, /^## Commands$/m);
  assert.match(content, /^## Security Rules(?: [—-] ABSOLUTE)?$/m);
  assert.match(content, /^## Domain Knowledge$/m);
  assert.match(content, /^## Mandatory Trade Flow$/m);
  assert.ok(
    content.includes("use onekey-market"),
    "Expected swap skill to route research and prices to onekey-market.",
  );
  assert.ok(
    content.includes("use onekey-security"),
    "Expected swap skill to route security audits to onekey-security.",
  );
  assert.equal(
    content.includes("apps/cli/"),
    false,
    "Expected swap skill to remove monorepo paths.",
  );
  assert.equal(
    content.includes("cli-api.d.ts"),
    false,
    "Expected swap skill to remove cli-api.d.ts references.",
  );
});

test("onekey-wallet skill content matches US-003 requirements", () => {
  const content = readSkill("skills/onekey-wallet/SKILL.md");
  const frontmatter = getFrontmatter(content);

  assertCommonFrontmatter(frontmatter, "onekey-wallet", [
    "check balance",
    "show my assets",
    "send tokens",
    "transfer ETH",
    "import wallet",
    "transaction history",
    "wallet status",
    "查余额",
    "转账",
    "发送",
    "导入钱包",
    "交易记录",
    "Do NOT use for swap execution — use onekey-swap.",
    "Do NOT use for token prices or research — use onekey-market.",
  ]);

  assert.match(content, /^## Pre-flight$/m);
  assert.match(content, /^## Interface Discovery$/m);
  assert.match(content, /^## Commands$/m);
  assert.match(content, /^## Security Rules(?: [—-] ABSOLUTE)?$/m);
  assert.match(content, /^## Domain Knowledge$/m);
  assert.match(content, /^## Transfer Workflow$/m);
  assert.ok(
    content.includes("use onekey-swap"),
    "Expected wallet skill to route swap execution to onekey-swap.",
  );
  assert.ok(
    content.includes("use onekey-market"),
    "Expected wallet skill to route token research to onekey-market.",
  );
  assert.equal(
    content.includes("apps/cli/"),
    false,
    "Expected wallet skill to remove monorepo paths.",
  );
  assert.equal(
    content.includes("cli-api.d.ts"),
    false,
    "Expected wallet skill to remove cli-api.d.ts references.",
  );
});
