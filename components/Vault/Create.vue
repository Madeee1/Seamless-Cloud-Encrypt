<template>
  <div class="px-4 text-gray-200">
    <form class="space-y-2">
      <p class="text-3xl font-semibold">
        <span class="text-third-blue">Create V</span>ault
      </p>
      <div>
        <label class="block text-xl"
          ><span class="text-third-blue">N</span>ame</label
        >
        <input
          v-model="createVaultStore.name"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md px-2 py-1 text-main-blue font-semibold"
        />
      </div>
      <div>
        <label class="block text-xl"
          ><span class="text-third-blue">P</span>assword</label
        >
        <input
          v-model="vaultPassword"
          type="password"
          required
          class="w-full border border-gray-300 rounded-md px-2 py-1 text-main-blue font-semibold"
        />
      </div>
      <div>
        <label class="block text-xl"
          ><span class="text-third-blue">C</span>loud</label
        >
        <select
          v-model="createVaultStore.cloudProvider"
          class="w-full border border-gray-300 rounded-md px-2 py-1 text-main-blue font-semibold"
        >
          <option value="None">None</option>
          <option value="OneDrive">OneDrive</option>
        </select>
      </div>
      <div>
        <label class="block text-xl"
          ><span class="text-third-blue">D</span>escription</label
        >
        <input
          v-model="createVaultStore.description"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md px-2 py-1 text-main-blue font-semibold"
        />
      </div>
      <div>
        <label class="block text-xl"
          ><span class="text-third-blue">C</span>loud
          <span class="text-third-blue">F</span>older
          <span class="text-third-blue">N</span>ame</label
        >
        <input
          v-model="createVaultStore.cloudFolderName"
          type="text"
          required
          class="w-full border border-gray-300 rounded-md px-2 py-1 text-main-blue font-semibold"
        />
      </div>
    </form>
    <div class="mt-7">
      <UButton
        class="px-4 py-2 text-white rounded-md font-semibold text-md"
        color="blue"
        @click="saveCreateVault()"
      >
        Create Vault
      </UButton>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// TODO: Deprecate use of crypto-js in favor of built-in Web Crypto API and btoa()
import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const createVaultStore = useCreateVaultStore()

const vaultPassword = ref('')

const errorMessage = ref('')

async function saveCreateVault() {
  if (createVaultStore.cloudProvider !== 'OneDrive') {
    alert('Only OneDrive is supported at the moment.')
    return
  }

  const saltRounds = 10
  const hashPass = await bcrypt.hash(vaultPassword.value, saltRounds)

  createVaultStore.hashedPassword = hashPass
  createVaultStore.password = vaultPassword.value

  connectToOneDrive()
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
