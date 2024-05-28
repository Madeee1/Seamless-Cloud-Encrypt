<template>
  <div class="flex flex-col gap-4">
    <div>
      <p>Upload files you want to encrypt here</p>
      <input
        ref="fileInput"
        type="file"
        @change="handleFileUpload"
      >
    </div>
    <div>
      <form>
        <label for="keyPass">Password: </label>
        <input v-model="keyPass" type="text">
      </form>
    </div>
    <div>
      <p>You can download the encrypted file over here</p>
      <a
        :href="encryptedFileURL"
        download="encryptedFile.txt"
      >Download</a>
      <p>{{ encryptedFileURL }}</p>
    </div>
  </div>
</template>

<script>
import { useObjectStore } from './store.js'

export default {
  data() {
    return {
      JWK: { test: 'test' },
      encryptedFileURL: '',
      decryptedFileURL: '',
      keyPass: '',
      newFilename: '',
      oriFilename: '',
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
    encryptedFilename() {
      return this.newFilename + '.bin'
    },
    decryptedFilename() {
      return this.oriFilename + '.txt'
    },
  },
  methods: {
    generateDownloadFilename() {
      return this.newFilename
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
    async handleFileUpload() {

      // derive key from password
      const password = this.keyPass
      const salt = new Uint8Array([1, 2, 3, 4])
      const cryptoKeyObj = await this.deriveKeyFromPassword(password, salt)

      // convert file to arraybuffer
      const file = this.$refs.fileInput.files[0]
      const fileAB = await file.arrayBuffer()
      // generate iv
      const iv = crypto.getRandomValues(new Uint8Array(12))

      // encrypt data
      const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKeyObj, fileAB)

      // create blob for file download, concatenate iv into encrypted file
      const encryptedBlob = new Blob([iv, encryptedData], { type: 'application/octet-stream' })
      this.encryptedFileURL = URL.createObjectURL(encryptedBlob)

      // upload key to pinia store
      const testStore = useObjectStore()
      testStore.object = cryptoKeyObj
    },
    async encryptFilename(string, key) {
      const encoded = new TextEncoder().encode(string)
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)

      return { iv, encrypted }
    },
  },
}
</script>
