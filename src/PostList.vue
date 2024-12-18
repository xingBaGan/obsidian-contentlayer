<template>
  <div class="popup-container" :key="key">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3>已经编译{{ posts.length }}篇博客</h3>
      <button @click="showOnLocal">display on local</button>
    </div>
    <ul>
      <li v-for="post in posts" :key="post._id">{{ post.title || post._id }}</li>
    </ul>
    <div>
      <input class="commit-message" type="text" v-model="commitMessage" :placeholder="msg" />
      <button class="generate-commit-msg" @click="generateCommitMsg">generate msg</button>
    </div>
    <div class="btn-container" style="display: flex; justify-content: space-between;">
      <button class="compile-btn" @click="compileBlog" :disabled="running">{{ running ? 'building...' : 'compile 博客'
        }}</button>
      <div class="git-push-btn">
        <button class="compile-btn" @click="pushToGit" :disabled="running || pushing || !commitMessage">{{ pushing ?
          'pushing...' : 'push to git'
          }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive } from 'vue';
const posts = reactive([])
const running = ref(false)
const key = ref(0)
const commitMessage = ref('')
const msg = ref('输入commit message')
const generateCommitMsg = () => {
  commitMessage.value = new Date().toLocaleString()
}
const compileBlog = () => {
  running.value = true
  // 调用 LayerPopupModal 的 runNodeCLI 方法
  fetch('http://localhost:3001/build-contentlayer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()).then(data => {
    const newPosts = data.posts.allDocuments || [];
    posts.splice(0, posts.length, ...newPosts)
  }).finally(async () => {
    running.value = false
    // 重新渲染该组件
    key.value++
  })
}

const showOnLocal = () => {
  fetch('http://localhost:3001/show-on-local', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()).then(data => {
    console.log('show on local', data)
  })
}
const pushing = ref(false)
const pushToGit = () => {
  pushing.value = true
  // 调用 LayerPopupModal 的 runNodeCLI 方法
  fetch('http://localhost:3001/push-to-git', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      commitMessage: commitMessage.value
    })
  }).then(res => res.json()).then(data => {
    pushing.value = false
  })
}
</script>


<style scoped>
h2 {
  color: lightcoral;
}

.generate-commit-msg {
  width: 30%;
  margin-left: 10px;
  min-width: 100px;
}

.commit-message {
  width: 63%;
  height: 25px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  background-color: #f0f0f0;
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