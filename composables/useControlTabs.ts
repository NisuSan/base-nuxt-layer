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

  /**
   * @function whenQuery - Check if the current tab is equal to the given tab in the query
   * @param {string} val - The value to compare
   * @returns {boolean} Whether the current tab is equal to the given tab
   */
  const whenQuery = (val: string): boolean => route.query.tab === val

  /**
   * @function whenParam - Check if the current tab is equal to the given tab in the route params
   * @param {string} val - The value to compare
   * @returns {boolean} Whether the current tab is equal to the given tab
   */
  const whenParam = (val: string): boolean => route.params.tab === val

  /**
   * @function when - Check if the current tab is equal to the given tab in either the query or params
   * @param {string} type - The type of route to check, either 'query' or 'params'
   * @param {string} val - The value to compare
   * @returns {boolean} Whether the current tab is equal to the given tab
   */
  const when = (type: 'query' | 'params', val: string): boolean => route[type].tab === val

  return { activeTab, onTabChange, whenQuery, whenParam, when }
}
