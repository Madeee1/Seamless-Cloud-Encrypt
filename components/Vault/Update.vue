<template>
  <div class="max-w-lg mx-auto my-8">
    <h1 class="text-2xl font-bold text-center mb-6">Update Vault:</h1>
    <form>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">Name:</label>
        <input
          v-model="updatedVaultName"
          type="text"
          required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2"
          >Description:</label
        >
        <textarea
          v-model="updatedVaultDescription"
          required
          class="w-[600px] shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="5"
        ></textarea>
      </div>
      <div class="flex justify-center">
        <UButton
          class="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          @click="updateVault()"
          >Update Vault</UButton
        >
      </div>
    </form>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const vault = useVaultStore()
const updatedVaultName = ref(vault.name)
const updatedVaultDescription = ref(vault.description)
const user = useSupabaseUser()

async function updateVault() {
  const { data, error } = await supabase
    .from('vault')
    .update({
      name: updatedVaultName.value,
      description: updatedVaultDescription.value,
    })
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
