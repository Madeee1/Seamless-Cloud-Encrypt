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
    tokenExpiresIn: Number | undefined,
  }),
  actions: {
    setKey(newKey) {
      this.key = newKey
    },
  },
  persist: {
    storage: persistedState.sessionStorage,
  },
})
