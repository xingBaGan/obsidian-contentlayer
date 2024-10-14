<template>
  <div class="popup-container" :key="key">
    <button class="compile-btn" @click="compileBlog" :disabled="running">{{ running ? 'building...' : 'compile 博客'
      }}</button>
    <ul>
      <li v-for="post in posts" :key="post._id">{{ post._id }}</li>
    </ul>
  </div>
</template>

<script setup lang="tsx">
const vaultPath = 'D:\\code_workspace\\xmind-obsidian\\xmind-obsidian\\md';
import { allPosts } from '../.contentlayer/generated/index.mjs';
import { ref, reactive } from 'vue';

const posts = reactive(allPosts)
const running = ref(false)
const key = ref(0)

const compileBlog = () => {
  running.value = true
  // 调用 LayerPopupModal 的 runNodeCLI 方法
  fetch('http://localhost:3001/build-contentlayer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()).then(data => {
    const newPosts = data.posts
    posts.splice(0, posts.length, ...newPosts)
  }).finally(async () => {
    running.value = false
    // 重新渲染该组件
    key.value++
  })
}
</script>


<style scoped>
h2 {
  color: lightcoral;
}

.compile-btn {
  background-color: lightcoral;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  float: right;
}

.compile-btn:disabled {
  border: none;
  cursor: not-allowed;
}

.popup-container {
  padding: 5px 0;
}
</style>