import Joi from 'joi'
import { prisma } from '../../prisma/instance'

type NestedObject = Record<string, unknown>

export async function getData<T>(kind: 'body' | 'query' | 'params', validators?: { [K in keyof T]: Joi.AnySchema | Joi.Reference } ) {
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
