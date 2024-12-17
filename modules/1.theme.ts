import { defineNuxtModule } from 'nuxt/kit'
import { readFileSync, writeFileSync } from 'node:fs'
import { greenBright } from 'ansis'
import { localPath } from '../utils/index.server'
import resolveConfig from 'tailwindcss/resolveConfig'
import twconfig from '../tailwind.config'

export type ModuleOptions = Record<string, unknown>

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'themeUtils',
    configKey: 'themeUtils',
  },
  setup(_options, _nuxt) {
    try {
      generateComposables()
      generateColorType()
      console.log(`${greenBright('✔')} Generate __themes.ts composable`)
    } catch (e) {
      console.error('themeUtils error:', e)
    }
  },
})

function getThemes() {
  const fileContent = readFileSync(localPath('../theme/theme.colors.css'), 'utf-8')
  if (!fileContent) throw new Error('No themes found')

  return fileContent
    .matchAll(/\[theme=['"](\w+)['"]\]/gm)
    .map(m => m[1])
    .toArray()
    .filter(x => x) as string[]
}

function generateComposables() {
  const themes = getThemes()
  const themesArgs = Object.values(themes)
    .map(t => `${t}:Layer.Color`)
    .join()
  const themesLookUp = `{${Object.values(themes).join()},auto:dark}`
  const possiblesOverrides = generateCombinations(themes, ['Layer.Color', 'string']).join()

  writeFileSync(
    localPath('../composables/__themes.ts'),
    `
    import { useColorMode } from '@vueuse/core'

    export function useThemeNames(){
      return ${JSON.stringify(themes)}
    }

    export function colors(name: string): string
    export function colors(name: Layer.Color): string
    export function colors(name: Layer.Color | string): string {
      const color = name.startsWith('#') || name.startsWith('rgb') ? name : getComputedStyle(document.documentElement).getPropertyValue(\`--\${name}\`)
      if(!color) throw new Error(\`Color \${name} not found\`)
      return color
    }

    export function useColorChooser(){
      const th = useColorMode();
      return ((${themesArgs}) => computed(() => colors(${themesLookUp}[th.value]))) as { ${possiblesOverrides} }
    };
  `
  )
}

function generateColorType() {
  // @ts-ignore
  const colors = resolveConfig(twconfig).theme.textColor
  if (!colors) throw new Error('Tailwind colors not found')

  const colorVariants = extractColorKeys(colors)
  writeFileSync(
    localPath('../colors.d.ts'),
    `declare global { namespace Layer { type Color = '${[...colorVariants].join("' | '")}' } } export {}`
  )
}

function generateCombinations(themes: string[], types: string[]): string[] {
  const result: string[] = []
  const combinationsCount = types.length ** themes.length

  for (let i = 0; i < combinationsCount; i++) {
    const combination: string[] = []
    let remainder = i
    for (let j = 0; j < themes.length; j++) {
      const typeIndex = remainder % types.length
      combination.push(`${themes[j]}: ${types[typeIndex]}`)
      remainder = Math.floor(remainder / types.length)
    }
    result.push(`(${combination.join(', ')}): ComputedRef<string>`)
  }

  return result
}

// biome-ignore lint/suspicious/noExplicitAny: I don't know how fix this yet
function extractColorKeys(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'string' ? `${prefix}${key}` : extractColorKeys(value, `${prefix}${key}.`)
  )
}
