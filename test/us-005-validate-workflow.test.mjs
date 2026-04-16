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

test("validate workflow matches US-005 requirements", () => {
  const content = readDoc(".github/workflows/validate.yml");

  assert.match(content, /^name:\s*Validate$/m);
  assert.match(content, /^on:\n\s+push:\n\s+branches:\n\s+-\s+main\n\s+pull_request:\s*$/m);

  for (const jobName of ["validate-skills", "validate-marketplace-json"]) {
    assert.match(
      content,
      new RegExp(`^\\s{2}${jobName}:$`, "m"),
      `Expected workflow to define the ${jobName} job.`,
    );
  }

  assert.match(content, /^\s{4}runs-on:\s*ubuntu-latest$/m);

  for (const skillPath of [
    "skills/onekey-market/SKILL.md",
    "skills/onekey-security/SKILL.md",
    "skills/onekey-swap/SKILL.md",
    "skills/onekey-wallet/SKILL.md",
  ]) {
    assert.ok(
      content.includes(skillPath),
      `Expected workflow to validate ${skillPath}.`,
    );
  }

  for (const phrase of [
    "_shared/common.md",
    "[ -s \"$file\" ]",
    "head -n 5",
    "grep -q '^---$'",
    "grep -q '^name:'",
    "python -m json.tool .claude-plugin/marketplace.json",
  ]) {
    assert.ok(
      content.includes(phrase),
      `Expected workflow to include "${phrase}".`,
    );
  }
});
