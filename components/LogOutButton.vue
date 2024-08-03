<template>
  <div>
    <UButton
      variant="link"
      size="xl"
      outlined
      class="hover:underline underline-offset-4 decoration-warning-red"
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
        <UCard class="bg-gray-200">
          <template #header>
            <h1 class="text-xl text-center font-bold text-main-blue">
              Are you sure you want to
              <span class="text-third-blue">LOG OUT</span>?
            </h1>
          </template>
          <div class="flex justify-center space-x-2">
            <UButton
              color="white"
              class="block text-center w-1/2 text-lg font-semibold text-third-blue"
              @click="isModalOpen = false"
              >Nah, I'd Stay</UButton
            >
            <UButton
              color="blue"
              class="block text-center w-1/2 text-lg font-semibold"
              @click="logout"
              >Yea, I'd Leave</UButton
            >
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
