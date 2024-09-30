// 创建一个modal
import { Modal,App} from 'obsidian';
import { createApp, App as VueApp } from 'vue';
import Popup from './LayerPopupModal.vue';
import { exec, execSync } from 'child_process';
import { ref, Ref, watch } from 'vue';

const vaultPath = 'D:\\code_workspace\\xmind-obsidian\\xmind-obsidian\\md';
class LayerPopupModal extends Modal {
    vueapp: VueApp;
    hello: () => void;
    runingState: Ref<boolean>;
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
        this.runingState = ref(false)
        this.vueapp = createApp(Popup, {
            props: {
                runingState: this.runingState
            }
        });
        this.vueapp.mount(content);
        // 监听popup-container的compile-btn
        const compileBtn = content.querySelector('.compile-btn');
        compileBtn.addEventListener('click', async () => {
            this.runingState.value = true
            await this.runNodeCLI()
            this.runingState.value = false
        })
        watch(() => this.runingState.value, (newVal, oldVal) => {
            console.log('newVal', newVal)
            console.log('oldVal', oldVal)
        })
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }

    async installContentlayer() {
        try {
            const command = 'npm';
            const args = ['install', '-g', 'contentlayer'];
            const child = exec(`${command} ${args.join(' ')}`);
            // 正在运行emoji
            const runningEmoji = '🚀';
            console.log(`${runningEmoji} 正在安装contentlayer...`);
            // 监听输出
            child.stdout.on('data', (data) => {
                console.log(`${data}`);
            });

            child.stderr.on('data', (data) => {
                console.error(`${data}`);
            });

            child.on('close', (code) => {
                console.log(`安装contentlayer完成，代码: ${code} 🎉`);
            });
        } catch (error) {
            console.log('error', error);
        }
    }

    async runNodeCLI() {
        console.log('building...')
        // 如果不存在全局安装contentlayer，则先全局安装contentlayer，之后build
        try {
            try {
                const result = execSync('contentlayer --version', { encoding: 'utf8' });
                console.log(`contentlayer version: ${result} 🚀`);
            } catch (error) {
                console.error(`Error: ${error.message}`);
            }
        } catch (error) {
            await this.installContentlayer()
        }

        // const command = 'contentlayer build';
        // 打印路径
        // const cdCommand = process.platform === 'win32' ? 'echo %cd%' : 'pwd'; // Updated command
        const cdCommand = process.platform === 'win32' ? `cd "${vaultPath}"` : `cd '${vaultPath}'`; 
        const command = `${cdCommand} && contentlayer build`
        try {
            const result = await new Promise((resolve, reject) => {
                exec('npx contentlayer build', { encoding: 'utf8', shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash' }, (error, stdout, stderr) => {
                    if (error) {
                        reject(`${error.message}\n${error.stack}`);
                        return;
                    }
                    resolve(stdout);
                });
            });
            console.log(`stdout: ${result}`);
            console.log('building done')
        } catch (error) {
            console.log('build error', error)
        }
    }
}

export default LayerPopupModal;
