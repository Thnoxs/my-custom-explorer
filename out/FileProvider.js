"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileItem = exports.FileProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    currentPath;
    constructor(rootPath) {
        this.currentPath = rootPath;
    }
    updatePath(newPath) {
        this.currentPath = newPath;
        this.refresh();
    }
    getRootPath() {
        return this.currentPath;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        const folderPath = element ? element.resourceUri.fsPath : this.currentPath;
        const config = vscode.workspace.getConfiguration('quickAccess');
        const showHidden = config.get('showHidden');
        if (!folderPath || !this.pathExists(folderPath)) {
            return Promise.resolve([]);
        }
        try {
            const files = fs.readdirSync(folderPath);
            const fileItems = files.map(file => {
                if (!showHidden && file.startsWith('.')) {
                    return null;
                }
                const filePath = path.join(folderPath, file);
                let stats;
                try {
                    stats = fs.statSync(filePath);
                }
                catch {
                    return null;
                }
                if (!stats) {
                    return null;
                }
                const isDir = stats.isDirectory();
                return new FileItem(file, vscode.Uri.file(filePath), isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None, isDir);
            }).filter((item) => item !== null);
            fileItems.sort((a, b) => {
                if (a.collapsibleState === b.collapsibleState) {
                    return a.label.localeCompare(b.label);
                }
                return a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed ? -1 : 1;
            });
            return Promise.resolve(fileItems);
        }
        catch (err) {
            return Promise.resolve([]);
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.FileProvider = FileProvider;
class FileItem extends vscode.TreeItem {
    label;
    resourceUri;
    collapsibleState;
    isDirectory;
    constructor(label, resourceUri, collapsibleState, isDirectory) {
        super(label, collapsibleState);
        this.label = label;
        this.resourceUri = resourceUri;
        this.collapsibleState = collapsibleState;
        this.isDirectory = isDirectory;
        this.tooltip = this.resourceUri.fsPath;
        this.contextValue = isDirectory ? 'folder' : 'file';
        if (!isDirectory) {
            this.command = { command: 'vscode.open', title: "Open File", arguments: [this.resourceUri] };
        }
    }
}
exports.FileItem = FileItem;
//# sourceMappingURL=FileProvider.js.map