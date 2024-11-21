import { NTabs } from 'naive-ui'

export function useControlTabs(defaultTab: string, executableFunction: Record<string, Function> = {}) {
  const activeTab = ref('')
  const router = useRouter()
  const route = useRoute()

  activeTab.value = (route.query.tab as string) || defaultTab

  const onTabChange = () => {
    router.push({ query: { tab: activeTab.value } })
    executableFunction[activeTab.value] && executableFunction[activeTab.value]?.()
  }

  const whenQuery = (val: string) => route.query.tab === val
  const whenParam = (val: string) => route.params.tab === val
  const when = (type: 'query' | 'params', val: string) => route[type].tab === val

  return { activeTab, onTabChange, whenQuery, whenParam, when }
}
