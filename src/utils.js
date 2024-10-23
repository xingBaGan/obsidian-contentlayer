const path = require('path');
const manifest = require('../manifest.json');
const pluginName = manifest.name;

function getPublishFilePath(vault, publishFolder) {
  const vaultPath = vault.adapter.basePath;
  const publishDir = path.join(vaultPath, publishFolder);
  return publishDir;
}

function getPluginDir(vault) {
  const vaultPath = vault.adapter.basePath;
  const configPath = vault.configDir;
  return path.join(vaultPath, configPath, 'plugins', pluginName)
}

const guidanceFileName = 'contentlayer_guidence.md';

module.exports = {
    getPublishFilePath,
    getPluginDir,
    guidanceFileName,
}