<template>
  <div class="my-10">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Delete Vault</h1>
    <UButton
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      @click="confirmPassword = true"
      >Click here if you are sure</UButton
    >
    <div v-if="confirmPassword">
      <label for="confirm-password">Confirm Password:</label>
      <input
        id="confirm-password"
        v-model="password"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <UButton class="mx-4 mt-4" @click="confirmDelete">Confirm</UButton>
    </div>
    <div v-if="confirmPassword">
      <label for="confirm-password">Confirm Password:</label>
      <input
        id="confirm-password"
        v-model="password"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <UButton class="mx-4 mt-4" @click="confirmDelete">Confirm</UButton>
    </div>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

const confirmPassword = ref(false)
const password = ref('')

async function confirmDelete() {
  try {
    const response = await $fetch('/api/vault/delete/auth', {
      method: 'POST',
      body: {
        password: password.value,
        vaultId: vault.id,
      },
    })

    if (response.ok) {
      vault.$reset()
      navigateTo('/dashboard')
    }
  } catch (error) {
    if (!error.response) {
      alert('Network error, try again later!')
    } else if (error.response.status === 401) {
      alert('Wrong password, try again!')
    } else if (error.response.status === 500) {
      alert('Server error, try again later!')
    }
  }
}
</script>
