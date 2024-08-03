<template>
  <div class="flex flex-col gap-28">
    <AccountView />
    <AccountDelete />
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Account',
  description: 'Account information',
  layout: 'dashboard',
})
</script>