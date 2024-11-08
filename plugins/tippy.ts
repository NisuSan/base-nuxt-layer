import { defineNuxtPlugin } from 'nuxt/app'
import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    defaultProps: {
      arrow: true,
      allowHTML: true,
    },
    flipDuration: 0,
  })
})
