import { defineStore } from 'pinia'

export const useCreateVaultStore = defineStore({
  id: 'createVaultStore',
  state: () => ({
    name: '',
    description: '',
    hashedPassword: '',
    cloudProvider: '',
    cloudFolderName: '',
    password: '',
    key: CryptoKey | undefined,
  }),
  actions: {},
  persist: {
    storage: persistedState.localStorage,
  },
})
