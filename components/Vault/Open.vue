<template>
  <div class="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
    <div class="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow">
      <h1 class="text-xl font-semibold text-gray-800">
        You are trying to open vault: {{ vault.name }}
      </h1>
      <input
        v-model="password"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <!--Submit button-->
      <UButton
        class="w-full px-4 py-2 text-white focus:outline-none focus:ring-2"
        @click="openVault"
      >
        Submit
      </UButton>
    </div>
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
  try {
    const response = await $fetch('/api/vault/auth', {
      method: 'POST',
      body: {
        password: password.value,
        vaultId: vault.id,
      },
    })

    if (response.ok) {
      const encryptionKeyObject = await deriveKeyFromPassword(password.value)

      // TODO: Decrypt tokens
      vault.$patch({
        key: encryptionKeyObject,
        name: response.data.name,
        cloudProvider: response.data.cloud_provider,
        cloudFolderName: response.data.cloud_folder_name,
        createdAt: response.data.created_at,
        description: response.data.description,
        idleTime: response.data.idle_time,
        cloudAccessToken: '',
        cloudRefreshToken: '',
        id: response.data.id,
        isOpen: true,
      })
      navigateTo('/dashboard/vault')
    }
  } catch (error) {
    if (!error.response) {
      alert('Network error, try again later!')
    } else if (error.response.status === 401) {
      alert('Wrong password, try again!')
    } else if (error.response.status === 500) {
      alert('Server error, try again later!')
    }
  }
}

async function deriveKeyFromPassword(password) {
  const salt = new Uint8Array([1, 2, 3, 4])
  const encoder = new TextEncoder()
  const encodedPassword = encoder.encode(password)

  // Import key here is used to set the "structure" of the key
  const derivedKey = await crypto.subtle.importKey(
    'raw',
    encodedPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 110000,
      hash: 'SHA-256',
    },
    derivedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  return key
}
</script>