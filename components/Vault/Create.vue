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
import bcrypt from 'bcryptjs'
const supabase = useSupabaseClient()
const user = useSupabaseUser() 

const vaultName = ref('')
const vaultPassword = ref('')
const vaultCloud = ref('')

const cloudFolder = ref('crypt_and_go_folder')

async function createVault(){  
  const vaultPass = JSON.stringify(vaultPassword)
  const saltRounds = 10
  const salt = await bcrypt.genSaltSync(saltRounds)
  const hashPass = await bcrypt.hashSync(vaultPass, salt)
  const { data, error } = await supabase.from('vault')
  .insert({'name': vaultName.value,'cloud_folder_name': cloudFolder.value,'cloud_provider': vaultCloud.value, 'hashed_password': hashPass})
  .select()
}
</script>