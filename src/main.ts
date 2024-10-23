import {
    Plugin,
} from 'obsidian';
import { VIEW_TYPE } from './view'
import { WorkspaceLeaf, Editor, MarkdownView } from "obsidian";
import LayerPopupModal from './LayerPopupModal'
import { SliderView, VIEW_TYPE_SLIDER } from './SliderView'
import { SettingTab } from "./settings";
import { guidanceFileName } from "./utils";


interface MyPluginSettings {
    publishFolderName: string;
    gitRepoURL: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    publishFolderName: 'md',
    gitRepoURL: 'https://github.com/xmind-obsidian/xmind-obsidian.git'
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        this.addRibbonIcon('hammer', '更新博客', (evt) => {
            // this.activateView()
            this.activateSliderView()
        })

        // 注册一个侧边栏
        this.registerView(VIEW_TYPE_SLIDER, (leaf) => new SliderView(leaf))

        // 添加一个settingTab
        this.addSettingTab(new SettingTab(this.app, this))

        // publish file
        this.addCommand({
            id: 'to-publish-folder',
            name: 'to publish folder',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const currentFile = this.app.workspace.getActiveFile();
                const fileName = currentFile?.name;
                const destinationFileName = `${this.settings.publishFolderName}/${fileName}`;
                const destinationFileExisted = this.app.vault.getAbstractFileByPath(destinationFileName);
                if (destinationFileExisted) {
                    const existedFile = this.app.vault.getFileByPath(destinationFileName);
                    if (existedFile) {
                        await this.app.vault.delete(existedFile);
                    }
                }
                if (currentFile && fileName) {
                    console.log('file updated');
                    await this.app.vault.copy(currentFile, destinationFileName);
                }
            },
        });

        // open guidance file
        this.addCommand({
            id: 'open-start-file',
            name: 'open start file',
            callback: async () => {
                const guidanceFile = this.app.vault.getAbstractFileByPath(`${this.settings.publishFolderName}/${guidanceFileName}`);
                console.log('guidanceFile', guidanceFile);
                if (guidanceFile) {
                    this.app.workspace.openLinkText(guidanceFile.path, '');
                }
            },
        });
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE)
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        new LayerPopupModal(this.app).open()
    }

    async activateSliderView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_SLIDER);

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0];
        } else {
            // Our view could not be found in the workspace, create a new leaf
            // in the right sidebar for it
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_SLIDER, active: true });
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        workspace.revealLeaf(leaf);
    }
}

