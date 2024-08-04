<template>
  <div class="flex flex-col items-center justify-center h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        You are trying to open vault <br />
        <span class="text-3xl text-third-blue ml-5">{{ vault.name }}</span>
      </h1>
      <h2
        class="text-xl font-semibold text-gray-200 pt-2 first-letter:text-third-blue"
      >
        Vault Description <br />
        <span class="text-2xl text-third-blue ml-5">{{
          vault.description
        }}</span>
      </h2>
      <hr class="w-full h-[3px] bg-white rounded" />
      <h2
        class="text-xl font-semibold text-gray-200 pt-2 first-letter:text-third-blue"
      >
        Please enter your vault's password ^-^
      </h2>
      <input
        v-model="password"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded"
      />
      <!--Submit button-->
      <UButton
        block
        class="w-full py-2 text-gray-200 text-xl hover:text-white"
        color="blue"
        @click="openVault"
      >
        Submit
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { decrypt, deriveKeyFromPassword } from '~/utils/encryptionUtils'
definePageMeta({
  title: 'Open Vault',
  description: 'Open a vault',
  layout: 'dashboard',
})

const password = ref('')
const accessToken = ref(null)
const refreshToken = ref(null)
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
      console.log('server response is ok')
      const encryptionKeyObject = await deriveKeyFromPassword(password.value)

      try {
        accessToken.value = await decrypt(
          response.data.enc_cloud_access_token,
          encryptionKeyObject
        )
      } catch (error) {
        console.error('error during access token decryption')
      }

      try {
        refreshToken.value = await decrypt(
          response.data.enc_cloud_refresh_token,
          encryptionKeyObject
        )
      } catch (error) {
        console.error('error during refresh token decryption')
      }

      if (!accessToken || !refreshToken) {
        console.error('Error during decryptions?')
      }

      console.log(accessToken)

      console.log(refreshToken)

      sessionStorage.setItem('vaultID', response.data.id)
      sessionStorage.setItem('vaultKey', password.value)
      vault.$patch({
        key: encryptionKeyObject,
        name: response.data.name,
        cloudProvider: response.data.cloud_provider,
        cloudFolderName: response.data.cloud_folder_name,
        createdAt: response.data.created_at,
        description: response.data.description,
        idleTime: response.data.idle_time,
        cloudAccessToken: accessToken,
        cloudRefreshToken: refreshToken,
        id: response.data.id,
        isOpen: true,
        tokenExpiresIn: response.data.token_expires_in,
      })
      navigateTo('/dashboard/vault')
    }
  } catch (error) {
    console.error(error)
    if (!error.response) {
      alert('Network error, try again later!')
    } else if (error.response.status === 401) {
      alert('Wrong password, try again!')
    } else if (error.response.status === 500) {
      alert('Server error, try again later!')
    }
  }
}
</script>
