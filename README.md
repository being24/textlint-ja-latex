# being-textlint-ja-latex

日本語 LaTeX 文書向けの共通 textlint 設定である。

```sh
npm install
npx being-textlint "**/*.tex"
npx being-textlint --mcp
```

`being-textlint` はこの package 内の設定と rule を指定して textlint を実行する。
日本語の表記・文体、同義語の表記揺れ、SI単位、日本語・英語の AI 的な定型・誇張表現、同一文の繰り返し、同じ導入句で始まる3文連続を検出する。英語は `slopless`、日本語の定型句は検出専用であり、文脈上必要な表現は修正しなくてよい。

## 論文向けの追加チェック

英語本文は [TeXtidote](https://github.com/sylvainhalle/textidote) で LaTeX 記法を処理してから文法・スペルを確認できる。Java と TeXtidote を別途用意し、英語だけのファイルを指定する。

```sh
java -jar /path/to/textidote.jar --check en --read-all chapters/abstract-en.tex
```

TeX Live または MiKTeX の [checkcites](https://ctan.org/pkg/checkcites) は、文書をビルドした後に未定義・未使用の引用を確認する。

```sh
checkcites main.aux
```

図表・数式などの未使用ラベルも調べる場合は、ドラフト時に [refcheck](https://ctan.org/pkg/refcheck) をプリアンブルへ追加して再ビルドする。投稿用 PDF では取り除く。
