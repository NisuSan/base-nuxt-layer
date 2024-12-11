<template>
  <div>
    <n-button type="primary" @click="sign">Login</n-button>
    {{ isAuthenticated }}<br>
    {{ user }}
  </div>
</template>

<script setup lang="ts">
  const { isAuthenticated, user, signIn } = useAuth()
  async function sign() {
    const d = await api().auth.signin({ login: 'admin', password: 'admin' })
    console.log(d);

  }
</script>
