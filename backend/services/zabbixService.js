const axios = require('axios')

const ZABBIX_URL = "http://localhost:8080/api_jsonrpc.php"

/**
 * Login ke Zabbix → return token
 */
async function login(username, password) {
  const response = await axios.post(ZABBIX_URL, {
    jsonrpc: "2.0",
    method: "user.login",
    params: { username, password },
    id: 1
  }, {
    headers: { "Content-Type": "application/json-rpc" }
  })

  if (response.data.error) throw new Error(response.data.error.data)
  return response.data.result
}

/**
 * Ambil daftar host khusus router (MBJR, BBNM, DPJE, SBJE, PHYE)
 */
async function getHosts(token) {
  const response = await axios.post(ZABBIX_URL, {
    jsonrpc: "2.0",
    method: "host.get",
    params: {
      output: ["hostid", "name"],
      filter: {
        host: ["MBJR", "BBNM", "DPJE", "SBJE", "PHYE"]
      }
    },
    id: 2
  }, {
    headers: {
      "Content-Type": "application/json-rpc",
      "Authorization": `Bearer ${token}`
    }
  })

  if (response.data.error) throw new Error(response.data.error.data)
  return response.data.result
}

/**
 * Ambil semua item dari host
 */
async function getItems(token, hostId) {
  const response = await axios.post(ZABBIX_URL, {
    jsonrpc: "2.0",
    method: "item.get",
    params: {
      output: ["itemid", "name", "key_"],
      hostids: hostId
    },
    id: 3
  }, {
    headers: {
      "Content-Type": "application/json-rpc",
      "Authorization": `Bearer ${token}`
    }
  })

  if (response.data.error) throw new Error(response.data.error.data)
  return response.data.result
}

// Mapping hostId ke index interface (disesuaikan router kamu)
const interfaceIndexMap = {
  "10771": 8, // MBJR
  "10772": 3, // BBNM
  "10773": 2, // DPJE == lan to mbjr
  "10774": 1, // SBJE == lan to dpkeje
  "10775": 5  // PHYE
};

/**
 * Ambil metric dasar (Ping, Loss, Latency, Uptime)
 */
async function getRouterDataBasic(token, hostId) {
  const items = await getItems(token, hostId);

  const metrics = [
    { key: "icmpping", name: "ping", history: 0 },
    { key: "icmppingloss", name: "loss", history: 0 },
    { key: "icmppingsec", name: "latency", history: 0 },
    { key: "uptime", name: "uptime", history: 3 }
  ];

  return metrics.reduce((acc, { key, name, history }) => {
    // pakai includes biar lebih fleksibel
    const item = items.find(i => i.key_.includes(key));
    acc[name] = item ? { ...item, history } : null;
    return acc;
  }, {});
}

/**
 * Ambil metric traffic (In/Out)
 */
async function getRouterDataTraffic(token, hostId) {
  const items = await getItems(token, hostId);
  const ifaceIndex = interfaceIndexMap[String(hostId)];

  if (!ifaceIndex) {
    console.warn(`⚠️ Tidak ada mapping interface index untuk hostId ${hostId}`);
    return {};
  }

  const metrics = [
    { key: `net.if.in[ifHCInOctets.${ifaceIndex}]`, name: "trafficIn", history: 3 },
    { key: `net.if.out[ifHCOutOctets.${ifaceIndex}]`, name: "trafficOut", history: 3 }
  ];

  return metrics.reduce((acc, { key, name, history }) => {
    // pakai includes biar tetap ketemu walau key ada variasi
    const item = items.find(i => i.key_.includes(key));
    acc[name] = item ? { ...item, history } : null;
    return acc;
  }, {});
}

/**
 * Ambil history item
 */
async function getHistory(token, itemId, history = null) {
  const response = await axios.post(ZABBIX_URL, {
    jsonrpc: "2.0",
    method: "history.get",
    params: {
      output: "extend",
      history,
      itemids: itemId,
      sortfield: "clock",
      sortorder: "DESC",
      limit: 20
    },
    id: 4
  }, {
    headers: {
      "Content-Type": "application/json-rpc",
      "Authorization": `Bearer ${token}`
    }
  })

  if (response.data.error) throw new Error(response.data.error.data)
  return response.data.result
}

module.exports = { 
  login, 
  getHosts, 
  getItems, 
  getHistory,
  getRouterDataBasic,
  getRouterDataTraffic
}
