<template>
  <div class="flex justify-center items-center h-screen">
    <div class="bg-gray-200 p-4 rounded-lg">
      <p class="text-lg font-semibold">Waiting for email confirmation</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

// Get redirect path from cookies
const cookieName = useRuntimeConfig().public.supabase.cookieName
const redirectPath = useCookie(`${cookieName}-redirect-path`).value

watch(
  user,
  () => {
    if (user.value) {
      // Clear cookie
      useCookie(`${cookieName}-redirect-path`).value = null
      // Redirect to path
      return navigateTo(redirectPath || '/dashboard')
    }
  },
  { immediate: true }
)
</script>
