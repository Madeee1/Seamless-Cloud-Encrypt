<template>
  <div class="flex flex-col min-h-screen bg-main-blue text-gray-200">
    <section class="h-min">
      <h1 class="text-5xl font-extrabold mb-5 mt-20 text-center">
        Welcome to
        <span class="text-third-blue font-title"
          >CRYPT<span class="text-gray-200 text-4xl">&</span>GO</span
        >
      </h1>
      <div
        class="h-16 w-3/4 bg-third-blue rounded-md transform- -skew-x-12 mx-auto shadow-[10px_5px_0px_rgb(255,0,0)]"
      >
        <h2
          class="text-4xl font-extrabold w-3/4 mx-auto pt-2 transform skew-x-12 text-center text-white"
        >
          Secure Your Files with Client-Side Encryption
        </h2>
      </div>
      <p class="text-xl text-gray-200 text-center mb-5 max-w-xl mt-10 mx-auto">
        Trust no one but yourself with your data. Encrypt your files locally
        before uploading them to your preferred cloud service. Secure, seamless,
        and simple.
      </p>
      <div class="flex space-x-4 w-1/3 mx-auto text-lg mt-10">
        <button
          class="flex-1 bg-third-blue text-gray-200 px-6 py-3 rounded-md font-semibold hover:shadow-[5px_3px_0px_rgb(255,0,0)] hover:bg-white hover:text-third-blue"
          @click="navigateTo('/login')"
        >
          Get Started
        </button>
        <button
          class="flex-1 bg-white text-third-blue px-6 py-3 rounded-md font-semibold hover:shadow-[5px_3px_0px_rgb(255,0,0)] hover:bg-third-blue hover:text-gray-200"
          @click="moveToDashboard"
        >
          Open Dashboard
        </button>
      </div>
      <div class="flex items-center justify-center mt-10 space-x-8">
        <div class="flex items-center space-x-2">
          <span class="text-lime-400">&#10003;</span>
          <p class="text-lg">Free forever for core features</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-lime-400">&#10003;</span>
          <p class="text-lg">More integrations than any other platform</p>
        </div>
      </div>
    </section>
    <div
      class="aspect-900/200 w-full bg-repeat bg-center bg-cover bg-wave2"
    ></div>
    <section class="h-screen bg-third-blue">
      <div
        class="h-16 w-3/4 bg-second-blue rounded-md transform- -skew-x-12 mx-auto shadow-[10px_5px_0px_rgb(255,0,0)]"
      >
        <h2
          class="text-4xl font-extrabold w-3/4 mx-auto pt-2 transform skew-x-12 text-center text-first-blue"
        >
          Features
        </h2>
      </div>
    </section>
  </div>
</template>

<script setup>
const user = useSupabaseUser()

function moveToDashboard() {
  if (user.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login?tab=Login')
  }
}
</script>
