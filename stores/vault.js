import { defineStore } from 'pinia'

export const useVaultStore = defineStore({
  id: 'object',
  state: () => ({
    key: null,
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
