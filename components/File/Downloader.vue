<template>
  <div class="max-w-md p-4">
    <h1 class="text-2xl font-bold mb-4">Download:</h1>
    <div v-if="confirmPassword">
      <label for="confirm-password">Confirm Password:</label>
      <input
        id="confirm-password"
        v-model="password"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <UButton class="mx-4 mt-4" @click="confirmDownload">Confirm</UButton>
      <br />
      <br />
    </div>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      @click="filesList"
    >
      Refresh Files List
    </button>
    <ul>
      <li
        v-for="file in files"
        :key="file.id"
        class="flex items-center justify-between bg-gray-100 p-2 rounded mb-2 gap-2"
      >
        <div class="flex items-center">
          <img
            v-if="file.thumbnailUrl"
            :src="file.thumbnailUrl"
            alt="Thumbnail"
            class="w-10 h-10 mr-4 rounded"
          />
          <span class="font-medium">
            {{ file.oriFilename }}
          </span>
        </div>
        <UButton
          class="text-white font-bold py-1 px-3 rounded"
          @click="handleDownload(file)"
        >
          Download
        </UButton>
      </li>
    </ul>
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>
<script>
import { useVaultStore } from '@/stores/vault'
import { v4 as uuidv4 } from 'uuid'
import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

export default {
  data() {
    return {
      // files: [],
      decryptedFileURL: [],
      originalFilename: [],
      // from download.vue
      files: [],
      error: null,
      password: null,
      selectedFile: null,
      confirmPassword: false,
    }
  },
  computed: {
    accessToken() {
      const vaultStore = useVaultStore()
      return vaultStore.cloudAccessToken
    },
  },
  methods: {
    handleDownload(file) {
      this.confirmPassword = true
      this.selectedFile = file
    },
    async previewFilename(filename) {
      const vaultStore = useVaultStore()
      const cryptoKeyObj = vaultStore.key

      const encryptedFilenameB64 = filename.replace(/\.bin$/, '')
      const encFNameUInt8Array = this.fromBase64Url(encryptedFilenameB64)
      const encryptedFilenameAndiv = encFNameUInt8Array.buffer

      const fileNameiv = encryptedFilenameAndiv.slice(0, 12)
      const encryptedFilename = encryptedFilenameAndiv.slice(12)

      try {
        const decryptedFilename = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: fileNameiv },
          cryptoKeyObj,
          encryptedFilename
        )
        return new TextDecoder().decode(decryptedFilename)
      } catch (error) {
        return 'Undecipherable_Filename.txt'
      }
    },

    async decryptFile(fileArrayBuffer, filename) {
      const vaultStore = useVaultStore()
      // file converted to arrayBuffer in backend
      // get key and filename from pinia store
      const cryptoKeyObj = vaultStore.key

      // extract index of orignal encrypted filename
      const separatorIndex = new Uint8Array(fileArrayBuffer).indexOf(
        '\n'.charCodeAt(0)
      )

      // Extract the filename, which is b64. Convert to ArrayBuffer for decryption
      const encryptedFilenameB64 = filename.replace(/\.bin$/, '')
      const encFNameUInt8Array = this.fromBase64Url(encryptedFilenameB64)
      const encryptedFilename = encFNameUInt8Array.buffer

      // extract filename iv from encrypted file
      const ivBuffer = fileArrayBuffer.slice(
        separatorIndex + 1,
        separatorIndex + 13
      )
      const iv = new Uint8Array(ivBuffer)

      // extract encrypted content from encrypted file
      const ciphertext = fileArrayBuffer.slice(separatorIndex + 13)

      const filenameiv = encryptedFilename.slice(0, 12)
      const encryptedFilenameOnly = encryptedFilename.slice(12)

      let originalFilename = ''
      // decrypt filename
      try {
        const decryptedFilename = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: filenameiv },
          cryptoKeyObj,
          encryptedFilenameOnly
        )
        originalFilename = new TextDecoder().decode(decryptedFilename)
        this.originalFilename.push(originalFilename)
      } catch (error) {
        console.error('error during filename decryption: ', error)
      }

      let decryptedBlob = null
      // decrypt file and create download URL
      try {
        const decryptedData = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          cryptoKeyObj,
          ciphertext
        )
        decryptedBlob = new Blob([decryptedData], {
          type: 'text/plain',
        })
        this.decryptedFileURL.push(URL.createObjectURL(decryptedBlob))
      } catch (error) {
        console.error('error during content decryption: ', error)
      }

      // Return a File object
      const decryptedFile = new File([decryptedBlob], originalFilename, {
        type: 'text/plain',
      })
      return decryptedFile
    },

    async refreshAccessToken() {
      const vaultStore = useVaultStore()

      if (this.checkTokenRefresh()) {
        console.log('Refresh token expired, opening reauthentication popup.')
        await this.reauthenticatePopUp()
        return // Exit early, reauthentication is handled in the popup
      }

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
            refresh_token: vaultStore.cloudRefreshToken,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Failed to refresh access token: ${response.statusText} - ${errorText}`
          )
        }

        const tokenData = await response.json()
        vaultStore.cloudAccessToken = tokenData.access_token
        vaultStore.cloudRefreshToken = tokenData.refresh_token // refresh token if new one is provided
        vaultStore.tokenExpiresIn = Date.now() + tokenData.expires_in * 1000
      } catch (err) {
        console.error(`Error refreshing access token: ${err.message}`)
        throw err
      }
    },

    async checkTokenRefresh() {
      let isReauthenticating = false
      const vaultStore = useVaultStore()
      const timeLeft = vaultStore.tokenExpiresIn - Date.now()

      if (timeLeft < 5 * 60 * 1000) {
        // < 5 min refresh
        if (!isReauthenticating) {
          console.log('Refresh token expired, opening reauthentication popup.')
          isReauthenticating = true // Set the flag to true to avoid multiple logs
          try {
            await this.reauthenticatePopUp()
          } catch (err) {
            console.error('Error during reauthentication:', err)
          } finally {
            isReauthenticating = false // Reset the flag after reauthentication
          }
          return // Exit early, reauthentication is handled in the popup
        }
      } else {
        try {
          await this.refreshAccessToken()
        } catch (err) {
          console.error('Error during token refresh:', err)
        }
      }
    },

    async filesList() {
      const vaultStore = useVaultStore()
      const cloudFolderName = vaultStore.cloudFolderName

      console.log('Access token', this.accessToken)

      try {
        await this.checkTokenRefresh()

        if (!this.accessToken) {
          const code = await this.reauthenticatePopUp()
          await this.getAccessToken(code)
        }

        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root:/${cloudFolderName}:/children`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to list files: ${response.statusText}`)
        }

        const data = await response.json()
        this.files = data.value // store list of files

        for (let i = 0; i < this.files.length; i++) {
          const oriFilename = await this.previewFilename(this.files[i].name)
          this.files[i].oriFilename = oriFilename
        }
      } catch (err) {
        this.error = `Error listing files: ${err.message}`
        console.error('Error details:', err)
      }
    },

    async downloadFile(file) {
      try {
        await this.checkTokenRefresh() // Ensure token is refreshed

        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        const response = await $fetch('/api/vault/download', {
          method: 'POST',
          body: {
            accessToken: this.accessToken,
            fileId: file.id,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`)
        }

        const encryptedFileArrayBuffer = this.base64ToArrayBuffer(
          response.encryptedBlob
        )

        // Decrypt File here
        const decryptedFile = await this.decryptFile(
          encryptedFileArrayBuffer,
          file.name
        )

        // Download the decrypted file
        const url = window.URL.createObjectURL(decryptedFile)
        const a = document.createElement('a')
        a.href = url
        a.download = decryptedFile.name
        document.body.appendChild(a)
        a.click()
        a.remove()
      } catch (err) {
        this.error = `Error downloading file: ${err.message}`
        console.error('Error details:', err)
      }
    },

    fromBase64Url(base64UrlString) {
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
    },

    base64ToArrayBuffer(base64) {
      const binaryString = atob(base64)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes.buffer
    },

    async confirmDownload() {
      const vault = useVaultStore()

      try {
        const response = await $fetch('/api/vault/auth/download', {
          method: 'POST',
          body: {
            password: this.password,
            vaultId: vaultStore.id,
          },
        })

        if (response.ok) {
          this.downloadFile(this.selectedFile)
          this.confirmPassword = false
          this.selectedFile = null
          this.password = null
        }
      } catch (error) {
        if (!error.response) {
          alert('Network error, try again later!')
        } else if (error.response.status === 401) {
          alert('Wrong password, try again!')
        } else if (error.response.status === 500) {
          alert('Server error, try again later!')
        }
      }
    },

    async reauthenticatePopUp() {
      // Same as connectToOneDrive() this part
      try {
        const clientID = import.meta.env.VITE_CLIENT_ID
        const redirectUri = import.meta.env.VITE_OD_REDIRECT_URI
        const scope = 'files.readwrite offline_access'
        const tenantID = 'common'

        //const state = uuidv4()
        //const nonce = uuidv4()

        const codeVerifier = await this.generateCodeVerifier()
        const codeChallenge = await this.generateCodeChallenge(codeVerifier)

        const authURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=consent`
        //const authURL = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}&state=${state}&nonce=${nonce}&code_challenge=${codeChallenge}&code_challenge_method=S256`

        const popup = window.open(authURL, 'authPopup', 'width=600,height=600')

        if (!popup) {
          throw new Error('Failed to open authentication popup')
        }

        // Listen for messages from the popup window
        window.addEventListener('message', async (event) => {
          if (event.origin !== window.location.origin) return

          const { type, code } = event.data
          if (type === 'auth_code') {
            await handleAuthCode(code)
            window.removeEventListener('message', listener)
          }
        })
      } catch (err) {
        console.error(`Error opening login popup: ${err.message}`)
      }
    },

    // same method as in callback.vue
    async getAccessToken(code) {
      const tokenURL = `https://login.microsoftonline.com/common/oauth2/v2.0/token`
      const codeVerifier = sessionStorage.getItem('code_verifier')
      if (!codeVerifier) {
        throw new Error('Code verifier not found in session storage.')
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: import.meta.env.VITE_CLIENT_ID,
        code: code,
        redirect_uri: import.meta.env.VITE_OD_REDIRECT_URI,
        code_verifier: codeVerifier,
      })

      try {
        const response = await fetch(tokenURL, {
          method: 'POST',
          body: body.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Access Token:', data.access_token)
        // Store the access token and use it for subsequent API requests
        const vaultStore = useVaultStore()
        vaultStore.cloudAccessToken = data.access_token
        vaultStore.cloudRefreshToken = data.refresh_token
        vaultStore.tokenExpiresIn = Date.now() + data.expires_in * 1000
      } catch (error) {
        console.error('Error exchanging authorization code:', error)
      }
    },

    async handleAuthCode(code) {
      try {
        await this.getAccessToken(code) // Assume this method exchanges the code for new tokens
        console.log('Reauthentication successful')
        window.location.href = '/vault'
      } catch (err) {
        console.error(`Error handling authorization code: ${err.message}`)
      }
    },

    async generateCodeVerifier() {
      try {
        // Generate a secure random string of 32 bytes
        const array = new Uint8Array(32)
        window.crypto.getRandomValues(array)
        const codeVerifier = Array.from(array, (byte) =>
          byte.toString(16).padStart(2, '0')
        ).join('')
        sessionStorage.setItem('code_verifier', codeVerifier)
        return codeVerifier
      } catch (err) {
        console.error(`Error generating code verifier: ${err.message}`)
      }
    },

    async generateCodeChallenge(codeVerifier) {
      const hash = sha256(codeVerifier)
      const base64Hash = Base64.stringify(hash)
      return base64Hash
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    },
  },
}
</script>
