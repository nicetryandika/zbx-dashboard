const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const zabbixRoutes = require('./routes/zabbix')
app.use('/api/zabbix', zabbixRoutes)   // ✅ penting

const PORT = 5000
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`))
