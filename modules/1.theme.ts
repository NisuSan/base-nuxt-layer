import { defineNuxtModule, useNuxt } from 'nuxt/kit'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { greenBright } from 'ansis'
import { localPath } from '../utils/index.server'
import { Project } from 'ts-morph'

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

      generateColorType()
      console.log(`${greenBright('✔')} Generate Color type to types.d.ts`)
    }
    catch (e) { console.error('themeUtils error:', e) }
  }
})

function getThemes() {
  const fileContent = readFileSync(localPath('../theme/theme.colors.css'), 'utf-8')
  if(!fileContent) throw new Error('No themes found')

  return fileContent.matchAll(/\[theme=['"](\w+)['"]\]/gm).map((m) => m[1] ).toArray().filter(x => x) as string[]
}

function generateComposables() {
  const themes = getThemes()
  const themesArgs = Object.values(themes).map(t => `${t}:Layer.Color`).join()
  const themesLookUp = `{${Object.values(themes).join()},auto:dark}`
  const possiblesOverrides = generateCombinations(themes, ['Layer.Color', 'string']).join()

  writeFileSync(localPath('../composables/__themes.ts'), `
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
  `)
}

function generateColorType() {
  const content = readFileSync(join(useNuxt().options.buildDir, 'types/tailwind.config.d.ts'), 'utf-8')
  const moduleMatch = content.match(/(?<=declare module "#tw\/theme\/colors" \{)([\s\S]*?)(?=,\s+};\s?export default)/s)
  if (!moduleMatch) throw new Error('Module #tw/theme/colors not found in the provided .d.ts file')

  const moduleContent = moduleMatch[1]
  const colorMatches = [...(moduleContent?.matchAll(/export const (_\w+): (\{[^}]+\}|"[^"]+");/g) || [])]
  const colorVariants = new Set()

  for (const match of colorMatches) {
    const colorName = match[1]?.substring(1)
    const colorValue = match[2]

    if (colorValue?.startsWith('{')) Object.keys(JSON.parse(colorValue)).forEach(key => colorVariants.add(`${colorName}.${key}`));
    else colorVariants.add(colorName)
  }

  const defaultExportMatch = moduleContent?.match(/const defaultExport: \{([^}]*)/g)
  if (defaultExportMatch) {
    for (const match of defaultExportMatch[0]?.matchAll(/"([\w-]+)":/g) || []) {
      colorVariants.add(match[1])
    }
  }

  const project = new Project({ tsConfigFilePath: localPath('../tsconfig.json') })
  const sourceFile = project.getSourceFile(localPath('../types.d.ts'))
  if (!sourceFile) throw new Error('types.d.ts file not found')

  const layerNamespace = sourceFile?.getModule('global')?.getModule('Layer')
  if (!layerNamespace) throw new Error('Layer namespace not found in the provided .d.ts file')

  layerNamespace.getTypeAlias('Color')?.remove()
  layerNamespace.addTypeAlias({ name: 'Color', type: `'${[...colorVariants].join("' | '")}'`})
  sourceFile.saveSync()
}

function generateCombinations(themes: string[], types: string[]): string[] {
  const result: string[] = []
  const combinationsCount = Math.pow(types.length, themes.length)

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
