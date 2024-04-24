<template>
  <div class="flex flex-col gap-4">
    <div>
      <p>Upload files you want to encrypt here</p>
      <input type="file" ref="fileInput" @change="handleFileUpload" />
    </div>
    <div>
      <p>Generate JWK Key</p>
      <button @click="generateKey()">Generate Key</button>
      <div v-if="Object.keys(JWK).length">{{ JWK }}</div>
    </div>
    <div>
      <p>You can download the encrypted file over here</p>
      <a :href="encryptedFileURL" download="encrypted-file.bin">Download</a>
      <p>{{ encryptedFileURL }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      JWK: { test: "test" },
      encryptedFileURL: "",
    };
  },
  computed: {
    imagePreview() {
      return this.$refs.fileInput.files[0];
    },
  },
  methods: {
    async handleFileUpload() {
      const file = this.$refs.fileInput.files[0];
      const cryptoKeyObj = await this.generateKey();
      const ivAndEncrypted = await this.encrypt(file, cryptoKeyObj);

      // Encrypted file is ArrayBuffer type, needs to be blob to be downloaded
      const blobEncryptedFile = new Blob([ivAndEncrypted.encrypted], {
        type: "application/octet-stream",
      });
      this.encryptedFileURL = URL.createObjectURL(blobEncryptedFile);
    },
    async generateKey() {
      const returnValue = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
      await this.exportKey(returnValue);
      return returnValue;
    },
    async exportKey(key) {
      const JWK = await crypto.subtle.exportKey("jwk", key);
      this.JWK = JWK;
    },
    async importKey(jwk) {
      return await crypto.subtle.importKey(
        "jwk",
        jwk,
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
    },
    async encrypt(file, key) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      // file needs to be encoded from File Blob into ArrayBuffer
      const fileAB = await file.arrayBuffer();

      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        fileAB
      );
      return { iv, encrypted };
    },
    async decrypt(encrypted, key) {
      return await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: encrypted.iv,
        },
        key,
        encrypted.encrypted
      );
    },
  },
};
</script>
