<template>
  <div class="container mx-auto mt-5">
    <n-tabs type="line" animated>
      <n-tab-pane name="todo" tab="ToDo">
        <div style="width: fit-content;" class="flex flex-col">
          <div style="width: fit-content;">
            <c-input class="mr-4" type="string" placeholder="Add a new todo" v-model="newTodo" />
            <n-button type="primary" class="mt-2" @click="() => { todos.push({ id: todos.length + 1, task: newTodo, done: false }); newTodo = '' }" :disabled="!newTodo">Add</n-button>
          </div>

          <ul v-if="todos.length" class="pt-1">
            <li v-for="todo in todos" :key="todo.id" class="flex justify-between mt-2">
              <div>
                <c-input type="checkbox" v-model:checked="todo.done" class="mr-3"/>
                <span :class="{'line-through': todo.done}">{{ todo.task }}</span>
              </div>
              <IFa6SolidTrash @click="() => todos = todos.filter(t => t.id !== todo.id)" class="cursor-pointer hover:text-danger-hover"/>
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
  const { data: todos } = api().todo.getList()
</script>

<style lang="scss">

</style>
