export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  const { fallbackRoute, unprotectedRoutes } = useRuntimeConfig().public.baseLayer.auth
  const isPublicPage = unprotectedRoutes.some(path => to.path.startsWith(path))

  if (isAuthenticated.value && to.path.startsWith(fallbackRoute) && from.path !== '/') {
    return navigateTo('/')
  }

  if (!isPublicPage && !isAuthenticated.value && from.path !== fallbackRoute) {
    return navigateTo(fallbackRoute)
  }
})
