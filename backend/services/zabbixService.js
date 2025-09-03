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

/**
 * Ambil item spesifik router (Ping, Loss, Latency, Uptime, Traffic)
 */
async function getRouterMetrics(token, hostId) {
  const items = await getItems(token, hostId)

  return {
    ping: items.find(i => i.key_ === "icmpping"),
    loss: items.find(i => i.key_ === "icmppingloss"),
    latency: items.find(i => i.key_ === "icmppingsec"),
    uptime: items.find(i => i.key_ === "system.uptime"),
    trafficIn: items.find(i => i.key_.startsWith("net.if.in")),
    trafficOut: items.find(i => i.key_.startsWith("net.if.out"))
  }
}

/**
 * Ambil history item
 * @param {string} token
 * @param {string} itemId
 * @param {number} history → 0 = numeric float, 1 = string, 3 = unsigned int
 */
async function getHistory(token, itemId, history = 3) {
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

async function postHistory(token, itemId, history = "" ) {
    const response = await axios.post( ZABBIX_URL, {}

    )
}

module.exports = { 
  login, 
  getHosts, 
  getItems, 
  getRouterMetrics, 
  getHistory 
}
