<template>
  <div>
    <dl v-for="vault in allVaults.vaults" :key="vault.id" class="mt-4">
      <div
        class="flex items-center border border-black"
        @click="openVault(vault.id, vault.name)"
      >
        <UIcon name="i-heroicons-lock-closed" />
        <dd class="mr-4 w-15">{{ vault.name }}</dd>
      </div>
    </dl>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const vaultPinia = useVaultStore()
const allVaults = useAllVaultStore()

async function readVault() {
  // TODO: CHANGE TO Lazy ftech in order to have a pending state for a loading UI
  const { data: vault, error } = await supabase
    .from('vault')
    .select('id, name')
    .eq('user_id', user.value.id)

  allVaults.vaults = vault
}

onMounted(() => {
  readVault()
})

function openVault(id, name) {
  vaultPinia.id = id
  vaultPinia.name = name
  navigateTo('/dashboard/open')
}
</script>