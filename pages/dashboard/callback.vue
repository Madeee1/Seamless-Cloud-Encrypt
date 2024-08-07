<template>
  <div>
    <h1>Give us a moment..</h1>
    <div
      v-if="connected"
      class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
      role="alert"
    >
      <p>Connected to OneDrive.</p>
    </div>
    <div
      v-if="error"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
      role="alert"
    >
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { encrypt, deriveKeyFromPassword } from '~/utils/encryptionUtils'
const error = ref('')
const createVaultStore = useCreateVaultStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

// TODO: CHANGE AFTER
const accessToken = ref('')
const refreshToken = ref('')
const connected = ref(false)
onMounted(async () => {
  async function handleCallback() {
    try {
      // Access token area
      const URLparams = new URLSearchParams(window.location.search)
      const code = URLparams.get('code') // get auth code from URL
      if (code) {
        await getAccessToken(code) // exchange for access token if code exists
      } else {
        const error = URLparams.get('error')
        if (error) {
          error.value = `Error from authorization server: ${error}`
        }
      }

      // Save vault to supabase
      await createVault()

      navigateTo('/dashboard')
    } catch (err) {
      error.value = `Error during vault creation: ${err.message}`
    }
  }

  if (!sessionStorage.getItem('vaultID')) {
    console.log('Creating new vault... ')
    handleCallback()
  } else {
    const URLparams = new URLSearchParams(window.location.search)
    const code = URLparams.get('code')
    await renewAccessToken(code)
  }
})

// Functions on vault creation
async function createVault() {
  console.log('createVault is running')

  createVaultStore.key = await deriveKeyFromPassword(createVaultStore.password)

  // encrypt the access and refresh token using the key
  const encryptedAccessToken = await encrypt(
    accessToken.value,
    createVaultStore.key
  )
  const encryptedRefreshToken = await encrypt(
    refreshToken.value,
    createVaultStore.key
  )

  const { error } = await supabase.from('vault').insert({
    name: createVaultStore.name,
    cloud_folder_name: createVaultStore.cloudFolderName,
    cloud_provider: createVaultStore.cloudProvider,
    hashed_password: createVaultStore.hashedPassword,
    description: createVaultStore.description,
    enc_cloud_access_token: encryptedAccessToken,
    enc_cloud_refresh_token: encryptedRefreshToken,
    token_expires_in: createVaultStore.tokenExpiresIn,
  })

  createVaultStore.$reset()

  // TODO: Handle error
  if (error) {
    throw new Error(`Error creating vault: ${error.message}`)
  } else {
    readVault()
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

// Function on Access Token stuff
async function getAccessToken(code) {
  console.log('getAccessToken is running')
  try {
    const clientID = import.meta.env.VITE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
    const tenantID = 'common'
    const tokenURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/token` // where exchange takes place
    const codeVerifier = sessionStorage.getItem('code_verifier')

    if (!codeVerifier) {
      throw new Error('Code verifier not found in session storage.')
    }

    console.log('Requesting access token with code:', code) // debugging: Log the authorization code

    // send HTTP POST req. 2 tokenURL & wait 4 response
    const response = await $fetch(tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Set CT header to that, indic8 req. body is url encoded
      },
      body: new URLSearchParams({
        // construct req. body as URL encoded param.
        client_id: clientID,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.access_token) {
      const errorText = await response.text()
      throw new Error(
        `Failed to obtain access token: ${response.statusText} - ${errorText}`
      )
    }

    accessToken.value = response.access_token // store access token
    refreshToken.value = response.refresh_token // store refresh token
    createVaultStore.tokenExpiresIn = Date.now() + response.expires_in * 1000 // Calculate token expiration time

    connected.value = true
    // clean url of its parameters without cleaning the /dashboard/callback
    window.history.replaceState({}, document.title, '/dashboard/callback')
  } catch (err) {
    error.value = `Error obtaining access token: ${err.message}`
    console.error('Error details:', err) // Log detailed error information
  }
}

async function renewAccessToken(code) {
  console.log('renewAccessToken is running')
  try {
    const clientID = import.meta.env.VITE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
    const tenantID = 'common'
    const tokenURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/token` // where exchange takes place
    const codeVerifier = sessionStorage.getItem('code_verifier')

    if (!codeVerifier) {
      throw new Error('Code verifier not found in session storage.')
    }

    console.log('Requesting access token with code:', code) // debugging: Log the authorization code

    // send HTTP POST req. 2 tokenURL & wait 4 response
    const response = await $fetch(tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Set CT header to that, indic8 req. body is url encoded
      },
      body: new URLSearchParams({
        // construct req. body as URL encoded param.
        client_id: clientID,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.access_token) {
      const errorText = await response.text()
      throw new Error(
        `Failed to obtain access token: ${response.statusText} - ${errorText}`
      )
    }

    const vaultPassword = sessionStorage.getItem('vaultKey')
    const vaultKey = await deriveKeyFromPassword(vaultPassword)
    const vaultID = sessionStorage.getItem('vaultID')

    const encryptedAccessToken = await encrypt(response.access_token, vaultKey)

    const encryptedRefreshToken = await encrypt(
      response.refresh_token,
      vaultKey
    )

    const { supabaseData, error } = await supabase
      .from('vault')
      .update({
        enc_cloud_access_token: encryptedAccessToken,
        enc_cloud_refresh_token: encryptedRefreshToken,
        token_expires_in: Date.now() + response.expires_in * 1000,
      })
      .eq('id', vaultID)
      .eq('user_id', user.value.id)
      .select()

    if (error) {
      console.error(error)
    } else {
      console.log('Access tokens renewed successfully.')
    }

    sessionStorage.removeItem('vaultID')
    sessionStorage.removeItem('vaultKey')
    navigateTo('/dashboard')
  } catch (err) {
    error.value = `Error obtaining access token: ${err.message}`
    console.error('Error details:', err) // Log detailed error information
  }
}
</script>
