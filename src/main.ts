import {
    App,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting
} from 'obsidian';
import { LayerPopup, VIEW_TYPE } from './view'
import LayerPopupModal from './LayerPopupModal'

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
        this.addRibbonIcon('hammer', 'Open my view', (evt) => {
            this.activateView()
        })

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
}

