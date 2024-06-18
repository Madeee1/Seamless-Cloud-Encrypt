<template>
  <div>
    <dl v-for="vault in allVaults.vaults" :key="vault.id" class="mt-4">
      <div
        class="flex items-center border border-black"
        @click="openVault(vault.id, vault.name, vault.description)"
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
  allVaults.pending = true
  const { data: vault, error } = await supabase
    .from('vault')
    .select('id, name, description')
    .eq('user_id', user.value.id)

  allVaults.vaults = vault
  allVaults.pending = false
}

onMounted(() => {
  readVault()
})

function openVault(id, name, description) {
  vaultPinia.id = id
  vaultPinia.name = name
  vaultPinia.description = description
  navigateTo('/dashboard/open')
}
</script>
