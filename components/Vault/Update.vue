<template>
  <div>
    <h1 class="text-2xl font-bold">Update Vault:</h1>
    <div>
      <form>
        <div>
          <label class="block mt-4">Name:</label>
          <input
            v-model="updatedVaultName"
            type="text"
            required
            class="border border-black p-2"
          />
        </div>
        <div>
          <label class="block mt-4">Description:</label>
          <textarea
            v-model="updatedVaultDescription"
            class="border border-black p-2 w-[600px] h-[200px]"
          />
        </div>
        <UButton class="mx-4 mt-4" @click="updateVault()">Update Vault</UButton>
      </form>
    </div>
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
