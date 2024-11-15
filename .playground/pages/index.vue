<template>
  <div class="container mx-auto mt-5">
    <div class="flex justify-center">
      <div class="menu-btn mr-6" :class="{'active': tab === 'todo'}" @click="tab = 'todo'">TO Do List</div>
      <div class="menu-btn" :class="{'active': tab === 'reminder'}" @click="tab = 'reminder'">Reminder</div>
    </div>
    <div v-if="tab === 'todo'" id="todo" class="flex flex-col items-center mt-5">
      <div class="mb-4">
        <c-input class="inline-block mr-4" type="string" placeholder="Add a new todo" />
        <n-button type="primary" class="mt-2">Add</n-button>
      </div>

      <ul v-if="todos.length">

      </ul>
      <n-empty v-else description="No todos here. Add one!" size="huge" class="inline-flex w-2/5 py-4 border-main-brand border rounded">
        <template #icon>
          <IFa6SolidList width="3.3rem" height="3.3rem"/>
        </template>
      </n-empty>
    </div>
    <div v-else id="reminder">

    </div>
  </div>
</template>

<script setup lang="ts">
  const tab = ref('todo')
  const todos = ref([])
</script>

<style lang="scss">
  .menu-btn {
    @apply text-xl font-bold cursor-pointer py-2 px-3 border-text border rounded hover:border-main-brand;

    &.active {
      @apply border-main-brand;
    }
  }
</style>
