import { defineNuxtModule, useNuxt } from 'nuxt/kit'
import { cpSync } from 'node:fs'
import { join } from 'node:path'
import { greenBright, grey } from 'ansis'
import boxen from 'boxen'
import defu from 'defu'
import { localPath } from '../utils/index.server'

export interface ModuleOptions {
  /** Creates a theme folder in the root directory
   * @default true
  */
  exposeTheme?: boolean,
  /** Creates a prisma folder in the root directory
   * @default false
  */
  exposePrisma?: boolean,
  /** Creates a docker folder in the root directory
   * @default false
  */
  // exposeDocker?: {

  // } | boolean
}

const defaultOptions: ModuleOptions = {
  exposeTheme: true,
  exposePrisma: true
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'baseLayerExpose',
    configKey: 'baseLayerExpose',
  },
  setup(_options, _nuxt) {
    try {
      const options = defu(_options, defaultOptions)

      if(options.exposeTheme) exposeFolder('theme')
      if(options.exposePrisma) {
        exposeFolder('prisma') && boxAboutScripts([
          '"prisma-generate": "pnpx prisma generate"',
          '"prisma-migrate-dev": "pnpx prisma migrate dev"',
          '"prisma-seed": "pnpx tsx prisma/seed.ts"',
        ])
      }
    } catch (e) {
      console.error('baseLayerExpose error:', e)
    }
  },
})

function exposeFolder(folder: string) {
  try {
    cpSync(localPath(`../${folder}`), join(useNuxt().options.rootDir, `/${folder}`), {
      recursive: true,
      errorOnExist: true
    })
    console.log(`${greenBright('✔')} Expose ${folder} folder`)
    return true
  }
  catch (e) {
    if(!(e as Error).message.includes('Target already exists')) throw e
    console.log(grey(`Skipped exposing ${folder} folder as it already exists`))
    return false
  }
}

function boxAboutScripts(scripts: string[], title = 'You can add these scripts to package.json') {
  if(!scripts.length) return
  console.log(boxen(
    scripts.join('\n'),
    { title, padding: 1, borderStyle: 'round' }
  ))
}
