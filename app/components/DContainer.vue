<template>
  <div class="grid mx-auto w-full" :style="[gridStyle, { columnGap: props.gapX, rowGap: props.gapY, gap: props.gap, }]">
    <slot/>
  </div>
</template>

<script setup lang="ts">
  type Props = {
    minColumns?: number,
    maxColumns?: number,
    gap?: string,
    gapX?: string,
    gapY?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    minColumns: 2,
    maxColumns: 4,
    gap: '1rem'
  })

  const { width } = useWindowSize()
  const childCount = (useSlots()?.default?.({}) || []).length

  const gridStyle = computed(() => {
    let c = Math.min(props.maxColumns, Math.max(props.minColumns, childCount))

    if (width.value < 640) c = 1
    else if (width.value < 768) c = Math.min(c, 2)

    return `grid-template-columns: repeat(${c}, minmax(0, 1fr))`
  })
</script>
