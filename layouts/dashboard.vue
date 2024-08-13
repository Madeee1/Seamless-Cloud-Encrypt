<template>
  <ClientOnly>
    <body class="h-screen flex flex-col">
      <!-- Header -->
      <header
        class="bg-main-blue text-gray-200 flex justify-between items-center p-2 border-b-2 border-gray-500"
      >
        <button
          class="flex items-center gap-2 ml-2"
          @click="navigateTo('/dashboard/account')"
        >
          <UIcon
            name="i-heroicons-adjustments-horizontal-solid"
            class="w-8 h-8"
          />
          <div
            class="flex-1 bg-transparent font-semibold text-third-blue text-3xl font-title hover:underline underline-offset-4 decoration-[rgb(255,0,0)]"
          >
            CRYPT<span class="text-gray-200 text-2xl">&</span>GO
          </div>
        </button>
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
  </ClientOnly>
</template>

<script lang="ts" setup></script>
