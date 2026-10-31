import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── History ───────────────────────────────────────────────────
export const getHistory = (params = {}) =>
  api.get('/history/', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', limit: 200, ...params } })

export const getHistoryCount = (params = {}) =>
  api.get('/history/count', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', ...params } })

export const ingestBulk = (records) =>
  api.post('/history/bulk', { records })

export const clearHistory = (params = {}) =>
  api.delete('/history/', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', ...params } })

// ── Forecast ──────────────────────────────────────────────────
export const trainModel = (payload) =>
  api.post('/forecast/train', {
    tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT',
    target: 'transactions', test_size: 0.2,
    ...payload,
  })

export const predictDemand = (intervals, target = 'transactions') =>
  api.post('/forecast/predict', {
    tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT',
    target, intervals,
  })

export const getModelStatus = () =>
  api.get('/forecast/status', { params: { store_id: 'STORE-001', department_id: 'CHECKOUT', target: 'transactions' } })

export const getForecastResults = () =>
  api.get('/forecast/results', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', limit: 96 } })

// ── Staffing ──────────────────────────────────────────────────
export const calculateStaffing = (payload) =>
  api.post('/staffing/calculate', {
    tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', ...payload,
  })

export const getStaffingRecords = () =>
  api.get('/staffing/records', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', limit: 96 } })

// ── Variance ──────────────────────────────────────────────────
export const calculateVariance = (items) =>
  api.post('/variance/', {
    tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', items,
  })

// ── Recommendations ───────────────────────────────────────────
export const getRecommendations = (pendingOnly = false) =>
  api.get('/recommendations/', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', pending_only: pendingOnly } })

export const generateRecommendations = (intervals) =>
  api.post('/recommendations/', {
    tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT', intervals,
  })

export const approveRecommendation = (id) =>
  api.post('/recommendations/approve', { recommendation_id: id })

// ── Dashboard Stats ───────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/dashboard/stats', { params: { tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT' } })

// ── Seed (calls backend seed via a simple POST to /history/bulk) ──
export const seedDemoData = async () => {
  const base = new Date('2026-10-01T08:00:00Z')
  const records = []
  for (let day = 0; day < 14; day++) {
    for (let slot = 0; slot < 56; slot++) {  // 08:00 - 22:00 → 56 slots of 15min
      const dt = new Date(base.getTime() + day * 86400000 + slot * 900000)
      const hour = dt.getUTCHours()
      if (hour < 8 || hour >= 22) continue
      const dow = dt.getUTCDay()
      const isWeekend = dow === 0 || dow === 6
      const isPromo = dow === 5  // Friday
      let base_footfall = hour >= 15 && hour <= 18 ? 160 : hour >= 10 && hour <= 12 ? 110 : 60
      if (isWeekend) base_footfall = Math.floor(base_footfall * 1.35)
      const footfall = Math.max(5, base_footfall + Math.floor(Math.random() * 30 - 15))
      const transactions = Math.max(1, Math.floor(footfall * (0.3 + Math.random() * 0.2)))
      const sales = parseFloat((transactions * (350 + Math.random() * 300)).toFixed(2))
      records.push({
        tenant_id: 'demo', store_id: 'STORE-001', department_id: 'CHECKOUT',
        interval_start: dt.toISOString(),
        transactions, footfall, sales,
        is_holiday: false, promotion: isPromo,
        temperature: parseFloat((25 + Math.random() * 10).toFixed(1)),
        source: 'seeder',
      })
    }
  }
  // Send in batches of 200
  for (let i = 0; i < records.length; i += 200) {
    await ingestBulk(records.slice(i, i + 200))
  }
  return records.length
}

export default api
