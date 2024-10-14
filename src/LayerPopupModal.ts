// 创建一个modal
import { Modal,App} from 'obsidian';

class LayerPopupModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

export default LayerPopupModal;
