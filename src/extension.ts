import * as vscode from 'vscode';

function inferType(value: any): string {
  if (Array.isArray(value)) {
    return `${inferType(value[0])}[]`;
  } else if (typeof value === 'string') {
    return 'string';
  } else if (typeof value === 'number') {
    return 'number';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (typeof value === 'object' && value !== null) {
    return 'object';
  } else {
    return 'any';
  }
}

function capitalizeFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



function generateInterface(jsonData: any, interfaceName: string = 'Root'): string {
  let result = `interface ${interfaceName} {\n`;

  for (let key in jsonData) {
    let type = inferType(jsonData[key]);
    console.log(type);      
    if (type === 'object'){
      const interfaceTitle = capitalizeFirstChar(key);
  
      const newInterface = generateInterface(jsonData[key], interfaceTitle);
      result = newInterface + result;
      type = interfaceTitle;
    }
    result += `  ${key}: ${type};\n`;
  }

  result += `}\n`;
  return result;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.convertJsonToInterface', () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const jsonText = document.getText(selection) || document.getText();

      try {
        const jsonData = JSON.parse(jsonText);

        const tsInterface = generateInterface(jsonData);

        editor.edit((editBuilder) => {
          editBuilder.replace(selection.isEmpty ? new vscode.Range(0, 0, document.lineCount, 0) : selection, tsInterface);
        });
      } catch (error) {
        vscode.window.showErrorMessage('Invalid JSON. Please check your JSON format.');
      }
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
