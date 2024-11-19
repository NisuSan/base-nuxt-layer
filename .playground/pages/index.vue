<template>
  <div class="container mx-auto mt-5">
    <n-tabs type="line" animated>
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
        reminder
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
  const newTodo = ref('')
  const { data: todos } = await api().todo.list()

  async function addTodo() {
    if(!newTodo.value) useMessage().error('Please add a todo')
    const { data: todo } = await api().todo.add({ task: newTodo.value, done: false })
    todos.value.push(todo.value)
  }

  async function removeTodo(id: number) {
    const { data } = await api().todo.remove({ id })
    if(!data.value) return

    todos.value = todos.value.filter(t => t.id !== id)
  }

  async function closeTodo(id: number, done: boolean) {
    const { data: todo } = await api().todo.close({ id, done })
  }
</script>

<style lang="scss">

</style>
