#!/usr/bin/env node

const { spawn } = require("node:child_process");
const { dirname, join } = require("node:path");

const packageRoot = join(__dirname, "..");
const textlint = require.resolve("textlint/bin/textlint.js");
const rulesBaseDirectory = dirname(dirname(require.resolve("textlint/package.json")));
const child = spawn(
  process.execPath,
  [
    textlint,
    "--config",
    join(packageRoot, "textlintrc.json"),
    "--rules-base-directory",
    rulesBaseDirectory,
    ...process.argv.slice(2)
  ],
  { stdio: "inherit" }
);

child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
