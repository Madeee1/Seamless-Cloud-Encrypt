<template>
  <div class="flex flex-col gap-4">
    <FileUploader />
    <FileDownloader />
    <TimerAutoLock />
    <TimerRefreshToken />
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Vault',
  description: 'Vault',
  layout: 'vault',
})
</script>
