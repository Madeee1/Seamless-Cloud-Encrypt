<template>
  <div>
    <dl v-for="vault in allVaults.vaults" :key="vault.id" class="mb-3 mt-2 w-full">
      <div
        class="mx-3 flex items-center bg-transparent border border-third-blue p-1 px-2 rounded hover:bg-gray-700 focus:bg-gray-200 focus:shadow-[5px_-3px_0px_rgb(255,0,0)] focus:outline-none focus:ml-0 focus:rounded-l-none transition-all duration-150 ease-in-out cursor-pointer"
        tabindex="0"
        @click="openVault(vault.id, vault.name, vault.description)"
      >
        <dd class="ml-2 flex-1 text-third-blue text-semibold">
          {{ vault.name }}
        </dd>
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
