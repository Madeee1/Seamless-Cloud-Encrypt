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
    <form>
      <label for="keyPass">Password: </label>
      <input
        v-model="keyPass"
        type="text"
      >
    </form>
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
      JWK: { test: 'test' },
      decryptedFileURL: '',
      keyPass: '',
      ivAndEncrypted: [],
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
    async handleFileUpload() {
      const file = this.$refs.fileInput.files[0]
      const passStore = useObjectStore()
      const cryptoKeyObj = passStore.object

      console.log('key from pinia = ')
      console.log(cryptoKeyObj)
      console.log(typeof cryptoKeyObj)

      // const encryptedData = new Uint8Array(reader.result);
      // // Read and split file contents
      // // const fileContent = await this.readFile(file)
      // // const lines = fileContent.split('\n')
      // // this.ivAndEncrypted = lines

      // const iv = encryptedData.slice(0, 12)
      // const encrypted = encryptedData.slice(12)
      // // console.log(encrypted)
      // // console.log(typeof encrypted)
      // // console.log(iv)
      // // console.log(typeof iv)

      // // Decrypt file
      // const decryptedFile = await this.decrypt(encrypted, iv, cryptoKeyObj)
      // console.log('decrypted file = ', decryptedFile)

      // // Encrypted file is ArrayBuffer type, needs to be blob to be downloaded
      // const blobDecryptedFile = new Blob([decryptedFile], { type: 'text/plain' })
      // this.decryptedFileURL = URL.createObjectURL(blobDecryptedFile)
      try {
        const encryptedData = await file.arrayBuffer()
        const ivBuffer = encryptedData.slice(0, 12) // Extract IV from encrypted data
        const iv = new Uint8Array(ivBuffer)
        const ciphertext = encryptedData.slice(12) // Extract ciphertext from encrypted data
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, cryptoKeyObj, ciphertext)
        const decryptedBlob = new Blob([decryptedData], { type: 'text/plain' })
        this.decryptedFileURL = URL.createObjectURL(decryptedBlob)
      } catch (error) {
        console.error('error decryption ', error)
      }
      
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          resolve(reader.result)
        }

        reader.onerror = reject

        reader.readAsText(file)
      })
    },
    async decrypt(encrypted, iv, key) {
      const uint8Arrayc = new TextEncoder().encode(encrypted)
      const contentBuffer = uint8Arrayc.buffer
      const uint8Arrayiv = new TextEncoder().encode(iv)
      const ivBuffer = uint8Arrayiv.buffer
      console.log('inside decrypt func')
      console.log('iv = ', ivBuffer)
      console.log('typeof iv = ', typeof ivBuffer)
      console.log('')
      console.log('content = ', contentBuffer)
      console.log('typeof content = ', typeof contentBuffer)

      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuffer }, key, contentBuffer)
      const decoded = new TextDecoder().decode(decrypted)

      return decoded
    },
    async deriveKeyFromPassword(password, salt) {
      const encoder = new TextEncoder()
      const encodedPassword = encoder.encode(password)
      const derivedKey = await crypto.subtle.importKey(
        'raw',
        encodedPassword,
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
      )

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000, // You can adjust this based on your security requirements
          hash: 'SHA-256',
        },
        derivedKey,
        { name: 'AES-GCM', length: 256 }, // 256-bit key for AES-GCM
        false,
        ['encrypt', 'decrypt'],
      )

      return key
    },
  },
}
</script>
