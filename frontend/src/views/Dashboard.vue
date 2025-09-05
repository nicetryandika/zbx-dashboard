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
              Tampilkan MRTG
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

      <!-- Chart Basic -->
      <section
        v-if="showBasicChart"
        style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;"
      >
        <h3 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">
           Router MRTG
        </h3>
        <div>
          <canvas id="routerDataChart"></canvas>
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
import { onMounted, ref } from "vue";
import axios from "axios";
import Chart from "chart.js/auto";

const token = ref(localStorage.getItem("zabbixToken"));
const metrics = ref(null);
const hosts = ref(null);

const showBasicChart = ref(false);
const showTrafficChart = ref(false);

// UPDATE: fungsi konversi
const bytesToMbps = (value) => (parseFloat(value) * 8) / (1000 * 1000);

let currentChart = null;
let currentTrafficChart = null;

onMounted(async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/hosts", {
      token: token.value,
    });
    hosts.value = res.data;
  } catch (err) {
    alert("Failed to get router data: " + err.message);
  }
});

const loadBasicData = async (hostId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data-basic", {
      token: token.value,
      hostId
    });
    metrics.value = res.data;
    showBasicChart.value = true;
    showTrafficChart.value = false;
    createBasicChart(metrics.value);
  } catch (err) {
    alert("Failed to get basic router data: " + err.message);
  }
};

const loadTrafficData = async (hostId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data-traffic", {
      token: token.value,
      hostId
    });
    metrics.value = res.data;
    showBasicChart.value = false;
    showTrafficChart.value = true;
    createTrafficChart(metrics.value);
  } catch (err) {
    alert("Failed to get traffic router data: " + err.message);
  }
};

const createBasicChart = (metricsData) => {
  const routerDataChartElement = document.getElementById("routerDataChart");
  const ctx = routerDataChartElement?.getContext("2d");

  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }

  if (!metricsData) return;

  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: metricsData.ping
        ? metricsData.ping.map((item) => new Date(item.clock * 1000).toLocaleString())
        : [],
      datasets: [
        {
          label: "Ping",
          data: metricsData.ping ? metricsData.ping.map((item) => parseFloat(item.value)) : [],
          borderColor: "#0066cc",
          backgroundColor: "rgba(0, 102, 204, 0.2)",
          fill: true,
        },
        {
          label: "Packet Loss",
          data: metricsData.loss ? metricsData.loss.map((item) => parseFloat(item.value)) : [],
          borderColor: "#ff6347",
          backgroundColor: "rgba(255, 99, 71, 0.2)",
          fill: true,
        },
        {
          label: "Latency",
          data: metricsData.latency ? metricsData.latency.map((item) => parseFloat(item.value)) : [],
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
        y: { beginAtZero: true, title: { display: true, text: "Value" } },
      },
      plugins: { legend: { display: true, position: "top" } },
    },
  });
};

const createTrafficChart = (metricsData) => {
  const routerTrafficDataChartElement = document.getElementById("routerTrafficDataChart");
  const trafficCtx = routerTrafficDataChartElement?.getContext("2d");

  if (currentTrafficChart) {
    currentTrafficChart.destroy();
    currentTrafficChart = null;
  }

  if (!metricsData) return;

 // Traffic Chart
currentTrafficChart = new Chart(trafficCtx, {
  type: "line",
  data: {
    labels: metricsData.trafficIn.map((item) =>
      new Date(item.clock * 1000).toLocaleString()
    ),
    datasets: [
      {
        label: "Download (Mbps)", // UPDATE
        data: metricsData.trafficIn.map((item) => bytesToMbps(item.value)), // UPDATE
        borderColor: "#ff8c00",
        backgroundColor: "rgba(255, 140, 0, 0.2)",
        fill: true,
      },
      {
        label: "Upload (Mbps)", // UPDATE
        data: metricsData.trafficOut.map((item) => bytesToMbps(item.value)), // UPDATE
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
      y: { beginAtZero: true, title: { display: true, text: "Mbps" } }, // UPDATE
    },
    plugins: { legend: { display: true, position: "top" } },
  },
});

};
</script>