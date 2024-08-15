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
      <div class="pt-5 flex justify-end">
        <UButton
          class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
          :loading="isLoading"
          @click="setIdleTime"
          >Set Idle Time</UButton
        >
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

async function setIdleTime() {
  isLoading.value = true
  const { data, error } = await supabase
    .from('vault')
    .update({ idle_time: idleTime.value })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)

  if (error) {
    alert('Error setting idle time, please try again.')
  } else {
    vault.idleTime = idleTime.value
  }
}
</script>
