<template>
  <div></div>
</template>

<script setup>
import { encrypt } from '~/utils/encryptionUtils'
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