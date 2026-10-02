const command = /\\(textbf|bfseries|bf|underline|underbar|uline|uuline|ul)(?![A-Za-z])/g;

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
  const skip = (node) => skipped.push(node.range);
  return {
    [Syntax.Comment]: skip,
    [Syntax.Code]: skip,
    [Syntax.CodeBlock]: skip,
    [Syntax.DocumentExit](node) {
      const text = mask(getSource(node), skipped);
      for (const match of text.matchAll(command)) {
        report(node, new RuleError(`論文では太字・下線を使わない（\\${match[1]}）`, { index: match.index }));
      }
    }
  };
};
