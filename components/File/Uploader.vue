<template>
  <div class="flex flex-col gap-4">
    <div>
      <p class="text-lg font-semibold">Upload files you want to encrypt here</p>
      <input
        ref="fileInput"
        type="file"
        multiple
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        @change="handleFileUpload"
      />
    </div>
    <div v-for="(file, index) in newFilename" :key="index" class="pt-2">
      <a
        :href="encryptedFileURL[index]"
        :download="file"
        class="text-blue-500 hover:text-blue-800"
        >Download -> {{ file }}</a
      >
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
    async handleFileUpload() {
      this.files = Array.from(this.$refs.fileInput.files)
      const vaultStore = useVaultStore()

      const encoder = new TextEncoder()

      for (let i = 0; i < this.files.length; i++) {
        // derive key from password
        const cryptoKeyObj = vaultStore.key

        // convert file to arraybuffer
        const file = this.files[i]
        const fileAB = await file.arrayBuffer()

        // generate iv
        const iv = crypto.getRandomValues(new Uint8Array(12))

        // encrypt data
        const encryptedData = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKeyObj,
          fileAB
        )

        // get filename and iv for filename encryption
        const encodedFilename = encoder.encode(file.name)
        const filenameiv = crypto.getRandomValues(new Uint8Array(12))

        // encrypt filename
        const encryptedFilename = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: filenameiv },
          cryptoKeyObj,
          encodedFilename
        )

        // convert encrypted filename to readable string
        const filenameArray = new Uint8Array(encryptedFilename)
        // const filenameString = String.fromCharCode.apply(null, filenameArray)
        const base64Filename = this.toBase64Url(filenameArray)
        const newFilename = base64Filename + '.bin'
        this.newFilename.push(newFilename)

        // create blob for file download
        // concatenate index for pinia filenameArray, newline separator, filenameiv, and iv into encrypted file
        const encryptedBlob = new Blob(
          [i, '\n', filenameiv, iv, encryptedData],
          { type: 'application/octet-stream' }
        )
        this.encryptedFileURL.push(URL.createObjectURL(encryptedBlob))
      }
    },
    toBase64Url(byteArray) {
      // Convert byteArray to a standard base64 string
      const base64String = window.btoa(
        String.fromCharCode.apply(null, byteArray)
      )

      // Make the base64 string URL and filename safe
      const base64UrlString = base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      return base64UrlString
    },
    toHexString(byteArray) {
      return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
      }).join('')
    },
  },
}
</script>
