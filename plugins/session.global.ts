export default defineNuxtPlugin(async _ => {
  const { enabled } = useRuntimeConfig().public.baseLayer.auth
  if(!enabled) return

  await useAuth().fetchSession()
})
