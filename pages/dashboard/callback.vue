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
const showUploadComponent = ref(false)
const showDownloadComponent = ref(false)

// TODO: CHANGE AFTER
const accessToken = ref('')
const refreshToken = ref('')
const tokenExpiryTime = ref('')
const connected = ref(false)
onMounted(() => {
  try {
    const URLparams = new URLSearchParams(window.location.search)
    const code = URLparams.get('code') // get auth code from URL
    if (code) {
      getAccessToken(code) // exchange for access token if code exists
    } else {
      const error = URLparams.get('error')
      if (error) {
        error.value = `Error from authorization server: ${error}`
      }
    }

    navigateTo('/dashboard')
  } catch (err) {
    error.value = `Error during mounted: ${err.message}`
  }
})

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

    // TODO: DEPRECATE?
    sessionStorage.setItem('access_token', accessToken.value)
    sessionStorage.setItem('refresh_token', refreshToken.value)
    sessionStorage.setItem('token_expiry_time', tokenExpiryTime.value)

    console.log('Access Token:', accessToken.value) // debugging - log access token
    connected.value = true
    window.history.replaceState({}, document.title, '/') // clean URL

    // TODO:
    // this.setTokenRefreshInterval()
  } catch (err) {
    error.value = `Error obtaining access token: ${err.message}`
    console.error('Error details:', err) // Log detailed error information
  }
}

function showUpload() {
  showUploadComponent.value = true
  showDownloadComponent.value = false
}
function showDownload() {
  showUploadComponent.value = false
  showDownloadComponent.value = true
}
</script>