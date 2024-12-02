export default defineAuthHandler('signin', async event => {
  return {
    id: 1,
    roleId: 1,
    privileges: [1, 2, 3, 4, 5, 6],
    firstName: '',
    lastName: '',
    middleName: '',
    hash: '',
    salt: ''
  }
})
