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
      <a
        :href="decryptedFileURL"
        download="decryptedFile.txt"
      >Download</a>
      <p>{{ decryptedFileURL }}</p>
    </div>
  </div>
</template>

<script>
import { useObjectStore } from './store'

export default {
  data() {
    return {
      decryptedFileURL: '',
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
    async handleFileUpload() {

      // convert file to arraybuffer
      const file = this.$refs.fileInput.files[0]
      const encryptedData = await file.arrayBuffer()

      // get key from pinia store
      const passStore = useObjectStore()
      const cryptoKeyObj = passStore.object

      // extract iv from encrypted file
      const ivBuffer = encryptedData.slice(0, 12) // Extract IV from encrypted data
      const iv = new Uint8Array(ivBuffer)

      // extract encrypted content from encrypted file
      const ciphertext = encryptedData.slice(12)

      // decrypt file and create download URL
      try {
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, cryptoKeyObj, ciphertext)
        const decryptedBlob = new Blob([decryptedData], { type: 'text/plain' })
        this.decryptedFileURL = URL.createObjectURL(decryptedBlob)
      } catch (error) {
        console.error('error decryption ', error)
      }
      
    },
  },
}
</script>
