import * as vscode from "vscode";

export function getConvertSrc({
  editor,
  languageId
}: {
  editor: vscode.TextEditor;
  languageId?: string;
}): {
  range: vscode.Range;
  text: string;
  fileName: string;
} {
  const { document, selection, visibleRanges } = editor;
  const { fileName, languageId: srcLanguageId } = document;
  let range: vscode.Range = new vscode.Range(selection.start, selection.end);
  let text: string = document.getText(range);

  if (selection.isEmpty && srcLanguageId === languageId) {
    range = visibleRanges[0];
    text = document.getText();
  }

  return {
    range,
    text,
    fileName
  };
}

export async function replaceText({
  editor,
  range,
  text
}: {
  editor: vscode.TextEditor;
  range: vscode.Range;
  text: string;
}): Promise<void> {
  return new Promise(resolve => {
    editor.edit(edit => {
      edit.replace(range, text);
      resolve();
    });
  });
}

export async function openNewEditor({
  text,
  language,
  fileName
}: {
  text: string;
  language: string;
  fileName?: string;
}): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({
    language,
    content: text
  });
  await vscode.window.showTextDocument(doc, {
    viewColumn: vscode.ViewColumn.Beside
  });
}

export function getConfiguration(section: string){
  return vscode.workspace.getConfiguration("scss2css").get(section);
} 