<template>
  <div>
    <UButton
      color="red"
      outlined
      @click="logout"
    >
      Log out
    </UButton>
  </div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient()
function logout() {
  supabase.auth.signOut()
}
</script>

<style>

</style>
