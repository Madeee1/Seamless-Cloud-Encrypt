<template>
  <div class="flex flex-col gap-4">
    <div>
      <p>Upload files you want to encrypt here</p>
      <input
        ref="fileInput"
        type="file"
        multiple
        @change="handleFileUpload"
      >
    </div>
    <div>
      <form>
        <label for="keyPass">Password: </label>
        <input
          v-model="keyPass"
          type="text"
        >
      </form>
    </div>
    <div
      v-for="(file, index) in newFilename"
      :key="index"
    >
      <a
        :href="encryptedFileURL[index]"
        :download="file"
      >Download -> {{ file }}</a>
    </div>
  </div>
</template>

<script>
import { useVaultStore } from '@/stores/vault'

export default {
  data() {
    return {
      files: [],
      encryptedFileURL: [],
      keyPass: '',
      newFilename: [],
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
    downloadFile() {
      for (let i = 0; i < this.encryptedFileURL.length; i++) {
        const a = document.createElement('a')
        a.href = this.encryptedFileURL
        a.download = this.newFilename
        document.body.appendChild(a)
        a.click()
      }
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
      this.files = Array.from(this.$refs.fileInput.files)

      for (let i = 0; i < this.files.length; i++) {
        // derive key from password
        const password = this.keyPass
        const salt = new Uint8Array([1, 2, 3, 4])
        const cryptoKeyObj = await this.deriveKeyFromPassword(password, salt)

        // convert file to arraybuffer
        const file = this.files[i]
        const fileAB = await file.arrayBuffer()

        // generate iv
        const iv = crypto.getRandomValues(new Uint8Array(12))

        // encrypt data
        const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKeyObj, fileAB)

        // get filename and iv for filename encryption
        const encodedFilename = new TextEncoder().encode(file.name)
        const filenameiv = crypto.getRandomValues(new Uint8Array(12))

        // encrypt filename
        const encryptedFilename = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: filenameiv }, cryptoKeyObj, encodedFilename)

        // convert encrypted filename to readable string
        const filenameArray = new Uint8Array(encryptedFilename)
        const filenameString = String.fromCharCode.apply(null, filenameArray)
        const newFilename = btoa(filenameString) + '.bin'
        this.newFilename.push(newFilename)

        // upload key to pinia store
        const vaultStore = useVaultStore()
        vaultStore.setKey(cryptoKeyObj)
        vaultStore.addFilename(encryptedFilename)

        // create blob for file download 
        // concatenate index for pinia filenameArray, newline separator, filenameiv, and iv into encrypted file
        const encryptedBlob = new Blob([i, '\n', filenameiv, iv, encryptedData], { type: 'application/octet-stream' })
        this.encryptedFileURL.push(URL.createObjectURL(encryptedBlob))
      }
    },
  },
}
</script>
