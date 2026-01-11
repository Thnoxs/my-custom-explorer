import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileProvider, FileItem } from './FileProvider';
import { InfoProvider } from './InfoProvider';

export function activate(context: vscode.ExtensionContext) {

    let currentRoot = context.globalState.get<string>('rootPath') || path.join(os.homedir(), 'Desktop');
    const fileProvider = new FileProvider(currentRoot);
    
    // Create TreeView (Variable me store kiya taaki selection access kar sakein)
    const treeView = vscode.window.createTreeView('quickAccessView', {
        treeDataProvider: fileProvider
    });

    vscode.window.registerTreeDataProvider('infoView', new InfoProvider());

    // --- EVENTS & UTILS ---
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('quickAccess.showHidden')) {fileProvider.refresh();}
    });

    const refresh = () => fileProvider.refresh();

    // Helper: Determine Target Path (Smart Logic)
    const getTargetDirectory = (node?: FileItem): string => {
        // 1. Agar Context Menu (Right Click) se call hua hai -> Use Node Path
        if (node) {
            return node.isDirectory ? node.resourceUri.fsPath : path.dirname(node.resourceUri.fsPath);
        }

        // 2. Agar Top Button click hua hai -> Check Selection
        if (treeView.selection.length > 0) {
            const selectedNode = treeView.selection[0];
            // Agar folder select hai to uske andar, agar file select hai to uske parent folder me
            return selectedNode.isDirectory ? selectedNode.resourceUri.fsPath : path.dirname(selectedNode.resourceUri.fsPath);
        }

        // 3. Kuch nahi select -> Root Path
        return fileProvider.getRootPath();
    };

    // --- COMMANDS ---

    // 1. CREATE FILE
    vscode.commands.registerCommand('quickAccess.createFile', async (node?: FileItem) => {
        const targetDir = getTargetDirectory(node);
        
        const fileName = await vscode.window.showInputBox({ 
            placeHolder: 'Filename (e.g., style.css)',
            prompt: `Creating file in: ${path.basename(targetDir)}` 
        });
        
        if (fileName) {
            const filePath = path.join(targetDir, fileName);
            try {
                fs.writeFileSync(filePath, '');
                refresh();
                vscode.window.showTextDocument(vscode.Uri.file(filePath));
            } catch (e) { vscode.window.showErrorMessage("Error creating file"); }
        }
    });

    // 2. CREATE FOLDER
    vscode.commands.registerCommand('quickAccess.createFolder', async (node?: FileItem) => {
        const targetDir = getTargetDirectory(node);

        const folderName = await vscode.window.showInputBox({ 
            placeHolder: 'Folder Name',
            prompt: `Creating folder in: ${path.basename(targetDir)}`
        });

        if (folderName) {
            const folderPath = path.join(targetDir, folderName);
            try {
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                    refresh();
                } else { vscode.window.showErrorMessage("Folder exists!"); }
            } catch (e) { vscode.window.showErrorMessage("Error creating folder"); }
        }
    });

    // 3. COPY PATH
    vscode.commands.registerCommand('quickAccess.copyPath', (node: FileItem) => {
        if (node) {
            vscode.env.clipboard.writeText(node.resourceUri.fsPath);
            vscode.window.showInformationMessage(`Path Copied: ${node.label}`);
        }
    });

    // 4. DELETE
    vscode.commands.registerCommand('quickAccess.delete', async (node: FileItem) => {
        if (!node) {return;}
        const confirm = await vscode.window.showWarningMessage(`Delete ${node.label}?`, { modal: true }, 'Delete');
        if (confirm === 'Delete') {
            try {
                fs.rmSync(node.resourceUri.fsPath, { recursive: true, force: true });
                refresh();
            } catch (e) { vscode.window.showErrorMessage("Delete failed"); }
        }
    });

    // 5. RENAME & REVEAL & OPEN URL
    vscode.commands.registerCommand('quickAccess.rename', async (node: FileItem) => {
        if (!node) {return;}
        const newName = await vscode.window.showInputBox({ value: node.label, placeHolder: 'New Name' });
        if (newName && newName !== node.label) {
            try {
                fs.renameSync(node.resourceUri.fsPath, path.join(path.dirname(node.resourceUri.fsPath), newName));
                refresh();
            } catch (e) { vscode.window.showErrorMessage("Rename failed"); }
        }
    });

    vscode.commands.registerCommand('quickAccess.revealInOS', (node: FileItem) => {
        if (node) {vscode.commands.executeCommand('revealFileInOS', node.resourceUri);}
    });

    vscode.commands.registerCommand('quickAccess.openUrl', (url: string) => vscode.env.openExternal(vscode.Uri.parse(url)));
    vscode.commands.registerCommand('quickAccess.refresh', () => refresh());

    // 6. CHANGE ROOT FOLDER
    vscode.commands.registerCommand('quickAccess.changeFolder', async () => {
        const homeDir = os.homedir();
        const options = [
            { label: '$(desktop-download) Desktop', path: path.join(homeDir, 'Desktop') },
            { label: '$(cloud-download) Downloads', path: path.join(homeDir, 'Downloads') },
            { label: '$(file-directory) Documents', path: path.join(homeDir, 'Documents') },
            { label: '$(search) Custom Folder...', path: 'CUSTOM' }
        ];
        const selected = await vscode.window.showQuickPick(options, { placeHolder: 'Select Root Folder' });
        if (selected) {
            let targetPath = selected.path;
            if (targetPath === 'CUSTOM') {
                const folderUri = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
                if (folderUri && folderUri[0]){ targetPath = folderUri[0].fsPath;} else {return;}
            }
            await context.globalState.update('rootPath', targetPath);
            fileProvider.updatePath(targetPath);
        }
    });
}
export function deactivate() {}