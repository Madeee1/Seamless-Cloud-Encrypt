<template>
  <div class="flex flex-col min-h-screen bg-main-blue text-gray-200">
    <section class="h-min">
      <h1 class="text-5xl font-extrabold mb-5 mt-32 text-center">
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
          class="flex-1 bg-third-blue text-gray-200 px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-third-blue"
          @click="navigateTo('/login')"
        >
          Get Started
        </button>
        <button
          class="flex-1 bg-white text-third-blue px-6 py-3 rounded-md font-semibold hover:bg-third-blue hover:text-gray-200"
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
      <div class="pt-20">
        <ul class="text-gray-200 text-lg list-none">
          <li class="mb-5">
            <div class="flex relative h-40 w-10/12">
              <div
                class="absolute top-8 left-10 w-fit ml-52 bg-main-blue border-4 border-second-blue px-8 py-4"
              >
                <span
                  >Crypt&Go is a free online platform designed to be accessible
                  to everyone with the purpose of enhancing security by adding
                  an additional layer of security for cloud files.
                </span>
              </div>
              <div
                class="absolute w-fit ml-52 text-2xl bg-second-blue p-2 transform- -skew-x-12"
              >
                <span class="ml-1">What is Crypt&Go?</span>
              </div>
            </div>
            <div class="flex items-center justify-between pb-20">
              <div>
                <div
                  class="ml-[200px] w-[200px] flex items-center justify-center bg-main-blue border-4 border-second-blue rounded shadow-[5px_7px_0px_rgb(255,0,0)]"
                >
                  <span class="text-lg text-gray-200 p-5 space-y-2">
                    Files uploaded to the website will be
                    <span class="text-third-blue">ENCRYPTED</span>. <br /><br />
                    Even if
                    <span class="text-warning-red">ATTACKERS</span> gain access
                    to the cloud, they won't be able to see the file
                    contents.</span
                  >
                </div>
              </div>
              <div>
                <!-- Image Section -->
                <div class="flex-shrink-0 ml-4 mr-[200px]">
                  <img
                    src="/img/showcase.png"
                    alt="Description"
                    class="object-cover"
                  />
                </div>
              </div>
            </div>
          </li>
          <li class="mb-5">
            <div class="flex relative h-[300px] w-10/12">
              <div
                class="absolute top-8 left-10 w-fit ml-52 bg-main-blue border-4 border-second-blue px-8 py-4"
              >
                <span
                  >Crypt&Go's encryption works by using AES-GCM, a technology
                  that is fast and lightweight, making it compatible to any
                  users' devices.<br /><br />
                  <ul class="list-disc pl-5 space-y-2">
                    <li>
                      User need to create a
                      <span class="text-third-blue">vault</span>, folder that
                      connect Crypt&Go with their Cloud, and a vault's
                      <span class="text-third-blue">password</span>.
                    </li>
                    <li>
                      With the <span class="text-third-blue">vault</span>, user
                      can upload files to
                      <span class="text-third-blue">encrypt</span> them. The
                      files will then automatically uploaded to the Cloud.
                    </li>
                    <li>
                      To <span class="text-third-blue">restore</span> the files
                      back to their original content, simply enter the
                      <span class="text-third-blue">vault</span> and choose
                      which files to
                      <span class="text-third-blue">download</span>.
                    </li>
                  </ul>
                </span>
              </div>
              <div
                class="absolute w-fit ml-52 text-2xl bg-second-blue p-2 transform- -skew-x-12"
              >
                <span class="ml-1">How does Crypt&Go works?</span>
              </div>
            </div>
          </li>
          <li class="mb-5">
            <div class="flex relative h-64 w-10/12">
              <div
                class="absolute top-8 left-10 w-4/5 ml-52 bg-main-blue border-4 border-second-blue px-8 py-4"
              >
                <span
                  >Crypt&Go ensures safety and compliance with industry
                  standards. All data is encrypted both at rest and in transit
                  with <span class="text-third-blue">TLS 1.2</span> and
                  <span class="text-third-blue">AES 256</span> encryption.
                  <br /><br />In addition to secure hosting, our software uses
                  the <span class="text-third-blue">Nuxt Security</span> module
                  to guard against
                  <span class="text-third-blue"
                    >OWASP top 10 vulnerabilities</span
                  >
                  and <span class="text-third-blue">HTTP header issues</span>.
                  This includes protections for
                  <span class="text-third-blue"
                    >Cross-Origin Resource Sharing (CORS)</span
                  >, security response headers, and more.
                </span>
              </div>
              <div
                class="absolute w-fit ml-52 text-2xl bg-second-blue p-2 transform- -skew-x-12"
              >
                <span class="ml-1">Is Crypt&Go safe?</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
    <div
      class="aspect-900/200 w-full bg-repeat bg-center bg-cover bg-wave3"
    ></div>
    <section class="h-min bg-main-blue">
      <div class="flex items-center justify-center py-20 space-x-5">
        <div>
          <div class="flex items-center justify-center">
            <span class="text-5xl font-title text-third-blue"
              >CRYPT<span class="text-gray-200 text-4xl">&</span>GO</span
            >
          </div>
        </div>
        <div class="border-2 h-16"></div>
        <div>
          <div class="flex-shrink-0 ml-4">
            <p class="mb-2 text-gray-200 text-3xl first-letter:text-third-blue">
              SHARE
            </p>
            <div class="flex space-x-6">
              <a
                href="https://twitter.com/intent/tweet?url=https://crypt-and-go.vercel/app"
                target="_blank"
                class="ml-2"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0,0,256,256"
                  class="transition-transform transform hover:scale-125"
                >
                  <g
                    fill="#e5e7eb"
                    fill-rule="nonzero"
                    stroke="none"
                    stroke-width="1"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-miterlimit="10"
                    stroke-dasharray=""
                    stroke-dashoffset="0"
                    font-family="none"
                    font-weight="none"
                    font-size="none"
                    text-anchor="none"
                    style="mix-blend-mode: normal"
                  >
                    <g transform="scale(5.12,5.12)">
                      <path
                        d="M50.0625,10.4375c-1.84766,0.82031 -3.82812,1.37109 -5.91016,1.62109c2.125,-1.27344 3.75781,-3.28906 4.52344,-5.6875c-1.98437,1.17578 -4.19141,2.03125 -6.53125,2.49219c-1.875,-2 -4.54687,-3.24609 -7.50391,-3.24609c-5.67969,0 -10.28516,4.60156 -10.28516,10.28125c0,0.80469 0.09375,1.58984 0.26953,2.34375c-8.54687,-0.42969 -16.12109,-4.52344 -21.19531,-10.74609c-0.88672,1.52344 -1.39062,3.28906 -1.39062,5.17187c0,3.56641 1.8125,6.71484 4.57422,8.5625c-1.6875,-0.05469 -3.27344,-0.51953 -4.66016,-1.28906c0,0.04297 0,0.08594 0,0.12891c0,4.98438 3.54688,9.13672 8.24609,10.08594c-0.85937,0.23438 -1.76953,0.35938 -2.70703,0.35938c-0.66406,0 -1.30859,-0.0625 -1.9375,-0.1875c1.3125,4.08203 5.10938,7.0625 9.60547,7.14453c-3.51562,2.75781 -7.94922,4.39844 -12.76953,4.39844c-0.83203,0 -1.64844,-0.04687 -2.44922,-0.14453c4.54687,2.92188 9.95312,4.62109 15.76172,4.62109c18.91406,0 29.25781,-15.66797 29.25781,-29.25391c0,-0.44531 -0.01172,-0.89453 -0.02734,-1.33203c2.00781,-1.44922 3.75,-3.26172 5.12891,-5.32422z"
                      ></path>
                    </g>
                  </g></svg
              ></a>
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https://crypt-and-go.vercel/app"
                target="_blank"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0,0,256,256"
                  class="transition-transform transform hover:scale-125"
                >
                  <g
                    fill="#e5e7eb"
                    fill-rule="nonzero"
                    stroke="none"
                    stroke-width="1"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-miterlimit="10"
                    stroke-dasharray=""
                    stroke-dashoffset="0"
                    font-family="none"
                    font-weight="none"
                    font-size="none"
                    text-anchor="none"
                    style="mix-blend-mode: normal"
                  >
                    <g transform="scale(5.12,5.12)">
                      <path
                        d="M25,3c-12.15,0 -22,9.85 -22,22c0,11.03 8.125,20.137 18.712,21.728v-15.897h-5.443v-5.783h5.443v-3.848c0,-6.371 3.104,-9.168 8.399,-9.168c2.536,0 3.877,0.188 4.512,0.274v5.048h-3.612c-2.248,0 -3.033,2.131 -3.033,4.533v3.161h6.588l-0.894,5.783h-5.694v15.944c10.738,-1.457 19.022,-10.638 19.022,-21.775c0,-12.15 -9.85,-22 -22,-22z"
                      ></path>
                    </g>
                  </g></svg
              ></a>
            </div>
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-200 text-center mx-auto pb-10">
        Licensing ©CRYPT&GO All rights reserved
      </p>
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
