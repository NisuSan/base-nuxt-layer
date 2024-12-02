import Joi from 'joi'
import { sign } from 'jsonwebtoken'
import { pbkdf2Sync } from 'node:crypto'

type FullUser = { salt: string, hash: string } & Layer.User

export async function useSignin() {
  const input = await getData<Layer.SignIn>('body', {
    login: Joi.string().alphanum().min(3).max(16).required(),
    password: Joi.string().alphanum().min(3).max(16).required()
  })

  const user = await usePrisma().user.findUnique({ select: {
    id: true,
    hash: true,
    salt: true,
    roleId: true,
    privileges: true,
    profile: { select: { first_name: true, last_name: true, middle_name: true },  }
  }, where: { login: input.login } })
  if(user === null) throw createError({ message: 'User not found', statusCode: 404 })

  const { password } = await readBody(useEvent())
  const encryptedHash = pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')

  if(user.hash !== encryptedHash.toString()) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return { ...makeSafeUser(user), token: generateJwt(user) }
}

export function useSignup() {
  const event = useEvent()
}

export function useSignout() {
  const event = useEvent()

}

function generateJwt(user: Layer.User) {
  const runtimeConfig = useRuntimeConfig()
  return sign({id: user.id, privileges: user.privileges, roleId: user.roleId, scope: ['accsess', 'user'] }, runtimeConfig.jwtSecret, { expiresIn: '1d' })
}

function makeSafeUser(user: FullUser) {
  const { hash, salt, ...safeUser } = user
  return safeUser
}
