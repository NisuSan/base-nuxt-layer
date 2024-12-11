type TLit = 'signin' | 'signup' | 'signout' | 'session'
type RequestData<T> = T extends 'signin'
  ? Layer.SignIn
  : T extends 'signup'
    ? Layer.SignUp
    : T extends 'signout'
      ? undefined
      : T extends 'session'
        ? undefined
        : never

type ResponseData<T> = T extends 'signin'
  ? Layer.User
  : T extends 'signup'
    ? boolean
    : T extends 'signout'
      ? boolean
      : T extends 'session'
        ? Layer.User
        : never

export function useAuth() {
  const signIn = async (data: Layer.SignIn) => {
    const user = await baseApiCall('signin', data)
    console.log(user);


    // if (user) {
    //   useState('user').value = user
    //   navigateTo({ path: '/' })
    // }
  }

  const fetchSession = async () => {
    let userInfo = null
    try {
      userInfo = await baseApiCall('session', undefined)
    } catch (error) {}
    finally {
      useState('user').value = userInfo
    }
  }

  const signUp = async (data: Layer.SignUp) => baseApiCall('signup', data)
  const signOut = async () => baseApiCall('signout', undefined)

  const user = computed(() => useState('user').value)
  const isAuthenticated = computed(() => !!user.value)

  return { signIn, signUp, signOut, fetchSession, user, isAuthenticated }
}

async function baseApiCall<T extends TLit>(fn: T, data: RequestData<T>): Promise<ResponseData<T>> {
  // @ts-expect-error the type signature is the same but T has additional literal text 'auth.'
  const { data: result, error } = await api().auth[fn](data)
  if (error) throw error

  // @ts-expect-error the type signature is the same but T has additional literal text 'auth.'
  return result.value
}
