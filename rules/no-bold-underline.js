// 直前のバックスラッシュが偶数個のときだけ命令として実行される（奇数個なら \\ の改行や文字の一部）
const command = /(?<!\\)((?:\\\\)*)\\(textbf|bfseries|bf|underline|underbar|uline|uuline|ul)(?![A-Za-z@])/g;

// latex2e は数式も Code/CodeBlock にするため、数式は走査対象に残して \verb と verbatim 系環境だけを除く
const isVerbatim = (source) => /^\\verb\b|^\\begin\{(?:verbatim|Verbatim|lstlisting|minted)\*?\}/.test(source);

const mask = (text, ranges) => {
  const chars = text.split("");
  for (const [start, end] of ranges) {
    for (let index = start; index < end && index < chars.length; index++) {
      if (chars[index] !== "\n") chars[index] = " ";
    }
  }
  return chars.join("");
};

module.exports = (context) => {
  const { Syntax, RuleError, getSource, report } = context;
  const skipped = [];
  const skipVerbatim = (node) => {
    if (isVerbatim(getSource(node))) skipped.push(node.range);
  };
  return {
    [Syntax.Comment]: (node) => skipped.push(node.range),
    [Syntax.Code]: skipVerbatim,
    [Syntax.CodeBlock]: skipVerbatim,
    [Syntax.DocumentExit](node) {
      const text = mask(getSource(node), skipped);
      for (const match of text.matchAll(command)) {
        const index = match.index + match[1].length;
        if (text.slice(0, index).endsWith("\\string")) continue;
        report(node, new RuleError(`論文では太字・下線を使わない（\\${match[2]}）`, { index }));
      }
    }
  };
};
