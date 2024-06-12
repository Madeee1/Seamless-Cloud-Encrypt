<template>
  <body class="h-screen flex flex-col">
    <!-- Header -->
    <header
      class="bg-gray-800 text-white flex justify-between items-center p-4"
    >
      <div class="flex items-center">
        <div class="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
        <h1 class="text-xl">Vaults</h1>
      </div>
      <LogOutButton />
    </header>

    <!-- Main Content -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <SideBar>
        <UVerticalNavigation :links="links" />
        <div class="flex-grow"></div>
        <UButton
          block
          color="red"
          icon="i-heroicons-arrow-left"
          label="Lock and Exit vault"
          @click="lockAndExit"
        ></UButton>
      </SideBar>

      <!-- Main Content Area -->
      <main class="flex-1 p-4">
        <slot></slot>
      </main>
    </div>
  </body>
</template>

<script setup>
const vault = useVaultStore()
function lockAndExit() {
  vault.$reset()
  navigateTo('/dashboard')
}

const links = [
  [
    { label: 'Vault', icon: 'i-heroicons-lock-closed', to: '/dashboard/vault' },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-8-tooth',
      to: '/dashboard/vault/settings',
    },
  ],
]
</script>