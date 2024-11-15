<template>
  <n-config-provider :locale="locale" :date-locale="dateLocale" :theme-overrides="cTheme">
    <n-dialog-provider>
      <slot v-if="isLoaded"/>
      <div v-else class="h-screen w-full flex justify-center items-center">
        <span class="loader"/>
      </div>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { ukUA, dateUkUA, type GlobalThemeOverrides, type NLocale, type NDateLocale } from 'naive-ui'

  const props = withDefaults(defineProps<{
    locale?: NLocale
    dateLocale?: NDateLocale,
    theme?: GlobalThemeOverrides,
    srrLoadingBarColor?: string
  }>(), {
    srrLoadingBarColor: '#6067B1',
    // @ts-ignore
    locale: ukUA,
    // @ts-ignore
    dateLocale: dateUkUA
  })

  const isLoaded = ref(false)
  const { themeUI } = useTheme()
  const cTheme = computed(() => ({...themeUI, ...props.theme}))

  onMounted(() => { isLoaded.value = true })

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
