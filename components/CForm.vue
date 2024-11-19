<template>
  <form class="c-form">
    <slot :formErrors="formErrors" :status="status"></slot>
  </form>
</template>

<script setup lang="ts">
  const formErrors = ref<{ el: HTMLElement, message: Ref<string> }[]>([])
  const status = computed<Layer.InputStatus>(() => formErrors.value.some(d => d.message) ? 'error' : 'success')

  provide('formErrors', formErrors)
</script>
