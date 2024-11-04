<template>
  <n-config-provider>
    <n-dialog-provider>
      <slot/>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { _text } from '#tw/theme/colors'
</script>
