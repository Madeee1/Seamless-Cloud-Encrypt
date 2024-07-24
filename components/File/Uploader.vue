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
      filesToUpload: [],
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
          }

          this.filesToUpload.push(fileInfo)

          //await this.uploadFile(fileInfo)
        }

        await this.uploadFile(this.filesToUpload)
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
    async uploadFile(files) {
      const fileNames = []
      const vaultStore = useVaultStore()
      const cloudFolderName = vaultStore.cloudFolderName

      for (const file of files) {
        fileNames.push(file.fileName)
      }

      const response = await $fetch('/api/vault/upload', {
        method: 'POST',
        body: {
          fileNames: fileNames,
          accessToken: this.accessToken,
          cloudFolderName: cloudFolderName,
        },
      })

      if (!response.ok) {
        throw new Error('Error during files upload.')
      }

      for (let i = 0; i < this.filesToUpload.length; i++) {
        console.log('Uploading file:', this.filesToUpload[i].fileName)
        console.log('Uploading to: ', response.uploadUrls[i])
        // upload file to OneDrive using Microsoft Graph API
        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        const fileToUpload = new File(
          [
            this.filesToUpload[i].fileNameIndex,
            '\n',
            this.filesToUpload[i].fileContentiv,
            this.filesToUpload[i].fileContent,
          ],
          this.filesToUpload[i].fileName,
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

          const uploadResponse = await fetch(response.uploadUrls[i], {
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
