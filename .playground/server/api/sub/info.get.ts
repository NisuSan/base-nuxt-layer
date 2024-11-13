type QueryArgs = { login: string, pasword: string }

export default defineEventHandler(async event => {
  //auth logic here
  return {
    name: 'User 1',
    role: 'admin',
    privileges: [1,2,3,4,5,6],
  }
})
