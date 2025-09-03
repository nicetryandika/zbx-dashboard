const express = require('express')
const router = express.Router()
const zabbixService = require('../services/zabbixService')

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const token = await zabbixService.login(username, password)
    res.json({ token })
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET HOSTS (filter router MBJR, BBNM, DPJE, SBJE, PHYE)
router.post('/hosts', async (req, res) => {
  try {
    const { token } = req.body
    const hosts = await zabbixService.getHosts(token)
    res.json(hosts)
  } catch (err) {
    console.error("Get hosts error:", err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET ROUTER DATA (Ping, Loss, Latency, Traffic, Uptime)
router.post('/router-data', async (req, res) => {
  try {
    const { token, hostId } = req.body
    const items = await zabbixService.getRouterMetrics(token, hostId)

    const data = {}
    for (let [key, item] of Object.entries(items)) {
      if (item) {
        data[key] = await zabbixService.getHistory(token, item.itemid, 3)
      }
    }

    res.json(data)
  } catch (err) {
    console.error("Get router data error:", err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
