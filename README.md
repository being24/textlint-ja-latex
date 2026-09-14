# being-textlint-ja-latex

日本語 LaTeX 文書向けの共通 textlint 設定である。

```sh
npm install
npx being-textlint "**/*.tex"
npx being-textlint --mcp
```

`being-textlint` はこの package 内の設定と rule を指定して textlint を実行する。
日本語・英語の AI 的な定型・誇張表現、同一文の繰り返し、同じ導入句で始まる3文連続も検出する。英語は `slopless`、日本語の定型句は検出専用であり、文脈上必要な表現は修正しなくてよい。
