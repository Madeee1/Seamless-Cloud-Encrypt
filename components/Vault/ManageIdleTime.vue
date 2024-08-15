<template>
  <div class="flex flex-col h-full px-4">
    <form class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-3xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Set <span class="text-third-blue">A</span>uto
        <span class="text-third-blue">L</span>ock
      </h1>
      <div class="mb-3 first-letter:text-third-blue">
        <label class="text-xl font-semibold text-gray-200"
          >Set Idle Time for Vault's Auto-Lock</label
        >
        <input
          v-model="idleTime"
          type="text"
          required
          class="rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
      <div class="pt-5 flex justify-between items-center">
        <UButton
          class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
          :loading="isLoading"
          @click="setIdleTime"
          >Set Idle Time</UButton
        >
        <div
          v-if="showSuccess"
          class="flex-1 ml-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-2 rounded"
        >
          <p>Idle time set successfully!</p>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const vault = useVaultStore()
const idleTime = ref(vault.idleTime)
const isLoading = ref(false)
const showSuccess = ref(false)

async function setIdleTime() {
  isLoading.value = true

  if (idleTime.value < 1) {
    alert('Idle time must be greater than 0.')
    isLoading.value = false
    return
  }
  if (idleTime.value > 1440) {
    alert('Idle time must be less than 1440 minutes.')
    isLoading.value = false
    return
  }
  if (isNaN(idleTime.value)) {
    alert('Idle time must be a number.')
    isLoading.value = false
    return
  }

  const { error } = await supabase
    .from('vault')
    .update({ idle_time: idleTime.value })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)

  if (error) {
    alert('Error setting idle time, please try again.')
  } else {
    vault.idleTime = idleTime.value
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 8000)
  }
  isLoading.value = false
}
</script>
