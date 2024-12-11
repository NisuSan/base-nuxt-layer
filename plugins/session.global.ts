export default defineNuxtPlugin(async nuxtApp => {
  await useAuth().fetchSession()
})
