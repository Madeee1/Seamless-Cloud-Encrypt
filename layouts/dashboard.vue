<template>
  <body class="h-screen flex flex-col">
    <!-- Header -->
    <header
      class="bg-main-blue text-gray-200 flex justify-between items-center p-2 border-b-2 border-gray-500"
    >
      <div class="flex items-center">
        <button
          class="flex-1 bg-transparent font-semibold text-third-blue text-3xl font-title hover:underline underline-offset-4 decoration-[rgb(255,0,0)]"
          @click="navigateTo('/dashboard/account')"
        >
          CRYPT<span class="text-gray-200 text-2xl">&</span>GO
        </button>
      </div>
      <LogOutButton />
    </header>

    <!-- Main Content -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <SideBar>
        <VaultRead />
        <UButton
          block
          icon="i-heroicons-plus"
          color="blue"
          class="w-11/12 rounded ml-3 mr-3"
          @click="navigateTo('/dashboard/create')"
        ></UButton>
      </SideBar>

      <!-- Main Content Area -->
      <main class="flex-1 p-4 bg-main-blue">
        <slot></slot>
      </main>
    </div>
  </body>
</template>

<script lang="ts" setup></script>
