<template>
  <div>
    <h1>Download:</h1>
    <button @click="filesList">Refresh Files List</button>
    <ul class="">
      <li v-for="file in files" :key="file.id" class="">
        <div class="">
          <img
            v-if="file.thumbnailUrl"
            :src="file.thumbnailUrl"
            alt="Thumbnail"
          />
          <span>
            {{ file.name }}
          </span>
        </div>
        <button @click="downloadFile(file.id)">Download</button>
      </li>
    </ul>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
  <!-- Deprecated 
  <div class="space-y-4">
    <p class="pt-4">Upload files you want to DECRYPT here</p>
    <input
      ref="fileInput"
      type="file"
      multiple
      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      @change="handleFileUpload"
    />
    <div>
      <p>You can download the decrypted file over here</p>
    </div>
    <div v-for="(file, index) in originalFilename" :key="index" class="pt-2">
      <a
        :href="decryptedFileURL[index]"
        :download="file"
        class="text-blue-500 hover:text-blue-800"
        >Download -> {{ file }}</a
      >
    </div>
  </div>
  
  -->
</template>

<script>
import { useVaultStore } from '@/stores/vault'

export default {
  data() {
    return {
      // files: [],
      decryptedFileURL: [],
      originalFilename: [],
      // from download.vue
      accessToken: sessionStorage.getItem('access_token') || null,
      files: [],
      error: null,
    }
  },
  methods: {
    // downloadFile() {
    //   const a = document.createElement('a')
    //   a.href = this.decryptedFileURL
    //   a.download = this.originalFilename
    //   document.body.appendChild(a)
    //   a.click()
    // },
    async decryptFile(fileBlob, filename) {
      const vaultStore = useVaultStore()
      // convert file to arraybuffer
      const encryptedData = await fileBlob.arrayBuffer()

      // get key and filename from pinia store
      const cryptoKeyObj = vaultStore.key

      // extract index of orignal encrypted filename
      const separatorIndex = new Uint8Array(encryptedData).indexOf(
        '\n'.charCodeAt(0)
      )

      // Extract the filename, which is b64. Convert to ArrayBuffer for decryption
      const encryptedFilenameB64 = filename.replace(/\.bin$/, '')
      const encFNameUInt8Array = this.fromBase64Url(encryptedFilenameB64)
      const encryptedFilename = encFNameUInt8Array.buffer

      // extract filename iv from encrypted file
      const filenameivBuffer = encryptedData.slice(
        separatorIndex + 1,
        separatorIndex + 13
      )
      const filenameiv = new Uint8Array(filenameivBuffer)

      // extract iv from encrypted file
      const ivBuffer = encryptedData.slice(
        separatorIndex + 13,
        separatorIndex + 25
      )
      const iv = new Uint8Array(ivBuffer)

      // extract encrypted content from encrypted file
      const ciphertext = encryptedData.slice(separatorIndex + 25)

      let originalFilename = ''
      // decrypt filename
      try {
        const decryptedFilename = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: filenameiv },
          cryptoKeyObj,
          encryptedFilename
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
      try {
        const response = await fetch(
          'https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo:/children',
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

        // TODO: IMPLEMENT
        // Fetch thumbnails of each file
        // for (const file of this.files) {
        //   if (file.file) {
        //     const thumbnailResponse = await fetch(
        //       `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/thumbnails`,
        //       {
        //         method: 'GET',
        //         headers: {
        //           Authorization: `Bearer ${this.accessToken}`,
        //           'Content-Type': 'application/json',
        //         },
        //       }
        //     )

        //     if (thumbnailResponse.ok) {
        //       const thumbnailData = await thumbnailResponse.json()
        //       if (thumbnailData.value && thumbnailData.value.length > 0) {
        //         file.thumbnailUrl = thumbnailData.value[0].medium.url // medium size thumbnail
        //       } else {
        //         console.error(
        //           'Failed to fetch thumbnail:',
        //           thumbnailResponse.statusText
        //         )
        //       }
        //     }
        //   }
        // }
      } catch (err) {
        this.error = `Error listing files: ${err.message}`
        console.error('Error details:', err)
      }
    },

    async downloadFile(fileId) {
      try {
        if (!this.accessToken) {
          throw new Error('Access token not found')
        }
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`)
        }

        // Decrypt File here
        const encryptedFilename = response.url.split('/').pop()
        const blob = await response.blob()
        const decryptedFile = await this.decryptFile(blob, encryptedFilename)

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
  },
}
</script>
