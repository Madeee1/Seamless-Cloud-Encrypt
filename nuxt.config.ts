// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxtjs/supabase', 'nuxt-security'],
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
  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
    },
    removeLoggers: process.env.NODE_ENV === 'development' ? false : undefined,
  },
})
