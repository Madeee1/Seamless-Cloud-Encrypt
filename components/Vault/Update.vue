<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800">Update Vault:</h1>
    <form class="mt-6">
      <label for="vaultName" class="block text-gray-700 font-medium mb-2"
        >Name:</label
      >
      <input
        id="vaultName"
        v-model="updatedVaultName"
        type="text"
        required
        class="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
      />
      <UButton
        class="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
        @click="updateVault()"
        >Update Vault</UButton
      >
    </form>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const vault = useVaultStore()
const updatedVaultName = ref(vault.name)
const user = useSupabaseUser()

async function updateVault() {
  const { data, error } = await supabase
    .from('vault')
    .update({ name: updatedVaultName.value })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .select()

  if (error) {
    console.error(error)
  } else {
    console.log(data)
    vault.$patch({
      name: data[0].name,
    })
    navigateTo('/dashboard/vault')
  }
}
</script>