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

test("回りくどい分析口調のAI定型句を検出する", () => {
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
  handlers.Str({ text: "これらの知見から，本稿が対象とする2つの限界が直接導かれる。" });
  handlers.Str({ text: "チャンスレベル近傍またはそれ以下のバランス精度まで崩壊した。" });
  handlers.Str({ text: "本項目が現時点で開発中であることと整合する。" });
  handlers.Str({ text: "氷接触振動信号が大きな効果量で分離できるという確定結果を報告した。" });
  handlers.Str({ text: "これはインソール型センサにおいて計測対象活動に応じてレンジを適合させる必要があるという既知の制約と一致するものであり。" });
  handlers.Str({ text: "観測された分類性能が真の氷面条件情報を反映しているかを確認する。" });
  handlers.Str({ text: "被験者固有のアーティファクトに依存せず氷面条件を分類できる。" });
  assert.deepEqual(messages, [
    "AI定型句「直接導かれる」: 導出のニュアンスを削り主張をそのまま書く",
    "AI定型句「まで崩壊した」: 誇張を避け実際の値や変化を書く",
    "AI定型句「ことと整合する」: 確認的な言い回しを削り事実をそのまま書く",
    "AI定型句「という確定結果を報告した」: 「報告した」を介さず主張をそのまま書く",
    "AI定型句「既知の制約と一致するものであり」: 確認的な一致付けを削り、必要な主張だけ残す",
    "AI定型句「真の氷面条件情報」: 「真の」という強調を削り具体的に何の情報かを書く",
    "AI定型句「アーティファクト」: 「特性」「癖」「混入」等、具体的な言葉に置き換える"
  ]);
});
