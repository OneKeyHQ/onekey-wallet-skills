#!/usr/bin/env node
// @ts-check

/**
 * Baseline verifier scaffold for skill install validation.
 *
 * This first iteration only normalizes CLI input and prints a stable
 * human-readable run summary. Report generation and execution hooks land in
 * later stories.
 */

import path from 'node:path';

/** @typedef {'claude' | 'cursor' | 'codex' | 'opencode' | 'openclaw'} Platform */
/** @typedef {'baseline' | 'full'} VerificationMode */

/**
 * @typedef {object} CliOptions
 * @property {Platform[]} platforms
 * @property {VerificationMode} mode
 * @property {string} outputPath
 * @property {string[]} warnings
 */

/** @type {readonly Platform[]} */
const SUPPORTED_PLATFORMS = ['claude', 'cursor', 'codex', 'opencode', 'openclaw'];
/** @type {readonly VerificationMode[]} */
const SUPPORTED_MODES = ['baseline', 'full'];
const DEFAULT_MODE = 'baseline';
const DEFAULT_OUTPUT_PATH = 'reports/skill-install-verification.json';

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
  -o, --output <path>              Report output path for later iterations.
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
  console.log('Scaffold only: execution and report writing are not enabled in this step.');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  printSummaryHeader(options);
}

main();
