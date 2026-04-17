#!/usr/bin/env node
// @ts-check

/**
 * Baseline verifier for skill install validation.
 *
 * The baseline flow stays dependency-light on purpose: it stages required
 * platform artifacts inside an isolated temporary workspace, records one
 * result per selected platform, writes a machine-readable report, and then
 * cleans up the temporary context before exiting.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** @typedef {'claude' | 'cursor' | 'codex' | 'opencode' | 'openclaw'} Platform */
/** @typedef {'baseline' | 'full'} VerificationMode */
/** @typedef {'passed' | 'failed'} ResultStatus */

/**
 * @typedef {object} CliOptions
 * @property {Platform[]} platforms
 * @property {VerificationMode} mode
 * @property {string} outputPath
 * @property {string[]} warnings
 */

/**
 * @typedef {object} BaselineResult
 * @property {Platform} platform
 * @property {ResultStatus} status
 * @property {string[]} checkedFiles
 * @property {string[]} missingFiles
 * @property {string[]} messages
 * @property {string} startedAt
 * @property {string} finishedAt
 */

/**
 * @typedef {object} IsolationState
 * @property {boolean} enabled
 * @property {string | null} workspacePath
 * @property {'pending' | 'cleaned' | 'failed'} cleanupStatus
 * @property {string | null} cleanupError
 */

/**
 * @typedef {object} VerificationSummary
 * @property {number} total
 * @property {number} passed
 * @property {number} failed
 */

/**
 * @typedef {object} VerificationReport
 * @property {number} schemaVersion
 * @property {string} generatedAt
 * @property {string} repoRoot
 * @property {VerificationMode} requestedMode
 * @property {'baseline'} executedMode
 * @property {string[]} warnings
 * @property {string} outputPath
 * @property {IsolationState} isolation
 * @property {VerificationSummary} summary
 * @property {BaselineResult[]} results
 */

/** @type {readonly Platform[]} */
const SUPPORTED_PLATFORMS = ['claude', 'cursor', 'codex', 'opencode', 'openclaw'];
/** @type {readonly VerificationMode[]} */
const SUPPORTED_MODES = ['baseline', 'full'];
const DEFAULT_MODE = 'baseline';
const DEFAULT_OUTPUT_PATH = 'reports/skill-install-verification.json';
const ISOLATION_PREFIX = 'onekey-skill-install-verifier-';

/** @type {Readonly<Record<Platform, readonly string[]>>} */
const PLATFORM_BASELINE_FILES = {
  claude: ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json'],
  cursor: ['.cursor-plugin/plugin.json'],
  codex: ['.codex/INSTALL.md'],
  opencode: ['.opencode/opencode.json', '.opencode/INSTALL.md'],
  openclaw: ['.openclaw/INSTALL.md'],
};

/**
 * @param {string[]} argv
 * @returns {CliOptions}
 */
function parseArgs(argv) {
  /** @type {Set<Platform>} */
  const selectedPlatforms = new Set();
  /** @type {string[]} */
  const warnings = [];
  /** @type {VerificationMode} */
  let mode = DEFAULT_MODE;
  let outputPath = DEFAULT_OUTPUT_PATH;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--platform' || arg === '-p') {
      const value = requireValue(argv, index, arg);
      index += 1;

      for (const platform of parsePlatforms(value)) {
        selectedPlatforms.add(platform);
      }
      continue;
    }

    if (arg.startsWith('--platform=')) {
      for (const platform of parsePlatforms(arg.slice('--platform='.length))) {
        selectedPlatforms.add(platform);
      }
      continue;
    }

    if (arg === '--mode' || arg === '-m') {
      const value = requireValue(argv, index, arg);
      index += 1;
      mode = parseMode(value);
      continue;
    }

    if (arg.startsWith('--mode=')) {
      mode = parseMode(arg.slice('--mode='.length));
      continue;
    }

    if (arg === '--output' || arg === '-o') {
      const value = requireValue(argv, index, arg);
      index += 1;
      outputPath = value;
      continue;
    }

    if (arg.startsWith('--output=')) {
      outputPath = arg.slice('--output='.length);
      continue;
    }

    warnings.push(`Ignoring unknown argument: ${arg}`);
  }

  const platforms = selectedPlatforms.size > 0
    ? Array.from(selectedPlatforms)
    : [...SUPPORTED_PLATFORMS];

  return {
    platforms,
    mode,
    outputPath: path.resolve(outputPath),
    warnings,
  };
}

/**
 * @param {string[]} argv
 * @param {number} index
 * @param {string} flag
 * @returns {string}
 */
function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) {
    throw new Error(`Expected a value after ${flag}`);
  }
  return value;
}

/**
 * @param {string} rawValue
 * @returns {Platform[]}
 */
function parsePlatforms(rawValue) {
  const values = rawValue
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (values.length === 0) {
    throw new Error('Expected at least one platform value');
  }

  return values.map((value) => {
    if (isSupportedPlatform(value)) {
      return value;
    }
    throw new Error(
      `Unsupported platform "${value}". Expected one of: ${SUPPORTED_PLATFORMS.join(', ')}`,
    );
  });
}

/**
 * @param {string} rawValue
 * @returns {VerificationMode}
 */
function parseMode(rawValue) {
  const normalized = rawValue.trim().toLowerCase();
  if (isSupportedMode(normalized)) {
    return normalized;
  }

  throw new Error(
    `Unsupported mode "${rawValue}". Expected one of: ${SUPPORTED_MODES.join(', ')}`,
  );
}

/**
 * @param {string} value
 * @returns {value is Platform}
 */
function isSupportedPlatform(value) {
  return SUPPORTED_PLATFORMS.includes(/** @type {Platform} */ (value));
}

/**
 * @param {string} value
 * @returns {value is VerificationMode}
 */
function isSupportedMode(value) {
  return SUPPORTED_MODES.includes(/** @type {VerificationMode} */ (value));
}

function printHelp() {
  console.log(`Usage: node scripts/verify-skill-installs.mjs [options]

Options:
  -p, --platform <name[,name...]>  Limit execution to one or more platforms.
  -m, --mode <baseline|full>       Select verification mode.
  -o, --output <path>              Report output path.
  -h, --help                       Show this help message.
`);
}

/**
 * @param {CliOptions} options
 */
function printSummaryHeader(options) {
  console.log('OneKey Skill Install Verifier');
  console.log('================================');
  console.log(`Mode: ${options.mode}`);
  console.log(`Platforms: ${options.platforms.join(', ')}`);
  console.log(`Output: ${options.outputPath}`);

  if (options.warnings.length > 0) {
    console.log('Warnings:');
    for (const warning of options.warnings) {
      console.log(`- ${warning}`);
    }
  } else {
    console.log('Warnings: none');
  }

  console.log('');
}

/**
 * @param {CliOptions} options
 * @returns {Promise<VerificationReport>}
 */
async function runVerification(options) {
  const repoRoot = process.cwd();
  const report = createEmptyReport(options, repoRoot);
  const isolation = await createIsolationState();

  report.isolation.workspacePath = isolation.workspacePath;

  try {
    if (options.mode === 'full') {
      report.warnings.push('Full mode is not implemented yet; executed baseline checks instead.');
    }

    for (const platform of options.platforms) {
      report.results.push(await runBaselineCheck(platform, repoRoot, isolation.workspacePath));
    }

    report.summary = summarizeResults(report.results);
    report.generatedAt = new Date().toISOString();
    return report;
  } finally {
    const cleanup = await cleanupIsolation(isolation.workspacePath);
    report.isolation.cleanupStatus = cleanup.cleanupStatus;
    report.isolation.cleanupError = cleanup.cleanupError;
  }
}

/**
 * @param {CliOptions} options
 * @param {string} repoRoot
 * @returns {VerificationReport}
 */
function createEmptyReport(options, repoRoot) {
  return {
    schemaVersion: 1,
    generatedAt: '',
    repoRoot,
    requestedMode: options.mode,
    executedMode: 'baseline',
    warnings: [...options.warnings],
    outputPath: options.outputPath,
    isolation: {
      enabled: true,
      workspacePath: null,
      cleanupStatus: 'pending',
      cleanupError: null,
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
    results: [],
  };
}

/**
 * @returns {Promise<IsolationState>}
 */
async function createIsolationState() {
  const workspacePath = await fs.mkdtemp(path.join(os.tmpdir(), ISOLATION_PREFIX));

  return {
    enabled: true,
    workspacePath,
    cleanupStatus: 'pending',
    cleanupError: null,
  };
}

/**
 * @param {string | null} workspacePath
 * @returns {Promise<Pick<IsolationState, 'cleanupStatus' | 'cleanupError'>>}
 */
async function cleanupIsolation(workspacePath) {
  if (!workspacePath) {
    return {
      cleanupStatus: 'cleaned',
      cleanupError: null,
    };
  }

  try {
    await fs.rm(workspacePath, { recursive: true, force: true });
    return {
      cleanupStatus: 'cleaned',
      cleanupError: null,
    };
  } catch (error) {
    return {
      cleanupStatus: 'failed',
      cleanupError: toErrorMessage(error),
    };
  }
}

/**
 * @param {Platform} platform
 * @param {string} repoRoot
 * @param {string | null} workspacePath
 * @returns {Promise<BaselineResult>}
 */
async function runBaselineCheck(platform, repoRoot, workspacePath) {
  const startedAt = new Date().toISOString();
  const requiredFiles = PLATFORM_BASELINE_FILES[platform];
  /** @type {string[]} */
  const checkedFiles = [];
  /** @type {string[]} */
  const missingFiles = [];

  for (const relativeFile of requiredFiles) {
    const sourcePath = path.join(repoRoot, relativeFile);
    const exists = await pathExists(sourcePath);

    if (!exists) {
      missingFiles.push(relativeFile);
      continue;
    }

    checkedFiles.push(relativeFile);

    if (workspacePath) {
      const stagedPath = path.join(workspacePath, platform, relativeFile);
      await fs.mkdir(path.dirname(stagedPath), { recursive: true });
      await fs.copyFile(sourcePath, stagedPath);
    }
  }

  const status = missingFiles.length === 0 ? 'passed' : 'failed';
  /** @type {string[]} */
  const messages = [];

  if (checkedFiles.length > 0) {
    messages.push(`Staged ${checkedFiles.length} required file(s) in the isolated baseline workspace.`);
  }

  if (missingFiles.length > 0) {
    messages.push(`Missing required file(s): ${missingFiles.join(', ')}`);
  } else {
    messages.push('All required baseline files were present.');
  }

  return {
    platform,
    status,
    checkedFiles,
    missingFiles,
    messages,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {BaselineResult[]} results
 * @returns {VerificationSummary}
 */
function summarizeResults(results) {
  const passed = results.filter((result) => result.status === 'passed').length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
  };
}

/**
 * @param {VerificationReport} report
 * @returns {Promise<void>}
 */
async function writeReport(report) {
  await fs.mkdir(path.dirname(report.outputPath), { recursive: true });
  await fs.writeFile(report.outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

/**
 * @param {VerificationReport} report
 */
function printExecutionSummary(report) {
  console.log(`Executed mode: ${report.executedMode}`);
  console.log(`Isolated workspace: ${report.isolation.workspacePath ?? 'not created'}`);
  console.log(`Results: ${report.summary.passed} passed, ${report.summary.failed} failed`);
  console.log(`Report written to: ${report.outputPath}`);

  if (report.warnings.length > 0) {
    console.log('Report warnings:');
    for (const warning of report.warnings) {
      console.log(`- ${warning}`);
    }
  }

  for (const result of report.results) {
    console.log(`[${result.status.toUpperCase()}] ${result.platform}: ${result.messages.join(' ')}`);
  }
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  printSummaryHeader(options);
  const report = await runVerification(options);
  await writeReport(report);
  printExecutionSummary(report);

  if (report.summary.failed > 0 || report.isolation.cleanupStatus === 'failed') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Verification failed: ${toErrorMessage(error)}`);
  process.exit(1);
});
