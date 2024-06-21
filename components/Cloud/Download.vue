<template>
  <div>
    <br>
    <h1>Download</h1>
    <br>
    <button @click="filesList">
      Files List
    </button>
    <ul class="">
      <li
        v-for="file in files"
        :key="file.id"
        class=""
      >
        <div class="">
          <img
            v-if="file.thumbnailUrl"
            :src="file.thumbnailUrl"
            alt="Thumbnail"
          />
          <span>
            {{ file.name }}
          </span>
        </div>
        <button
          @click="downloadFile(file.id)"
        >
          Download
        </button>
      </li>
    </ul>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      accessToken: sessionStorage.getItem('access_token') || null,
      files: [],
      error: null,
    }
  },
  methods: {
    async filesList() {
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to list files: ${response.statusText}`)
        }

        const data = await response.json()
        this.files = data.value // store list of files

        // Fetch thumbnails of each file
        for (const file of this.files) {
          if (file.file) {
            const thumbnailResponse = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/thumbnails`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (thumbnailResponse.ok) {
              const thumbnailData = await thumbnailResponse.json()
              if (thumbnailData.value && thumbnailData.value.length > 0) {
                file.thumbnailUrl = thumbnailData.value[0].medium.url // medium size thumbnail
              }
              else {
                console.error('Failed to fetch thumbnail:', thumbnailResponse.statusText)
              }
            }
          }
        }
      }
      catch (err) {
        this.error = `Error listing files: ${err.message}`
        console.error('Error details:', err)
      }
    },

    async downloadFile(fileId) {
      try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        })

        if (!this.accessToken) {
          throw new Error('Access token not found')
        }

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`)
        }

        const blob = await response.blob() // convert response 2 blob obj - rep. binary data, file
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'downloaded_file' // set file name here!
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      catch (err) {
        this.error = `Error downloading file: ${err.message}`
        console.error('Error details:', err)
      }
    },
  },
}
</script>

<style scoped>
.file-list {
  list-style-type: none;
  padding: 0;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.file-item:nth-child(even) {
  background-color: #f9f9f9;
}

.file-info {
  display: flex;
  align-items: center;
}

.thumbnail {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.download-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
}

.download-button:hover {
  background-color: #45a049;
}
</style>
