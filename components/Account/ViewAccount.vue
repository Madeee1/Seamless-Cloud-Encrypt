<template>
  <div>
    <h1>Account</h1>
    <div>
      <form>
        <div>
          <label class="block mt-4">Email:</label>
          <input
            v-model="userEmail"
            type="text"
            required
            class="border border-black p-2"
          />
          <UButton class="mx-4 mt-4" @click="updateAccountEmail()">
            Update Email
          </UButton>
        </div>
        <div>
          <label class="block mt-4">Password:</label>
          <input
            v-model="userPassword"
            type="text"
            required
            class="border border-black p-2"
          />
          <UButton class="mx-4 mt-4" @click="updateAccountPass()">
            Update Password
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const userEmail = ref()
const userPassword = ref()
async function getUserInfo() {
  const { data: { user } } = await supabase.auth.getUser()
  userEmail.value = user.identities[0].email
}

onMounted(() => {
  getUserInfo()
})

async function updateAccountEmail() {
  const { data, error } = await supabase.auth.updateUser({
    email: userEmail.value
  })

  if (error) {
    console.error(error)
  } else {
    console.log(data)
  }
}

async function updateAccountPass() {
  const { data, error } = await supabase.auth.updateUser({
    password: userPassword.value
  })

  if (error) {
    console.error(error)
  } else {
    console.log(data)
  }
}
</script>