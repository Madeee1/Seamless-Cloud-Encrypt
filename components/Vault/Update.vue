<template>
    <h1>Change Vault:</h1>
    <div>
        <form>
            <label>Name: </label>
            <input type="text" required v-model="vaultName" class="border border-black">
            <br>
            <button type="button" @click="updateVault()" class="border border-black"> Update Vault </button>
        </form>
    </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const vaultId = ref('') 
vaultId.value = localStorage.getItem('vaultId') //change this later
const vaultName = ref('')
const {data: vaultInfo, error} =  await supabase.from('vault').select().eq('id', vaultId.value)
vaultName.value = vaultInfo[0].name

async function updateVault(){
    const {data, error} = await supabase.from('vault')
    .update({'name': vaultName.value})
    .eq('id', vaultId.value)
    .select()
}

</script>