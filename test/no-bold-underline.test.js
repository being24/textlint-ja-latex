const assert = require("node:assert/strict");
const test = require("node:test");
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");
const rule = require("../rules/no-bold-underline");

const Syntax = {
  Comment: "Comment",
  Code: "Code",
  CodeBlock: "CodeBlock",
  DocumentExit: "Document:exit"
};

const lint = (text, maskedRanges = []) => {
  const reported = [];
  const handlers = rule({
    Syntax,
    RuleError: class RuleError {
      constructor(message, padding) {
        this.message = message;
        this.index = padding.index;
      }
    },
    getSource: (node) => node.text,
    report: (_, error) => reported.push({ message: error.message, index: error.index })
  });
  for (const range of maskedRanges) {
    handlers.Comment({ range });
  }
  handlers["Document:exit"]({ text });
  return reported;
};

test("太字・下線の命令を位置付きで検出する", () => {
  const text = "本文 \\textbf{A} {\\bf B} {\\bfseries C} \\underline{D} \\underbar{E} \\uline{F} \\uuline{G} \\ul{H}";
  assert.deepEqual(
    lint(text).map(({ index }) => text.slice(index).match(/^\\[a-z]+/)[0]),
    ["\\textbf", "\\bf", "\\bfseries", "\\underline", "\\underbar", "\\uline", "\\uuline", "\\ul"]
  );
});

test("数式の太字やイタリック強調は対象外とする", () => {
  assert.deepEqual(lint("$\\mathbf{x}$ $\\boldsymbol{\\beta}$ \\emph{a} \\textit{b} \\ulcorner \\bfdefault"), []);
});

test("コメント・コード領域の命令は検出しない", () => {
  const text = "本文．% \\textbf{コメント}\n\\verb|\\textbf| 後";
  assert.deepEqual(lint(text, [[3, 20], [20, 35]]), []);
});

test("マクロ定義の中の命令も検出する", () => {
  assert.equal(lint("\\newcommand{\\foo}{\\textbf{x}}").length, 1);
});

const cli = join(__dirname, "..", "bin", "being-textlint.js");
const fixture = join(__dirname, "fixtures", "bold-underline.tex");

for (const lang of ["ja", "en"]) {
  test(`being-textlint --lang ${lang} で有効になっている`, () => {
    const result = spawnSync(process.execPath, [cli, "--lang", lang, "--format", "json", fixture], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    const lines = JSON.parse(result.stdout)[0]
      .messages.filter((message) => message.ruleId === "@being/no-bold-underline")
      .map((message) => message.line);
    assert.deepEqual(lines, [2, 3]);
  });
}
