<template>
  <h1></h1>
</template>
<script setup>
const timeoutId = ref('')
const vault = useVaultStore()

import { startIdleTimer } from '~/utils/timer-auto-lock'

function handleIdle() {
  vault.$reset()
  navigateTo('/dashboard')
}

function resetIdleTimer() {
  timeoutId.value = startIdleTimer(vault.idleTime, timeoutId.value, handleIdle)
}

onMounted(() => {
  window.addEventListener('mousemove', resetIdleTimer)
  window.addEventListener('keypress', resetIdleTimer)
  window.addEventListener('click', resetIdleTimer)
  window.addEventListener('scroll', resetIdleTimer)

  startIdleTimer(vault.idleTime, timeoutId.value, handleIdle)
})

onBeforeUnmount(() => {
  // Remove event listeners and clear the timeout
  window.removeEventListener('mousemove', resetIdleTimer)
  window.removeEventListener('keypress', resetIdleTimer)
  window.removeEventListener('click', resetIdleTimer)
  window.removeEventListener('scroll', resetIdleTimer)

  clearTimeout(timeoutId.value)
})
</script>