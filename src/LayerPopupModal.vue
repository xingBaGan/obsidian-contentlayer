<template>
  <div>
    <h2>更新博客</h2>
    <ul>
      <li v-for="post in posts" :key="post._id">{{ post._id }}</li>
    </ul>
  </div>
</template>

<script setup lang="tsx">
import { allPosts } from '../.contentlayer/generated/index.mjs';
import { ref, onMounted } from 'vue';

const posts = ref(allPosts)
</script>


<style scoped>
h2 {
  color: lightcoral;
}
</style>