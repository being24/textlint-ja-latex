// Japanese checks adapted from https://github.com/bamboo-nova/meiseki (MIT License).
const japanesePhrases = [
  [/に他な(?:らない|りません)/g, "主張をそのまま書く"],
  [/重要なのは/g, "主張をそのまま書く"],
  [/見ていき(?:ましょう|ます)/g, "予告を削って本題から入る"],
  [/多角的/g, "何をどう見たかを書く"],
  [/包括的/g, "何を網羅したかを書く"],
  [/不可欠/g, "なぜ必要かを書く"],
  [/鍵となる/g, "何がどう効くかを書く"],
  [/非常に|極めて/g, "削るか具体的な程度を書く"],
  [/掘り下げ|深掘り/g, "何をどう調べる・書くかを言う"],
  [/(?:から)?直接導かれる/g, "導出のニュアンスを削り主張をそのまま書く"],
  [/まで崩壊した/g, "誇張を避け実際の値や変化を書く"],
  [/ことと整合する/g, "確認的な言い回しを削り事実をそのまま書く"],
  [/という(?:確定)?結果を報告した/g, "「報告した」を介さず主張をそのまま書く"]
];

const phrases = japanesePhrases;

const sentences = (text) =>
  [...text.matchAll(/[^。．！？\n]+[。．！？]/gu)].map((match) => ({
    text: match[0].trim(),
    index: match.index + match[0].indexOf(match[0].trim())
  }));

const leadingPhrase = (sentence) => sentence.match(/^.{2,12}?(?:では|には|とは|は|が|を|に|で|と|も)/u)?.[0] ?? sentence.slice(0, 5);

module.exports = (context) => {
  const { Syntax, RuleError, getSource, report } = context;
  return {
    [Syntax.Str](node) {
      const text = getSource(node);
      for (const [pattern, message] of phrases) {
        for (const match of text.matchAll(pattern)) {
          report(node, new RuleError(`AI定型句「${match[0]}」: ${message}`, { index: match.index }));
        }
      }
    },
    [Syntax.Paragraph](node) {
      const paragraph = sentences(getSource(node));
      const seen = new Set();
      for (const sentence of paragraph) {
        const normalized = sentence.text.replace(/\s/gu, "");
        if (normalized.length >= 8 && seen.has(normalized)) {
          report(node, new RuleError(`同一文の繰り返し「${sentence.text}」`, { index: sentence.index }));
        }
        seen.add(normalized);
      }
      for (let index = 2; index < paragraph.length; index++) {
        const lead = leadingPhrase(paragraph[index].text);
        if (
          lead.length >= 4 &&
          lead === leadingPhrase(paragraph[index - 1].text) &&
          lead === leadingPhrase(paragraph[index - 2].text) &&
          (index === 2 || lead !== leadingPhrase(paragraph[index - 3].text))
        ) {
          report(node, new RuleError(`同じ導入句「${lead}」で始まる文が3文連続しています`, { index: paragraph[index].index }));
        }
      }
    }
  };
};
