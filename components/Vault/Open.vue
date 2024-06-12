<template>
  <div>
    <h1>You are trying to open vault: {{ vault.name }}</h1>
    <input
      v-model="password"
      type="password"
      placeholder="Enter vault password"
      class="border border-black px-4 py-2"
    />
    <!--Submit button-->
    <button class="border border-black px-4 py-2" @click="openVault">
      Submit
    </button>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Open Vault',
  description: 'Open a vault',
  layout: 'dashboard',
})

const password = ref('')
const vault = useVaultStore()

async function openVault() {
  const response = await $fetch('/api/vault/auth', {
    method: 'POST',
    body: {
      password: password.value,
      vaultId: vault.id,
    },
  })

  if (response.ok) {
    console.log(response)
    // TODO: Handle success, and save to pinia
    // TODO: Derive key from password
    // TODO: Decrypt tokens
    vault.$patch({
      key: 'TODO',
      name: response.data.name,
      cloudProvider: response.data.cloud_provider,
      cloudFolderName: response.data.cloud_folder_name,
      createdAt: response.data.created_at,
      description: response.data.description,
      idleTime: response.data.idle_time,
      cloudAccessToken: '',
      cloudRefreshToken: '',
      id: response.data.id,
    })
    navigateTo('/dashboard/vault')
  }
}
</script>