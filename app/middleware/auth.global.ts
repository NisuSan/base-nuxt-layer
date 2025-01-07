export default defineNuxtRouteMiddleware((to, from) => {
  const { fallbackRoute, unprotectedRoutes, enabled } = useRuntimeConfig().public.baseLayer.auth

  if (enabled) {
    const { isAuthenticated } = useAuth()
    const isPublicPage = unprotectedRoutes.some(path => to.path.startsWith(path))

    if (isAuthenticated.value && to.path.startsWith(fallbackRoute) && from.path !== '/') {
      return navigateTo('/')
    }

    if (!isPublicPage && !isAuthenticated.value && from.path !== fallbackRoute) {
      return navigateTo(fallbackRoute)
    }
  }
})
