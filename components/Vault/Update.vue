<template>
  <div>
    <h1 class="text-2xl font-bold">Update Vault:</h1>
    <div>
      <form>
        <label class="block mt-4">Name:</label>
        <input
          v-model="updatedVaultName"
          type="text"
          required
          class="border border-black p-2"
        />
        <UButton class="mx-4 mt-4" @click="updateVault()">Update Vault</UButton>
      </form>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const vault = useVaultStore()
const updatedVaultName = ref(vault.name)

async function updateVault() {
  const { data, error } = await supabase
    .from('vault')
    .update({ name: updatedVaultName.value })
    .eq('id', vault.id)
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