const { exec, execSync } = require('child_process');
var express = require('express')
const cors = require('cors');
var app = express()
app.use(cors());
const port = 3001;
const vaultPath = process.argv[2];
async function installContentlayer() {
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

async function runNodeCLI() {
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
    await installContentlayer()
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

async function pushToGit() {
  const cdCommand = process.platform === 'win32' ? `cd "${vaultPath}"` : `cd '${vaultPath}'`;
  const command = `${cdCommand} && git push origin main`;
  try {
    const result = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`${error.message}\n${error.stack}`);
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

function main() {
  app.get('/', (req, res)=>{
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
    pushToGit()
    res.send({
      code: 200,
      message: 'push to git done'
    })
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

module.exports = {
  main,
}

main()