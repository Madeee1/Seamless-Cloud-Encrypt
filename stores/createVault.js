import { defineStore } from 'pinia'

export const useCreateVaultStore = defineStore({
  id: 'createVaultStore',
  state: () => ({
    name: '',
    description: '',
    hashedPassword: '',
    cloudProvider: '',
    cloudFolderName: '',
    passwordDerivedKeyObject: CryptoKey | undefined,
  }),
  actions: {},
  persist: {
    storage: persistedState.localStorage,
  },
})
