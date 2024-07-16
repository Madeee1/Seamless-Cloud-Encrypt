<template>
  <div>
    <h1>Callback here</h1>
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
const error = ref('')
const createVaultStore = useCreateVaultStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// TODO: CHANGE AFTER
const accessToken = ref('')
const refreshToken = ref('')
const tokenExpiryTime = ref('')
const connected = ref(false)
onMounted(() => {
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

  handleCallback()
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

  const decryptedAccessToken = await decrypt(
    encryptedAccessToken,
    createVaultStore.key
  )
  const decryptedRefreshToken = await decrypt(
    encryptedRefreshToken,
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
    console.log('Here is the response from getting access token:')
    console.log(response)

    if (!response.access_token) {
      const errorText = await response.text()
      throw new Error(
        `Failed to obtain access token: ${response.statusText} - ${errorText}`
      )
    }

    accessToken.value = response.access_token // store access token
    refreshToken.value = response.refresh_token // store refresh token
    tokenExpiryTime.value = Date.now() + response.expires_in * 1000 // Calculate token expiration time

    console.log('Access Token:', accessToken.value) // debugging - log access token
    connected.value = true
    // clean url of its parameters without cleaning the /dashboard/callback
    window.history.replaceState({}, document.title, '/dashboard/callback')

    // TODO:
    // this.setTokenRefreshInterval()
  } catch (err) {
    error.value = `Error obtaining access token: ${err.message}`
    console.error('Error details:', err) // Log detailed error information
  }
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