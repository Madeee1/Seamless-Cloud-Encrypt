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
      <div class="flex space-x-4 w-1/3 mx-auto text-lg mt-10 mb-5">
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
    </section>
    <div
      class="aspect-900/200 w-full bg-repeat bg-center bg-cover bg-wave2"
    ></div>
    <section class="h-min bg-third-blue">
      <div
        class="h-16 w-3/4 bg-second-blue rounded-md transform- -skew-x-12 mx-auto mt-20 mb-10 shadow-[10px_5px_0px_rgb(255,0,0)]"
      >
        <h2
          class="text-4xl font-extrabold w-3/4 mx-auto pt-2 transform skew-x-12 text-center text-first-blue"
        >
          Features
        </h2>
      </div>
      <div>
        <ul class="text-gray-200 text-xl font-bold list-none">
          <li class="mb-5">
            <div
              class="w-fit ml-52 shadow-[-10px_0px_0px_rgb(0,31,210)] transform- -skew-x-12"
            >
              <span class="ml-1"
                >Cloud-connected, password-protected vaults to store encrypted
                files</span
              >
            </div>
          </li>
          <li class="mb-5">
            <div
              class="w-fit ml-52 shadow-[-10px_0px_0px_rgb(0,31,210)] transform- -skew-x-12"
            >
              <span class="ml-1">
                Password-derived keys for encryption and decryption
              </span>
            </div>
          </li>
          <li class="mb-5">
            <div
              class="w-fit ml-52 shadow-[-10px_0px_0px_rgb(0,31,210)] transform- -skew-x-12"
            >
              <span class="ml-1">Automatic key management</span>
            </div>
          </li>
          <li class="mb-5">
            <div
              class="w-fit ml-52 shadow-[-10px_0px_0px_rgb(0,31,210)] transform- -skew-x-12"
            >
              <span class="ml-1">Seamless file encryption</span>
            </div>
          </li>
          <li class="mb-5">
            <div
              class="w-fit ml-52 shadow-[-10px_0px_0px_rgb(0,31,210)] transform- -skew-x-12"
            >
              <span class="ml-1">Seamless file decryption</span>
            </div>
          </li>
        </ul>
      </div>
      <div
        class="flex items-center justify-center mt-20 space-x-8 font-semibold text-lg"
      >
        <div class="flex items-center space-x-2">
          <span class="text-lime-400">&#10003;</span>
          <p>Free forever for core features</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-lime-400">&#10003;</span>
          <p>More integrations than any other platform</p>
        </div>
      </div>
    </section>
    <div
      class="aspect-900/200 w-full bg-repeat bg-center bg-cover bg-wave3"
    ></div>
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
