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

const lint = (text, skippedNodes = []) => {
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
  for (const node of skippedNodes) {
    handlers[node.type](node);
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

test("コメント・\\verb・verbatim の中は検出しない", () => {
  const comment = "% \\textbf{c}\n";
  const verb = "\\verb|\\textbf|";
  const verbatim = "\\begin{verbatim}\n\\underline{v}\n\\end{verbatim}";
  const text = comment + verb + "\n" + verbatim;
  const at = (part) => [text.indexOf(part), text.indexOf(part) + part.length];
  assert.deepEqual(
    lint(text, [
      { type: "Comment", text: comment, range: at(comment) },
      { type: "Code", text: verb, range: at(verb) },
      { type: "CodeBlock", text: verbatim, range: at(verbatim) }
    ]),
    []
  );
});

test("数式の中の太字・下線命令は検出する", () => {
  const inline = "$\\textbf{x}$";
  const display = "\\[\n\\underline{x}\n\\]";
  const text = inline + "\n" + display;
  const at = (part) => [text.indexOf(part), text.indexOf(part) + part.length];
  assert.equal(
    lint(text, [
      { type: "Code", text: inline, range: at(inline) },
      { type: "CodeBlock", text: display, range: at(display) }
    ]).length,
    2
  );
});

test("実行されない命令名は検出しない", () => {
  assert.deepEqual(lint("row \\\\textbf literal \\string\\textbf \\ul@hook"), []);
});

test("エスケープされた改行の直後の命令は検出する", () => {
  assert.equal(lint("a\\\\\\textbf{b}").length, 1);
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
    assert.deepEqual(lines, [2, 3, 4]);
  });
}
