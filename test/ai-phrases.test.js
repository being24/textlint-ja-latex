const assert = require("node:assert/strict");
const test = require("node:test");
const rule = require("../rules/ai-phrases");

test("同一文と同じ導入句の3文連続を検出する", () => {
  const messages = [];
  const handlers = rule({
    Syntax: { Str: "Str", Paragraph: "Paragraph" },
    RuleError: class RuleError {
      constructor(message) {
        this.message = message;
      }
    },
    getSource: (node) => node.text,
    report: (_, error) => messages.push(error.message)
  });
  handlers.Paragraph({
    text: "この手法は有効である。この手法は有効である。本研究では手法Aを用いる。本研究では手法Bを用いる。本研究では手法Cを用いる。"
  });
  assert.deepEqual(messages, [
    "同一文の繰り返し「この手法は有効である。」",
    "同じ導入句「本研究では」で始まる文が3文連続しています"
  ]);
});
