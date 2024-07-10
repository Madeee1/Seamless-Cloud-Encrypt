<template>
  <div class="flex flex-col gap-8">
    <VaultUpdate />
    <VaultDelete />
    <VaultUpdatePassword />
    <Cloud />
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Vault',
  description: 'Vault settings',
  layout: 'vault',
  middleware: 'vault-auth',
})
</script>
