<template>
  <h1></h1>
</template>
<script setup>
const timeoutId = ref('')
const vault = useVaultStore()

function handleIdle() {
  vault.$reset()
  navigateTo('/dashboard')
}

function startIdleTimer() {
  const idleTime = vault.idleTime * 60000

  clearTimeout(timeoutId.value)

  timeoutId.value = setTimeout(() => {
    handleIdle()
  }, idleTime)
}

function resetIdleTimer() {
  startIdleTimer()
}

onMounted(() => {
  window.addEventListener('mousemove', resetIdleTimer)
  window.addEventListener('keypress', resetIdleTimer)
  window.addEventListener('click', resetIdleTimer)
  window.addEventListener('scroll', resetIdleTimer)

  startIdleTimer()
})

onBeforeUnmount(() => {
  // Remove event listeners and clear the timeout
  window.removeEventListener('mousemove', resetIdleTimer)
  window.removeEventListener('keypress', resetIdleTimer)
  window.removeEventListener('click', resetIdleTimer)
  window.removeEventListener('scroll', resetIdleTimer)

  clearTimeout(timeoutId)
})
</script>