// 创建一个modal
import { Modal,App} from 'obsidian';
import { createApp, App as VueApp } from 'vue';
import Popup from './LayerPopupModal.vue';
class LayerPopupModal extends Modal {
    vueapp: VueApp;

    constructor(app: App) {
        super(app);
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.setText("更新博客");
        const container = this.containerEl.children[1];
        let content = container.createEl("div", {
            cls: "my-plugin-view"
        });
        this.vueapp = createApp(Popup);
        this.vueapp.mount(content);
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

export default LayerPopupModal;

