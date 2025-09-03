<template>
  <div>
    <h1>Welcome to Dashboard 🎯</h1>
    <p>Token: {{ token }}</p>

    <h2>Router MBJR</h2>
    <button @click="loadData">Tampilkan Data Router</button>

    <div v-if="metrics">
      <h3>Hasil Data Router</h3>
      <table border="1" cellpadding="6">
        <thead>
          <tr>
            <th>Metrik</th>
            <th>Nilai Terbaru</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ping</td>
            <td>{{ lastValue(metrics.ping) }}</td>
            <td>{{ lastTime(metrics.ping) }}</td>
          </tr>
          <tr>
            <td>Packet Loss (%)</td>
            <td>{{ lastValue(metrics.loss) }}</td>
            <td>{{ lastTime(metrics.loss) }}</td>
          </tr>
          <tr>
            <td>Latency (ms)</td>
            <td>{{ lastValue(metrics.latency) }}</td>
            <td>{{ lastTime(metrics.latency) }}</td>
          </tr>
          <tr>
            <td>Traffic In (bytes)</td>
            <td>{{ lastValue(metrics.trafficIn) }}</td>
            <td>{{ lastTime(metrics.trafficIn) }}</td>
          </tr>
          <tr>
            <td>Traffic Out (bytes)</td>
            <td>{{ lastValue(metrics.trafficOut) }}</td>
            <td>{{ lastTime(metrics.trafficOut) }}</td>
          </tr>
          <tr>
            <td>Uptime (detik)</td>
            <td>{{ lastValue(metrics.uptime) }}</td>
            <td>{{ lastTime(metrics.uptime) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"

const token = ref(localStorage.getItem("zabbixToken"))
const metrics = ref(null)

const loadData = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data", {
      token: token.value,
      hostId: "10771"   // ⚠️ ganti dengan hostid MBJR di sistemmu
    })
    metrics.value = res.data
  } catch (err) {
    alert("Gagal ambil data router: " + err.message)
  }
}

const lastValue = (arr) => {
  if (!arr || arr.length === 0) return "-"
  return arr[0].value
}

const lastTime = (arr) => {
  if (!arr || arr.length === 0) return "-"
  return new Date(arr[0].clock * 1000).toLocaleString()
}
</script>
