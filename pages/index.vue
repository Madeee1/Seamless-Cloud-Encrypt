<template>
  <div class="flex flex-col w-[500px] place-content-center mx-auto">
    <FileUploader />
    <button @click="navigateTo('/login')" class="border border-black">Go to login / sign in</button>
    <button @click="logout" class="border border-red-700">Log out</button>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
function logout() {
  supabase.auth.signOut()
}
</script>
