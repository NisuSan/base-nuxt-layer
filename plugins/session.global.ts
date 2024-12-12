export default defineNuxtPlugin(nuxtApp => {
  // await useAuth().fetchSession()
  nuxtApp.hook('page:start', () => { console.log('session global hook')})
})
