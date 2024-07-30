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
import { toBase64Url } from '~/utils/encryptionUtils'
import { encryptFile } from '~/utils/fileEncryptUtils'

export default {
  data() {
    return {
      files: [],
      encryptedFileURL: [],
      keyPass: '',
      newFilename: [],
      fileNames: [],
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
    cryptoKeyObj() {
      const vaultStore = useVaultStore()
      return vaultStore.key
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
          // const cryptoKeyObj = vaultStore.key
          // console.log('Uploading file = ', this.files[i].name)

          // // convert file to arraybuffer
          // const file = this.files[i]
          // const fileAB = await file.arrayBuffer()

          // // generate iv
          // const iv = crypto.getRandomValues(new Uint8Array(12))

          // // encrypt data
          // const encryptedData = await crypto.subtle.encrypt(
          //   { name: 'AES-GCM', iv },
          //   cryptoKeyObj,
          //   fileAB
          // )

          // // get filename and iv for filename encryption
          // const encodedFilename = encoder.encode(file.name)
          // const filenameiv = crypto.getRandomValues(new Uint8Array(12))

          // // encrypt filename
          // const encryptedFilename = await crypto.subtle.encrypt(
          //   { name: 'AES-GCM', iv: filenameiv },
          //   cryptoKeyObj,
          //   encodedFilename
          // )

          // // convert encrypted filename to readable string
          // const filenameArray = new Uint8Array(encryptedFilename)
          // // const filenameString = String.fromCharCode.apply(null, filenameArray)
          // const base64Filename = toBase64Url(filenameArray)
          // const newFilename = base64Filename + '.bin'
          // this.newFilename.push(newFilename)

          // // create blob for file download
          // // concatenate index for pinia filenameArray, newline separator, filenameiv, and iv into encrypted file
          // const encryptedBlob = new Blob(
          //   [i, '\n', filenameiv, iv, encryptedData],
          //   { type: 'application/octet-stream' }
          // )
          // this.encryptedFileURL.push(URL.createObjectURL(encryptedBlob))

          // // file info details for file creation in server

          // const fileNameivBase64 = toBase64Url(filenameiv)

          // const fileInfo = {
          //   fileNameIndex: i,
          //   fileName: `${fileNameivBase64}${newFilename}`,
          //   fileContentiv: iv,
          //   fileContent: encryptedData,
          // }
          const fileToUpload = await encryptFile(
            this.files[i],
            this.cryptoKeyObj
          )

          console.log('FILENAME = ', fileToUpload.name)

          this.filesToUpload.push(fileToUpload)
          this.fileNames.push(fileToUpload.name)
          // this.filesToUpload.push(fileInfo)
        }

        console.log('file names to upload: ')
        for (const file of this.filesToUpload) {
          console.log(file.name)
        }
        await this.uploadFile()
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
    async uploadFile() {
      const vaultStore = useVaultStore()
      const cloudFolderName = vaultStore.cloudFolderName

      console.log('fileNames in upload file')
      for (const file of this.fileNames) {
        console.log(file)
      }

      const response = await $fetch('/api/vault/upload', {
        method: 'POST',
        body: {
          files: this.fileNames,
          accessToken: this.accessToken,
          cloudFolderName: cloudFolderName,
        },
      })

      if (!response.ok) {
        throw new Error('Error during files upload.')
      }

      for (let i = 0; i < this.filesToUpload.length; i++) {
        // console.log('Uploading file:', this.filesToUpload[i].fileName)
        console.log('Uploading to: ', response.uploadUrls[i])
        // upload file to OneDrive using Microsoft Graph API
        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        // const fileToUpload = new File(
        //   [
        //     this.filesToUpload[i].fileNameIndex,
        //     '\n',
        //     this.filesToUpload[i].fileContentiv,
        //     this.filesToUpload[i].fileContent,
        //   ],
        //   this.filesToUpload[i].fileName,
        //   {
        //     type: 'application/octet-stream',
        //   }
        // )

        // Upload the file to OneDrive using the upload session URL in chunks
        const chunkSize = 1024 * 1024 // 1 MB per chunk
        let start = 0
        console.log('uploading ', this.fileNames[i])

        while (start < this.filesToUpload[i].size) {
          const end = Math.min(start + chunkSize, this.filesToUpload[i].size)
          const chunk = this.filesToUpload[i].slice(start, end)

          const uploadResponse = await fetch(response.uploadUrls[i], {
            method: 'PUT',
            headers: {
              'Content-Range': `bytes ${start}-${end - 1}/${this.filesToUpload[i].size}`,
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

      // Clear arrays for next uploads
      this.files = []
      this.encryptedFileURL = []
      this.newFilename = []
      this.filesToUpload = []
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
