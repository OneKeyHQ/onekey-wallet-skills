import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

function readDoc(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.equal(
    existsSync(fullPath),
    true,
    `Expected ${relativePath} to exist.`,
  );

  return readFileSync(fullPath, "utf8");
}

test("_shared/common.md matches US-004 requirements", () => {
  const content = readDoc("_shared/common.md");

  assert.ok(content.trim().length > 0, "Expected _shared/common.md to be non-empty.");

  assert.match(content, /^## Pre-flight$/m);
  assert.match(content, /^## Operating Model$/m);
  assert.match(content, /^## Safety Rules$/m);
  assert.match(content, /^## Scam & Mismatch Stops$/m);
  assert.match(content, /^## Chain Inference$/m);
  assert.match(content, /^## Response Contract$/m);
  assert.match(content, /^## Cross-Domain Fallback$/m);

  for (const phrase of [
    "run `onekey version`",
    "Start with `onekey schema --list`",
    "Never guess parameter names, networks, venues, output fields, or command support.",
    "Never reveal private keys, seed phrases, or mnemonics.",
    "must pass `security-audit` inside the flow",
    "Stop on URL-like, promo-style, typo-squat, or obviously malicious token names.",
    "Explicit user chain or prior chat context always wins.",
    "Read-only answers start with the actual result block",
    "Compound intents (read + trade, or trade + send) split into one read-only answer and one confirmation per fund-moving step.",
  ]) {
    assert.ok(
      content.includes(phrase),
      `Expected _shared/common.md to include "${phrase}".`,
    );
  }

  assert.equal(
    content.includes("apps/cli/"),
    false,
    "Expected _shared/common.md to remove monorepo paths.",
  );
});
