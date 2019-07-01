import * as vscode from "vscode";
import { scss2css, css2scss } from "./convertor";
import { get } from "lodash";
import { getConfiguration, getConvertSrc, replaceText, openNewEditor } from "./util";

const avaliableConvert = {
  css: {
    scss: css2scss
  },
  scss: {
    css: scss2css
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
      const { range, text, fileName } = getConvertSrc({
        editor,
        languageId: srcLanguageId
      });

      if (text && text.length) {
        vscode.window.showInformationMessage(
          `Start ${srcLanguageId} to ${targetLanguageId}`
        );

        try {
          const { text: convertedText } = await convertFunction({
            data: text
          });
          const mode: any = getConfiguration("mode");

          if (mode === "replace") {
            await replaceText({
              editor,
              range,
              text: convertedText
            });
          } else {
            await openNewEditor({
              language: targetLanguageId,
              text: convertedText,
              fileName: fileName
                ? fileName.replace(`.${srcLanguageId}`, `.${targetLanguageId}`)
                : undefined
            });
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
