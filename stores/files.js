import { defineStore } from 'pinia'

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [],
  }),
  actions: {
    async refreshFilesList(cloudFolderName, accessToken) {
      try {
        console.log(cloudFolderName)
        console.log(accessToken)
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root:/${cloudFolderName}:/children`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to list files: ${response.statusText}`)
        }

        const data = await response.json()
        this.files = data.value // store list of files
      } catch (err) {
        this.error = `Error listing files: ${err.message}`
        console.error('Error details:', err)
      }
    },

    addFile(file) {
      this.files.push(file)
    },
  },
})
