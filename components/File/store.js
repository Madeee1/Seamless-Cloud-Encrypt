import { defineStore } from 'pinia'

export const useObjectStore = defineStore({
  id: 'object',
  state: () => ({
    object: null,
    filename: null,
  }),
  mutations: {
    setObject(newObject) {
      this.object = newObject
    },
  },
})
