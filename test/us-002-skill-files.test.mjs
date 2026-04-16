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

test("onekey-market skill content matches US-002 requirements", () => {
  const content = readSkill("skills/onekey-market/SKILL.md");
  const frontmatter = getFrontmatter(content);

  assertCommonFrontmatter(frontmatter, "onekey-market", [
    "token price",
    "trending",
    "search token",
    "kline chart",
    "candlestick",
    "trading volume",
    "top holders",
    "liquidity",
    "token info",
    "代币价格",
    "热门代币",
    "K线",
    "搜索代币",
    "Do NOT use for swap execution — use onekey-swap.",
    "Do NOT use for security audits — use onekey-security.",
  ]);

  assert.match(content, /^## Pre-flight$/m);
  assert.match(content, /^## Interface Discovery$/m);
  assert.match(content, /^## Commands$/m);
  assert.match(content, /^## Domain Knowledge$/m);
  assert.match(content, /^## Workflow: Token Research \(Due Diligence\)$/m);
  assert.ok(
    content.includes("use onekey-security"),
    "Expected market skill to route security checks to onekey-security.",
  );
  assert.equal(
    content.includes("apps/cli/"),
    false,
    "Expected market skill to remove monorepo paths.",
  );
  assert.equal(
    content.includes("cli-api.d.ts"),
    false,
    "Expected market skill to remove cli-api.d.ts references.",
  );
});

test("onekey-security skill content matches US-002 requirements", () => {
  const content = readSkill("skills/onekey-security/SKILL.md");
  const frontmatter = getFrontmatter(content);

  assertCommonFrontmatter(frontmatter, "onekey-security", [
    "is this token safe",
    "honeypot check",
    "security scan",
    "simulate transaction",
    "risk assessment",
    "代币安全",
    "蜜罐检测",
    "安全审计",
    "模拟交易",
    "Do NOT use for token prices — use onekey-market.",
    "Do NOT use for swap execution — use onekey-swap.",
  ]);

  assert.match(content, /^## Pre-flight$/m);
  assert.match(content, /^## Interface Discovery$/m);
  assert.match(content, /^## Commands$/m);
  assert.match(content, /^## Security Rules(?: [—-] ABSOLUTE)?$/m);
  assert.match(content, /^## Risk Classification(?: (?:->|→) Agent Action)?$/m);
  assert.match(content, /^## Domain Knowledge$/m);
  assert.ok(
    content.includes("use onekey-market"),
    "Expected security skill to route token pricing to onekey-market.",
  );
  assert.ok(
    content.includes("use onekey-swap"),
    "Expected security skill to route swap execution to onekey-swap.",
  );
  assert.equal(
    content.includes("apps/cli/"),
    false,
    "Expected security skill to remove monorepo paths.",
  );
  assert.equal(
    content.includes("cli-api.d.ts"),
    false,
    "Expected security skill to remove cli-api.d.ts references.",
  );
});
