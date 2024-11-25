import db from '../../db.service'

export default defineEventHandler(async event => {
  return db('todo').get()
})
