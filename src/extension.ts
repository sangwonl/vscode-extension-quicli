import * as vscode from 'vscode';

const TERMINAL_NAME = 'QuiCLI';

const COMMAND_HANDLERS: { [command: string]: (args: any[]) => void } = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'quicli.runCommandInTerminal': onRunCommandInTerminal,
};

function onRunCommandInTerminal(_args: any[]) {
  const command = extractExecutableCommand(getTextAtCursorLine());

  const term = getOrCreateTerminal(TERMINAL_NAME);
  term.sendText(command, true);
  term.show(true);
}

function getTextAtCursorLine(): string {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return '';
  }

  const { text } = activeEditor.document.lineAt(
    activeEditor.selection.active.line,
  );
  return text;
}

function extractExecutableCommand(text: string): string {
  return text;
}

function getOrCreateTerminal(name: string): vscode.Terminal {
  let term = vscode.window.terminals.find(t => t.name === name);
  if (!term) {
    term = vscode.window.createTerminal(name);
  }
  return term;
}

export function activate(context: vscode.ExtensionContext) {
  Object.entries(COMMAND_HANDLERS).forEach(([command, handler]) => {
    const disposable = vscode.commands.registerCommand(command, handler);
    context.subscriptions.push(disposable);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
