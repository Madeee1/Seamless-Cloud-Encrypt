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
          <div>
            <dl class="w-full">
              <div
                class="mb-3 mt-2 mx-3 flex items-center bg-transparent border border-third-blue p-1 px-2 rounded hover:bg-gray-700 focus:bg-gray-200 focus:shadow-[5px_-3px_0px_rgb(255,0,0)] focus:outline-none focus:ml-0 focus:rounded-l-none transition-all duration-150 ease-in-out cursor-pointer"
                tabindex="0"
                @click="navigateTo('/dashboard/vault')"
              >
                <UIcon
                  name="i-heroicons-lock-closed-solid"
                  class="text-third-blue"
                />
                <dd class="ml-2 flex-1 text-third-blue text-semibold">Vault</dd>
              </div>
              <div
                class="mx-3 flex items-center bg-transparent border border-third-blue p-1 px-2 rounded hover:bg-gray-700 focus:bg-gray-200 focus:shadow-[5px_-3px_0px_rgb(255,0,0)] focus:outline-none focus:ml-0 focus:rounded-l-none transition-all duration-150 ease-in-out cursor-pointer"
                tabindex="0"
                @click="navigateTo('/dashboard/vault/settings')"
              >
                <UIcon
                  name="i-heroicons-cog-6-tooth-solid"
                  class="text-third-blue"
                />
                <dd class="ml-2 flex-1 text-third-blue text-semibold">
                  Settings
                </dd>
              </div>
            </dl>
          </div>
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
</script>
