<template>
    <div>
        <button @click="readVault()">Read Vault</button>
    </div>
    <div>
        <h1>Fetched Data</h1>
        <dl v-for="vault in vaults"
          :key="vault.id">
          <div>
            <dt>Vault ID: {{ vault.id }}</dt>
            <dd>Vault Name: {{ vault.name }}</dd>
            <dd>Created At: {{ vault.created_at }}</dd>
            <dd>User ID: {{ vault.user_id }}</dd>
            <dd>Cloud Folder: {{ vault.cloud_folder_name }}</dd>
            <dd>Access Token: {{ vault.enc_cloud_access_token }}</dd>
            <dd>Refresh Token: {{ vault.enc_cloud_refresh_token }}</dd>
            <dd>Cloud: {{ vault.cloud_provider }}</dd>
            <dd>Hashed Password: {{ vault.hashed_password }}</dd>
            <dd>Vault Description:{{ vault.description }}</dd>
            <dd>Idle Time: {{ vault.idle_time }}</dd>
            <br>
          </div>
        </dl>
    </div>
  </template>
<script setup>
const supabase = useSupabaseClient()
const vaults = ref('')
async function readVault(){
  const {data, error} =  await supabase.from('vault')
  .select()

  vaults.value = data
  return vaults
}
</script>