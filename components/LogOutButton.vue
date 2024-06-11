<template>
  <div>
    <UButton color="red" outlined @click="openModal"> Log out </UButton>
    <UModal v-model="isModalOpen">
      <div>
        <UCard>
          <template #header>
            <h1 class="text-xl font-bold">Are you sure you want to log out?</h1>
          </template>

          <div class="flex gap-4">
            <UButton color="red" @click="logout">Yes</UButton>
            <UButton @click="isModalOpen = false">No</UButton>
          </div>
        </UCard>
      </div>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
const isModalOpen = ref(false)

function openModal() {
  isModalOpen.value = true
}

const supabase = useSupabaseClient()
function logout() {
  supabase.auth.signOut()
  navigateTo('/')
}
</script>

<style>

</style>
