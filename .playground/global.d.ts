declare global {
  interface BaseEntity {
    id: number
  }
  type ToDo = BaseEntity & { task: string; done: boolean }
  type Reminder = BaseEntity & { task: string; date: Date }
}

export {}
