export default defineEventHandler(async event => {
  const user = await getUser()
  if(!user) throw createError({ statusCode: 401 })
  return user
})
