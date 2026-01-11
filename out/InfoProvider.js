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
exports.InfoProvider = void 0;
const vscode = __importStar(require("vscode"));
class InfoProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        // Yahan aap apni links define karein
        return Promise.resolve([
            new InfoItem("Created by Thnoxs", "heart", undefined), // Sirf text
            new InfoItem("Visit Portfolio", "globe", "https://thnoxs.com"), // Website link
            new InfoItem("Buy me a Coffee", "coffee", "https://buymeacoffee.com/thnoxs") // Donation link
        ]);
    }
}
exports.InfoProvider = InfoProvider;
class InfoItem extends vscode.TreeItem {
    label;
    constructor(label, iconName, url) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
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
//# sourceMappingURL=InfoProvider.js.map