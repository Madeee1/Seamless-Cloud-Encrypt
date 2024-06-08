<template>
    <div>
        <button @click="readVault()" class="border border-black">Read Vault</button>
    </div>
    <div>
        <h1>Fetched Data</h1>
        <dl v-for="vault in vaults"
          :key="vault.id">
          <div>
            <dd>Vault Name: {{ vault.name }}
            <button @click="updateVault( vault.id )" class="border border-black">Update</button>
            <button @click="deleteVault( vault.id )" class="border border-black">Delete</button>
            </dd>
            <br>
          </div>
        </dl>
    </div>
  </template>
<script setup>
const supabase = useSupabaseClient()
const vaults = ref('')
async function readVault(){
  const {data: vault, error} =  await supabase.from('vault')
  .select()

  vaults.value = vault
}
async function updateVault(id){
  localStorage.setItem('vaultId', id )
  navigateTo('/updatePage')
}
async function deleteVault(id){
  const { error } = await supabase.from('vault').delete().eq('id', id)
}
</script>