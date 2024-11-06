import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'
import { localPath } from './utils'

export default defineNuxtConfig({
  build: {
    transpile: [
      '@juggle/resize-observer',
      ...(process.env.NODE_ENV === 'production' ? [
        'naive-ui',
        'vueuc',
        '@css-render/vue3-ssr',
        '@hapi',
        '@sideway'
      ] : [])
    ]
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxtjs-naive-ui', 'unplugin-icons/nuxt'],
  vite: {
    optimizeDeps: {
      include: process.env.NODE_ENV === 'development' ? [
        localPath('./node_modules/naive-ui'),
        localPath('./node_modules/vueuc')
      ] : [],
    },
    ssr: {
      noExternal: ['naive-ui']
    },
    plugins: [
      AutoImport({ imports: [{
        'naive-ui': [
          'useDialog',
          'useMessage',
          'useNotification',
          'useLoadingBar'
        ]}]
      }),
      Components({
        resolvers: [NaiveUiResolver(), IconsResolver()]
      }),
      Icons({ autoInstall: true })
    ]
  },
  tailwindcss: {
    cssPath: ['./assets/tailwind.css', { injectPosition: 'first' }],
    exposeConfig: {
      level: 4,
      alias: '#tw'
    }
  },

})
