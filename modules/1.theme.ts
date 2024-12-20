import { defineNuxtModule } from 'nuxt/kit'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { greenBright } from 'ansis'
import twColors from 'tailwindcss/colors.js'
import { localPath, rootPath } from '../utils/index.server'

export type ModuleOptions = Record<string, unknown>

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'themeUtils',
    configKey: 'themeUtils',
  },
  setup(_options, _nuxt) {
    try {
      generateComposables()
      generateTwAndColorType()
      console.log(`${greenBright('✔')} Generate __themes.ts composable`)
    } catch (e) {
      console.error('themeUtils error:', e)
    }
  },
})

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

function generateTwAndColorType() {
  const themeColors = extractThemeColors()
  const twNativeColorls = extractColorKeys(twColors)

  writeFileSync(
    localPath('../colors.d.ts'),
    `declare global { namespace Layer { type Color = '${[...themeColors, ...twNativeColorls].join("' | '")}' } } export {}`
  )

  writeFileSync(
    localPath('../assets/tw.colors.css'),
    `@theme { ${themeColors.map(k => [`--color-${k}:var(--${k})`]).join(';')} }`
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

function extractThemeColors() {
  const css = parseThemeFiles()
  const themeRegex = /\[theme="([^"]+)"\]\s*\{([^}]+)\}/g
  const propertyRegex = /--([\w-]+):\s*(#[0-9A-Fa-f]+);/g

  let referenceKeys: Set<string> | null = null
  let firstTheme = true

  let themeMatch: RegExpExecArray | null
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((themeMatch = themeRegex.exec(css)) !== null) {
    const [, themeName, content] = themeMatch
    if (!content) throw new Error(`Theme "${themeName}" has no content.`)

    const keysForThisTheme = new Set<string>()
    let propMatch: RegExpExecArray | null

    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((propMatch = propertyRegex.exec(content)) !== null) {
      keysForThisTheme.add(propMatch[1] || '')
    }

    if (firstTheme) {
      referenceKeys = keysForThisTheme
      firstTheme = false
    } else {
      if (referenceKeys?.size !== keysForThisTheme.size) {
        throw new Error(`All themes must have identical keys. Theme "${themeName}" differs in key count.`)
      }
      for (const key of keysForThisTheme) {
        if (!referenceKeys?.has(key)) {
          throw new Error(`All themes must have identical keys. Theme "${themeName}" has unexpected key "${key}".`)
        }
      }
    }
  }

  if (!referenceKeys) throw new Error('No themes found or no properties detected.')
  return Array.from(referenceKeys)
}

// biome-ignore lint/suspicious/noExplicitAny: I don't know how fix this yet
function extractColorKeys(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'string' ? `${prefix}${key}` : extractColorKeys(value, `${prefix}${key}.`)
  )
}

function getThemes() {
  const fileContent = parseThemeFiles()
  if (!fileContent && !fileContent.trim().length) throw new Error('No themes found')

  return fileContent
    .matchAll(/\[theme=['"](\w+)['"]\]/gm)
    .map(m => m[1])
    .toArray()
    .filter(x => x) as string[]
}

function parseThemeFiles() {
  const path = existsSync(rootPath('theme/theme.colors.css'))
    ? rootPath('theme/theme.colors.css')
    : localPath('../theme/theme.colors.css')

  return readFileSync(path, 'utf-8')
}
