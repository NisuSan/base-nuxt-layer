import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import { sign } from 'jsonwebtoken'
import { pbkdf2Sync } from 'node:crypto'

type AuthKind = 'signin' | 'signup' | 'signout'
type IneerHandlerResponse<K> = K extends 'signin' ? Layer.User & { hash: string, salt: string } : boolean
type Returned<K> = K extends 'signin' ? Layer.User & { token: string } : boolean

export function defineAuthHandler<T extends EventHandlerRequest, K extends AuthKind>(kind: K, handler: (event: H3Event<T>) => Promise<IneerHandlerResponse<K>>): EventHandler<T, Returned<K>> {
  if(['signin', 'signup', 'signout'].includes(kind) === false) throw createError({ statusCode: 400, statusMessage: 'Invalid auth kind' })

  return defineEventHandler<T>(async event => {
    try {
      const user = await handler(event)

      if(user == null) throw createError({ message: 'User not found', statusCode: 404 })
      if(kind === 'signin') {
        const { password } = await readBody(event)
        const encryptedHash = pbkdf2Sync(password, (user as IneerHandlerResponse<'signin'>).salt, 10000, 512, 'sha512')
        // @ts-expect-error can't infer corect type from generated type
        if(user.hash !== encryptedHash.toString()) throw createError({ statusCode: 404, statusMessage: 'User not found' })
        // @ts-expect-error can't infer corect type from generated type
        return { ...makeSafeUser(user), token: generateJwt(user) }
      }
      return user
    }
    catch (err) {
      return { err }
    }
  })
}

function generateJwt(user: IneerHandlerResponse<'signin'>) {
  const runtimeConfig = useRuntimeConfig()
  return sign({id: user.id, privileges: user.privileges, scope: ['accsess', 'user'] }, runtimeConfig.jwtSecret, { expiresIn: '1d' })
}

function makeSafeUser(user: IneerHandlerResponse<'signin'>) {
  const { hash, salt, ...safeUser } = user
  return safeUser
}
