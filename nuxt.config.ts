// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase', 'nuxt-security', '@nuxtjs/robots'],
  // eslint: {
  //   checker: true,
  //   config: {
  //     stylistic: true,
  //   },
  // },
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
});
