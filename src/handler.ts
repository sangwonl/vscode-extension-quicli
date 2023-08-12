import { Disposable, Terminal, window } from 'vscode';
import { ICommandExtracter, ILineGetter } from './extracter';

const TERMINAL_NAME = 'QuiCLI';

type CmdHandlerMap = { [command: string]: (args: any[]) => void };

export class CommandHandler implements Disposable {
  private handlerMap: CmdHandlerMap = {};

  constructor(private commandExtracter: ICommandExtracter) {
    this.handlerMap = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'quicli.runCommandInTerminal': this.onRunCommandInTerminal,
    };
  }

  dispose() {}

  forEach(callback: (command: string, handler: (args: any[]) => void) => void) {
    Object.entries(this.handlerMap).forEach(([command, handler]) => {
      callback(command, handler);
    });
  }

  private onRunCommandInTerminal = (_args: any[]) => {
    const cursorLine = this.getCursorLineNumber();
    if (cursorLine === undefined) {
      return;
    }

    const command = this.commandExtracter.extractCommand(cursorLine);

    const term = this.getOrCreateTerminal(TERMINAL_NAME);
    term.sendText(command, true);
    term.show(true);
  };

  private getCursorLineNumber = (): number | undefined => {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      return undefined;
    }

    return activeEditor.selection.active.line;
  };

  private getOrCreateTerminal = (name: string): Terminal => {
    let term = window.terminals.find(t => t.name === name);
    if (!term) {
      term = window.createTerminal(name);
    }
    return term;
  };
}

export class TextEditorLineGetter implements ILineGetter {
  dispose() {}

  getLine(lineNumber: number): string | undefined {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      return undefined;
    }

    return activeEditor.document.lineAt(lineNumber).text;
  }
}
