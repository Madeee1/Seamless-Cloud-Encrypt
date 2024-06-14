<template>
  <body class="h-screen flex flex-col">
    <!-- Header -->
    <header
      class="bg-[#305d63] text-white flex justify-between items-center p-4"
    >
      <div class="flex items-center" @click="navigateTo('/dashboard')">
        <div class="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
        <h1 class="text-xl">Vaults</h1>
      </div>
      <LogOutButton />
    </header>

    <!-- Main Content -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <SideBar>
        <VaultRead />
        <div class="flex-grow"></div>
        <UButton
          block
          icon="i-heroicons-plus"
          @click="navigateTo('/dashboard/create')"
        ></UButton>
      </SideBar>

      <!-- Main Content Area -->
      <main class="flex-1 p-4">
        <slot></slot>
      </main>
    </div>
  </body>
</template>

<script lang="ts" setup>

</script>
