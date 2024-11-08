<template>
  <NaiveUIWrapper>
    <!-- <div class="h-5 bg-slate-400">
      <span class="to-blue-400">ghgfhfh</span>
    </div> -->
    <IFa6RegularCircleStop/>
    <div v-validation="info">
      <c-input type="string" validation="string-cyrillic"/>
      <c-input type="string" validation="string-cyrillic"/>
      <c-input type="string" validation="string-cyrillic"/>
    </div>
    {{ info }}
    <!-- <n-button type="primary" @click="refresh()">Default</n-button>
    {{ data }} -->
  </NaiveUIWrapper>
</template>

<script setup lang="ts">
  const info = reactive({ errors: [], state: '' })
</script>
