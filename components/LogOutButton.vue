<template>
  <div>
    <UButton
      variant="link"
      size="xl"
      outlined
      class="hover:underline underline-offset-4 decoration-[rgb(255,0,0)]"
      @click="openModal"
    >
      <span class="text-gray-200 text-2xl"
        ><span class="text-third-blue">L</span>og<span class="text-third-blue"
          >O</span
        >ut</span
      >
    </UButton>
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
import type { _fontFamily } from '#tailwind-config/theme'

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

<style></style>
