import {
    Plugin,
} from 'obsidian';
import { VIEW_TYPE } from './view'
import { WorkspaceLeaf } from "obsidian";
import LayerPopupModal from './LayerPopupModal'
import { SliderView, VIEW_TYPE_SLIDER } from './SliderView'
interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
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

