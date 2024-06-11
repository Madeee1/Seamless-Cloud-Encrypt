<template>
  <div>
    <h1 class="text-xl font-bold">Fetched Data</h1>
    <dl v-for="vault in vaults" :key="vault.id" class="mt-4">
      <div
        class="flex items-center border border-black"
        @click="openVault(vault.id)"
      >
        <dd class="mr-4 w-15">{{ vault.name }}</dd>
        <button
          class="border border-black px-4 py-2 mr-2"
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
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const vaults = ref('')
const vaultPinia = useVaultStore()

async function readVault() {
  // TODO: CHANGE TO Lazy ftech in order to have a pending state for a loading UI
  const { data: vault, error } = await supabase
    .from('vault')
    .select('id, name')
    .eq('user_id', user.value.id)

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

function openVault(id) {
  vaultPinia.id = id
  navigateTo('/dashboard/open')
}
</script>