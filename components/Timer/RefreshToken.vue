<template>
  <div></div>
</template>

<script setup>
const createVaultStore = useCreateVaultStore()
const vault = useVaultStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const intervalId = ref('')

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

async function refreshAccessToken() {
  try {
    console.log('refreshing access token')
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
        refresh_token: vault.cloudRefreshToken,
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
    vault.tokenExpiresIn = Date.now() + tokenData.expires_in * 1000
  } catch (err) {
    throw new Error(`Error refreshing access token: ${err.message}`)
  }
}

async function checkTokenRefresh() {
  const timeLeft = vault.tokenExpiresIn - Date.now()
  if (timeLeft < 5 * 60 * 1000) {
    // < 5 min refresh
    try {
      await refreshAccessToken()
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style>

</style>