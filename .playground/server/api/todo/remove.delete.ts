import db from '../../db.service'

type QueryArgs = { id: number }

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event) as QueryArgs
  return db('todo').remove(id)
})
