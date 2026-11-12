const assert = require("node:assert/strict");
const test = require("node:test");
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const cli = join(__dirname, "..", "bin", "being-textlint.js");
const fixture = join(__dirname, "fixtures", "one-sentence.tex");

const lines = (lang) => {
  const result = spawnSync(process.execPath, [cli, "--lang", lang, "--format", "json", fixture], { encoding: "utf8" });
  return JSON.parse(result.stdout)[0].messages.filter((m) => m.ruleId === "one-sentence-per-line").map((m) => m.line);
};

test("日本語設定は同じ行に続く文だけを検出し、文ごとに改行した段落と小数点は検出しない", () => {
  assert.deepEqual(lines("ja"), [1, 4, 8, 9]);
});
test("英語の略語では分割せず、日英とも有効になっている", () => assert.deepEqual(lines("en"), [1, 4, 8, 9]));
