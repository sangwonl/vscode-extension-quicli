import { ExtensionContext, commands } from 'vscode';
import { ShellCommandExtracter } from './extracter';
import { CommandHandler, TextEditorLineGetter } from './handler';

export function activate(context: ExtensionContext) {
  const cmdExtracter = new ShellCommandExtracter(new TextEditorLineGetter());
  context.subscriptions.push(cmdExtracter);

  const cmdHandler = new CommandHandler(cmdExtracter);
  context.subscriptions.push(cmdHandler);

  cmdHandler.forEach((command, handler) => {
    const disposable = commands.registerCommand(command, handler);
    context.subscriptions.push(disposable);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
