<template>
  <div>
    <h1>Zabbix Monitoring Dashboard</h1>
    <h2>Login ke Zabbix</h2>

    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')

const login = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/zabbix/login', {
      username: username.value,
      password: password.value
    })

    if (res.data.token) {
      alert('Login sukses! 🎉')
      localStorage.setItem('zabbixToken', res.data.token) // simpan token
      router.push('/dashboard') // redirect ke dashboard
    } else {
      alert('Login gagal ❌')
    }
  } catch (err) {
    alert('Login error ❌: ' + err.message)
  }
}
</script>
