import * as vscode from "vscode";
import { promises as fs } from "fs";
import * as path from "path";

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
  let doc: vscode.TextDocument|undefined;

  if(fileName) {
    const filePath = path.resolve(fileName);

    try{
      let isExist = false;
      let writeMethodName: string | undefined = getConfiguration('saveMode');
      let fileHandle: fs.FileHandle | undefined;
      
      try{
        fileHandle = await fs.open(filePath, 'r');
        isExist = true;
      }catch(error){
        if(error.code !== 'EEXIST'){
          throw error;
        }
      }

      if(fileHandle){
        fileHandle.close();
      }

      if(isExist && writeMethodName === "ask"){
        writeMethodName = await vscode.window.showWarningMessage(
          'File already exist.', 
          'override', 'append', 'cancel'
        );
      }

      switch(writeMethodName){
        case 'override':
          await fs.writeFile(filePath, text);
          doc = await vscode.workspace.openTextDocument(fileName);
          break;
        case 'append':
          await fs.appendFile(filePath, `\n\n${text}`);   
          doc = await vscode.workspace.openTextDocument(fileName);
          break;
        default:
          break;
      }
    }catch(error){
      vscode.window.showErrorMessage('File creation failed.');
    }
  }

  if(doc == null){
    doc = await vscode.workspace.openTextDocument({
      language,
      content: text
    });
  }

  await vscode.window.showTextDocument(doc, {
    viewColumn: vscode.ViewColumn.Beside
  });
}

export function getConfiguration(section: string): any{
  return vscode.workspace.getConfiguration("scss2css").get(section);
} 