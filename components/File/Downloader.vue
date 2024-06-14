<template>
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
</template>

<script>
import { useVaultStore } from '@/stores/vault'

export default {
  data() {
    return {
      files: [],
      decryptedFileURL: [],
      originalFilename: [],
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
    downloadFile() {
      const a = document.createElement('a')
      a.href = this.decryptedFileURL
      a.download = this.originalFilename
      document.body.appendChild(a)
      a.click()
    },
    async handleFileUpload() {
      this.files = Array.from(this.$refs.fileInput.files)
      const vaultStore = useVaultStore()
      for (let i = 0; i < this.files.length; i++) {
        // convert file to arraybuffer
        const file = this.files[i]
        const encryptedData = await file.arrayBuffer()

        // get key and filename from pinia store
        const cryptoKeyObj = vaultStore.key

        // extract index of orignal encrypted filename
        const separatorIndex = new Uint8Array(encryptedData).indexOf(
          '\n'.charCodeAt(0)
        )

        // Extract the filename, which is b64. Convert to ArrayBuffer for decryption
        const encryptedFilenameB64 = this.files[i].name.replace(/\.bin$/, '')
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

        // decrypt filename
        try {
          const decryptedFilename = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: filenameiv },
            cryptoKeyObj,
            encryptedFilename
          )
          const originalFilename = new TextDecoder().decode(decryptedFilename)
          this.originalFilename.push(originalFilename)
        } catch (error) {
          console.error('error during filename decryption: ', error)
        }

        // decrypt file and create download URL
        try {
          const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            cryptoKeyObj,
            ciphertext
          )
          const decryptedBlob = new Blob([decryptedData], {
            type: 'text/plain',
          })
          this.decryptedFileURL.push(URL.createObjectURL(decryptedBlob))
        } catch (error) {
          console.error('error during content decryption: ', error)
        }
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
