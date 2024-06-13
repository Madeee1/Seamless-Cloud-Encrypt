import { defineStore } from 'pinia'

export const useVaultStore = defineStore('vault', {
  state: () => ({
    key: CryptoKey | undefined,
    id: Number | undefined,
    name: '',
    createdAt: '',
    cloudFolderName: '',
    cloudAccessToken: '',
    cloudRefreshToken: '',
    cloudProvider: '',
    description: '',
    idleTime: Number | undefined,
    isOpen: false,

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
