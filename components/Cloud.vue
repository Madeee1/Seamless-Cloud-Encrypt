<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Connect to cloud</h1>
    <UButton
      class="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      @click="connectToOneDrive"
    >
      Connect to OneDrive
    </UButton>
    <div
      v-if="connected"
      class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
      role="alert"
    >
      <p>Connected to OneDrive.</p>
      <div>
        <button @click="showUpload">Upload File</button>
        <button @click="showDownload">Download File</button>
        <!--
        <CloudUpload v-if="showUploadC" />
        <CloudDownload v-if="showDownloadC" />  
      --></div>
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

<script>
import { v4 as uuidv4 } from 'uuid'
// TODO: Deprecate use of crypto-js in favor of built-in Web Crypto API and btoa()
import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

export default {
  // data function ret. obj containing component's reactive data properties; init. aT to null
  data() {
    return {
      accessToken: null,
      refreshToken: null,
      tokenExpiryTime: null,
      error: null,
      connected: false,
      showUploadC: false,
      showDownloadC: false,
    }
  },
  mounted() {},
  methods: {
    generateCodeVerifier() {
      try {
        const codeVerifier = uuidv4() + uuidv4() + uuidv4() + uuidv4()
        sessionStorage.setItem('code_verifier', codeVerifier) // store code ver. in session storage
        return codeVerifier
      } catch (err) {
        this.error = `Error generating code verifier: ${err.message}`
      }
    },
    generateCodeChallenge(codeVerifier) {
      try {
        const hash = sha256(codeVerifier)
        const base64Hash = Base64.stringify(hash)
        return base64Hash
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')
      } catch (err) {
        this.error = `Error generating code challenge: ${err.message}`
      }
    },
    connectToOneDrive() {
      console.log('button is being pressed')
      try {
        const clientID = import.meta.env.VITE_CLIENT_ID
        const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
        const scope = 'files.readwrite offline_access' // perm. app req.; offline_access - allow app 2 receive refresh tokens 2 obtain new access tokens w/o user having to sign in again
        const tenantID = 'common'

        // Generate PKCE code verifier & code challenge
        const codeVerifier = this.generateCodeVerifier()
        const codeChallenge = this.generateCodeChallenge(codeVerifier)

        const authURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=consent`
        console.log('Redirecting to:', authURL) // debugging: Log the authorization URL
        window.location.href = authURL // 2 redirect user 2 auth. url ;prop. of window.locn obj that get/sets url of current page
      } catch (err) {
        this.error = `Error connecting to OneDrive: ${err.message}`
      }
    },
    // exchange auth. code for access token
    async getAccessToken(code) {
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
        const response = await fetch(tokenURL, {
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

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Failed to obtain access token: ${response.statusText} - ${errorText}`
          )
        }

        const tokenData = await response.json() // parse response as json
        this.accessToken = tokenData.access_token // store access token
        this.refreshToken = tokenData.refresh_token // store refresh token
        this.tokenExpiryTime = Date.now() + tokenData.expires_in * 1000 // Calculate token expiration time

        sessionStorage.setItem('access_token', this.accessToken)
        sessionStorage.setItem('refresh_token', this.refreshToken)
        sessionStorage.setItem('token_expiry_time', this.tokenExpiryTime)

        console.log('Access Token:', this.accessToken) // debugging - log access token
        this.connected = true
        window.history.replaceState({}, document.title, '/') // clean URL

        this.setTokenRefreshInterval()
      } catch (err) {
        this.error = `Error obtaining access token: ${err.message}`
        console.error('Error details:', err) // Log detailed error information
      }
    },
    async refreshAccessToken() {
      try {
        const clientID = import.meta.env.VITE_CLIENT_ID
        const redirectUri =
          'https://super-duper-palm-tree-g4x9qrw94p5r2vww-3000.app.github.dev/testing' // change later! to url of vault after successfully connected to cloud!
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
            refresh_token: this.refreshToken,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Failed to refresh access token: ${response.statusText} - ${errorText}`
          )
        }

        const tokenData = await response.json()
        this.accessToken = tokenData.access_token
        this.refreshToken = tokenData.refresh_token // refresh token if new one is provided
        this.tokenExpiryTime = Date.now() + tokenData.expires_in * 1000

        sessionStorage.setItem('access_token', this.accessToken)
        sessionStorage.setItem('refresh_token', this.refreshToken)
        sessionStorage.setItem('token_expiry_time', this.tokenExpiryTime)

        console.log('Access Token:', this.accessToken)
        this.connected = true
        window.history.replaceState({}, document.title, '/') // clean URL
      } catch (err) {
        this.error = `Error refreshing access token: ${err.message}`
        console.error('Error details:', err)
      }
    },
    setTokenRefreshInterval() {
      setInterval(() => {
        const timeLeft = this.tokenExpiryTime - Date.now()
        if (timeLeft < 5 * 60 * 1000) {
          // < 5 min refresh
          this.refreshAccessToken()
        }
      }, 60 * 1000) // Check every min if token going 2 expire
    },
    showUpload() {
      this.showUploadC = true
      this.showDownloadC = false
    },
    showDownload() {
      this.showUploadC = false
      this.showDownloadC = true
    },
  },
}
</script>