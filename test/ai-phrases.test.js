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

test("評価語による断定・独自の意味づけを検出する", () => {
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
  handlers.Str({ text: "この結果は示唆に富む。" });
  handlers.Str({ text: "重要な示唆を与えるものである。" });
  handlers.Str({ text: "そこから深い洞察が得られた。" });
  handlers.Str({ text: "この観測は重大な意味を持つ。" });
  handlers.Str({ text: "本稿は画期的な手法を提案する。" });
  handlers.Str({ text: "これは革新的なアプローチである。" });
  assert.deepEqual(messages, [
    "AI定型句「示唆に富む」: 評価語ではなく、観測結果から何が言えるかを書く",
    "AI定型句「重要な示唆」: 評価語ではなく、観測結果から何が言えるかを書く",
    "AI定型句「深い洞察」: 洞察の具体的な内容を書く",
    "AI定型句「重大な意味を持つ」: どの結果が何に与える意味かを書く",
    "AI定型句「画期的な手法」: 新規性を評価語で断定せず、既存手法との差を書く",
    "AI定型句「革新的なアプローチ」: 新規性を評価語で断定せず、既存手法との差を書く"
  ]);
});

test("節番号の括弧補足・独立性のぼかし・口語的言い回しを検出する", () => {
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
  handlers.Str({ text: "高いLOSO精度で得られた（第\\ref{sec:pebble-presence}節）。" });
  handlers.Str({ text: "摩耗状態や細かいペブル種別までの区別は，この交絡から独立できなかった。" });
  handlers.Str({ text: "粗い区分ほど頑健であるという一貫した傾向が見える。" });
  handlers.Str({ text: "現在の慣性センシングチャンネルと特徴量セットからは回収できない。" });
  handlers.Str({ text: "被験者を高い精度で言い当てられてしまった。" });
  assert.deepEqual(messages, [
    "AI定型句「（第\\ref{sec:pebble-presence}節）」: 節番号の括弧補足をやめ、地の文に「第N節で示すとおり」のように組み込む",
    "AI定型句「から独立できなかった」: 「〜から独立できなかった」を避け、「〜の影響を受けていた」等の具体的な言い方にする",
    "AI定型句「一貫した傾向」: 「一貫した傾向」を避け、観測された関係をそのまま書く",
    "AI定型句「回収できない」: 「回収できない」を避け、「検出できない」等の具体的な動詞にする",
    "AI定型句「言い当てられてしまった」: 口語的な「てしまう」を避け、「判別できた」等の中立的な表現にする"
  ]);
});

test("評価語の乱用・硬い言い回し・独自造語を検出する", () => {
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
  handlers.Str({ text: "粗い氷面条件を短い時間窓でも頑健に識別できるかを検証した。" });
  handlers.Str({ text: "Extra-FineとCoarse-Fineという2条件は個人差非依存でも本質的に区別困難である。" });
  handlers.Str({ text: "これらの結果は，元の限界の範囲を画定する。" });
  handlers.Str({ text: "Extra-Fine対Coarse-Fineの直接判別は未解決である。" });
  handlers.Str({ text: "速度不変表現が有効かを確認した。" });
  assert.deepEqual(messages, [
    "AI定型句「頑健に」: 「頑健に」という評価語を避け、具体的にどの程度・どう安定しているかを書く",
    "AI定型句「本質的に」: 「本質的に」という強調語を避け、何がどうであるかを直接書く",
    "AI定型句「画定する」: 「画定する」という硬い言い回しを避け、「示す」「絞り込む」等の平易な動詞にする",
    "AI定型句「直接判別」: 「直接」という修飾が必要か確認し、不要なら削って「判別」とする",
    "AI定型句「速度不変表現」: 「速度不変表現」という独自の複合語を避け、何を指すか平易に言い換える"
  ]);
});
