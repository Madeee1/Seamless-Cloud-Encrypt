<template>
  <ClientOnly>
    <body class="h-screen flex flex-col">
      <!-- Header -->
      <header
        class="bg-[#305d63] text-white flex justify-between items-center p-4"
      >
        <div class="flex items-center">
          <div
            class="w-10 h-10 bg-gray-300 rounded-full mr-4"
            @click="navigateTo('/dashboard/account')"
          ></div>
          <h1 class="text-xl" @click="navigateTo('/dashboard')">Vaults</h1>
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
  </ClientOnly>
</template>

<script lang="ts" setup>

</script>
