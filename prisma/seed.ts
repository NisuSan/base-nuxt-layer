import { type Prisma, PrismaClient } from '@prisma/client'
import { greenBright, blue } from 'ansis'

const prisma = new PrismaClient()

async function main() {
  const decapitalize = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

  const usersData: Prisma.Enumerable<Prisma.UserCreateManyInput> = [
    {
      id: 1,
      roleId: 2,
      hash: 'wtfisgoinghere',
      login: 'worker',
      salt: 'wtfisgoinghere',
    },
  ]

  const profilesData: Prisma.Enumerable<Prisma.ProfileCreateManyInput> = [
    {
      id: 1,
      userId: 1,
      first_name: 'Worker',
      last_name: 'Worker',
      middle_name: 'Worker',
    },
  ]

  const rolesData: Prisma.Enumerable<Prisma.RoleCreateManyInput> = [
    {
      id: 1,
      name: 'Розробник',
      description: 'Максимальні права на весь функціонал програми, включаючи тестові функції',
      privileges: [],
    },
    {
      id: 2,
      name: 'Робот',
      description: 'Призначено для скриптових задач',
      privileges: [],
    },
    {
      id: 3,
      name: 'Адміністратор',
      description: 'Призначено для працівніків енергоменеджменту',
      privileges: [],
    },
    {
      id: 4,
      name: 'Субабонент',
      description: 'Призначено для клієнтів купуючих електроенергію',
      privileges: [],
    },
  ]

  /*Collect all preknown tables in one place*/
  const data: Partial<Record<Prisma.ModelName, Prisma.Enumerable<NonNullable<unknown>>>> = {
    Role: rolesData,
    User: usersData,
    Profile: profilesData,
  }

  /*Call <createMany> method for cpllected data */
  for (const d of Object.entries(data)) {
    console.info(`${blue('ℹ')} Adding data to the ${d[0]} table..`)
    // biome-ignore lint/suspicious/noExplicitAny: for prisma we can't infer right type
    await (prisma as any)[decapitalize(d[0])].createMany({ data: d[1], skipDuplicates: true })
  }
}

main()
  .then(async () => {
    console.info(`${greenBright('✔')} All tables was filled.`)
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
