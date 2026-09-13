#!/usr/bin/env node

const { spawn } = require("node:child_process");
const { join } = require("node:path");

const packageRoot = join(__dirname, "..");
const textlint = require.resolve("textlint/bin/textlint.js");
const child = spawn(
  process.execPath,
  [
    textlint,
    "--config",
    join(packageRoot, "textlintrc.json"),
    "--rules-base-directory",
    join(packageRoot, "node_modules"),
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
