const { split } = require("sentence-splitter");

// 英語の略語で終わる文は文末とみなさない
const abbreviation = /\b(?:Fig|Figs|Eq|Eqs|Tab|Sec|Ch|Ref|Refs|No|vs|cf|etc|al|Dr|Mr|Ms|Prof|e\.g|i\.e)\.$/;

// 段落ごとに文へ分け、直前の文と同じ行に続く文を報告する（行内の文数を数える。fix は提供しない）
module.exports = (context) => {
  const { Syntax, RuleError, getSource, report } = context;
  return {
    [Syntax.Paragraph](node) {
      const text = getSource(node);
      let previous = null;
      for (const part of split(text)) {
        if (part.type === "Sentence") {
          // shortcut: 略語は上の一覧だけ、誤分割が目立ったら足す
          if (previous && !abbreviation.test(previous.raw) && !text.slice(previous.range[1], part.range[0]).includes("\n")) {
            report(node, new RuleError("1文1行にする（直前の文と同じ行にある）", { index: part.range[0] }));
          }
          previous = part;
        }
      }
    }
  };
};
