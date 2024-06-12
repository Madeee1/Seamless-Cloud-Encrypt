/* eslint-disable no-undef */
import { defineStore } from 'pinia'

export const useAllVaultStore = defineStore({
  id: 'myAllVaultStore',
  state: () => ({
    supabase: useSupabaseClient(),
    user: useSupabaseUser(),
    vaults: [],
  }),
  actions: {
    // DEPRECATED
    async update() {
      const { data: vault, error } = await supabase
        .from('vault')
        .select('id, name')
        .eq('user_id', user.value.id)

      if (error) {
        console.error('Error fetching vaults:', error.message)
        return
      } else {
        this.vaults = vault
      }
    },
  },
})
