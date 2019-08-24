import * as vscode from "vscode";
import { scssToCss, cssToScss } from "./convertor";
import { get } from "lodash";
import { getConfiguration, getConvertSrc, replaceText, openNewEditor } from "./util";

const avaliableConvert = {
  css: {
    scss: cssToScss
  },
  scss: {
    css: scssToCss
  }
};

export default function getCommandHandler({
  srcLanguageId,
  targetLanguageId
}: {
  srcLanguageId: string;
  targetLanguageId: string;
}): (...args: any[]) => Promise<any> {
  const convertFunction = get(
    avaliableConvert,
    `${srcLanguageId}.${targetLanguageId}`
  );

  if (convertFunction == null) {
    throw Error("Not avalilable.");
  }

  return async () => {
    const { activeTextEditor: editor } = vscode.window;

    if (editor) {
      let { range, text, fileName } = getConvertSrc({
        editor,
        languageId: srcLanguageId
      });

      if (text && text.length) {
        try {
          const targetOptions: any = getConfiguration(targetLanguageId);
          const { text: convertedText } = await convertFunction({
            ...targetOptions, 
            data: text
          });
          const mode: any = getConfiguration("mode");

          switch(mode){
            case "replace":
              await replaceText({
                editor,
                range,
                text: convertedText
              });
              break;
            case "save":
              await openNewEditor({
                language: targetLanguageId,
                text: convertedText,
                fileName: fileName
                  ? fileName.replace(`.${srcLanguageId}`, `.${targetLanguageId}`)
                  : undefined
              });
              break;
            default:
              await openNewEditor({
                language: targetLanguageId,
                text: convertedText
              });
              break;
          }

          vscode.window.showInformationMessage(
            `Done ${srcLanguageId} to ${targetLanguageId}`
          );
        } catch (error) {
          vscode.window.showErrorMessage(error.message);
        }
      } else {
        vscode.window.showInformationMessage("First step, You select text");
      }
    }
  };
}
