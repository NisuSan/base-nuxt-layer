<template>
  <div class="container mx-auto mt-5 relative">
    <n-tabs type="line" animated default-value="todo" v-model:value="activeTab" @update:value="onTabChange">
      <n-tab-pane name="todo" tab="ToDo">
        <div style="width: fit-content;" class="flex flex-col">
          <div style="width: fit-content;">
            <c-input class="mr-4" type="string" :validation="false" :required="false" placeholder="Add a new todo" v-model="newTodo" />
            <n-button type="primary" class="todo-add mt-2" @click="addTodo()" :disabled="!newTodo">Add</n-button>
          </div>

          <ul v-if="todos.length" class="todo-list pt-1">
            <li v-for="todo in todos" :key="todo.id" class="flex justify-between mt-2">
              <div>
                <c-input type="checkbox" class="mr-3" v-model:checked="todo.done" @click="closeTodo(todo.id, todo.done)"/>
                <span :class="{'line-through': todo.done}">{{ todo.task }}</span>
              </div>
              <IFa6SolidTrash @click="removeTodo(todo.id)" class="todo-remove cursor-pointer hover:text-danger-hover"/>
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
            <c-input class="mr-4" type="string" :validation="false" :required="false" placeholder="Add a new reminder text" v-model="newReminderText" />
            <c-input class="mr-4" type="datetime" :required="true" placeholder="Add a new reminder time" v-model="newReminderTime" />
            <n-button type="primary" class="reminder-add mt-2" @click="addReminder()" :disabled="!(newReminderText && newReminderTime)">Add</n-button>
          </div>

          <ul v-if="reminders.length" class="reminder-list pt-1">
            <li v-for="rem in reminders" :key="rem.id" class="flex justify-between mt-2">
              <div>
                <span>{{ rem.task }}</span>
                <span class="ml-1">at <span class="font-bold">{{ rem.date.toLocaleString('uk-UA') }}</span></span>
              </div>
              <IFa6SolidTrash @click="removeReminder(rem.id)" class="reminder-remove cursor-pointer hover:text-danger-hover"/>
            </li>
          </ul>
          <n-empty v-else description="No reminders here. Add one!" size="medium" class="inline-flex mt-4">
            <template #icon>
              <IFa6SolidList width="2.5rem" height="2.5rem"/>
            </template>
          </n-empty>
        </div>
      </n-tab-pane>
      <n-tab-pane name="files" tab="Files">
        <div style="width: fit-content;" class="flex flex-col">
          <div style="width: fit-content;">
            <input type="file" @input="handleFileInput" />
            <n-button type="primary" class="files-upload mt-2" :disabled="files.length === 0" @click="uploadFiles()">Upload</n-button>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
    <div class="toggle-theme cursor-pointer p-2 border border-main-brand rounded inline-block absolute -top-1 right-2" @click="toggleTheme()">
      <IFa6SolidSun v-if="themeName === 'dark'" width="1.1rem" height="1.1rem" class="toggle-theme-sun"/>
      <IFa6SolidMoon v-else width="1.1rem" height="1.1rem" class="toggle-theme-moon"/>
    </div>
  </div>
</template>

<script setup lang="ts">
const newTodo = ref('')
const newReminderText = ref('')
const newReminderTime = ref()
const { themeName, toggleTheme } = useTheme()

const { activeTab, onTabChange, whenQuery } = useControlTabs('todo', {
  todo: async () => await executeTodos({ _initial: true }),
  reminder: async () => await executeReminders({ _initial: true }),
})

const { data: todos, execute: executeTodos } = api().todo.list({}, { immediate: whenQuery('todo') })
const { data: reminders, execute: executeReminders } = api().reminder.list({}, { immediate: whenQuery('reminder') })
const { handleFileInput, files } = useFileStorage({ clearOldFiles: true })

async function addTodo() {
  if (!newTodo.value) useMessage().error('Please add a todo')
  const todo = await api().todo.addAsync({ task: newTodo.value, done: false })
  todos.value.push(todo)
  newTodo.value = ''
}

async function removeTodo(id: number) {
  const data = await api().todo.removeAsync({ id })
  if (!data) return

  todos.value = todos.value.filter(t => t.id !== id)
}

async function closeTodo(id: number, done: boolean) {
  await api().todo.closeAsync({ id, done })
}

async function addReminder() {
  if (!(newReminderText.value && newReminderTime.value)) useMessage().error('Please add a reminder')

  const reminder = await api().reminder.addAsync({ task: newReminderText.value, date: newReminderTime.value })
  reminders.value.push(reminder)

  newReminderText.value = ''
  newReminderTime.value = null
}

async function removeReminder(id: number) {
  const data = await api().reminder.removeAsync({ id })
  if (!data) return

  reminders.value = reminders.value.filter(t => t.id !== id)
}

async function uploadFiles() {
  const data = await api().uploadAsync(files.value)
  console.log(data);

}
</script>

<style lang="scss">
  [theme=dark] .toggle-theme {
    svg {
      color: theme('colors.yellow.500');
    }

    &:hover {
      svg {
        color: theme('colors.yellow.400');
      }
    }
  }

  [theme=light] .toggle-theme {
    svg {
      color: theme('colors.text');
    }

    &:hover {
      background-color: theme('colors.main-brand');
      svg {
        color: white;
      }
    }
  }
</style>
