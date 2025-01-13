import Joi from 'joi'
import { prisma } from '../../prisma/instance'
import type { ServerFile } from 'nuxt-file-storage'

type RequestTypes = 'body' | 'query' | 'params'
type Validators<T> = { [K in keyof T]: Joi.AnySchema | Joi.Reference }
type Profile = { firstName: string; lastName: string; middleName: string }
type FileUploadingOptions = { save?: boolean, folderToSave?: string }

/**
 * Get the data from the current request context.
 * @param kind Which data to use, can be "body", "query" or "params".
 * @param validators Joi schema to validate the data with.
 * If validators is not provided, the data is returned as is.
 * @throws NuxtError If the data is invalid according to the validators.
 * @returns The validated data or the original data if no validators are provided.
 */
export async function useData<T>(kind: RequestTypes, validators?: Validators<T>) {
  const target = (
    kind === 'body' ? await readBody(useEvent()) : kind === 'query' ? getQuery(useEvent()) : getRouterParams(useEvent())
  ) as T

  if (!validators) return target
  const schema = Joi.object(validators)
  const test = schema.validate(target)

  if (test.error) throw createError({ message: test.error.message, statusCode: 422 })
  return target
}

export function usePrisma() {
  return prisma
}

export async function setSession(data: Layer.SessionData) {
  const config = useRuntimeConfig()
  return (await useSession(useEvent(), {
    password: config.baseLayer.auth.sesionPrivateKey,
    maxAge : config.public.baseLayer.auth.jwtExpiresIn
  })).update(data)
}

export async function getUser() {
  return (
    await getSession<Layer.SessionData>(useEvent(), {
      password: useRuntimeConfig().baseLayer.auth.sesionPrivateKey,
    })
  ).data.user
}

/**
 * Given a profile, returns the initials of the first name and the first character of the last name and middle name.
 * If kind is 'auth', the returned string is a single string with no spaces and no separators between the characters.
 * If kind is 'regular' (default), the returned string has a space between the first and last name, and a period between the last and middle name.
 * @param profile The profile to get the initials from.
 * @param kind The kind of initials to generate. Defaults to 'regular'.
 * @throws A 404 error if the profile is empty.
 * @example
 * const initials = useInitialFromFullName(profile, 'auth') -> 'FirstLM'
 * const initials = useInitialFromFullName(profile, 'regular') -> 'First L.M.'
 * @returns The initials of the first, last, and middle name as a single string.
 */
export function useInitialFromFullName(profile: Profile, kind: 'auth' | 'regular' = 'regular') {
  return (
    profile.lastName +
    (kind === 'auth' ? '' : ' ') +
    [profile.firstName.slice(0, 1), profile.middleName.slice(0, 1)].join(kind === 'auth' ? '' : '.')
  )
}

/**
 * Parse the uploaded files from the request body and optionally save them to the local filesystem.
 * @param options Options to control the behavior of the function.
 * @param options.save If true, the files are saved to the local filesystem.
 * @param options.folderToSave Folder to save the files to. If not provided, the files are saved in the root of the project.
 * @returns An array of objects with the binary string and the file extension of each uploaded file.
 * @throws A 400 error if the request body is not an array of ServerFile objects.
 */
export async function useUploadedFiles(options?: FileUploadingOptions) {
  const files = await readBody<ServerFile[]>(useEvent())
  if(files.length === 0) return null

  const parsed: { binaryString: Buffer, ext: string }[] = []

  for (const file of files) {
    if (options?.save) {
      await storeFileLocally(file, 8, `/${options?.folderToSave ?? ''}`)
    }

    parsed.push(parseDataUrl(file.content))
  }

  return parsed
}
