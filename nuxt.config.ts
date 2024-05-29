// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxtjs/supabase'],
  eslint: {
    checker: true,
    config: {
      stylistic: true,
    },
  },
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/', '/login'],
      cookieRedirect: true,
    },
  },
  colorMode: {
    preference: 'light',
  },
})
