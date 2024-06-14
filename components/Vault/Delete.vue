<template>
  <div class="my-10">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Delete Vault</h1>
    <UButton
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      @click="deleteVault()"
      >Click here if you are sure</UButton
    >
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

async function deleteVault() {
  const { error } = await supabase
    .from('vault')
    .delete()
    .eq('id', vault.id)
    .eq('user_id', user.value.id)

  if (error) {
    console.error(error)
  } else {
    vault.$reset()
    navigateTo('/dashboard')
  }
}
</script>