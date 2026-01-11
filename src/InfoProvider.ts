import * as vscode from 'vscode';

export class InfoProvider implements vscode.TreeDataProvider<InfoItem> {
    getTreeItem(element: InfoItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<InfoItem[]> {
        // Yahan aap apni links define karein
        return Promise.resolve([
            new InfoItem("Created by Thnoxs", "heart", undefined), // Sirf text
            new InfoItem("Visit Portfolio", "globe", "https://thnoxs.com"), // Website link
            new InfoItem("Buy me a Coffee", "coffee", "https://buymeacoffee.com/thnoxs") // Donation link
        
        ]);
       
    }
}

class InfoItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        iconName: string,
        url?: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        
        // Built-in VS Code Icons use kiye (professional look ke liye)
        this.iconPath = new vscode.ThemeIcon(iconName);

        if (url) {
            this.command = {
                command: 'quickAccess.openUrl',
                title: 'Open Link',
                arguments: [url]
            };
            this.tooltip = "Click to open in browser";
        }
    }
}