export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  const { fallbackRoute, unprotectedRoutes } = useRuntimeConfig().public.baseLayer
  const isPublicPage = unprotectedRoutes.some(path => to.path.startsWith(path))

  if (!isPublicPage && !isAuthenticated.value) {
    return navigateTo(fallbackRoute)
  }
})
