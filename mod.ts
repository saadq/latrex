import { delimiter, join } from 'https://deno.land/std@0.113.0/path/mod.ts';

/** Options for the latrex function. */
export interface Options {
  /** The command to run for your compiling your LaTeX document (pdflatex, xetex, /user/bin/custom-tex, etc). Defaults to `pdflatex`. */
  command?: string;

  /** Arguments passed to the command. Defaults to ['-halt-on-error']. */
  args?: string[];

  /** A list of absolute paths to the directory which contains the assets necessary for the doc. */
  inputs?: string[];

  /** The number of times to run options.command. Some documents require multiple * passes. Only works when doc is a string. Defaults to 1. */
  passes?: number;

  /** The path to the file where you want to save the contents of the error log to. */
  errorLogsPath?: string;
}

/** A function that runs a LaTeX child process on a given docment. */
export async function latrex(
  texDoc: Uint8Array | string,
  options: Options = {},
): Promise<Uint8Array> {
  const tempDir = await Deno.makeTempDir();
  const jobName = 'latrex';
  const {
    command = 'pdflatex',
    args = [],
    inputs = [tempDir],
    passes = 1,
  } = options;
  const inputsPath = inputs.join(delimiter) + delimiter;

  const encodedDocument = texDoc instanceof Uint8Array
    ? texDoc
    : new TextEncoder().encode(texDoc);

  for (let i = 0; i < passes; i++) {
    const process = Deno.run({
      cmd: [command, `-jobname=${jobName}`, '-halt-on-error', ...args],
      cwd: tempDir,
      env: {
        TEXINPUTS: inputsPath,
        TTFONTS: inputsPath,
        OPENTYPEFONTS: inputsPath,
      },
      stdin: 'piped',
      stdout: 'piped',
    });

    await process.stdin.write(encodedDocument);
    process.stdin.close();

    const status = await process.status();
    if (!status.success) {
      let errorMessage = 'latrex was unable to compile the LaTeX document.';

      if (options.errorLogsPath) {
        const logPath = join(tempDir, `${jobName}.log`);
        await Deno.copyFile(logPath, options.errorLogsPath);
      } else {
        errorMessage +=
          'You can pass the `errorLogsPath` option to `latrex()` to see the full error output.';
      }

      await Deno.remove(tempDir, { recursive: true });
      throw new Error(errorMessage);
    }
  }

  const outputPath = join(tempDir, `${jobName}.pdf`);
  const pdf = await Deno.readFile(outputPath);
  await Deno.remove(tempDir, { recursive: true });

  return pdf;
}
