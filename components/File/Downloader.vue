<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-2xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Download the files you have encrypted in the vault
      </h1>
      <div class="flex justify-between">
        <div class="flex space-x-4 flex-1 max-w-sm">
          <button
            class="block w-full text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded mb-4"
            @click="(confirmPassword = true), (deleting = false)"
          >
            Download
          </button>
          <button
            class="block w-full text-lg font-semibold bg-warning-red hover:bg-red-600 text-gray-200 py-1 px-2 rounded mb-4"
            @click="(confirmPassword = true), (deleting = true)"
          >
            Delete
          </button>
        </div>
        <button
          class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded mb-4"
          @click="refreshFilesList"
        >
          Refresh Files List
        </button>
      </div>
      <div
        class="h-64 overflow-y-scroll scrollbar-hidden bg-white bg-opacity-15 p-4 rounded"
      >
        <ul class="list-disc list-inside space-y-2">
          <li
            v-for="file in files"
            :key="file.id"
            class="flex items-center justify-between bg-gray-100 p-2 rounded mb-2 gap-2"
          >
            <input v-model="selectedFiles" type="checkbox" :value="file" />
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
          </li>
        </ul>
      </div>
      <div
        v-if="confirmPassword"
        class="pt-3 mb-3 first-letter:text-third-blue"
      >
        <label
          for="confirm-password"
          class="text-xl font-semibold text-gray-200"
          >{{
            deleting
              ? 'Confirm Password to Delete Files'
              : 'Confirm Password to Download Files'
          }}</label
        >
        <input
          id="confirm-password"
          v-model="password"
          type="password"
          placeholder="Enter vault password"
          class="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <div class="pt-4 flex justify-end space-x-2">
          <UButton
            class="block text-center w-1/6 text-lg font-semibold bg-white hover:bg-gray-200 text-second-blue py-1 px-2 rounded"
            @click="(confirmPassword = false), (password = null)"
            >Cancel</UButton
          >
          <UButton
            class="block text-center w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
            @click="
              deleting ? confirmAction('delete') : confirmAction('download')
            "
            >Confirm</UButton
          >
        </div>
      </div>
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
    </div>
  </div>
</template>
<script>
import { useVaultStore } from '@/stores/vault'
import { useFilesStore } from '@/stores/files'
import { decryptFile, base64ToArrayBuffer } from '~/utils/fileEncryptUtils'

export default {
  data() {
    return {
      decryptedFileURL: [],
      originalFilename: [],
      selectedFiles: [],
      // from download.vue
      error: null,
      password: null,
      confirmPassword: false,
      deleting: false,
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
    files() {
      const filesStore = useFilesStore()
      return filesStore.files
    },
  },
  async mounted() {
    // this.filesList()
    const filesStore = useFilesStore()
    await filesStore.refreshFilesList(this.cloudFolderName, this.accessToken)
    await filesStore.previewFilename(this.cryptoKeyObj)
  },
  methods: {
    downloadSelected() {
      if (this.selectedFiles.length > 0) {
        for (const file of this.selectedFiles) {
          this.downloadFile(file)
        }
      } else {
        alert('No selected file.')
      }
    },

    async deleteSelected() {
      if (this.selectedFiles.length > 0) {
        for (const file of this.selectedFiles) {
          await this.deleteFile(file)
        }
      } else {
        alert('No selected file.')
      }
    },

    async refreshFilesList() {
      const filesStore = useFilesStore()
      await filesStore.refreshFilesList(this.cloudFolderName, this.accessToken)
      await filesStore.previewFilename(this.cryptoKeyObj)
    },

    async downloadFile(file) {
      try {
        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/content`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`)
        }

        const encryptedFileBlob = await response.blob()
        const encryptedFileBuffer = await encryptedFileBlob.arrayBuffer()

        // Decrypt File here
        console.log('Decrypting ', file.name, '... ')
        const decryptedFile = await decryptFile(
          file.name,
          encryptedFileBuffer,
          this.cryptoKeyObj
        )

        // Download the decrypted file
        console.log('Downloading ', decryptedFile.name, '... ')
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

    async deleteFile(file) {
      const response = await $fetch('/api/vault/delete', {
        method: 'POST',
        body: {
          accessToken: this.accessToken,
          fileName: file.name,
          cloudFolderName: this.cloudFolderName,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${file.name}: ${response.statusText}`)
      }

      console.log(file.name, ' deleted successfully.\n ')
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

    async confirmAction(action) {
      const vault = useVaultStore()
      try {
        const response = await $fetch('/api/vault/auth/download', {
          method: 'POST',
          body: {
            password: this.password,
            vaultId: vault.id,
          },
        })

        if (response.ok) {
          if (action == 'download') {
            this.downloadSelected()
            this.confirmPassword = false
            this.password = null
            // Clear array for consecutive downloads
            this.selectedFiles = []
          } else if (action == 'delete') {
            await this.deleteSelected()
            // Refresh after deleting selected files
            const filesStore = useFilesStore()
            await filesStore.refreshFilesList(
              this.cloudFolderName,
              this.accessToken
            )
            await filesStore.previewFilename(this.cryptoKeyObj)
            this.deleting = false
            this.confirmPassword = false
            this.password = null
            // Clear array for consecutive deletions
            this.selectedFiles = []
          } else {
            console.error('Invalid Action')
          }
        }
      } catch (error) {
        if (!error.response) {
          alert('Network error, try again later!')
          this.confirmPassword = false
          this.password = null
        } else if (error.response.status === 401) {
          alert('Wrong password, try again!')
          this.confirmPassword = false
          this.password = null
        } else if (error.response.status === 500) {
          alert('Server error, try again later!')
          this.confirmPassword = false
          this.password = null
        }
      }
    },
  },
}
</script>
