<template>
  <n-config-provider :locale="props.locale" :date-locale="props.dateLocale">
    <n-dialog-provider>
      <slot/>
      {{ $appThemes }}
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { ukUA, type GlobalThemeOverrides } from 'naive-ui'

  const props = withDefaults(defineProps<{
    locale?: Record<string, unknown>
    dateLocale?: Record<string, unknown>
  }>(), {
    locale: () => ukUA,
    dateLocale: () => ukUA,
  })

  const { $appThemes } = useNuxtApp()
  console.log($appThemes);

</script>
