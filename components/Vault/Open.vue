<template>
  <div class="flex flex-col items-center justify-center h-full p-4">
    <div class="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow">
      <h1 class="text-xl font-semibold text-gray-800">
        You are trying to open vault: {{ vault.name }}
      </h1>
      <h2 class="text font-semibold text-gray-800">
        Vault Description: <br />
        <br />
        {{ vault.description }}
      </h2>
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
      const accessToken = await decrypt(
        response.data.enc_cloud_access_token,
        encryptionKeyObject
      )
      const refreshToken = await decrypt(
        response.data.enc_cloud_refresh_token,
        encryptionKeyObject
      )

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

// Encryption decryption functions
async function encrypt(stringToEncrypt, encryptionKeyObject) {
  const encoder = new TextEncoder()
  const encodedString = encoder.encode(stringToEncrypt)

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKeyObject,
    encodedString
  )

  const stringArray = new Uint8Array(encryptedData)
  const base64String = toBase64Url(stringArray)
  const base64IV = toBase64Url(iv)

  return base64IV + base64String
}

async function decrypt(stringToDecrypt, encryptionKeyObject) {
  const base64IV = stringToDecrypt.slice(0, 16)
  const base64String = stringToDecrypt.slice(16)

  const encStringUInt8Array = fromBase64Url(base64String)
  const encryptedString = encStringUInt8Array.buffer

  const ivUInt8Array = fromBase64Url(base64IV)
  const iv = ivUInt8Array.buffer

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    encryptionKeyObject,
    encryptedString
  )

  const decryptedString = new TextDecoder().decode(decryptedData)

  return decryptedString
}

function toBase64Url(byteArray) {
  // Convert byteArray to a standard base64 string
  const base64String = window.btoa(String.fromCharCode.apply(null, byteArray))

  // Make the base64 string URL and filename safe
  const base64UrlString = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return base64UrlString
}

function fromBase64Url(base64UrlString) {
  // Replace URL-safe characters back to their original
  const base64String = base64UrlString.replace(/-/g, '+').replace(/_/g, '/')

  // Pad the base64 string to make its length a multiple of 4
  const paddedBase64String = base64String.padEnd(
    base64String.length + ((4 - (base64String.length % 4)) % 4),
    '='
  )

  // Decode base64 string to a UTF-16 string
  const decodedString = window.atob(paddedBase64String)

  // Convert decoded string to byte array
  const byteArray = new Uint8Array(decodedString.length)
  for (let i = 0; i < decodedString.length; i++) {
    byteArray[i] = decodedString.charCodeAt(i)
  }

  return byteArray
}

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buff
}
</script>
