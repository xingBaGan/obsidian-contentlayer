import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules';
import Vue from "@the_tree/esbuild-plugin-vue3";
import path from "path";
import fs from "fs";
const banner =
    `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;
let baseDir = './contentlayer-builder';
const obsidianDir = 'D:\\md_workspace\\.obsidian\\plugins\\contentlayer-builder';
baseDir = obsidianDir;
const prod = (process.argv[2] === 'production');
process.env.NODE_ENV = 'production';

await esbuild.build({
    banner: {
        js: banner,
    },
    plugins: [
        Vue({ isProd: true })
    ],
    entryPoints: ['./src/main.ts'],
    bundle: true,
    external: [
        'obsidian',
        'electron',
        '@codemirror/autocomplete',
        '@codemirror/closebrackets',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/comment',
        '@codemirror/fold',
        '@codemirror/gutter',
        '@codemirror/highlight',
        '@codemirror/history',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/matchbrackets',
        '@codemirror/panel',
        '@codemirror/rangeset',
        '@codemirror/rectangular-selection',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/stream-parser',
        '@codemirror/text',
        '@codemirror/tooltip',
        '@codemirror/view',
        ...builtins],
    format: 'cjs',
    watch: !prod,
    target: 'es2016',
    logLevel: "info",
    sourcemap: prod ? false : 'inline',
    minify: prod ? true : false,
    treeShaking: true,
    outfile: !prod ? 'main.js' : path.resolve(baseDir, 'main.js'),
}).catch(() => process.exit(1));

await esbuild.build({
    entryPoints: ["./src/main.css"],
    outfile: !prod ? 'styles.css' : path.resolve(baseDir, 'styles.css'),
    watch: !prod,
    bundle: true,
    allowOverwrite: true,
    minify: false,
});

await esbuild.build({
    entryPoints: ["./server.js"],
    outfile: !prod ? 'contentlayer_server.js' : path.resolve(baseDir, 'contentlayer_server.js'),
    bundle: true,
    format: "cjs",
    watch: !prod,
    target: "node16",
    platform: "node",
    logLevel: "info",
    external: [
        // 'express',
        // 'cors',
        // './.contentlayer/generated/index.mjs',
    ],
    sourcemap: false,
    minify: prod ? true : false,
    treeShaking: true,
})

// 复制 manifest.json 到 contentlayer-builder 目录
try {
    fs.copyFileSync('manifest.json', path.resolve(baseDir, 'manifest.json'));
    console.log('manifest.json copied!');
} catch (err) {
    console.error(err);
}