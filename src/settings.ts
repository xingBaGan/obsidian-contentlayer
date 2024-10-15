import MyPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    const setting1 = new Setting(containerEl);

    // posts sub folder name
    setting1.setName("posts sub folder name")
      .setDesc("If your file is under 'vault/folder', and you set subfolder name to 'attachments', attachments will be saved to 'vault/folder/attachments'")
    .addText((text) =>
      text
        .setPlaceholder("sub folder name")
        .setValue(this.plugin.settings.postsSubFolderName)
        .onChange(async (value) => {
          this.plugin.settings.postsSubFolderName = value;
          await this.plugin.saveSettings();
        })
    );

    // git repo url
    const setting2 = new Setting(containerEl);
    setting2.setName("git repo url")
      .setDesc("please input the contentlayer files you want to update")
      .addText((text) =>
        text
          .setPlaceholder("please input git repo url")
          .setValue(this.plugin.settings.gitRepoURL)
          .onChange(async (value) => {
            this.plugin.settings.gitRepoURL = value;
            await this.plugin.saveSettings();
          })
      );

    // 增加一个按钮，用来启动contentlayer_server.js
    // const setting3 = new Setting(containerEl);
    // setting3.setName("start contentlayer server")
    //   .setDesc("start contentlayer server")
    //   .addButton((button) =>
    //     button
    //       .setButtonText("start")
    //       .onClick(() => {
    //         this.plugin.startContentlayerServer();
    //       })
    //   );
  }
}