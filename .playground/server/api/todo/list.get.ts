import db from '../../db.service'

type QueryArgs = {  }

export default defineEventHandler(async (event) => {
  return db('todo').get()
})
