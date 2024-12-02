

export function useAuth() {
  const {data} = api().auth.signin()
}

/**
 * Manages the user state by initializing it with a default value of null.
 * If the user state already has a value, it is returned.
 * Otherwise, it returns a cookie-based user state.
 *
 * @returns {Ref<Layer.User | null>} A reference to the user state or cookie-based user data.
 */
export function useUser(): Ref<Layer.User | null> {
  const user = useState<Layer.User | null>('user', () => null)
  if(user.value) return user

  return useCookie<Layer.User>('user')
}
