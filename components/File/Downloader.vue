<template>
  <div>
    <br>
    <br>
    <p>Upload files you want to DECRYPT here</p>
    <input
      ref="fileInput"
      type="file"
      multiple
      @change="handleFileUpload"
    >
    <div>
      <p>You can download the decrypted file over here</p>
      <button
        v-if="decryptedFileURL"
        @click="downloadFile">Download
      </button>
    </div>
    <div v-for="(file, index) in originalFilename" :key="index">
      <a :href="decryptedFileURL[index]" :download="file">Download -> {{ file }}</a>
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

      for(let i = 0; i < this.files.length; i++) {
        // convert file to arraybuffer
        const file = this.files[i]
        const encryptedData = await file.arrayBuffer()

        // get key and filename from pinia store
        const vaultStore = useVaultStore()
        const cryptoKeyObj = vaultStore.key

        // extract index of orignal encrypted filename
        const indexBuffer = encryptedData.slice(0,1)
        const index = new TextDecoder().decode(indexBuffer)
        const encryptedFilename = vaultStore.filenameArray[index]

        // extract filename iv from encrypted file
        const filenameivBuffer = encryptedData.slice(1, 13)
        const filenameiv = new Uint8Array(filenameivBuffer)

        // extract iv from encrypted file
        const ivBuffer = encryptedData.slice(13, 25)
        const iv = new Uint8Array(ivBuffer)

        // extract encrypted content from encrypted file
        const ciphertext = encryptedData.slice(25)
        
        // decrypt filename
        try {
          const decryptedFilename = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: filenameiv }, cryptoKeyObj, encryptedFilename)
          const originalFilename = new TextDecoder().decode(decryptedFilename)
          this.originalFilename.push(originalFilename)
        } catch (error) {
          console.error('error during filename decryption: ', error)
        }

        // decrypt file and create download URL
        try {
          const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, cryptoKeyObj, ciphertext)
          const decryptedBlob = new Blob([decryptedData], { type: 'text/plain' })
          this.decryptedFileURL.push(URL.createObjectURL(decryptedBlob))
        } catch (error) {
          console.error('error during content decryption: ', error)
        }
      }
    },
  },
}
</script>
