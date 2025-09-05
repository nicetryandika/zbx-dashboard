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

// GET HOSTS
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

// GET ROUTER DATA BASIC (Ping, Loss, Latency, Uptime)
router.post('/router-data-basic', async (req, res) => {
  try {
    const { token, hostId } = req.body;
    const items = await zabbixService.getRouterDataBasic(token, hostId);

    const data = await Promise.all(
      Object.entries(items).map(async ([key, item]) => {
        if (!item) return [key, []];
        const historyData = await zabbixService.getHistory(token, item.itemid, item.history);
        return [key, historyData];
      })
    );

    res.json(Object.fromEntries(data));
  } catch (err) {
    console.error("Get router basic data error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET ROUTER DATA TRAFFIC (Traffic In/Out)
router.post('/router-data-traffic', async (req, res) => {
  try {
    const { token, hostId } = req.body;
    const items = await zabbixService.getRouterDataTraffic(token, hostId);

    const data = await Promise.all(
      Object.entries(items).map(async ([key, item]) => {
        if (!item) return [key, []];
        const historyData = await zabbixService.getHistory(token, item.itemid, item.history);
        return [key, historyData];
      })
    );

    res.json(Object.fromEntries(data));
  } catch (err) {
    console.error("Get router traffic data error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router
