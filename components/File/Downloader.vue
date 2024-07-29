<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-2xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Download the files you have encrypted in the vault
      </h1>
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
    </div>
    <button
      class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded mb-4"
      @click="filesList"
    >
      Refresh Files List
    </button>
    <br />
    <button
      class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      @click="confirmPassword = true"
    >
      Download Selected
    </button>
    <ul>
      <li
        v-for="file in files"
        :key="file.id"
        class="flex items-center justify-between bg-gray-100 p-2 rounded mb-2 gap-2"
      >
        <input type="checkbox" @change="addFile(file)" />
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

export default {
  data() {
    return {
      // files: [],
      decryptedFileURL: [],
      originalFilename: [],
      filesToDownload: [],
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
    downloadSelected() {
      if (this.filesToDownload.length > 0) {
        for (const file of this.filesToDownload) {
          this.downloadFile(file)
        }
      } else {
        alert('No selected file.')
      }
    },
    addFile(file) {
      if (!this.filesToDownload.includes(file)) {
        this.filesToDownload.push(file)
      } else {
        this.filesToDownload = this.filesToDownload.filter(
          (element) => element !== file
        )
      }
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

    async filesList() {
      const vaultStore = useVaultStore()
      const cloudFolderName = vaultStore.cloudFolderName

      try {
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
            vaultId: vault.id,
          },
        })

        if (response.ok) {
          this.downloadSelected()
          this.confirmPassword = false
          this.selectedFile = null
          this.password = null
        }
      } catch (error) {
        if (!error.response) {
          alert('Network error, try again later!')
          this.confirmPassword = false
          this.selectedFile = null
          this.password = null
        } else if (error.response.status === 401) {
          alert('Wrong password, try again!')
          this.confirmPassword = false
          this.selectedFile = null
          this.password = null
        } else if (error.response.status === 500) {
          alert('Server error, try again later!')
          this.confirmPassword = false
          this.selectedFile = null
          this.password = null
        }
      }
    },
  },
}
</script>
