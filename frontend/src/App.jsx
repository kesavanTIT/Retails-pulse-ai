import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import DashboardOverview from './pages/DashboardOverview'
import DataIngestionPage from './pages/DataIngestionPage'
import ForecastingPage from './pages/ForecastingPage'
import StaffingSchedulePage from './pages/StaffingSchedulePage'
import VarianceAnalysisPage from './pages/VarianceAnalysisPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ManagerApprovalPage from './pages/ManagerApprovalPage'
import MCPAssistantPage from './pages/MCPAssistantPage'
import SettingsPage from './pages/SettingsPage'
import {
  getDashboardStats, getHistory, getForecastResults,
  getStaffingRecords, getRecommendations
} from './services/api'

const titleMap = {
  dashboard:       { title: 'Dashboard',             subtitle: 'Retail demand forecasting and workforce optimization' },
  ingestion:       { title: 'Data Ingestion',         subtitle: 'Upload historical sales, footfall and transaction data' },
  forecasting:     { title: 'Demand Forecast',        subtitle: 'XGBoost predicted sales, footfall and transactions' },
  staffing:        { title: 'Staffing & Schedule',    subtitle: 'Compare required FTE with scheduled headcount' },
  variance:        { title: 'Variance Analysis',      subtitle: 'Forecast accuracy and actual vs predicted comparison' },
  recommendations: { title: 'AI Recommendations',    subtitle: 'Staffing actions recommended by XGBoost demand model' },
  approval:        { title: 'Manager Approval',       subtitle: 'Review, approve or reject AI schedule recommendations' },
  assistant:       { title: 'MCP AI Assistant',       subtitle: 'Conversational AI for demand, staffing and scheduling' },
  settings:        { title: 'Settings',               subtitle: 'Configure integrations, ML parameters and API credentials' },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [forecasts, setForecasts] = useState([])
  const [staffing, setStaffing] = useState([])
  const [recommendations, setRecommendations] = useState([])

  const fetchAll = useCallback(async () => {
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
      console.error('App fetch error:', e)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, 30000)
    return () => clearInterval(timer)
  }, [fetchAll])

  const meta = titleMap[activeTab] || titleMap.dashboard

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} onRefresh={fetchAll} setActiveTab={setActiveTab} />
      case 'ingestion':
        return <DataIngestionPage history={history} onRefresh={fetchAll} setActiveTab={setActiveTab} />
      case 'forecasting':
        return <ForecastingPage stats={stats} history={history} forecasts={forecasts} onRefresh={fetchAll} />
      case 'staffing':
        return <StaffingSchedulePage staffing={staffing} onRefresh={fetchAll} setActiveTab={setActiveTab} />
      case 'variance':
        return <VarianceAnalysisPage />
      case 'recommendations':
        return <RecommendationsPage recommendations={recommendations} setActiveTab={setActiveTab} />
      case 'approval':
        return <ManagerApprovalPage onApproved={fetchAll} />
      case 'assistant':
        return <MCPAssistantPage onNavigateToApproval={() => setActiveTab('approval')} />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardOverview stats={stats} onRefresh={fetchAll} setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-shell">
        <TopNav
          activeTitle={meta.title}
          activeSubtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-content">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
