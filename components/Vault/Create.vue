<template>
    <div>
      <form>
        <p>Create Vault</p>
        <label>Name</label>
        <input type="text" required v-model="vaultName">
        <br>
        <label>Password</label>
        <input type="password" required v-model="vaultPassword">
        <br>
        <label>Cloud</label>
        <select v-model="vaultCloud">
          <option value="None">None</option>
          <option value="OneDrive">OneDrive</option>
          <option value="GDrive">Google Drive</option>
        </select>
        <br>
      </form>
      <div>
        <button @click="createVault()">Create Vault</button>
      </div>
    </div>
  </template>
  
  <script setup>
  const supabase = useSupabaseClient()
  const user = useSupabaseUser() 
  
  const vaultName = ref('')
  const vaultPassword = ref('')
  const vaultCloud = ref('')
  
  async function createVault(){
    if (vaultCloud.value == "None")
    {
        const { data, error } = await supabase.from('vaultstest')
        .insert({'vaultName': vaultName.value, 'vaultPassword': vaultPassword.value})
        .select()
    }
    const { data, error } = await supabase.from('vaultstest')
    .insert({'vaultName': vaultName.value, 'vaultPassword': vaultPassword.value, 'cloudProvider': vaultCloud.value})
    .select()
  }
  </script>