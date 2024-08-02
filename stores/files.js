import { defineStore } from 'pinia'
import { fromBase64Url } from '@/utils/encryptionUtils'

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [],
  }),
  actions: {
    async refreshFilesList(cloudFolderName, accessToken) {
      console.log('Refreshing files list for ', cloudFolderName)
      try {
        this.files = []
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
    async previewFilename(cryptoKeyObj) {
      for (const file of this.files) {
        const encryptedFilenameB64 = file.name.replace(/\.bin$/, '')
        const encFNameUInt8Array = fromBase64Url(encryptedFilenameB64)
        const encryptedFilenameAndiv = encFNameUInt8Array.buffer

        const fileNameiv = encryptedFilenameAndiv.slice(0, 12)
        const encryptedFilename = encryptedFilenameAndiv.slice(12)

        try {
          const decryptedFilename = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: fileNameiv },
            cryptoKeyObj,
            encryptedFilename
          )
          file.oriFilename = new TextDecoder().decode(decryptedFilename)
        } catch (error) {
          file.oriFilename = 'Undecipherable_File.txt'
        }
      }
    },
  },
})
