export default defineNuxtPlugin(async _ => {
  await useAuth().fetchSession()
})
