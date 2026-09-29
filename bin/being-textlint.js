#!/usr/bin/env node

const { spawn } = require("node:child_process");
const { dirname, join } = require("node:path");

const packageRoot = join(__dirname, "..");
const textlint = require.resolve("textlint/bin/textlint.js");
const rulesBaseDirectory = dirname(dirname(require.resolve("textlint/package.json")));

const rawArgs = process.argv.slice(2);
const langIndex = rawArgs.indexOf("--lang");
let lang = "ja";
const forwardedArgs = [...rawArgs];
if (langIndex !== -1) {
  lang = rawArgs[langIndex + 1];
  forwardedArgs.splice(langIndex, 2);
}
if (lang !== "ja" && lang !== "en") {
  console.error(`Unknown --lang value: ${lang} (expected "ja" or "en")`);
  process.exit(1);
}
const configFile = lang === "en" ? "textlintrc.en.json" : "textlintrc.json";

const child = spawn(
  process.execPath,
  [
    textlint,
    "--config",
    join(packageRoot, configFile),
    "--rules-base-directory",
    rulesBaseDirectory,
    ...forwardedArgs
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
