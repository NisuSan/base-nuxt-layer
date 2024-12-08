<template>
  <div>
    <n-button type="primary" @click="login">Login</n-button>
  </div>
</template>

<script setup lang="ts">
  async function login() {
    const { data: user } = await api().auth.signin({login: 'admin', password: 'password'})
    console.log(user)
  }
</script>
