<template>
  <div>
    <br>
    <h1>Upload</h1>
    <input
      type="file"
      @change="uploadFile"
    /> <!-- trigger uploadFile method when file selected -->
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
    <div
      v-if="uploadSuccess"
      class="alert alert-success"
    >
      File uploaded successfully!
    </div>
  </div>
</template>

<script>
export default {
  data() { // define reactive data properties
    return {
      accessToken: sessionStorage.getItem('access_token') || null,
      error: null, // init 2 null
      uploadSuccess: false,
    }
  },
  methods: {
    async uploadFile(event) { // upload file to OneDrive using Microsoft Graph API
      try {
        const file = event.target.files[0]
        if (!file) {
          throw new Error('No file selected')
        }

        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        console.log('Using Access Token:', this.accessToken) // Log access token 4 debugging

        const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${file.name}:/content`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': file.type,
            'apikey': import.meta.env.VITE_CLIENT_SECRET
          },
          body: file,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to upload file: ${response.statusText} - ${errorText}`)
        }

        this.uploadSuccess = true

        // timer for how long alert last
        setTimeout(() => {
          this.uploadSuccess = false
        }, 10000)
      }
      catch (err) {
        this.error = `Error uploading file: ${err.message}`
        console.error('Error details:', err)
      }
    },
  },
}
</script>

<style scoped>
.alert {
  padding: 10px;
  margin-top: 10px;
  background-color: #dff0d8;
  border: 1px solid #d0e9c6;
  border-radius: 4px;
  color: #3c763d;
}
</style>
