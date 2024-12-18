import MyPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { getPublishFilePath, getPluginDir, guidanceFileName } from "./utils";

export class SettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    // 获取插件文件夹路径
    this.plugin.settings.pluginFolderPath = getPluginDir(this.app.vault);
    this.plugin.saveSettings();
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    const postSubFolderName = new Setting(containerEl);
    // posts sub folder name
    postSubFolderName.setName("posts sub folder name")
      .setDesc("The folder name of the your articles will be build in your obsidian folder name. If you make a folder named 'md' and you want to build the aritcles under 'md' folder, you should set this folder name to 'md'.")
    .addText((text) =>
      text
        .setPlaceholder("sub folder name")
        .setValue(this.plugin.settings.publishFolderName)
        .onChange(async (value) => {
          this.plugin.settings.publishFolderName = value;
          this.plugin.settings.publishDir = getPublishFilePath(this.app.vault, value);
          await this.plugin.saveSettings();
        })
    );

    // git repo url
    const gitRepoUrl = new Setting(containerEl);
    gitRepoUrl.setName("git repo url")
      .setDesc("the contentlayer build bundles that you hold in your github repo url. It use to trigger the build on vercel.")
      .addText((text) =>
        text
          .setPlaceholder("please input git repo url")
          .setValue(this.plugin.settings.gitRepoURL)
          .onChange(async (value) => {
            this.plugin.settings.gitRepoURL = value;
            await this.plugin.saveSettings();
          })
      );

    // 博客项目路径
    const settingBlogProjectPath = new Setting(containerEl);
    settingBlogProjectPath.setName("blog project path")
      .setDesc("Your local blog project path. You can clone the blog project from https://github.com/xingBaGan/tailwind-nextjs-starter-blog.git and set the path to your local blog project path.")
      .addText((text) =>
        text
          .setPlaceholder("blog project path")
          .setValue(this.plugin.settings.blogProjectPath)
          .onChange(async (value) => {
            this.plugin.settings.blogProjectPath = value;
            await this.plugin.saveSettings();
          })
      );
      
    // 新增输入框，要拷贝到博客项目，需要重命名的文件名
    const renameFolderName = new Setting(containerEl);
    renameFolderName.setName("rename folder (read only)")
      .setDesc("The folder name of your local blog project contentlayer build bundles files folder name.")
      .addText((text) =>
        text.setDisabled(true)
          .setPlaceholder("rename folder")
          .setValue(this.plugin.settings.renameFolderName)
          .onChange(async (value) => {
            this.plugin.settings.renameFolderName = value;
            await this.plugin.saveSettings();
          })
      );
    // add blod title
    const title = new Setting(containerEl);
    title.setHeading();
    title.setName("operation");

    // 增加一个按钮，生成要启动的文件
    const generateStartFile = new Setting(containerEl);
    generateStartFile.setName("init plugin")
      .setDesc("It will generate the start script and stop script. And create the guidance file. you can start the plugin service by clicking the link on contentlayer_guidence.md.")
      .addButton((button) =>
        button
          .setButtonText("init plugin")
          .onClick(async () => {
            button.setButtonText("loading...");
            button.setDisabled(true);
            const { startScriptPath, stopScriptPath } = await this.createScript();
            const vault = this.app.vault;
            const guidanceFile = vault.getFileByPath(`${this.plugin.settings.publishFolderName}/${guidanceFileName}`);
            if(guidanceFile){
              console.log('guidanceFile already exists');
              button.setButtonText("init plugin");
              button.setDisabled(false);
              return;
            }
            vault.create(`${this.plugin.settings.publishFolderName}/${guidanceFileName}`, `---\n\ndraft: true\n---\n\n## 如何启动项目\n\n[运行 CMD 脚本](${startScriptPath})\n\n[停止 CMD 脚本](${stopScriptPath})`);
            console.log('guidanceFile created');
            button.setButtonText("init plugin");
            button.setDisabled(false);
          })
      );

    // 打开插件文件夹
    const openPluginFolder = new Setting(containerEl);
    openPluginFolder.setName("open plugin folder")
      .setDesc("open the plugin folder that store the start script and stop script.")
      .addButton((button) =>
        button
          .setButtonText("open plugin folder")
          .onClick(async () => {
            const pluginDir = getPluginDir(this.app.vault);
            // 打开文件夹
            const { exec } = require('child_process');
            exec(`start explorer ${pluginDir}`);
            // this.app.workspace.openLinkText(pluginDir, '', true);
            console.log('pluginDir', pluginDir);
          })
      );

  }

  async createScript(){
    const path = require('path');
    const fs = require('fs');
    const vault = this.app.vault;
    // @ts-ignore
    const pluginDir = getPluginDir(vault);

    const startScriptPath = path.join(pluginDir, 'start.bat');
    const stopScriptPath = path.join(pluginDir, 'stop.bat');
    // make start bat script under pluginDir
    if(fs.existsSync(startScriptPath) || fs.existsSync(stopScriptPath)){
      return {
        startScriptPath,
        stopScriptPath
      };
    }

    const mdDir = getPublishFilePath(vault, this.plugin.settings.publishFolderName);
    fs.writeFileSync(startScriptPath, '@echo off\n\n' +
      'cd /d "' + pluginDir + '"\n' +
      `node contentlayer_server.js "${mdDir}" "${pluginDir}/contentlayer.config.js"\n` +
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