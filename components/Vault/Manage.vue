<template>
  <form class="space-y-4">
    <div class="my-2">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Auto Lock</h1>
      <div>
        <label class="block">Set Idle Time for Auto Lock:</label>
        <input
          v-model="idleTime"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <UButton
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
        @click="setIdleTime"
        >Set Idle Time</UButton
      >
    </div>
  </form>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const vault = useVaultStore()
const idleTime = ref(vault.idleTime)

async function setIdleTime() {
  const { data, error } = await supabase
    .from('vault')
    .update({ idle_time: idleTime.value })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
}
</script>