# latrex

> A small wrapper for generating PDFs with LaTeX in Deno.

## Requirements

LaTeX must be installed on your machine. You can download it [here](https://www.latex-project.org/get/).

## Usage


### TeX file

```ts
import { latrex } from "https://deno.land/x/latrex/mod.ts";

const document = await Deno.readFile("./document.tex");
const pdf = await latrex(document);
await Deno.writeFile("./output.pdf", pdf);
```

### TeX string

```ts
import { latrex } from "https://deno.land/x/latrex/mod.ts";

const document = `
  \\documentclass{article}
  \\begin{document}
  hello world
  \\end{document}
`

const pdf = await latrex(document);
await Deno.writeFile("./output.pdf", pdf);
```

### With all options

```ts
const pdf = await latrex(document, { 
  command: 'xelatex',
  args: ['-no-file-line-error', '-no-pdf'],
  inputs: ['./styles', './fonts'],
  passes: 3,
  errorLogsPath: './my-tex-errors.log'
});
```

### Options

| **Option**      | **Type**   | **Default**          | **Description**                                                                                                               | 
| --------------- | ---------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `command`       | `string`   | `'pdflatex'`         | The command to run for your compiling your LaTeX document (pdflatex, xetex, /user/bin/custom-tex, etc).                       |
| `args`          | `string[]` | `['-halt-on-error']` | Arguments passed to the command.                                                                                              |
| `passes`        | `number`   | `1`                  | The number of times to run `options.command`. Some documents require multiple passes. Only works when doc is a string.        |
| `inputs`        | `string[]` | N/A                  | A list of absolute paths to the directory which contains the assets necessary for the doc (such as fonts or cls files, etc).  |
| `errorLogsPath` | `string`   | N/A                  | The path to the file where you want to save the contents of the error log to.                                                 |