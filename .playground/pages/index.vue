<template>
  <div class="container mx-auto mt-5">
    <n-tabs type="line" animated default-value="todo" v-model:value="activeTab" @update:value="onTabChange">
      <n-tab-pane name="todo" tab="ToDo">
        <div style="width: fit-content;" class="flex flex-col">
          <div style="width: fit-content;">
            <c-input class="mr-4" type="string" :required="false" placeholder="Add a new todo" v-model="newTodo" />
            <n-button type="primary" class="mt-2" @click="addTodo()" :disabled="!newTodo">Add</n-button>
          </div>

          <ul v-if="todos.length" class="pt-1">
            <li v-for="todo in todos" :key="todo.id" class="flex justify-between mt-2">
              <div>
                <c-input type="checkbox" class="mr-3" v-model:checked="todo.done" @click="closeTodo(todo.id, todo.done)"/>
                <span :class="{'line-through': todo.done}">{{ todo.task }}</span>
              </div>
              <IFa6SolidTrash @click="removeTodo(todo.id)" class="cursor-pointer hover:text-danger-hover"/>
            </li>
          </ul>
          <n-empty v-else description="No todos here. Add one!" size="medium" class="inline-flex mt-4">
            <template #icon>
              <IFa6SolidList width="2.5rem" height="2.5rem"/>
            </template>
          </n-empty>
        </div>
      </n-tab-pane>
      <n-tab-pane name="reminder" tab="Reminder">
        <div style="width: fit-content;" class="flex flex-col">
          <div style="width: fit-content;">
            <c-input class="mr-4" type="string" :required="false" placeholder="Add a new reminder text" v-model="newReminderText" />
            <c-input class="mr-4" type="datetime" :required="true" placeholder="Add a new reminder time" v-model="newReminderTime" />
            <n-button type="primary" class="mt-2" @click="addReminder()" :disabled="!(newReminderText && newReminderTime)">Add</n-button>
          </div>

          <ul v-if="reminders.length" class="pt-1">
            <li v-for="rem in reminders" :key="rem.id" class="flex justify-between mt-2">
              <div>
                <span>{{ rem.task }}</span>
                <span class="ml-1">at <span class="font-bold">{{ rem.date.toLocaleString('uk-UA') }}</span></span>
              </div>
              <IFa6SolidTrash @click="removeReminder(rem.id)" class="cursor-pointer hover:text-danger-hover"/>
            </li>
          </ul>
          <n-empty v-else description="No reminders here. Add one!" size="medium" class="inline-flex mt-4">
            <template #icon>
              <IFa6SolidList width="2.5rem" height="2.5rem"/>
            </template>
          </n-empty>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
  const activeTab = ref('todo')
  const newTodo = ref('')
  const newReminderText = ref('')
  const newReminderTime = ref()
  const router = useRouter()
  const route = useRoute()

  const { data: todos, execute: executeTodos } = await api().todo.list({}, {  immediate: route.query.tab === 'todo' })
  const { data: reminders, execute: executeReminders } = await api().reminder.list({}, { immediate: route.query.tab === 'reminder' })

  async function onTabChange(tab: string ) {
    router.push({ query: { tab } })

    switch (tab) {
      case 'todo':
        await executeTodos({ _initial: true }); break
      case 'reminder':
        await executeReminders({ _initial: true }); break
    }
  }

  async function addTodo() {
    if(!newTodo.value) useMessage().error('Please add a todo')
    const { data: todo } = await api().todo.add({ task: newTodo.value, done: false })
    todos.value.push(todo.value)
    newTodo.value = ''
  }

  async function removeTodo(id: number) {
    const { data } = await api().todo.remove({ id })
    if(!data.value) return

    todos.value = todos.value.filter(t => t.id !== id)
  }

  async function closeTodo(id: number, done: boolean) {
    await api().todo.close({ id, done })
  }

  async function addReminder() {
    if(!(newReminderText.value && newReminderTime.value)) useMessage().error('Please add a reminder')
    const { data: reminder } = await api().reminder.add({ task: newReminderText.value, date: newReminderTime.value })
    reminders.value.push(reminder.value)
    newReminderText.value = ''
    newReminderTime.value = null
  }

  async function removeReminder(id: number) {
    const { data } = await api().reminder.remove({ id })
    if(!data.value) return

    reminders.value = reminders.value.filter(t => t.id !== id)
  }

</script>

<style lang="scss">

</style>
