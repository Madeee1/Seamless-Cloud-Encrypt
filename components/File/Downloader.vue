<template>
  <div>
    <br>
    <br>
    <p>Upload files you want to DECRYPT here</p>
    <input
      ref="fileInput"
      type="file"
      @change="handleFileUpload"
    >
    <div>
      <p>You can download the decrypted file over here</p>
      <button
        v-if="decryptedFileURL"
        @click="downloadFile">Download
      </button>
    </div>
  </div>
</template>

<script>
import { useObjectStore } from './store'

export default {
  data() {
    return {
      decryptedFileURL: '',
      originalFilename: '',
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

      // convert file to arraybuffer
      const file = this.$refs.fileInput.files[0]
      const encryptedData = await file.arrayBuffer()

      // get key and filename from pinia store
      const passStore = useObjectStore()
      const cryptoKeyObj = passStore.object
      const encryptedFilename = passStore.filename

      // extract filename iv from encrypted file
      const filenameivBuffer = encryptedData.slice(0, 12)
      const filenameiv = new Uint8Array(filenameivBuffer)

      // extract iv from encrypted file
      const ivBuffer = encryptedData.slice(12, 24)
      const iv = new Uint8Array(ivBuffer)

      // extract encrypted content from encrypted file
      const ciphertext = encryptedData.slice(24)
      
      // decrypt filename
      try {
        const decryptedFilename = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: filenameiv }, cryptoKeyObj, encryptedFilename)
        const originalFilename = new TextDecoder().decode(decryptedFilename)
        this.originalFilename = originalFilename
      } catch (error) {
        console.error('error during filename decryption: ', error)
      }

      // decrypt file and create download URL
      try {
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, cryptoKeyObj, ciphertext)
        const decryptedBlob = new Blob([decryptedData], { type: 'text/plain' })
        this.decryptedFileURL = URL.createObjectURL(decryptedBlob)
      } catch (error) {
        console.error('error during content decryption: ', error)
      }
    },
  },
}
</script>
