<template>
  <div class="p-4">
    <form class="space-y-4">
      <p class="text-lg font-semibold">Create Vault</p>
      <div>
        <label class="block">Name</label>
        <input
          v-model="vaultName"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label class="block">Password</label>
        <input
          v-model="vaultPassword"
          type="password"
          required
          class="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label class="block">Cloud</label>
        <select
          v-model="vaultCloud"
          class="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="None">None</option>
          <option value="OneDrive">OneDrive</option>
          <option value="GDrive">Google Drive</option>
        </select>
      </div>
      <div>
        <label class="block">Description</label>
        <input
          v-model="vaultDescription"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
    </form>
    <div class="mt-4">
      <UButton class="px-4 py-2 text-white rounded-md" @click="createVault()">
        Create Vault
      </UButton>
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
const vaultDescription = ref('')

const cloudFolder = ref('crypt_and_go_folder')

async function createVault() {
  const saltRounds = 10
  const hashPass = await bcrypt.hash(vaultPassword.value, saltRounds)
  const { error } = await supabase.from('vault').insert({
    name: vaultName.value,
    cloud_folder_name: cloudFolder.value,
    cloud_provider: vaultCloud.value,
    hashed_password: hashPass,
    description: vaultDescription.value,
  })

  // TODO: Handle error
  if (error) {
    console.error(error)
  } else {
    readVault()
    navigateTo('/dashboard')
  }
}

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
</script>
