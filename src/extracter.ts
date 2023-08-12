import { Disposable } from 'vscode';

export interface ILineGetter extends Disposable {
  getLine(lineNumber: number): string | undefined;
}

export interface ICommandExtracter extends Disposable {
  extractCommand(baseLineNumber: number): string;
}

export class ShellCommandExtracter implements ICommandExtracter {
  constructor(private lineGetter: ILineGetter) {}

  dispose() {}

  extractCommand(baseLineNumber: number): string {
    const baseLine = this.lineGetter.getLine(baseLineNumber);
    if (!baseLine) {
      return '';
    }

    const lines: string[] = [];

    const cmdStartLine = this.findCommandStartLine(baseLineNumber);
    const cmdEndLine = this.findCommandEndLine(baseLineNumber);

    for (let i = cmdStartLine; i <= cmdEndLine; i++) {
      const line = this.lineGetter.getLine(i);
      if (line) {
        lines.push(line);
      }
    }

    return lines.join('\n');
  }

  private findCommandStartLine(baseLineNumber: number): number {
    // Case 1: Single line command
    // curl https://dummyjson.com/products
    //
    // Case 2: Multiline command
    // curl \
    //   -X GET \
    //   https://dummyjson.com/products
    //
    // Case	3: Combined command
    // curl https://dummyjson.com/products
    // curl \
    //   -X GET \
    //   https://dummyjson.com/products

    let startLine = baseLineNumber;

    for (let i = baseLineNumber; i >= 0; i--) {
      const line = this.lineGetter.getLine(i);
      if (line === undefined) {
        break;
      }

      startLine = i;

      if (this.hasLineContinuation(line)) {
        continue;
      }

      if (i !== baseLineNumber && !this.hasLineContinuation(line)) {
        startLine = i + 1;
        break;
      }
    }

    return startLine;
  }

  private findCommandEndLine(baseLineNumber: number): number {
    let endLine = baseLineNumber;

    let foundEndLine = false;
    for (let i = baseLineNumber; !foundEndLine; i++) {
      const line = this.lineGetter.getLine(i)!;
      if (line === undefined) {
        break;
      }

      endLine = i;

      if (!this.hasLineContinuation(line)) {
        break;
      }
    }

    return endLine;
  }

  private hasLineContinuation(line: string): boolean {
    return line.trim().endsWith('\\');
  }
}
