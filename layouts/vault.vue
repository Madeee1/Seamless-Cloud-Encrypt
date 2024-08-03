<template>
  <ClientOnly>
    <body class="h-screen flex flex-col">
      <!-- Header -->
      <header
        class="bg-main-blue text-gray-200 flex justify-between items-center p-2 border-b-2 border-gray-500"
      >
        <div class="flex items-center">
          <span
            class="flex-1 bg-transparent font-semibold text-third-blue text-3xl font-title"
          >
            CRYPT<span class="text-gray-200 text-2xl">&</span>GO
          </span>
        </div>
        <LogOutButton />
      </header>

      <!-- Main Content -->
      <div class="flex flex-1">
        <!-- Sidebar -->
        <SideBar>
          <UVerticalNavigation :links="links">
            <template #default="{ link }">
              <span
                class="group-hover:text-third-blue text-third-blue relative"
                >{{ link.label }}</span
              >
            </template>
          </UVerticalNavigation>
          <div class="flex-grow"></div>
          <UButton
            block
            class="w-11/12 rounded ml-3 mr-3"
            color="blue"
            icon="i-heroicons-arrow-left-start-on-rectangle"
            label="Lock & Exit"
            @click="lockAndExit"
          ></UButton>
        </SideBar>

        <!-- Main Content Area -->
        <main class="flex-1 p-4 bg-main-blue">
          <slot></slot>
        </main>
      </div>
    </body>
  </ClientOnly>
</template>

<script setup>
const vault = useVaultStore()
function lockAndExit() {
  vault.$reset()
  navigateTo('/dashboard')
}

const links = [
  [
    {
      label: 'Vault',
      icon: 'i-heroicons-lock-closed',
      to: '/dashboard/vault',
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-8-tooth',
      to: '/dashboard/vault/settings',
    },
  ],
]
</script>
