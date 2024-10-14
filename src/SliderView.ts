import { ItemView, WorkspaceLeaf } from "obsidian";
import PostList from './PostList.vue';
import { createApp, App as VueApp } from 'vue';

export const VIEW_TYPE_SLIDER = "slider-view";

export class SliderView extends ItemView {
  vueapp: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_SLIDER;
  }

  getDisplayText() {
    return "Slider view";
  }

  async onOpen() {
    let { contentEl } = this;
    contentEl.setText("已编译的文件");
    const container = this.containerEl.children[1];
    let content = container.createEl("div", {
      cls: "my-plugin-view"
    });
    this.vueapp = createApp(PostList);
    this.vueapp.mount(content);
  }

  async onClose() {
    // Nothing to clean up.
  }
}