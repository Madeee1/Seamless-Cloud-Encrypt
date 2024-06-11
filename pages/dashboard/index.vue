<template>
  <div>
    <FileUploader />
    <FileDownloader />
  </div>
</template>

<script setup>
import { createPinia } from 'pinia'
import { defineComponent, createApp } from 'vue'

const pinia = createPinia()
const app = createApp(defineComponent({}))
app.use(pinia)

definePageMeta({
  title: 'Dashboard',
  description: 'Dashboard page',
  layout: 'dashboard',
})
</script>
