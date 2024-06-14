<template>
  <div>
    <VaultUpdate />
    <VaultDelete />
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
