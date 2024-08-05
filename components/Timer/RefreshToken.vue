<template>
  <div></div>
</template>

<script setup>
import { encrypt } from '~/utils/encryptionUtils'
import { v4 as uuidv4 } from 'uuid'
import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

const createVaultStore = useCreateVaultStore()
const vault = useVaultStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const intervalId = ref('')
const errorMessage = ref('')
const refreshToken = ref(vault.cloudRefreshToken)

onMounted(() => {
  if (vault.tokenExpiresIn) {
    checkTokenRefresh()
  }
  intervalId.value = setInterval(() => {
    if (vault.tokenExpiresIn) {
      checkTokenRefresh()
    }
  }, 60 * 1000) // Do this every 1 minute
})

onBeforeUnmount(() => {
  clearInterval(intervalId.value)
})

// replaced with reAuthenticate?
async function refreshAccessToken() {
  try {
    const clientID = import.meta.env.VITE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
    const tenantID = 'common'
    const tokenURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/token`

    const response = await fetch(tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientID,
        grant_type: 'refresh_token',
        redirect_uri: redirectUri,
        refresh_token: refreshToken.value,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to refresh access token: ${response.statusText} - ${errorText}`
      )
    }

    const tokenData = await response.json()
    vault.cloudAccessToken = tokenData.access_token
    vault.cloudRefreshToken = tokenData.refresh_token // refresh token if new one is provided

    const enc_cloud_access_token = await encrypt(
      tokenData.access_token,
      vault.key
    )
    const enc_cloud_refresh_token = await encrypt(
      tokenData.refresh_token,
      vault.key
    )

    const newTokenExpiresIn = Date.now() + tokenData.expires_in * 1000
    vault.tokenExpiresIn = newTokenExpiresIn

    // Update Supabase vault
    const { error } = await supabase
      .from('vault')
      .update({
        enc_cloud_access_token: enc_cloud_access_token,
        enc_cloud_refresh_token: enc_cloud_refresh_token,
        token_expires_in: newTokenExpiresIn,
      })
      .eq('id', vault.id)
  } catch (err) {
    throw new Error(`Error refreshing access token: ${err.message}`)
  }
}

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
  console.log('connect to onedrive is running')
  try {
    const clientID = import.meta.env.VITE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
    const scope = 'files.readwrite offline_access' // perm. app req.; offline_access - allow app 2 receive refresh tokens 2 obtain new access tokens w/o user having to sign in again
    const tenantID = 'common'

    // Generate PKCE code verifier & code challenge
    const codeVerifier = generateCodeVerifier()
    const newcodeChallenge = generateCodeChallenge(codeVerifier)

    const authURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${newcodeChallenge}&code_challenge_method=S256&prompt=consent`
    window.location.href = authURL // 2 redirect user 2 auth. url ;prop. of window.locn obj that get/sets url of current page
  } catch (err) {
    console.error(err)
    errorMessage.value = `Error connecting to OneDrive: ${err}`
  }
}

async function checkTokenRefresh() {
  const timeLeft = vault.tokenExpiresIn - Date.now()
  if (timeLeft < 5 * 60 * 1000) {
    // < 5 min refresh
    try {
      await reAuthenticate()
    } catch (err) {
      console.error(err)
      connectToOneDrive()
    }
  }
}

async function reAuthenticate() {
  console.log(
    'Re-authenticating user for new access token and refresh token... '
  )

  const tokenURL = `https://login.microsoftonline.com/common/oauth2/v2.0/token`
  const clientID = import.meta.env.VITE_CLIENT_ID
  const scope = 'files.readwrite offline_access'
  const refreshToken = vault.cloudRefreshToken
  const params = new URLSearchParams({
    client_id: clientID,
    grant_type: 'refresh_token',
    scope: scope,
    refresh_token: refreshToken,
  })

  const response = await fetch(tokenURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const tokenResponse = await response.json()

  if (!response.ok) {
    sessionStorage.setItem('vaultID', vault.id)
    console.error(tokenResponse.error)
    throw new Error(
      `Error during reauthentication: ${tokenResponse.error_description || 'Unknown error'}`
    )
  }

  // Update pinia tokens
  vault.$patch({
    cloudAccessToken: tokenResponse.access_token,
    cloudRefreshToken: tokenResponse.refresh_token,
    tokenExpiresIn: tokenResponse.expires_in,
  })

  // Update supabase tokens
  const encryptedAccessToken = await encrypt(
    tokenResponse.access_token,
    vault.key
  )

  const encryptedRefreshToken = await encrypt(
    tokenResponse.refresh_token,
    vault.key
  )

  const { supabaseData, error } = await supabase
    .from('vault')
    .update({
      enc_cloud_access_token: encryptedAccessToken,
      enc_cloud_refresh_token: encryptedRefreshToken,
    })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .select()

  if (error) {
    console.error(error)
  } else {
    console.log('Re-authentication successful.\n ')
  }
}
</script>

<style></style>
