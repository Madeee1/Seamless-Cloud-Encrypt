<template>
  <div class="max-w-lg mx-auto my-10">
    <h1 class="text-2xl font-bold text-center mb-6">Account</h1>
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <form>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2"
            >Email:</label
          >
          <input
            v-model="userEmail"
            type="text"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <UButton class="mt-4" @click="updateAccountEmail">
            Update Email
          </UButton>
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2"
            >Password:</label
          >
          <input
            v-model="userPassword"
            type="password"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
          <UButton class="mt-4" @click="updateAccountPass">
            Update Password
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const userEmail = ref()
const userPassword = ref()

onMounted(() => {
  userEmail.value = user.value.email
})

async function updateAccountEmail() {
  const { data, error } = await supabase.auth.updateUser({
    email: userEmail.value,
  })

  // generate an email change link to be sent to the current email address
  const { data: currLink } = await supabase.auth.admin.generateLink({
    type: 'email_change_current',
    email: user.value.email,
    newEmail: userEmail.value,
  })

  // generate an email change link to be sent to the new email address
  const { data: newLink } = await supabase.auth.admin.generateLink({
    type: 'email_change_new',
    email: user.value.email,
    newEmail: userEmail.value,
  })
  // TODO: handle error correctly
  if (error) {
    console.error(error)
  } else {
    navigateTo('/dashboard')
  }
}

async function updateAccountPass() {
  const { data, error } = await supabase.auth.updateUser({
    password: userPassword.value,
  })

  // TODO: handle error correctly
  if (error) {
    console.error(error)
  } else {
    navigateTo('/dashboard')
  }
}
</script>
