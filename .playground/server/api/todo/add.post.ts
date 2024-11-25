import db from '../../db.service'

type QueryArgs = Omit<ToDo, 'id'>

export default defineEventHandler(async event => {
  const todo = (await readBody(event)) as QueryArgs
  return db('todo').add(todo)
})
