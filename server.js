const { exec, execSync } = require('child_process');
var express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const fs = require('fs');
const settings = require('./data.json');
var app = express()
const contentlayerOutputFolderName = '.contentlayer';
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors());
const port = 3001;
const vaultPath = process.argv[2];
const configPath = process.argv[3];
const runningEmoji = '🚀';
const command = 'npm';
async function installContentlayer() {
  try {
    const args = ['install', '-g', 'contentlayer', 'playwright'];
    const child = exec(`${command} ${args.join(' ')}`);
    // 正在运行emoji
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
    // bugfix: https://github.com/remcohaszing/remark-mermaidjs
    const palywright = ['npx', 'playwright', 'install']
    const child2 = exec(`${command} ${palywright.join(' ')}`);
    child2.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    child2.stderr.on('data', (data) => {
      console.error(`${data}`);
    });

    child2.on('close', (code) => {
      console.log(`安装playwright完成，代码: ${code} 🎉`);
    });
    const palywright2 = ['npx', 'playwright', 'install', '--with-deps', 'chromium']
    const child3 = exec(`${command} ${palywright2.join(' ')}`);
    child3.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    child3.stderr.on('data', (data) => {
      console.error(`${data}`);
    });

    child3.on('close', (code) => {
      console.log(`安装playwright 依赖完成，代码: ${code} 🎉`);
    });
  } catch (error) {
    console.log('error', error);
  }
}

function installDeps() {
  try {
    console.log('check node_modules dependencies install')
    // 检查是否有node_modules，没有则安装
    if (!fs.existsSync('node_modules')) {
      console.log(`${runningEmoji} installing dependencies...`);
      const args2 = ['install']
      // 安装其他一依赖
      const child2 = execSync(`${command} ${args2.join(' ')}`, { encoding: 'utf8' });
      console.log(child2);
      console.log(`install other dependencies done, code: 0 🎉`);
    }
  } catch (error) {
    console.log('error', error);
  }
}

async function checkContentlayer() {
  try {
    const result = execSync('contentlayer --version', { encoding: 'utf8' });
    console.log(`contentlayer version: ${result} 🚀`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await installContentlayer()
  }
}

async function runNodeCLI() {
  console.log('building...')
  // 如果不存在全局安装contentlayer，则先全局安装contentlayer，之后build
  try {
    const result = await new Promise((resolve, reject) => {
      exec(`npx contentlayer build --config ${configPath}`, { encoding: 'utf8', shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash' }, (error, stdout, stderr) => {
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

async function pushToGit(commitMessage) {
  console.log('git commit', commitMessage)
  const commitCommand = `git commit -m "${commitMessage}"`

  const cdCommand = process.platform === 'win32' ? `cd "${vaultPath}"` : `cd '${vaultPath}'`;
  const command = `${cdCommand} && git push origin main`;
  try {
    const result = await new Promise((resolve, reject) => {
      exec(`${cdCommand} && ${commitCommand}`, (error, stdout, stderr) => {
        if (error) {
          reject(`commit error: ${error.message}\n${error.stack}`);
          return;
        }
        resolve(stdout);
      });
    });
    console.log(`stdout: ${result}`);
    console.log('push to git done')
  } catch (error) {
    console.log('push to git error', error)
  }
}

async function showOnLocal() {
  console.log('copy to blog project');
  const { exec } = require('child_process');
  const sourcePath = settings.pluginFolderPath + '\\' + contentlayerOutputFolderName
  const targetPath = settings.blogProjectPath + '\\' + settings.renameFolderName
  console.log(sourcePath, targetPath)
  exec(`xcopy ${sourcePath} ${targetPath} /E /I /Y`);
}

async function main() {
  await installDeps()
  app.get('/', (req, res) => {
    res.send('contentlayer server started!')
  })

  // respond with "hello world" when a GET request is made to the homepage
  app.post('/build-contentlayer', async function (req, res) {
    await runNodeCLI()
    const posts = await import('./.contentlayer/generated/index.mjs');
    res.send({
      code: 200,
      message: 'build contentlayer done',
      posts: posts
    })
  })

  app.post('/push-to-git', async function (req, res) {
    const { commitMessage } = req.body
    await pushToGit(commitMessage)  
    res.send({
      code: 200,
      message: 'push to git done'
    })
  })

  app.post('/show-on-local', async function (req, res) {
    try {
      await showOnLocal()
    } catch (error) {
      console.log('show on local error', error)
    }
    res.send({
      code: 200,
      message: 'show on local done'
    })
  })

  app.listen(port, async () => {
    await checkContentlayer()
    console.log(`Example app listening on port ${port}`)
  })
}

module.exports = {
  main,
}

main()