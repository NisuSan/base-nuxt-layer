import { defineNuxtModule } from 'nuxt/kit'
import { readFileSync, writeFileSync } from 'node:fs'
import { greenBright } from 'ansis'
import { localPath } from '../utils/index.server'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'themeUtils',
    configKey: 'themeUtils',
  },
  setup(_options, _nuxt) {
    try {
      generateComposables()
      console.log(`${greenBright('✔')} Generate __themes.ts composable`)
    }
    catch (e) { console.error('themeUtils error:', e) }
  }
})

function getThemes() {
  const fileContent = readFileSync(localPath('../theme/theme.colors.css'), 'utf-8')
  if(!fileContent) throw new Error('No themes found')

  return fileContent.matchAll(/\[theme=['"](\w+)['"]\]/gm).map((m) => m[1]).toArray()
}

function generateComposables() {
  const themes = getThemes()
  const themesArgs = Object.values(themes).map(t => `${t}:string`).join()
  const themesLookUp = `{${Object.values(themes).join()},auto:dark}`

  writeFileSync(localPath('../composables/__themes.ts'), `
    import { useColorMode } from '@vueuse/core'
    import colors from '#tw/theme/colors'
    export function useThemeNames(){return ${JSON.stringify(themes)}}
    // @ts-expect-error tw colors import can't determine dynamic value\n
    export function useColorChooser(){const th = useColorMode();return (${themesArgs}) => computed(() => (colors[${themesLookUp}[th.value]]))};
  `)
}
