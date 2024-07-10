<template>
  <div class="my-2">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Update Password</h1>
    <UButton
      class="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      @click="confirmPassword = true"
    >
      Change Password
    </UButton>
    <div v-if="confirmPassword">
      <label for="confirm-password">Confirm Password:</label>
      <input
        id="confirm-password"
        v-model="passwordConfirmation"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div v-if="confirmPassword">
      <label for="new-password">New Password:</label>
      <input
        id="new-password"
        v-model="newPassword"
        type="password"
        placeholder="Enter new password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div v-if="confirmPassword">
      <label for="confirm-new-password">Confirm New Password:</label>
      <input
        id="confirm-new-password"
        v-model="newPasswordConfirmation"
        type="password"
        placeholder="Enter new password again"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <UButton class="mx-4 mt-4" @click="confirmUpdate">Confirm</UButton>
      <UButton
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        @click="confirmPassword = false"
        >Cancel</UButton
      >
    </div>
  </div>
</template>

<script setup>
import bcrypt from 'bcryptjs'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

const confirmPassword = ref(false)
const accessToken = sessionStorage.getItem('access_token') || null
const passwordConfirmation = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')

async function confirmUpdate() {
  try {
    const response = await $fetch('/api/vault/auth/update', {
      method: 'POST',
      body: {
        password: passwordConfirmation.value,
        vaultId: vault.id,
      },
    })

    if (response.ok && newPassword.value == newPasswordConfirmation.value) {
      console.log('mantap ajg')
      downloadAll()
      // updatePassword()
      // decrypt all files inside
      // re encrpt all files inside
    } else {
      console.log('salah ajg')
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

async function updatePassword() {
  const saltRounds = 10
  const hashPass = await bcrypt.hash(newPassword.value, saltRounds)

  const { data, error } = await supabase
    .from('vault')
    .update({
      hashed_password: hashPass,
    })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .select()

  if (error) {
    console.error(error)
  } else {
    console.log(data)
    vault.$patch({
      name: data[0].name,
    })
    navigateTo('/dashboard/vault')
  }
}

async function downloadAll() {
  const response = await $fetch('/api/vault/downloadAll', {
    method: 'POST',
    body: {
      accessToken: accessToken,
    },
  })

  console.log('response files length = ', response.files.length)
}
</script>
