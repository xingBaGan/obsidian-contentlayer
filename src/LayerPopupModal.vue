<template>
  <div class="popup-container">
    <button class="compile-btn" @click="compileBlog" :disabled="runingState">{{ runingState ? 'building...' : 'compile 博客' }}</button>
    <h3>编译的文件列表</h3>
    <ul>
      <li v-for="post in posts" :key="post._id">{{ post._id }}</li>
    </ul>
  </div>
</template>

<script setup lang="tsx">
import { allPosts } from '../.contentlayer/generated/index.mjs';
import { ref, onMounted, watch } from 'vue';
const props = defineProps({
  runingState: {
    type: Boolean,
    required: true
  }
});

console.log('props', props)

const posts = ref(allPosts)

// const compileBlog = () => {
//   // 调用 LayerPopupModal 的 runNodeCLI 方法
//   props.runingState = true
// }
// watch(() => props.runingState, (newVal, oldVal) => {
//   console.log('newVal', newVal)
//   console.log('oldVal', oldVal)
// }, { immediate: true })
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

.popup-container {
  padding: 5px 0;
}
</style>