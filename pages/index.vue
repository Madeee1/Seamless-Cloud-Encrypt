<template>
  <div class="flex flex-col items-center justify-center h-screen bg-white">
    <div class="mb-8">
      <img src="" alt="Crypt and Go Logo" class="h-12" />
    </div>
    <h1 class="text-4xl font-bold mb-4">
      Safe and encrypted files in your cloud today
    </h1>
    <p class="text-gray-700 text-center mb-8 max-w-md">
      No more trusting Google or Microsoft to keep your data safe. Seamlessly
      encrypt your files locally and store them in your own Google Drive or
      Microsoft OneDrive
    </p>
    <div class="flex space-x-4">
      <button
        class="bg-lime-500 text-white px-4 py-2 rounded-md"
        @click="navigateTo('/login')"
      >
        Login
      </button>
      <button
        class="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300"
        @click="navigateTo('/dashboard')"
      >
        Open dashboard
      </button>
      <LogOutButton />
    </div>
    <div class="flex items-center justify-center mt-8">
      <span class="text-gray-500 mr-2">&#10003;</span>
      <p class="text-gray-600">Free forever for core features</p>
      <span class="text-gray-500 mx-2">&#10003;</span>
      <p class="text-gray-600">More apps than any other platform</p>
    </div>
  </div>
</template>

<script setup>

</script>
