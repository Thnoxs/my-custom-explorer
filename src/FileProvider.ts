import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;

    private currentPath: string;

    constructor(rootPath: string) {
        this.currentPath = rootPath;
    }

    updatePath(newPath: string) {
        this.currentPath = newPath;
        this.refresh();
    }

    getRootPath(): string {
        return this.currentPath;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        const folderPath = element ? element.resourceUri.fsPath : this.currentPath;
        const config = vscode.workspace.getConfiguration('quickAccess');
        const showHidden = config.get<boolean>('showHidden');

        if (!folderPath || !this.pathExists(folderPath)) {return Promise.resolve([]);}

        try {
            const files = fs.readdirSync(folderPath);
            const fileItems = files.map(file => {
                if (!showHidden && file.startsWith('.')) {return null;}

                const filePath = path.join(folderPath, file);
                let stats;
                try { stats = fs.statSync(filePath); } catch { return null; }
                if (!stats) {return null;}

                const isDir = stats.isDirectory();
                return new FileItem(
                    file,
                    vscode.Uri.file(filePath),
                    isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    isDir
                );
            }).filter((item): item is FileItem => item !== null);

            fileItems.sort((a, b) => {
                if (a.collapsibleState === b.collapsibleState) {return a.label.localeCompare(b.label);}
                return a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed ? -1 : 1;
            });

            return Promise.resolve(fileItems);
        } catch (err) { return Promise.resolve([]); }
    }

    private pathExists(p: string): boolean {
        try { fs.accessSync(p); return true; } catch { return false; }
    }
}

export class FileItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly resourceUri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly isDirectory: boolean
    ) {
        super(label, collapsibleState);
        this.tooltip = this.resourceUri.fsPath;
        this.contextValue = isDirectory ? 'folder' : 'file';
        
        if (!isDirectory) {
            this.command = { command: 'vscode.open', title: "Open File", arguments: [this.resourceUri] };
        }
    }
}