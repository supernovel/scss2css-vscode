import * as vscode from "vscode";
import getCommandHandler from "./handler";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.scss2css",
      getCommandHandler({
        srcLanguageId: "scss",
        targetLanguageId: "css"
      })
    ),
    vscode.commands.registerCommand(
      "extension.css2scss",
      getCommandHandler({
        srcLanguageId: "css",
        targetLanguageId: "scss"
      })
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}