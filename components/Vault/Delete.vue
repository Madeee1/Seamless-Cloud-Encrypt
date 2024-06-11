<template>
    <div>
        <form>
        <p>Delete Vault</p>
        <label>id</label>
        <input type="text" required v-model="vaultId">
        <br>
        </form>
        <div>
            <button @click="deleteVault()">Delete Vault</button>
        </div>
    </div>
  </template>
<script setup>
const supabase = useSupabaseClient()
const vaultId = ref('')

async function deleteVault(){
    const { error } = await supabase.from('vault').delete().eq('id', vaultId.value)
}
</script>