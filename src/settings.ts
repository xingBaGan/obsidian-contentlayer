import MyPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { Vault } from "obsidian";

const pluginName = 'obsidian-vue-starter';
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

    // 增加一个按钮，生成要启动的文件
    const setting3 = new Setting(containerEl);
    setting3.setName("generate start file")
      .setDesc("generate start script")
      .addButton((button) =>
        button
          .setButtonText("init plugin")
          .onClick(async () => {
            const { startScriptPath, stopScriptPath } = await this.createScript();
            const vault = this.app.vault;
            const guidanceFile = vault.getFileByPath('contentlayer_guidence.md');
            if(guidanceFile){
              console.log('guidanceFile already exists');
              return;
            }
            vault.create('contentlayer_guidence.md', `## 如何启动项目\n\n[运行 CMD 脚本](${startScriptPath})\n\n[停止 CMD 脚本](${stopScriptPath})`);
            console.log('guidanceFile created');
          })
      );
  }

  async createScript(){
    const path = require('path');
    const fs = require('fs');
    const vault = this.app.vault;
    const vaultPath = vault.adapter.basePath;
    const configPath = vault.configDir;
    const pluginDir = path.join(vaultPath, configPath, 'plugins', pluginName);
    const startScriptPath = path.join(pluginDir, 'start.bat');
    const stopScriptPath = path.join(pluginDir, 'stop.bat');
    // make start bat script under pluginDir
    if(fs.existsSync(startScriptPath) || fs.existsSync(stopScriptPath)){
      return {
        startScriptPath,
        stopScriptPath
      };
    }
    fs.writeFileSync(startScriptPath, '@echo off\n\n' +
      'cd /d "' + pluginDir + '"\n' +
      'node contentlayer_server.js\n' +
      'pause');

    // make stop bat script under pluginDir
    fs.writeFileSync(stopScriptPath, '@echo off\n' +
      'setlocal\n' +
      '\n' +
      'rem 查找占用 3001 端口的进程 ID\n' +
      'for /f "tokens=5" %%a in (\'netstat -ano ^| findstr :3001\') do (\n' +
      '    echo 找到占用 3001 端口的进程 ID: %% a\n' +
      '    rem 终止该进程\n' +
      '    taskkill / PID %% a / F\n' +
      '    echo 进程 %% a 已被终止。\n' +
      ')\n' +
      'endlocal');

    return {
      startScriptPath,
      stopScriptPath
    };
  }
}