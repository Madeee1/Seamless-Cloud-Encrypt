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
      <label for="iv">IV: </label>
      <input
        v-model="iv"
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
export default {
  data() {
    return {
      JWK: { test: 'test' },
      decryptedFileURL: '',
      keyPass: '',
      hardIV: '',
    }
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0]
    },
  },
  methods: {
    async handleFileUpload() {
      const password = this.keyPass
      const salt = new Uint8Array([1, 2, 3, 4])
      const file = this.$refs.fileInput.files[0]
      const cryptoKeyObj = await this.deriveKeyFromPassword(password, salt)
      const decryptedFile = await this.decrypt(file, cryptoKeyObj)

      // Encrypted file is ArrayBuffer type, needs to be blob to be downloaded
      this.decryptedFileURL = URL.createObjectURL(decryptedFile)
    },
    async decrypt(encrypted, key) {
      const iv = this.hardIV
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encrypted)

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
