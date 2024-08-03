// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    '/': { prerender: true },
    '/dashboard/**': { prerender: false },
  },
  css: ['@/assets/css/main.css'],
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    'nuxt-security',
    '@nuxtjs/robots',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/', '/login', '/forgot-password', '/reset-password'],
      cookieRedirect: true,
    },
  },
  colorMode: {
    preference: 'light',
  },
  security: {
    headers: {
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
    },
    removeLoggers: process.env.NODE_ENV === 'development' ? false : undefined,
  },
  robots: {
    rules: [
      {
        UserAgent: '*',
        Disallow: process.env.NODE_ENV === 'production' ? '/dashboard/' : '/',
      },
      {
        UserAgent: '*',
        Disallow: process.env.NODE_ENV === 'production' ? '/confirm' : '/',
      },
    ],
  },
})
