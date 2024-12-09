export default defineEventHandler(async event => {
  const authOptions = useRuntimeConfig().baseLayer.auth

  if(authOptions.enabled && authOptions.unprotectedRoutes.every(route => !event._path?.includes(route))) {
    try {
      (await import('jsonwebtoken')).default.verify(getCookie(event, 'Authorization') || '', authOptions.jwtSecret)
    } catch (error) {
      if(event._path?.includes('api')) throw createError({ statusCode: 401 })
      await sendRedirect(event, authOptions.fallbackRoute, 301)
    }
  }
})
