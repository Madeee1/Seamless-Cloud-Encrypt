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
    cloudFolderName() {
      const vaultStore = useVaultStore()
      return vaultStore.cloudFolderName
    },
  },
  methods: {
    async handleFileUpload() {
      this.files = Array.from(this.$refs.fileInput.files)

      let errorBoolean = false
      try {
        for (let i = 0; i < this.files.length; i++) {
          // Encrypt all files uploaded
          console.log('Encrypting ', this.files[i].name, '... ')
          const fileToUpload = await encryptFile(
            this.files[i],
            this.cryptoKeyObj
          )

          this.filesToUpload.push(fileToUpload)
          // Filenames array to send to backend for upload urls
          this.fileNames.push(fileToUpload.name)
        }

        // Upload files
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
      const filesStore = useFilesStore()

      // Get Upload Urls for each file
      const response = await $fetch('/api/vault/upload', {
        method: 'POST',
        body: {
          files: this.fileNames,
          accessToken: this.accessToken,
          cloudFolderName: this.cloudFolderName,
        },
      })

      if (!response.ok) {
        throw new Error('Error during files upload.')
      }

      for (let i = 0; i < this.filesToUpload.length; i++) {
        console.log('Uploading ', this.files[i].name, '... ')
        // upload file to OneDrive using Microsoft Graph API
        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        // Upload the file to OneDrive using the upload session URL in chunks
        const chunkSize = 1024 * 1024 // 1 MB per chunk
        let start = 0

        while (start < this.filesToUpload[i].size) {
          const end = Math.min(start + chunkSize, this.filesToUpload[i].size)
          const chunk = this.filesToUpload[i].slice(start, end)

          console.log('Uploading chunks... ')
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
      this.fileNames = []
      // Refresh files list to include newly uploaded file
      filesStore.refreshFilesList(this.cloudFolderName, this.accessToken)
    },
  },
}
</script>
