import db from '../../db.service'

type QueryArgs = { id: number; done: boolean }

export default defineEventHandler(async event => {
  const todo = (await readBody(event)) as QueryArgs
  return db('todo').update(todo)
})
