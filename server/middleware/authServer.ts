export default defineEventHandler(async event => {
  const { fallbackRoute, unprotectedRoutes, enabled } = useRuntimeConfig().public.baseLayer.auth
  const { jwtSecret } = useRuntimeConfig().baseLayer.auth

  if (enabled && unprotectedRoutes.every(route => !event._path?.includes(route))) {
    try {
      ;(await import('jsonwebtoken')).default.verify(getCookie(event, 'Authorization') || '', jwtSecret)
    } catch (error) {
      if (event._path?.includes('api')) throw createError({ statusCode: 401 })
      await sendRedirect(event, fallbackRoute, 301)
    }
  }
})
