<template>
  <div>
    <n-button type="primary" @click="signIn({ login: 'admin', password: 'admin' })">Login</n-button>
    {{ isAuthenticated }}<br>
    {{ user }}
  </div>
</template>

<script setup lang="ts">
  const { isAuthenticated, user, signIn } = useAuth()
</script>
