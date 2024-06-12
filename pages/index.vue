<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-gray-900 to-blue-400 text-white"
  >
    <div class="mb-8">
      <img src="" alt="Crypt and Go Logo" class="h-16" />
    </div>
    <h1 class="text-5xl font-extrabold mb-4 text-center">
      Secure Your Files with Client-Side Encryption
    </h1>
    <p class="text-lg text-center mb-8 max-w-lg">
      Trust no one but yourself with your data. Encrypt your files locally
      before uploading them to your preferred cloud service. Secure, seamless,
      and simple.
    </p>
    <div class="flex space-x-4">
      <button
        class="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-md font-semibold"
        @click="navigateTo('/login')"
      >
        Get Started
      </button>
      <button
        class="bg-white text-gray-700 hover:text-gray-900 px-6 py-3 rounded-md border border-gray-300 font-semibold"
        @click="moveToDashboard"
      >
        Open Dashboard
      </button>
    </div>
    <div class="flex items-center justify-center mt-12 space-x-8">
      <div class="flex items-center space-x-2">
        <span class="text-lime-400">&#10003;</span>
        <p class="text-lg">Free forever for core features</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-lime-400">&#10003;</span>
        <p class="text-lg">More integrations than any other platform</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()

function moveToDashboard() {
  if (user.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
}
</script>