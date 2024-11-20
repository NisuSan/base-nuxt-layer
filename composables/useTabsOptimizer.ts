export function useTabsOptimizer(tabsComponent: Ref<any>, defaultTab: string, executableFunction: Record<string, Function> = {}) {
  const activeTab = ref(defaultTab)


  watch(
    tabsComponent,
    (newInstance) => {
      if (newInstance) {
        newInstance['default-value'] = defaultTab
        newInstance['v-model:value'] = activeTab
        newInstance['@update:value'] =
      }
    },
    { immediate: true }
  );
}
