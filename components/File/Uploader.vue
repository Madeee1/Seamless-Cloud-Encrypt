<template>
  <div class="flex flex-col gap-4">
    <div>
      <p class="text-lg font-semibold">
        Upload files you want to encrypt upload here
      </p>
      <input
        ref="fileInput"
        type="file"
        multiple
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        @change="handleFileUpload"
      />
    </div>
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>
    <div
      v-if="uploadSuccess"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
      role="alert"
    >
      File uploaded successfully!
    </div>
    <!-- DEPRECATE
    <div v-for="(file, index) in newFilename" :key="index" class="pt-2">
      <a
        :href="encryptedFileURL[index]"
        :download="file"
        class="text-blue-500 hover:text-blue-800"
        >Download -> {{ file }}</a
      >
    </div>
      -->
  </div>
</template>

<script>
import { useVaultStore } from '@/stores/vault'

export default {
  data() {
    return {
      files: [],
      encryptedFileURL: [],
      keyPass: '',
      newFilename: [],
      // FROM upload.vue
      accessToken: sessionStorage.getItem('access_token') || null,
      error: null, // init 2 null
      uploadSuccess: false,
    }
  },
  methods: {
    async handleFileUpload() {
      this.files = Array.from(this.$refs.fileInput.files)
      const vaultStore = useVaultStore()

      const encoder = new TextEncoder()

      for (let i = 0; i < this.files.length; i++) {
        // derive key from password
        const cryptoKeyObj = vaultStore.key

        // convert file to arraybuffer
        const file = this.files[i]
        const fileAB = await file.arrayBuffer()

        // generate iv
        const iv = crypto.getRandomValues(new Uint8Array(12))

        // encrypt data
        const encryptedData = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKeyObj,
          fileAB
        )

        // get filename and iv for filename encryption
        const encodedFilename = encoder.encode(file.name)
        const filenameiv = crypto.getRandomValues(new Uint8Array(12))

        // encrypt filename
        const encryptedFilename = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: filenameiv },
          cryptoKeyObj,
          encodedFilename
        )

        // convert encrypted filename to readable string
        const filenameArray = new Uint8Array(encryptedFilename)
        // const filenameString = String.fromCharCode.apply(null, filenameArray)
        const base64Filename = this.toBase64Url(filenameArray)
        const newFilename = base64Filename + '.bin'
        this.newFilename.push(newFilename)

        // create blob for file download
        // concatenate index for pinia filenameArray, newline separator, filenameiv, and iv into encrypted file
        const encryptedBlob = new Blob(
          [i, '\n', filenameiv, iv, encryptedData],
          { type: 'application/octet-stream' }
        )
        this.encryptedFileURL.push(URL.createObjectURL(encryptedBlob))

        // Save the file as a File object
        const encryptedFile = new File(
          [i, '\n', filenameiv, iv, encryptedData],
          newFilename,
          {
            type: 'application/octet-stream',
          }
        )
        await this.uploadFile(encryptedFile)
      }
    },

    // TODO: Only created to handle 1 file at a time
    async uploadFile(file) {
      console.log('Uploading file:', file.name)
      // upload file to OneDrive using Microsoft Graph API
      try {
        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        console.log('Using Access Token:', this.accessToken) // Log access token 4 debugging

        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${file.name}:/content`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': file.type,
              apikey: import.meta.env.VITE_CLIENT_SECRET,
            },
            body: file,
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Failed to upload file: ${response.statusText} - ${errorText}`
          )
        }

        this.uploadSuccess = true

        // timer for how long alert last
        setTimeout(() => {
          this.uploadSuccess = false
        }, 10000)
      } catch (err) {
        this.error = `Error uploading file: ${err.message}`
        console.error('Error details:', err)
      }
    },

    toBase64Url(byteArray) {
      // Convert byteArray to a standard base64 string
      const base64String = window.btoa(
        String.fromCharCode.apply(null, byteArray)
      )

      // Make the base64 string URL and filename safe
      const base64UrlString = base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      return base64UrlString
    },
    toHexString(byteArray) {
      return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
      }).join('')
    },
  },
}
</script>
