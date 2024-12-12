export function useAuth() {
  const signIn = async (data: Layer.SignIn) => {
    const user = await api().auth.signinAsync(data)

    if (user) {
      useState('user').value = user
      navigateTo({ path: '/' })
    }
  }

  const fetchSession = async () => {
    let userInfo = null
    try {
      userInfo = await api().auth.sessionAsync({})
    } catch (error) {
      console.log(error.status);

    }
    finally {
      useState('user').value = userInfo
    }
  }

  const signUp = async (data: Layer.SignUp) => api().auth.signupAsync(data)
  const signOut = async () => api().auth.signoutAsync({})

  const user = computed(() => useState('user').value)
  const isAuthenticated = computed(() => !!user.value)

  return { signIn, signUp, signOut, fetchSession, user, isAuthenticated }
}
