import { delimiter, join } from "https://deno.land/std@0.113.0/path/mod.ts";

interface Options {
  command?: string;
  args?: string[];
  inputs?: string[];
  passes?: number;
  errorLogsPath?: string;
}

export async function denotex(
  texDoc: Uint8Array | string,
  options: Options = {},
): Promise<Uint8Array> {
  const tempDir = await Deno.makeTempDir();
  const jobName = "denotex";
  const {
    command = "pdflatex",
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
      cmd: [command, `-jobname=${jobName}`, "-halt-on-error", ...args],
      cwd: tempDir,
      env: {
        TEXINPUTS: inputsPath,
        TTFONTS: inputsPath,
        OPENTYPEFONTS: inputsPath,
      },
      stdin: "piped",
      stdout: "piped",
    });

    await process.stdin.write(encodedDocument);
    process.stdin.close();

    const status = await process.status();
    if (!status.success) {
      let errorMessage = "denotex was unable to compile the LaTeX document.";

      if (options.errorLogsPath) {
        const logPath = join(tempDir, `${jobName}.log`);
        await Deno.copyFile(logPath, options.errorLogsPath);
      } else {
        errorMessage +=
          "You can pass the `errorLogsPath` flag to see the full error output.";
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
