// Authentication - Auth2.0
<template>
  <div>
    <button @click="connectToOneDrive" class="border border-black">
      Connect to OneDrive
    </button>
    <div v-if="connected">
      <p>Connected to OneDrive.</p>
    </div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

// export Vue.js component
export default {
  // data function ret. obj containing component's reactive data properties; init. aT to null
  data() {
    return {
      accessToken: null,
      refreshToken: null,
      error: null,
      connected: false,
    }
  },
  mounted() {
    try {
      const URLparams = new URLSearchParams(window.location.search)
      const code = URLparams.get('code') // get auth code from URL
      if (code) {
        this.getAccessToken(code) // exchange for access token if code exists
      } else {
        const error = URLparams.get('error')
        if (error) {
          this.error = 'Error from authorization server: ${error}'
        }
      }
    } catch (err) {
      this.error = 'Error during mounted: ${err.message}'
    }
  },

  methods: {
    generateCodeVerifier() {
      try {
        const codeVerifier = uuidv4() + uuidv4() + uuidv4() + uuidv4()
        return codeVerifier
      }
      catch (err) {
        this.error = `Error generating code verifier: ${err.message}`
      }
    },

    generateCodeChallenge(codeVerifier) {
      try {
        const hash = sha256(codeVerifier)
        const base64Hash = Base64.stringify(hash)
        return base64Hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
      catch (err) {
        this.error = `Error generating code challenge: ${err.message}`
      }
    },

    connectToOneDrive() {
      try {
        //const clientID = process.env.OD_CLIENT_ID 
        const clientID = '7dcaac58-fe03-412f-a027-44cd3c63383e'
        const redirectUri = 'https://super-duper-palm-tree-g4x9qrw94p5r2vww-3000.app.github.dev/testing' // change later! to url of vault after successfully connected to cloud!
        const scope = 'files.readwrite offline_access' // perm. app req.; offline_access - allow app 2 receive refresh tokens 2 obtain new access tokens w/o user having to sign in again
        const responseType = 'code' // auth. code
        const tenantID = 'common' 

// Generate PKCE code verifier & code challenge
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = this.generateCodeChallenge(codeVerifier);
        sessionStorage.setItem('code_verifier', codeVerifier);
        
        const authURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=consent`
        console.log('Redirecting to:', authURL); // debugging: Log the authorization URL
        window.location.href = authURL // 2 redirect user 2 auth. url ;prop. of window.locn obj that get/sets url of current page
      }
      catch (err) {
        this.error = 'Error connecting to OneDrive: ${err.message}'
      }
    },

    // exchange auth. code for access token
    async getAccessToken(code) {
      try {
        const clientID = '7dcaac58-fe03-412f-a027-44cd3c63383e'
        const redirectUri = 'https://super-duper-palm-tree-g4x9qrw94p5r2vww-3000.app.github.dev/testing' // change later! to url of vault after successfully connected to cloud!
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
          body: new URLSearchParams({ // construct req. body as URL encoded param.
            client_id: clientID,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to obtain access token: ${response.statusText} - ${errorText}`)
        }

        const tokenData = await response.json() // parse response as json
        this.accessToken = tokenData.access_token // store access token
        this.refreshToken = tokenData.refresh_token // store refresh token
        this.connected = true
        window.history.replaceState({}, document.title, "/") // clean URL
      }
      catch (err) {
        this.error = `Error obtaining access token: ${err.message}`
        console.error('Error details:', err) // Log detailed error information
      }
    },

    async refreshAccessToken() {
      try {
        const clientID = '7dcaac58-fe03-412f-a027-44cd3c63383e'
        const redirectUri = 'https://super-duper-palm-tree-g4x9qrw94p5r2vww-3000.app.github.dev/testing' // change later! to url of vault after successfully connected to cloud!
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
          throw new Error('Failed to refresh access token: ${response.statusText}')
        }

        const tokenData = await response.json()
        this.accessToken = tokenData.access_token
        this.refreshToken = tokenData.refresh_token // refresh token if new one is provided
        this.connected = true
        window.history.replaceState({}, document.title, "/") // clean URL
      }
      catch (err) {
        this.error = `Error refreshing access token: ${err.message}`
        console.error('Error details:', err)
      }
    },
  },
}
</script>