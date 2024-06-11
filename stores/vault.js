import { defineStore } from 'pinia'

export const useVaultStore = defineStore('vault', {
  state: () => ({
    key: null,
    id: null,
    name: '',
    createdAt: '',
    cloudFolderName: '',
    cloudAccessToken: '',
    cloudRefreshToken: '',
    cloudProvider: '',
    description: '',
    idleTime: null,

    // TODO: Deprecate later
    filenameArray: [],
  }),
  actions: {
    setKey(newKey) {
      this.key = newKey
    },
    clearVaultInfo() {
      this.key = null
      this.id = null
      this.name = ''
      this.createdAt = ''
      this.cloudFolderName = ''
      this.cloudAccessToken = ''
      this.cloudRefreshToken = ''
      this.cloudProvider = ''
      this.description = ''
      this.idleTime = null
      // TODO: DEPRECATE
      this.filenameArray = []
    },
    addFilename(newFilename) {
      this.filenameArray.push(newFilename)
    },
  },
})
