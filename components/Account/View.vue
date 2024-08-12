<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-3xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Edit <span class="text-third-blue">A</span>ccount
      </h1>
      <div class="">
        <form>
          <div class="mb-3 first-letter:text-third-blue">
            <label class="text-xl font-semibold text-gray-200">Email</label>
            <input
              v-model="userEmail"
              type="text"
              class="rounded w-full py-2 px-3 text-gray-700"
            />
            <div class="pt-3 flex justify-end">
              <UButton
                class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
                @click="updateAccountEmail"
              >
                Update Email
              </UButton>
            </div>
          </div>
          <div class="mb-3 first-letter:text-third-blue">
            <label class="text-xl font-semibold text-gray-200">Password</label>
            <input
              v-model="userPassword"
              type="password"
              placeholder="Enter New Password"
              class="rounded w-full py-2 px-3 text-gray-700"
            />
            <div class="pt-3 flex justify-end">
              <UButton
                class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
                @click="updateAccountPass"
              >
                Update Password
              </UButton>
            </div>
          </div>
        </form>
      </div>
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
    alert(error.message)
  } else {
    // Send out an alert to the user to check their email for the link
    alert('Check your email for the link to confirm the email change')
    navigateTo('/dashboard')
  }
}

async function updateAccountPass() {
  const { data, error } = await supabase.auth.updateUser({
    password: userPassword.value,
  })

  // TODO: handle error correctly
  if (error) {
    alert(error.message)
  } else {
    alert('Password updated successfully')
    navigateTo('/dashboard')
  }
}
</script>
