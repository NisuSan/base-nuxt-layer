import { defineNuxtModule } from 'nuxt/kit'
import { cpSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { greenBright, grey } from 'ansis'
import boxen from 'boxen'
import defu from 'defu'
import { localPath, rootPath } from '../utils/index.server'

export interface ModuleOptions {
  /** Creates a theme folder in the root directory
   * @default true
   */
  exposeTheme?: boolean
  /** Creates a prisma folder in the root directory
   * @default false
   */
  exposePrisma?: boolean
  /** Creates a docker folder in the root directory. Note: It's designed only for development
   * @default false
   */
  exposeDocker?:
    | {
        /** Name of the docker container
         * @default 'auto'
         */
        name: 'auto' | string
        /** Setup for databases
         * @default ['pgsql', 'mysql']
         */
        databases: ['pgsql', 'mysql']
        /** Wtite env variables to the .env and .env.example files
         * @default true
         */
        writeEnv: boolean
      }
    | false
}

const defaultOptions: ModuleOptions = {
  exposeTheme: true,
  exposePrisma: false,
  exposeDocker: false,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'baseLayerExpose',
    configKey: 'baseLayerExpose',
  },
  setup(_options, _nuxt) {
    try {
      const options = defu(_options, defaultOptions)

      if (options.exposeTheme) exposeFolder('theme')
      if (options.exposePrisma) {
        exposeFolder('prisma') &&
          boxAboutScripts([
            '"prisma-generate": "pnpx prisma generate"',
            '"prisma-migrate-dev": "pnpx prisma migrate dev"',
            '"prisma-seed": "pnpx tsx prisma/seed.ts"',
          ])
      }
      if (options.exposeDocker) {
        createDockerFiles(options.exposeDocker)
      }
    } catch (e) {
      console.error('baseLayerExpose error:', e)
    }
  },
})

function exposeFolder(folder: string) {
  try {
    cpSync(localPath(`../${folder}`), rootPath(folder), {
      recursive: true,
      force: false,
    })
    return true
  } catch (e) {
    return false
  }
}

function boxAboutScripts(scripts: string[], title = 'You can add these scripts to package.json') {
  if (!scripts.length) return
  console.log(
    `\n${boxen(scripts.join('\n'), {
      title,
      titleAlignment: 'center',
      padding: 1,
      borderStyle: 'round',
    })}\n`
  )
}

function createDockerFiles(options: ModuleOptions['exposeDocker']) {
  const containerName =
    typeof options === 'object' && options?.name === 'auto'
      ? (() => {
          try {
            const json = JSON.parse(readFileSync(rootPath('package.json')).toString('utf-8'))
            return json.name
          } catch (e) {
            return null
          }
        })() || 'nuxt-app'
      : // @ts-expect-error if the options is not an object it's will be undefined or false and next check just end the execution
        options?.name || 'nuxt-app'

  if (
    !existsSync(rootPath('docker/docker-compose.dev.yml')) &&
    typeof options === 'object' &&
    options.databases.length
  ) {
    const file = `
      services:
        ${
          options.databases.includes('pgsql')
            ? `postgres:
        # NOTE!!! container_name it's the "host" parameter in the pgadmin connection setup
          container_name: ${containerName}-pgsql
          image: postgres:17.2-bullseye
          environment:
            - POSTGRES_USER=\${POSTGRES_USER}
            - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
            - POSTGRES_DB=\${POSTGRES_DB}
            - PGDATA=\${PGDATA}
          volumes:
            - ./volumes/postgres:/var/lib/postgresql/data
          ports:
            - \${POSTGRES_DB_OUTHER_PORT}:5432
          healthcheck:
            test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
            interval: 10s
            timeout: 5s
            retries: 5
            start_period: 10s
          restart: always
          networks:
            - ${containerName}-app-network`
            : ''
        }
        ${
          options.databases.includes('mysql')
            ? `mysql:
          container_name: ${containerName}-mysql
          image: mysql:8.4
          restart: always
          environment:
            - MYSQL_USER=\${MYSQL_USER}
            - MYSQL_PASSWORD=\${MYSQL_PASSWORD}
            - MYSQL_DATABASE=\${MYSQL_DB}
            - MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD}
          ports:
            - \${MYSQL_DB_OUTHER_PORT}:3306
          healthcheck:
            test: mysqladmin ping -h 127.0.0.1 -u $$MYSQL_USER --password=$$MYSQL_PASSWORD
            start_period: 10s
            interval: 5s
            timeout: 5s
            retries: 5
          volumes:
            - ./volumes/mysql:/var/lib/mysql
          networks:
            - ${containerName}-app-network`
            : ''
        }

      networks:
        ${containerName}-app-network:
          driver: bridge
    `.replace(/^\s{0,5}/gm, '')

    mkdirSync(rootPath('docker'), { recursive: true })
    writeFileSync(rootPath('docker/docker-compose.dev.yml'), file)

    console.log(`${greenBright('✔')} Generate docker compose for development file`)
    boxAboutScripts([
      `"docker:dev": "docker-compose -f docker/docker-compose.dev.yml --env-file .env -p ${containerName} up -d --build"`,
    ])
  }

  if (options && typeof options === 'object' && options.writeEnv) {
    const result = writeEnvFile(
      (options.databases.includes('pgsql')
        ? `
      POSTGRES_USER=docker
      POSTGRES_PASSWORD=docker_pw
      POSTGRES_DB=${containerName}
      POSTGRES_DB_OUTHER_PORT=55432`
        : '') +
        (options.databases.includes('mysql')
          ? `
      MYSQL_USER=docker
      MYSQL_PASSWORD=docker_pw
      MYSQL_ROOT_PASSWORD=root_pw
      MYSQL_DB=${containerName}
      MYSQL_DB_OUTHER_PORT=33306
    `
          : ''),
      'docker compose'
    )

    console.log(
      result.some(x => x === true)
        ? `${greenBright('✔')} Write env variables to the .env* files`
        : grey(
            'Skipped creating .env and .env.example files as exposeDocker.writeEnv is disabled or files already exist'
          )
    )
  } else {
    console.log(grey('Skipped creating .env* files as exposeDocker.writeEnv is disabled or files already exist'))
  }
}

function writeEnvFile(text: string, commentTitle?: string) {
  const result: boolean[] = []
  for (const file of ['.env', '.env.example']) {
    let data = `\n#====These variables are automatically generated by baseLayerExpose for ${commentTitle}====\n`
    const splitedEnvs = text
      .split('\n')
      .filter(x => x.trim().length > 0)
      .map(line => {
        const [key, value] = line.split('=')
        return [key?.replace(/^\s{0,6}/gm, ''), file.includes('.example') ? '' : value] as [string, string]
      })

    if (existsSync(rootPath(file))) {
      const env = readFileSync(rootPath(file)).toString('utf-8')

      for (const line of splitedEnvs) {
        if (!env.includes(line[0])) {
          data += `${line[0]}=${line[1]}\n`
        }
      }

      if (data.split('\n').length > 3) {
        writeFileSync(rootPath(file), env + data)
        result.push(true)
      }
    } else {
      writeFileSync(rootPath(file), data + splitedEnvs.map(line => `${line[0]}=${line[1]}`).join('\n'))
      result.push(true)
    }
  }

  return result
}
