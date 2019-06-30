import * as vscode from 'vscode';
import { scss2css, css2sass } from './convertor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.scss2css', async () => {
			const { activeTextEditor:editor } = vscode.window;

			if(editor){
				const { range, text } = getConvertSrc({ editor });

				if(text && text.length){
					vscode.window.showInformationMessage('Start scss to css');

					try{
						const { text:convertedText } = await scss2css({
							data: text,
							indentedSyntax: false,
							outputStyle: 'expanded',
						});

						await openNewEditor({
							language: 'css',
							text: convertedText
						});

						vscode.window.showInformationMessage('Done scss to css');
					}catch(error){
						vscode.window.showErrorMessage(error.message);
					}
				}else{
					vscode.window.showInformationMessage('First step, You select text');
				}
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.css2scss', async () => {
			const { activeTextEditor:editor } = vscode.window;

			if(editor){
				const { range, text } = getConvertSrc({ editor });

				if(text && text.length){
					vscode.window.showInformationMessage('Start css to scss');

					try{
						const { text:convertedText } = await css2sass({
							data: text,
						});

						await openNewEditor({
							language: 'scss',
							text: convertedText
						});

						vscode.window.showInformationMessage('Done css to scss');
					}catch(error){
						vscode.window.showErrorMessage(error.message);
					}
				}else{
					vscode.window.showInformationMessage('First step, You select text');
				}
			}
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getConvertSrc({
	editor
}: {
	editor: vscode.TextEditor
}): {
	range: vscode.Range,
	text: string
}{
	const { document, selection, visibleRanges } = editor;
	let range: vscode.Range, text: string;
	
	if(!selection.isEmpty){
		range = new vscode.Range(selection.start, selection.end);
		text = document.getText(range);
	}else{
		range = visibleRanges[0];
		text = document.getText();
	}

	return {
		range,
		text
	};
}

async function replaceText({
	editor, 
	range, 
	text
}: {
	editor: vscode.TextEditor,
	range: vscode.Range,
	text: string
}): Promise<void>{
	return new Promise((resolve) => {
		editor.edit((edit) => {
			edit.replace(range, text);
			resolve();
		});
	});
}

async function openNewEditor({ 
	text ,
	language
}: {
	text: string,
	language: string
}): Promise<void>{
	const doc = await vscode.workspace.openTextDocument({ language, content: text });
	await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
}