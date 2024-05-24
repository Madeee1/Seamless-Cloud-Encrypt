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
      <p>Generate JWK Key</p>
      <button @click="generateKey()">
        Generate Key
      </button>
      <div v-if="Object.keys(JWK).length">
        {{ JWK }}
      </div>
    </div>
    <div>
      <p>You can download the encrypted file over here</p>
      <a
        :href="encryptedFileURL"
        download="encrypted-file.bin"
      >Download</a>
      <p>{{ encryptedFileURL }}</p>
      <br>
      <br>
    </div>
    <div>
      <p>You can download the DECRYPTED file over here</p>
      <a
        :href="decryptedFileURL"
        download="ori-file.txt"
      >Download&Decrypt</a>
      <p>{{ decryptedFileURL }}</p>
      <br>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      JWK: { test: 'test' },
      encryptedFileURL: '',
      decryptedFileURL: '',
      keyPass: '',
      initVector: '',
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
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
    async printPass() {
      const password = this.keyPass
      const salt = new Uint8Array([1, 2, 3, 4]) // You should generate a random salt
      this.deriveKeyFromPassword(password, salt)
        .then(key => {
          console.log('Derived key:', key)
        // Key successfully derived, you can proceed with encryption/decryption
        })
        .catch(error => {
          console.error('Error deriving key:', error)
        // Key derivation failed, handle the error
        })
    },
    async handleFileUpload() {
      const password = this.keyPass
      const salt = new Uint8Array([1, 2, 3, 4])
      const file = this.$refs.fileInput.files[0]
      const cryptoKeyObj = await this.deriveKeyFromPassword(password, salt)
      const ivAndEncrypted = await this.encrypt(file, cryptoKeyObj)

      // Encrypted file is ArrayBuffer type, needs to be blob to be downloaded
      console.log('iv for this file: ', ivAndEncrypted.iv)
      this.initVector = ivAndEncrypted.iv
      const blobEncryptedFile = new Blob([ivAndEncrypted.encrypted], {
        type: 'application/octet-stream',
      })
      this.encryptedFileURL = URL.createObjectURL(blobEncryptedFile)

      const decryptedFile = await this.decrypt(ivAndEncrypted.encrypted, ivAndEncrypted.iv, cryptoKeyObj)
      const blobDecryptedFile = new Blob([decryptedFile], { type: 'text/plain' })

      this.decryptedFileURL = URL.createObjectURL(blobDecryptedFile)
    },
    async generateKey() {
      const returnValue = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
      )
      await this.exportKey(returnValue)
      return returnValue
    },
    async exportKey(key) {
      const JWK = await crypto.subtle.exportKey('jwk', key)
      this.JWK = JWK
    },
    async importKey(jwk) {
      return await crypto.subtle.importKey(
        'jwk',
        jwk,
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
      )
    },
    async encrypt(file, key) {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      // file needs to be encoded from File Blob into ArrayBuffer
      const fileAB = await file.arrayBuffer()

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        fileAB,
      )
      return { iv, encrypted }
    },
    async decrypt(encrypted, iv, key) {
      const decrypted = await crypto.subtle.decrypt({ 'name': 'AES-GCM', 'iv': iv }, key, encrypted)
      const decoded = new TextDecoder().decode(decrypted)
      return decoded
    },
  },
}
</script>
