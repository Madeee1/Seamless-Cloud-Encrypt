<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <p
        class="text-2xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Upload the files you want to encrypt here
      </p>
      <input
        id="file-input"
        ref="fileInput"
        type="file"
        multiple
        class="block w-full text-lg text-gray-300 file:mr-5 file:w-1/6 file:py-1 file:px-2 file:rounded file:border-0 file:font-semibold file:bg-blue-500 file:text-gray-200 hover:file:bg-blue-700"
        @change="handleFileUpload"
      />
    </div>
    <div class="w-full px-10 ml-5 pt-3">
      <div
        v-if="error"
        class="px-10 py-2 bg-warning-red transform -skew-x-12 text-gray-200 rounded relative"
        role="alert"
      >
        <strong class="font-bold text-xl">ERROR!</strong>
        <br />
        <span class="pl-5 block sm:inline transform skew-x-12">{{
          error
        }}</span>
      </div>
      <div
        v-if="uploadSuccess"
        class="px-10 py-2 bg-third-blue transform -skew-x-12 text-gray-200 rounded relative"
        role="alert"
      >
        File uploaded successfully!
      </div>
    </div>
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
      error: null, // init 2 null
      uploadSuccess: false,
    }
  },
  computed: {
    accessToken() {
      const vaultStore = useVaultStore()
      return vaultStore.cloudAccessToken
    },
  },
  methods: {
    async handleFileUpload() {
      this.files = Array.from(this.$refs.fileInput.files)
      const vaultStore = useVaultStore()

      const encoder = new TextEncoder()

      let errorBoolean = false
      try {
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

          // file info details for file creation in server

          const fileNameivBase64 = this.toBase64Url(filenameiv)

          const fileInfo = {
            fileNameIndex: i,
            fileName: `${fileNameivBase64}${newFilename}`,
            fileContentiv: iv,
            fileContent: encryptedData,
            cloudFolderName: vaultStore.cloudFolderName,
          }

          await this.uploadFile(fileInfo)
        }
      } catch (err) {
        // TODO: better errror handling
        console.error(err)
        this.error = err.message
        errorBoolean = true
      }

      if (!errorBoolean) {
        this.uploadSuccess = true
        // timer for how long alert last
        setTimeout(() => {
          this.uploadSuccess = false
        }, 10000)
      }
    },
    async uploadFile(file) {
      console.log('Uploading file:', file.fileName)
      // upload file to OneDrive using Microsoft Graph API
      if (!this.accessToken) {
        throw new Error('Access token not found')
      }

      // TODO: CHANGE TO only 1 fetch for multiple signed urls
      const response = await $fetch('/api/vault/upload', {
        method: 'POST',
        body: {
          fileName: file.fileName,
          accessToken: this.accessToken,
          cloudFolderName: file.cloudFolderName,
        },
      })

      const uploadUrl = response.uploadUrl

      const fileToUpload = new File(
        [file.fileNameIndex, '\n', file.fileContentiv, file.fileContent],
        file.fileName,
        {
          type: 'application/octet-stream',
        }
      )

      // Upload the file to OneDrive using the upload session URL in chunks
      const chunkSize = 1024 * 1024 // 1 MB per chunk
      let start = 0

      while (start < fileToUpload.size) {
        const end = Math.min(start + chunkSize, fileToUpload.size)
        const chunk = fileToUpload.slice(start, end)

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Range': `bytes ${start}-${end - 1}/${fileToUpload.size}`,
          },
          body: chunk,
        })

        if (!uploadResponse.ok && uploadResponse.status !== 308) {
          const errorText = await uploadResponse.text()
          throw new Error(
            `Failed to upload file: ${uploadResponse.status} - ${errorText}`
          )
        }

        start = end
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
    arrayBufferToBase64(buffer) {
      let binary = ''
      const bytes = new Uint8Array(buffer)
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    },
  },
}
</script>
