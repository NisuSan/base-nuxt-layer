import Joi from 'joi'
import { sign } from 'jsonwebtoken'
import { pbkdf2Sync, randomBytes, randomInt } from 'node:crypto'
import cyrillicToTranslit from 'cyrillic-to-translit-js'

type FullUser = { salt: string, hash: string } & Layer.User

/**
 * Authenticates a user by validating login credentials and generating a JWT.
 *
 * This function retrieves login credentials from the request body, validates
 * them against the database, and generates a JSON Web Token (JWT) if the
 * credentials are correct. It sets the JWT in a cookie to maintain the user's
 * session. If the user is not found or the credentials are incorrect, an error
 * is thrown.
 *
 * @augments Layer.SignIn accessing with `useData('body')`
 *
 * @throws `NuxtError` If the user is not found or the password is incorrect.
 * @returns {Promise<Layer.User>} A safe user object excluding sensitive information.
 */
export async function useSignin(): Promise<Layer.User> {
  const input = await useData<Layer.SignIn>('body', {
    login: Joi.string().alphanum().min(3).max(16).required(),
    password: Joi.string().alphanum().min(3).max(16).required()
  })

  const user = await usePrisma().user.findUnique({ select: {
    id: true,
    hash: true,
    salt: true,
    roleId: true,
    privileges: true,
    profile: { select: { firstName: true, lastName: true, middleName: true } }
  }, where: { login: input.login } })
  if(user === null) throw createError({ message: 'User not found', statusCode: 404 })

  const { password } = await readBody(useEvent())
  const encryptedHash = pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')

  if(user.hash !== encryptedHash.toString()) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  setCookie(useEvent(), 'Authorization', generateJwt(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    maxAge: useRuntimeConfig().baseLayer.auth.jwtExpiresIn,
    path: '/'
  })
  return makeSafeUser(user)
}

/**
 * Handles the user signup process by validating the input data,
 * checking for existing users, and creating a new user record.
 *
 * This function retrieves signup data from the request body,
 * validates it using specified Joi schemas, and checks if a user
 * with the same login and profile already exists in the database.
 * If not, it creates a new user with the provided details.
 *
 * @augments Layer.SignUp accessing with `useData('body')`
 *
 * @throws `NuxtError` If the user already exists or creation fails.
 * @returns {Promise<boolean>} True if the user is successfully created.
 */
export async function useSignup(): Promise<boolean> {
  const kind = useRuntimeConfig().baseLayer.auth.signupKind
  const nameValidator = Joi.string().pattern(/^[\u0400-\u04FF']+$/).required()

  const input = await useData<Layer.SignUp>('body', {
    mail: Joi.string().pattern(/^[a-z]{3,}@kp-kvk\.dp\.ua$/s).email().required(),
    privileges: Joi.array().items(Joi.number()).required(),
    roleId: Joi.number().required(),
    profile: Joi.object({ firstName: nameValidator, lastName: nameValidator, middleName: nameValidator }),
    ...( kind === 'extended' ? {
      login: Joi.string().alphanum().min(3).max(16).required(),
      password: Joi.string().alphanum().min(3).max(16).required(),
      repeatedPasword: Joi.ref('password')
    } : { })
  })

  const login = cyrillicToTranslit({ preset: 'uk' }).transform(useInitialFromFullName(input.profile, 'auth').toLowerCase())
  if(await usePrisma().user.findFirst({ where: {
    login,
    profile: { some: {
      firstName: input.profile[0]?.firstName,
      lastName:  input.profile[0]?.lastName,
      middleName:  input.profile[0]?.middleName
    }
  }}})) throw createError({ message: 'User already exists', statusCode: 409 })

  const salt = randomBytes(128).toString('base64')
  const hash = pbkdf2Sync(input.password ?? generatePassword(), salt, 10000, 512, 'sha512').toString('hex')

  const user = await usePrisma().user.create({ select: { id: true }, data: {
    login,
    hash,
    salt,
    roleId: input.roleId,
    privileges: input.privileges,
    profile: { create: { ...input.profile, email: input.mail } }
  }})

  if(user.id === null) throw createError({ message: 'User not created', statusCode: 500 })
  return true
}

export function useSignout() {
  const event = useEvent()
  // TODO: remove cookie
}

function generateJwt(user: Layer.User) {
  const runtimeConfig = useRuntimeConfig()
  return sign({id: user.id, privileges: user.privileges, roleId: user.roleId, scope: ['accsess', 'user'] }, runtimeConfig.baseLayer.auth.jwtSecret, { expiresIn: '1d' })
}

function makeSafeUser(user: FullUser) {
  const { hash, salt, ...safeUser } = user
  return safeUser
}

function generatePassword(length = 6) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charsetLength = charset.length
  let password = ''

  for (let i = 0; i < length; i++)  password += charset[randomInt(0, charsetLength)]
  return password
}
