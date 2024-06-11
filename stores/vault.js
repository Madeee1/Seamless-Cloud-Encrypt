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
    addFilename(newFilename) {
      this.filenameArray.push(newFilename)
    },
  },
})
