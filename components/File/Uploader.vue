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
      <button
        v-if="encryptedFileURL"
        @click="downloadFile">Download
      </button>
    </div>
  </div>
</template>

<script>
import { useObjectStore } from './store.js'

export default {
  data() {
    return {
      encryptedFileURL: '',
      decryptedFileURL: '',
      keyPass: '',
      newFilename: '',
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
    generateDownloadFilename() {
      return this.newFilename
    },
    downloadFile() {
      const a = document.createElement('a')
      a.href = this.encryptedFileURL
      a.download = this.newFilename
      document.body.appendChild(a)
      a.click()
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

      // get filename and iv for filename encryption
      console.log('original filename = ', file.name )
      const encodedFilename = new TextEncoder().encode(file.name)
      console.log('encoded filename = ', encodedFilename)
      const filenameiv = crypto.getRandomValues(new Uint8Array(12))

      // encrypt filename
      const encryptedFilename = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: filenameiv }, cryptoKeyObj, encodedFilename)

      // convert encrypted filename to readable string
      const filenameArray = new Uint8Array(encryptedFilename)
      const newFilename = btoa(String.fromCharCode.apply(null, filenameArray)) + '.bin'
      this.newFilename = newFilename

      // upload key to pinia store
      const testStore = useObjectStore()
      testStore.object = cryptoKeyObj
      testStore.filename = encryptedFilename

      // create blob for file download, concatenate filenameiv and iv into encrypted file
      const encryptedBlob = new Blob([filenameiv, iv, encryptedData], { type: 'application/octet-stream' })
      this.encryptedFileURL = URL.createObjectURL(encryptedBlob)
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
