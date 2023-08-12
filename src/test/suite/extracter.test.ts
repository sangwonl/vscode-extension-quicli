import * as assert from 'assert';

import { ILineGetter, ShellCommandExtracter } from '../../extracter';

class MockLineGetter implements ILineGetter {
  constructor(private sourceText: string) {}

  dispose() {}

  getLine(lineNumber: number): string | undefined {
    const lines = this.sourceText.split('\n');
    if (lines.length === 0 || lineNumber >= lines.length) {
      return undefined;
    }
    return lines[lineNumber];
  }
}

suite('Extracter Test Suite', () => {
  const singlelineCommand = 'curl https://dummyjson.com/products';
  const multilineCommand = `curl \\
    -X POST \\
    -H "Content-Type: application/json" \\
    -d '{"title": "QuiCLI"}' \\
    https://dummyjson.com/products/1`;
  const combinedCommand = `${singlelineCommand}\n${multilineCommand}`;

  test('Get text at specific line', () => {
    const lineGetter: ILineGetter = new MockLineGetter(multilineCommand);
    assert.strictEqual('curl \\', lineGetter.getLine(0)?.trim());
    assert.strictEqual('-X POST \\', lineGetter.getLine(1)?.trim());
    assert.strictEqual(
      '-H "Content-Type: application/json" \\',
      lineGetter.getLine(2)?.trim(),
    );
    assert.strictEqual(
      `-d '{"title": "QuiCLI"}' \\`,
      lineGetter.getLine(3)?.trim(),
    );
    assert.strictEqual(
      'https://dummyjson.com/products/1',
      lineGetter.getLine(4)?.trim(),
    );
  });

  test('Extract shell command (Singleline)', () => {
    const lineGetter: ILineGetter = new MockLineGetter(singlelineCommand);
    const extracter = new ShellCommandExtracter(lineGetter);
    const command = extracter.extractCommand(0);
    assert.strictEqual('curl https://dummyjson.com/products', command);
  });

  test('Extract shell command (Multiline)', () => {
    const lineGetter: ILineGetter = new MockLineGetter(multilineCommand);
    const extracter = new ShellCommandExtracter(lineGetter);
    assert.strictEqual(multilineCommand, extracter.extractCommand(0));
    assert.strictEqual(multilineCommand, extracter.extractCommand(1));
    assert.strictEqual(multilineCommand, extracter.extractCommand(2));
    assert.strictEqual(multilineCommand, extracter.extractCommand(3));
    assert.strictEqual(multilineCommand, extracter.extractCommand(4));
  });

  test('Extract shell command (Combined)', () => {
    const lineGetter: ILineGetter = new MockLineGetter(combinedCommand);
    const extracter = new ShellCommandExtracter(lineGetter);
    assert.strictEqual(singlelineCommand, extracter.extractCommand(0));
    assert.strictEqual(multilineCommand, extracter.extractCommand(1));
    assert.strictEqual(multilineCommand, extracter.extractCommand(2));
    assert.strictEqual(multilineCommand, extracter.extractCommand(3));
    assert.strictEqual(multilineCommand, extracter.extractCommand(4));
  });
});
