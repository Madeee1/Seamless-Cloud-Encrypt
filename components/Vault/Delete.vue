<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-3xl font-semibold text-gray-200 first-letter:text-warning-red"
      >
        Delete <span class="text-warning-red">V</span>ault
      </h1>
      <div class="mb-3">
        <label class="text-xl font-semibold text-gray-200"
          >Delete Vault <span class="text-warning-red">PERMANENTLY</span>
          <br />Ensure all your files are already downloaded before
          deletion</label
        >
      </div>
      <UButton
        class="block w-1/6 text-lg font-semibold bg-warning-red hover:bg-red-600 text-gray-200 py-1 px-2 rounded"
        @click="confirmPassword = true"
        >Delete Vault</UButton
      >
      <div v-if="confirmPassword" class="mb-3 first-letter:text-warning-red">
        <label
          for="confirm-password"
          class="text-xl font-semibold text-gray-200"
          >Enter <span class="text-warning-red">P</span>assword</label
        >
        <input
          id="confirm-password"
          v-model="password"
          type="password"
          placeholder="Enter Vault's Password"
          class="rounded w-full py-2 px-3 text-gray-700"
        />
      </div>
      <div v-if="confirmPassword" class="pt-5 flex justify-end space-x-2">
        <UButton
          class="block text-center w-1/6 text-lg font-semibold bg-white hover:bg-gray-200 text-second-blue py-1 px-2 rounded"
          @click="confirmPassword = false"
          >Cancel</UButton
        >
        <UButton
          class="block w-1/6 text-lg font-semibold bg-warning-red hover:bg-red-600 text-gray-200 py-1 px-2 rounded"
          :loading="isDeleting"
          @click="confirmDelete"
          >Confirm Delete</UButton
        >
      </div>
    </div>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()
const cloudFolderName = vault.cloudFolderName
const accessToken = vault.cloudAccessToken

const confirmPassword = ref(false)
const password = ref('')

const isDeleting = ref(false)

async function confirmDelete() {
  try {
    isDeleting.value = true
    const folderId = await getFolderIdByName()

    // Delete supabase vault
    await deleteSupabaseVault()

    // Delete cloud folder
    if (folderId) {
      await deleteCloudFolder(folderId)
    }

    // Navigate back to dashboard
    console.log('Vault Deleted Successfully.')
    alert('Vault Deleted Successfully.')
    vault.$reset()
    isDeleting.value = false
    navigateTo('/dashboard')
  } catch (error) {
    isDeleting.value = false
    if (!error.response) {
      console.error(error)
      alert('Network error, try again later!')
    } else if (error.response.status === 401) {
      alert('Wrong password, try again!')
    } else if (error.response.status === 500) {
      alert('Server error, try again later!')
    }
  }
}

async function deleteSupabaseVault() {
  console.log('Deleting supabase vault ', vault.id)
  const response = await $fetch('/api/vault/delete/auth', {
    method: 'POST',
    body: {
      password: password.value,
      vaultId: vault.id,
    },
  })

  if (!response.ok) {
    throw new Error('Error deleting supabase vault.')
  }

  console.log('Supabase folder deleted successfully.')
}

async function deleteCloudFolder(folderId) {
  console.log('Deleting cloud folder ', cloudFolderName)
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete cloud folder: ${response.statusText}`)
  } else {
    console.log('Cloud folder deleted successfully.')
  }
}

async function getFolderIdByName() {
  const response = await fetch(
    'https://graph.microsoft.com/v1.0/me/drive/root/children',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(
      `Failed to get folder id by folder name: ${response.statusText}`
    )
  }

  const data = await response.json()
  const folder = data.value.find(
    (folder) => folder.name === cloudFolderName && folder.folder
  )

  if (!folder) {
    console.log('No cloud folder to delete.')
    return null
  } else {
    return folder.id
  }
}
</script>
