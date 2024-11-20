import db from '../../db.service'

type QueryArgs = Omit<Reminder, 'id'>

export default defineEventHandler(async (event) => {
  const reminder = await readBody(event) as QueryArgs
  return db('reminder').add(reminder)
})
