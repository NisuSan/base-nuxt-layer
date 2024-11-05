import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { defineNuxtPlugin } from '#app'
import { dirname, join } from 'path'

export default defineNuxtPlugin(() => {
  let themes: string[] = []
  try {
    const currentDir = dirname(fileURLToPath(import.meta.url))
    const fileContent = readFileSync(join(currentDir, '../theme/theme.colors.css'), 'utf-8')
    themes = fileContent.matchAll(/\[theme=['"](\w+)['"]\]/gm).map((m) => m[1]).toArray()
  } catch (error) {
    console.error("File read error:", error)
  }

  return {
    provide: {
      appThemes: themes
    }
  }
})
