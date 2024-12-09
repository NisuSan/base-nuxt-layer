import Joi from 'joi'
import { prisma } from '../../prisma/instance'

type RequestTypes = 'body' | 'query' | 'params'
type Validators<T> = { [K in keyof T]: Joi.AnySchema | Joi.Reference }
type Profile = { firstName: string, lastName: string, middleName: string }

/**
 * Get the data from the current request context.
 * @param kind Which data to use, can be "body", "query" or "params".
 * @param validators Joi schema to validate the data with.
 * If validators is not provided, the data is returned as is.
 * @throws NuxtError If the data is invalid according to the validators.
 * @returns The validated data or the original data if no validators are provided.
 */
export async function useData<T>(kind: RequestTypes, validators?: Validators<T>) {
  const target = (kind === 'body' ? await readBody(useEvent()) : kind === 'query' ? getQuery(useEvent()) : getRouterParams(useEvent())) as T

  if(!validators) return target
  const schema = Joi.object(validators)
  const test = schema.validate(target)

  if(test.error) throw createError({ message: test.error.message, statusCode: 422 })
  return target
}

export function usePrisma() {
  return prisma
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
  return profile.lastName
    + (kind === 'auth' ? '' : ' ')
    + [ profile.firstName.slice(0, 1), profile.middleName.slice(0, 1)].join(kind === 'auth' ? '' : '.')
}
