<template>
  <div>
    <div>
      <h1 class="text-xl font-bold">Fetched Data</h1>
      <dl v-for="vault in vaults" :key="vault.id" class="mt-4">
        <div class="flex items-center">
          <dd class="mr-4">Vault Name: {{ vault.name }}</dd>
          <button
            class="border border-black px-4 py-2"
            @click="updateVault(vault.id)"
          >
            Update
          </button>
          <button
            class="border border-black px-4 py-2"
            @click="deleteVault(vault.id)"
          >
            Delete
          </button>
        </div>
      </dl>
    </div>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const vaults = ref('')
async function readVault() {
  const { data: vault, error } = await supabase.from('vault').select()

  vaults.value = vault
}
onMounted(() => {
  readVault()
})

async function updateVault(id) {
  localStorage.setItem('vaultId', id)
  navigateTo('/updatePage')
}
async function deleteVault(id) {
  const { error } = await supabase.from('vault').delete().eq('id', id)
}
</script>