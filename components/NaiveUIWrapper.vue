<template>
  <n-config-provider :locale="props.locale" :date-locale="props.dateLocale" :theme-overrides="props.theme">
    <n-dialog-provider>
      <slot v-if="isLoaded"/>
      <div v-else class="h-screen w-full flex justify-center items-center">
        <span class="loader"/>
      </div>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { ukUA, type GlobalThemeOverrides } from 'naive-ui'

  const props = withDefaults(defineProps<{
    locale?: Record<string, unknown>
    dateLocale?: Record<string, unknown>,
    theme?: ComputedRef<GlobalThemeOverrides>,
    srrLoadingBarColor?: string
  }>(), {
    locale: () => ukUA,
    dateLocale: () => ukUA,
    theme: () => themeUI,
    srrLoadingBarColor: '#6067B1'
  })

  const isLoaded = ref(false)
  onMounted(() => { isLoaded.value = true })

</script>

<script lang="ts">
  const { themeUI } = useTheme()
  export default {}
</script>

<style lang="scss" scoped>
.loader {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  position: relative;
  animation: rotate 1s linear infinite;

  &::before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    inset: 0px;
    border-radius: 50%;
    border: 5px solid;
    border-color: v-bind(srrLoadingBarColor);
    animation: prixClipFix 2s linear infinite;
  }
}

@keyframes rotate {
  100% {transform: rotate(360deg)}
}

@keyframes prixClipFix {
  0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}
  25%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
  50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
  75%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
  100% {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)}
}
</style>
