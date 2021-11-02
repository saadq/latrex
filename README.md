# denotex

> A small wrapper for generating PDFs with LaTeX in Deno.

## Requirements

LaTeX must be installed on your machine. You can download it [here](https://www.latex-project.org/get/).

## Usage


### TeX file

```ts
import { denotex } from "https://deno.land/x/denotex/mod.ts";

const document = await Deno.readFile("./document.tex");
const pdf = await denotex(document);
await Deno.writeFile("./output.pdf", pdf);
```

### TeX string

```ts
import { denotex } from "https://deno.land/x/denotex/mod.ts";

const document = `
  \\documentclass{article}
  \\begin{document}
  hello world
  \\end{document}
`

const pdf = await denotex(document);
await Deno.writeFile("./output.pdf", pdf);
```

### Options

```ts
const pdf = await denotex(document, { 
  command: 'xelatex',
  args: ['-no-file-line-error', '-no-pdf'],
  inputs: ['./styles', './fonts'],
  passes: 3,
  errorLogsPath: './my-tex-errors.log'
});
```