export default defineNuxtRouteMiddleware((to, from) => {
  const vault = useVaultStore()

  if (!vault.isOpen) {
    return navigateTo('/dashboard')
  }
})
