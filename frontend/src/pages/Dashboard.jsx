import { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import KPICards from '../components/KPICards'
import DemandForecastChart from '../components/DemandForecastChart'
import StaffingGrid from '../components/StaffingGrid'
import RecommendationsPanel from '../components/RecommendationsPanel'
import DemoController from '../components/DemoController'
import {
  getDashboardStats, getHistory, getForecastResults,
  getStaffingRecords, getRecommendations,
} from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [forecasts, setForecasts] = useState([])
  const [staffing, setStaffing] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, h, f, st, r] = await Promise.allSettled([
        getDashboardStats(),
        getHistory({ limit: 96 }),
        getForecastResults(),
        getStaffingRecords(),
        getRecommendations(),
      ])
      if (s.status === 'fulfilled') setStats(s.value.data)
      if (h.status === 'fulfilled') setHistory(h.value.data)
      if (f.status === 'fulfilled') setForecasts(f.value.data)
      if (st.status === 'fulfilled') setStaffing(st.value.data)
      if (r.status === 'fulfilled') setRecommendations(r.value.data)
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header stats={stats} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <KPICards stats={stats} loading={loading} />

        {/* Demand Forecast Chart */}
        <DemandForecastChart history={history} forecasts={forecasts} />

        {/* Staffing + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StaffingGrid records={staffing} />
          <RecommendationsPanel recommendations={recommendations} onApproved={fetchAll} />
        </div>

        {/* Demo Controller */}
        <DemoController onRefresh={fetchAll} />
      </main>
    </div>
  )
}
