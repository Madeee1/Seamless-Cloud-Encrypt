<template>
  <div class="flex flex-col gap-8">
    <FileUploader />
    <FileDownloader />
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Vault',
  description: 'Vault',
  // layout: 'vault',
  middleware: 'vault-auth',
})
</script>
