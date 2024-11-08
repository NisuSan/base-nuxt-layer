import { defineNuxtModule, useNuxt } from 'nuxt/kit'
import { defu } from 'defu'
import { Project, SyntaxKind, type ArrowFunction, type Type, type ExportAssignment } from 'ts-morph'
import fg from 'fast-glob'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, parse } from 'node:path'
import { gray, greenBright } from 'ansis'
import { localPath } from '../utils/index.server'

export interface ModuleOptions {
  includeFiles?: string[],
  functionName?: string
}

type CustomApiTypes = {
  file: string,
  args: string,
  defaults: string,
  result: string
}

const defaultOptions: ModuleOptions = {
  functionName: 'api'
}
const tsProject = new Project({ tsConfigFilePath: join(useNuxt().options.rootDir, '/tsconfig.json') })

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'apiHelper',
    configKey: 'apiHelper',
  },
  setup(_options, _nuxt) {
    try {
      _options = defu(_options, defaultOptions)
      const res = generateComposables(_options)
      if(res === 0) console.log(`${greenBright('✔')} Generate __api.ts composable`)
    }
    catch (e) { console.error('apiHelper error:', e) }
  }
})

function generateComposables(options: ModuleOptions) {
  const dirsForParse = [...options.includeFiles || [], join(useNuxt().options.rootDir, '/server/api/**/*.ts').replace(/\\/g, '/')]
  const customApis = fg.sync(dirsForParse, { dot: true })

  if(customApis.length == 0) {
    console.log(gray(`No APIs found`))
    return 1
  }

  const customTypes = customApis.map(x => extractCustomApiTypes(x))

  let compiledInputTypes = customTypes.map(x => x.args).join(':')
  compiledInputTypes = compiledInputTypes + (compiledInputTypes ? ': never' : 'undefined')

  let compiledOutputTypes = customTypes.map(x => x.result).join(':')
  compiledOutputTypes = compiledOutputTypes + (compiledOutputTypes ? ': never' : 'undefined')

  const compiledDefaults = `{${customTypes.map(x => x.defaults).join(',')}}`

  let definedManualRoutes: string | string[] = customApis.map(x => `"${parse(x).name}"`)
  definedManualRoutes = definedManualRoutes.length > 0 ? definedManualRoutes.join(' | ') : 'undefined'

  const apiFunctions = Object.entries(customApis.map(x => {
    const parsed = parse(x)
    const group = parsed.dir.split('/').reverse()[0]
    const parts = parsed.name.split('.')

    const n = parts[0] === 'index' ? 'data' : parts[0]
    const fnName = parts[1] ? `${parts[1]}${capitalize(n || '')}` : n
    const route = getUrlRouteFromFile(x)

    return {
      group,
      method: `
        ${fnName}<T = '${group}.${parsed.name}'>(params?: Ref<APIParams<T>> | APIParams<T>, options?: Omit<UseFetchOptions<APIOutput<T>>, 'default' | 'query' | 'body' | 'params'> & { defaultData?: APIOutput<T>, withCache?: boolean | number }) {
          // @ts-expect-error
          return useExtendedFetch<APIOutput<T>>(\`${route}\`, '${parts[1] || 'get'}', params, {...options, default: dfBuilder('${group}.${parsed.name}', options?.defaultData) }) as AsyncData<APIOutput<T>, Error>
        }
      `,
    }
  // @ts-expect-error can't use dynamic values with corect type
  }).reduce((r, a) => ({ ...r, [a.group]: [...r[a.group] || [], a.method] }), {}))
  .map(([k, v]) => k == 'api' ? (v as string[]).join(',') : `
    ${k}: {
      ${(v as string[]).join(',')}
    }
  `)

  const composableText = `
    import { useFetch, type AsyncData, type UseFetchOptions } from 'nuxt/app'
    import {type Ref, unref, toRaw } from 'vue'
    export type Endpoint = ${definedManualRoutes};
    export type APIParams<T> = ${compiledInputTypes};
    export type APIOutput<T> = ${compiledOutputTypes};
    export const defaults = ${compiledDefaults};

    const dfBuilder = (n: string, d: unknown) => () => Array.isArray(defaults[n])
      ? d || defaults[n]
      : typeof defaults[n] === 'object'
        ? { ...defaults[n], ...d }
        : d || defaults[n]

    export function ${options.functionName}() {
      return {
        ${apiFunctions}
      }
    }

    export function useExtendedFetch<T>(
      url: string,
      method: string = 'get',
      params?: Ref<APIParams<T>> | APIParams<T>,
      options?: Omit<UseFetchOptions<APIOutput<T>>, 'default' | 'query' | 'body' | 'params'> & { default?: () => APIOutput<T>, withCache?: boolean | number }
    ) {
      const isHasArray = Object.values(unref(params) || {}).some(value => Array.isArray(value))
      // @ts-expect-error
      return useFetch<APIOutput<T>>(url, {
        method,
        [['get', 'delete'].includes(method) ? 'query' : 'body']: isHasArray
          ? Object.fromEntries(Object.entries(unref(params) || {}).map(([k, v]) => [Array.isArray(v) ? \`\${k}[]\` : k, toRaw(v)]))
          : params,
        lazy: true,
        getCachedData: options?.withCache === true ? (key: string | number, nuxtApp: { payload: { data: { [x: string]: any; }; }; static: { data: { [x: string]: any; }; }; }) => {
          return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
        } : undefined,
        default: () => [],
        ...options }
      )  as AsyncData<APIOutput<T>, Error>
    }
  `

  writeFileSync(localPath('../composables/__api.ts'), composableText)
  return 0
}

function extractCustomApiTypes(file: string): CustomApiTypes {
  const content = readFileSync(file).toString('utf8')

  const matchArgs = content.match(/type\s?QueryArgs\s?=\s?({[^}]*}|[^{;\n]+)/)
  const argsType = matchArgs ? matchArgs[1]?.replaceAll('\r\n', '').replaceAll('{', '{ ').replaceAll('}', ' }').replaceAll(/ +/g, ' ') : '{}'

  const resultType = getResultTypeFromAPI(file) || { t: '{}', defaultValue: '{}' }
  const parsed = parse(file)
  const group = parsed.dir.split('/').reverse()[0]

  return {
    file,
    args: `T extends "${group}.${parsed.name}" ? ${argsType}`,
    defaults: `'${group}.${parsed.name}': ${resultType.defaultValue}`,
    result: `T extends "${group}.${parsed.name}" ? ${resultType.t}`
  }
}

function getResultTypeFromAPI(file: string): { t: string, defaultValue: string } | undefined {
  const sourceFile = tsProject.addSourceFileAtPath(file)

  const arrowFunction = sourceFile.getExportAssignment((exp: ExportAssignment) => {
    const expression = exp.getExpressionIfKind(SyntaxKind.CallExpression)
    if (!expression) return false

    const identifier = expression.getExpressionIfKind(SyntaxKind.Identifier)
    return identifier?.getText() === 'defineEventHandler'
  })?.getExpressionIfKind(SyntaxKind.CallExpression)?.getArguments()[0] as ArrowFunction

  if (!arrowFunction) return undefined
  const arrowFunctionSourceFile = arrowFunction.getSourceFile()

  const f = arrowFunction.getReturnType().getProperties().filter(x => x.getName() === 'finally')[0]
  const typeArgs = f?.getTypeAtLocation(arrowFunctionSourceFile).getCallSignatures()[0]?.getReturnType().getTypeArguments()[0]

  return {
    t: typeArgs?.getText() || '{}',
    defaultValue: createDefaultvalue(typeArgs)
  }
}

function createDefaultvalue(type?: Type): string {
  if(!type) return 'undefined'

  type = type.getNonNullableType()
  if(type.isString()) return '\'\''
  if(type.isNumber()) return '0'
  if(type.isBoolean()) return 'false'
  if(type.isArray()) return '[]'
  if(type.isObject()) {
    const props = type.getSymbol()?.getDeclarations()[0]?.getType().getProperties()
    if(props) {
      return `{${props.map(x => `${x.getName()}: ${createDefaultvalue(x.getValueDeclaration()?.getType())}`).join(',')}}`
    }
  }

  return 'undefined'
}

function capitalize(word: string) {
  return word?.toLowerCase().split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

function getUrlRouteFromFile(file: string) {
  const parsed = file.match(/\/server(.*?\/)([^/]+?)(?:\.\w+)+$/)!
  // @ts-expect-error some undefined error here
  return parsed[1] + (parsed[2] === 'index' ? '' : parsed[2])
}
