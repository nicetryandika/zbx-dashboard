<template>
  <div style="min-height: 100vh; background-color: #f5f5f5; font-family: Arial, sans-serif; color: #333;">
    <!-- Header -->
    <header style="background-color: white; padding: 20px; text-align: center; border-bottom: 2px solid #ddd;">
      <h1 style="font-size: 32px; font-weight: bold; color: #333; margin-bottom: 15px;">
        Dashboard Monitoring
      </h1>
      <div
        style="display: inline-block; background-color: #f0f0f0; padding: 10px 20px; border: 1px solid #ccc; border-radius: 5px;"
      >
        <span style="font-weight: bold; color: #555; margin-right: 10px;">Token:</span>
        <span style="font-family: monospace; color: #0066cc; font-weight: bold;">{{ token }}</span>
      </div>
    </header>

    <main style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      <!-- Hosts -->
      <section
        style="background-color: white; padding: 20px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px;"
      >
        <h2
          style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;"
        >
          Available Hosts
        </h2>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; justify-items: center;"
        >
          <div
            v-for="host in hosts"
            :key="host.id"
            style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 5px; text-align: center; width: 250px;"
          >
            <h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px;">
              {{ host.name }}
            </h3>

            <button
              @click="loadBasicData(host.hostid)"
              style="padding: 8px 16px; margin: 5px; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; background-color: #28a745; color: white;"
            >
              Tampilkan PACKETLOSS
            </button>

            <button
              @click="loadLatencyData(host.hostid)"
              style="padding: 8px 16px; margin: 5px; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; background-color: #ff9900; color: white;"
            >
              Tampilkan Latency
            </button>

            <button
              @click="loadTrafficData(host.hostid)"
              style="padding: 8px 16px; margin: 5px; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; background-color: #0066cc; color: white;"
            >
              Tampilkan Traffic
            </button>
          </div>
        </div>
      </section>

      <!-- Chart Data Basic -->
      <section
        v-if="showBasicChart"
        style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"
      >
        <h3 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">
          Router Packet Loss
        </h3>
        <div>
          <canvas id="routerDataChart"></canvas>
        </div>
      </section>

      <!-- Chart Data Latency -->
      <section
        v-if="showLatencyChart"
        style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"
      >
        <h3 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">
          Router Latency
        </h3>
        <div>
          <canvas id="routerDataLatencyChart"></canvas>
        </div>
      </section>

      <!-- Chart Traffic -->
      <section
        v-if="showTrafficChart"
        style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"
      >
        <h3 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">
          Router Traffic
        </h3>
        <div>
          <canvas id="routerTrafficDataChart"></canvas>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import axios from "axios";
import Chart from "chart.js/auto";

const token = ref(localStorage.getItem("zabbixToken"));
const metrics = ref(null);
const hosts = ref([]);

const showBasicChart = ref(false);
const showTrafficChart = ref(false);
const showLatencyChart = ref(false); // ✅ konsisten

// util konversi bytes → Mbps
const bytesToMbps = (value) => (parseFloat(value || 0) * 8) / (1000 * 1000);

let currentChart = null;         // dipakai untuk MRTG & Latency
let currentTrafficChart = null;  // khusus traffic

// Ambil daftar host saat mount
onMounted(async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/hosts", {
      token: token.value,
    });
    hosts.value = res.data || [];
  } catch (err) {
    alert("Failed to get router data: " + err.message);
  }
});

const loadBasicData = async (hostId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data-basic", {
      token: token.value,
      hostId,
    });
    metrics.value = res.data;

    showBasicChart.value = true;
    showLatencyChart.value = false;
    showTrafficChart.value = false;

    await nextTick();
    createBasicChart(metrics.value);
  } catch (err) {
    alert("Failed to get basic router data: " + err.message);
  }
};

const loadLatencyData = async (hostId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data-latency", {
      token: token.value,
      hostId,
    });
    metrics.value = res.data;

    showBasicChart.value = false;
    showLatencyChart.value = true;
    showTrafficChart.value = false;

    await nextTick();
    createLatencyChart(metrics.value);
  } catch (err) {
    alert("Failed to get latency router data: " + err.message);
  }
};

const loadTrafficData = async (hostId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data-traffic", {
      token: token.value,
      hostId,
    });
    metrics.value = res.data;

    showBasicChart.value = false;
    showLatencyChart.value = false;
    showTrafficChart.value = true;

    await nextTick();
    createTrafficChart(metrics.value);
  } catch (err) {
    alert("Failed to get traffic router data: " + err.message);
  }
};

/* =========================
   Chart Builders
   ========================= */

const createBasicChart = (metricsData) => {
  const el = document.getElementById("routerDataChart");
  const ctx = el?.getContext("2d");

  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
  if (!metricsData || !ctx) return;

  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: (metricsData.ping || []).map((i) =>
        new Date(i.clock * 1000).toLocaleString()
      ),
      datasets: [
        {
          label: "Ping",
          data: (metricsData.ping || []).map((i) => parseFloat(i.value)),
          borderColor: "#0066cc",
          backgroundColor: "rgba(0, 102, 204, 0.2)",
          fill: true,
        },
        {
          label: "Packet Loss",
          data: (metricsData.loss || []).map((i) => parseFloat(i.value)),
          borderColor: "#ff6347",
          backgroundColor: "rgba(255, 99, 71, 0.2)",
          fill: true,
        },
        
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "category", title: { display: true, text: "Time" } },
        y: { beginAtZero: true, title: { display: true, text: "Value" } },
      },
      plugins: { legend: { display: true, position: "top" } },
    },
  });
};

const createLatencyChart = (metricsData) => {
  const el = document.getElementById("routerDataLatencyChart");
  const ctx = el?.getContext("2d");

  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
  if (!metricsData || !ctx) return;

  const lat = metricsData.latency || [];
  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: lat.map((i) => new Date(i.clock * 1000).toLocaleString()),
      datasets: [
        {
          label: "Latency (ms)",
          data: lat.map((i) => parseFloat(i.value)),
          borderColor: "#32cd32",
          backgroundColor: "rgba(50, 205, 50, 0.2)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "category", title: { display: true, text: "Time" } },
        y: { beginAtZero: true, title: { display: true, text: "ms" } },
      },
      plugins: { legend: { display: true, position: "top" } },
    },
  });
};

const createTrafficChart = (metricsData) => {
  const el = document.getElementById("routerTrafficDataChart");
  const ctx = el?.getContext("2d");

  if (currentTrafficChart) {
    currentTrafficChart.destroy();
    currentTrafficChart = null;
  }
  if (!metricsData || !ctx) return;

  currentTrafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: (metricsData.trafficIn || []).map((i) =>
        new Date(i.clock * 1000).toLocaleString()
      ),
      datasets: [
        {
          label: "Download (Mbps)",
          data: (metricsData.trafficIn || []).map((i) => bytesToMbps(i.value)),
          borderColor: "#ff8c00",
          backgroundColor: "rgba(255, 140, 0, 0.2)",
          fill: true,
        },
        {
          label: "Upload (Mbps)",
          data: (metricsData.trafficOut || []).map((i) => bytesToMbps(i.value)),
          borderColor: "#9932cc",
          backgroundColor: "rgba(153, 50, 204, 0.2)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "category", title: { display: true, text: "Time" } },
        y: { beginAtZero: true, title: { display: true, text: "Mbps" } },
      },
      plugins: { legend: { display: true, position: "top" } },
    },
  });
};
</script>
