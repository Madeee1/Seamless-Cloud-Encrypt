/* eslint-disable no-undef */
import { defineStore } from 'pinia'

export const useAllVaultStore = defineStore({
  id: 'myAllVaultStore',
  state: () => ({
    loading: false,
    vaults: [],
  }),
  actions: {},
  persist: {
    storage: persistedState.sessionStorage,
  },
})
