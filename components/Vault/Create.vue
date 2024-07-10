<template>
  <div class="p-4">
    <form class="space-y-4">
      <p class="text-lg font-semibold">Create Vault</p>
      <div>
        <label class="block">Name</label>
        <input
          v-model="createVaultStore.name"
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
          v-model="createVaultStore.cloudProvider"
          class="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="None">None</option>
          <option value="OneDrive">OneDrive</option>
        </select>
      </div>
      <div>
        <label class="block">Description</label>
        <input
          v-model="createVaultStore.description"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label class="block">Cloud Folder Name</label>
        <input
          v-model="createVaultStore.cloudFolderName"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
    </form>
    <div class="mt-4">
      <UButton
        class="px-4 py-2 text-white rounded-md"
        @click="saveCreateVault()"
      >
        Create Vault, Connect to OneDrive
      </UButton>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import bcrypt from 'bcryptjs'
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const createVaultStore = useCreateVaultStore()

const vaultPassword = ref('')
const vaultCloud = ref('')

const errorMessage = ref('')

async function saveCreateVault() {
  const saltRounds = 10
  const hashPass = await bcrypt.hash(vaultPassword.value, saltRounds)

  createVaultStore.hashedPassword = hashPass
  createVaultStore.passwordDerivedKeyObject = await deriveKeyFromPassword(
    vaultPassword.value
  )

  connectToOneDrive()
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

// Code for CONNECTING TO ONEDRIVE
function generateCodeVerifier() {
  try {
    const codeVerifier = uuidv4() + uuidv4() + uuidv4() + uuidv4()
    sessionStorage.setItem('code_verifier', codeVerifier) // store code ver. in session storage
    return codeVerifier
  } catch (err) {
    errorMessage.value = `Error generating code verifier: ${err.message}`
  }
}

function generateCodeChallenge(codeVerifier) {
  try {
    const hash = sha256(codeVerifier)
    const base64Hash = Base64.stringify(hash)
    return base64Hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch (err) {
    errorMessage.value = `Error generating code challenge: ${err.message}`
  }
}

function connectToOneDrive() {
  try {
    const clientID = import.meta.env.VITE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
    const scope = 'files.readwrite offline_access' // perm. app req.; offline_access - allow app 2 receive refresh tokens 2 obtain new access tokens w/o user having to sign in again
    const tenantID = 'common'

    // Generate PKCE code verifier & code challenge
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)

    const authURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=consent`
    window.location.href = authURL // 2 redirect user 2 auth. url ;prop. of window.locn obj that get/sets url of current page
  } catch (err) {
    errorMessage.value = `Error connecting to OneDrive: ${err.message}`
  }
}
</script>
