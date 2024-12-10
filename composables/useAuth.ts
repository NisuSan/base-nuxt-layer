export async function useAuth() {
  const signIn = async (data: Layer.SignIn) => {
    const { data: user, error } = await api().auth.signin(data)
    if(error) throw error

    if(user.value) {
      useState('user').value = user.value
      navigateTo({ path: '/' })
    }
  }
  const signUp = async (data: Layer.SignUp) => {
    const { data: user, error } = await api().auth.signup(data)
    if(error) throw error

    return user.value
  }

}
