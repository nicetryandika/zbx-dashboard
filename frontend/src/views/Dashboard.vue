<template>
  <div style="min-height: 100vh; background-color: #f5f5f5; font-family: Arial, sans-serif; color: #333;">
    <header style="background-color: white; padding: 20px; text-align: center; border-bottom: 2px solid #ddd;">
      <h1 style="font-size: 32px; font-weight: bold; color: #333; margin-bottom: 15px;">Welcome to Dashboard 🎯</h1>
      <div style="display: inline-block; background-color: #f0f0f0; padding: 10px 20px; border: 1px solid #ccc; border-radius: 5px;">
        <span style="font-weight: bold; color: #555; margin-right: 10px;">Token:</span>
        <span style="font-family: monospace; color: #0066cc; font-weight: bold;">{{ token }}</span>
      </div>
    </header>

    <main style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      <section style="background-color: white; padding: 20px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">Available Hosts</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px;">
          <div v-for="host in hosts" :key="host.id" style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 5px; text-align: center;">
            <h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px;">{{ host.name }}</h3>
            <button @click="loadData(host.hostid)" style="padding: 12px 24px; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; background-color: #0066cc; color: white;">
              Show Router Data
            </button>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; background-color: #e8f5e8; border: 1px solid #b8d4b8; border-radius: 5px;">
          <h2 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">Router MBJR</h2>
          <button @click="loadData(10771)" style="padding: 12px 24px; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase; background-color: #0066cc; color: white;">
            Show Router Data
          </button>
        </div>
      </section>

      <section style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">Router Data Chart</h3>
        <div>
          <canvas id="routerDataChart"></canvas>
        </div>
      </section>
      <section style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">Router Traffic Chart</h3>
        <div>
          <canvas id="routerTrafficDataChart"></canvas>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import Chart from "chart.js/auto";

const token = ref(localStorage.getItem("zabbixToken"));
const metrics = ref(null);
const hosts = ref(null);
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

const loadData = async (hostId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/router-data", {
      token: token.value,
      hostId: hostId,
    });
    metrics.value = res.data;
    createChart(metrics.value); // Create the chart after getting the data
  } catch (err) {
    alert("Failed to get router data: " + err.message);
  }
};

const createChart = (metricsData) => {
  const routerDataChartElement = document.getElementById("routerDataChart")
  var ctx = routerDataChartElement.getContext("2d");
  const routerTrafficDataChartElement = document.getElementById("routerTrafficDataChart")
  var trafficCtx = routerTrafficDataChartElement.getContext("2d");

  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
    }

    if (currentTrafficChart) {
    currentTrafficChart.destroy();
    currentTrafficChart = null;
    }

  currentChart = new Chart(ctx, {
    type: "line", // Change this based on chart type (line, bar, etc.)
    data: {
      labels: metricsData.ping.map((item) =>
        new Date(item.clock * 1000).toLocaleString()
      ),
      datasets: [
        {
          label: "Ping",
          data: metricsData.ping.map((item) => item.value),
          borderColor: "#0066cc",
          backgroundColor: "rgba(0, 102, 204, 0.2)",
          fill: true,
        },
        {
          label: "Packet Loss",
          data: metricsData.loss.map((item) => item.value),
          borderColor: "#ff6347",
          backgroundColor: "rgba(255, 99, 71, 0.2)",
          fill: true,
        },
        {
          label: "Latency",
          data: metricsData.latency.map((item) => item.value),
          borderColor: "#32cd32",
          backgroundColor: "rgba(50, 205, 50, 0.2)",
          fill: true,
        },
      ],
    },
    options: {
        responsive: true,
        scales: {
          x: {
            type: "category",
            title: {
              display: true,
              text: "Time"
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Value"
            }
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      },
  });

  currentTrafficChart = new Chart(trafficCtx, {
    type: "line", // Change this based on chart type (line, bar, etc.)
    data: {
      labels: metricsData.ping.map((item) =>
        new Date(item.clock * 1000).toLocaleString()
      ),
      datasets: [
        {
        label: "Traffic In (ms)",
        data: metricsData.trafficIn.map((item) => item.value * 1000),
        borderColor: "#ff8c00",
        backgroundColor: "rgba(255, 140, 0, 0.2)",
        fill: true,
        },
        {
        label: "Traffic Out (ms)",
        data: metricsData.trafficOut.map((item) => item.value * 1000),
        borderColor: "#9932cc",
        backgroundColor: "rgba(153, 50, 204, 0.2)",
        fill: true,
        },
      ],
    },
    options: {
        responsive: true,
        scales: {
          x: {
            type: "category",
            title: {
              display: true,
              text: "Time"
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Value"
            }
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      },
  });
};
</script>
