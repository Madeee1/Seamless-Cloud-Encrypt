<template>
  <div class="flex flex-col gap-4">
    <VaultUpdate />
    <VaultUpdatePassword />
    <VaultManageIdleTime />
    <VaultDelete />
    <TimerAutoLock />
    <TimerRefreshToken />
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
