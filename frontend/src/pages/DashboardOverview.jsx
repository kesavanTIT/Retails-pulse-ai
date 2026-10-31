import { useState } from 'react'
import {
  Users, ShoppingCart, Clock, TrendingUp,
  ArrowUp, ArrowDown, ChevronDown, Lightbulb,
  CheckCircle2, XCircle, Plus, Bot, Send, Calendar,
  ArrowRight
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { Chart, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend
)

/* ── Shared chart theme ──────────────────────────────────────── */
const chartFont = { family: 'Plus Jakarta Sans', size: 11, weight: '500' }
const tooltipDefaults = {
  backgroundColor: '#0f172a',
  titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
  bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
  padding: 10,
  cornerRadius: 8,
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
}

export default function DashboardOverview({ stats, onRefresh, setActiveTab }) {
  const [chatInput, setChatInput]   = useState('')
  const [approvalDone, setApprovalDone] = useState(false)
  const [addedSlots, setAddedSlots] = useState({})
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1, from: 'user',
      text: 'Show me the forecast and staffing recommendation for tomorrow evening.',
    },
    {
      id: 2, from: 'bot',
      header: 'Evening Rush Advisory (16:00 – 20:00)',
      timeWindow: '06 Oct 2026',
      metrics: [
        { label: 'Predicted Sales', val: '₹42,800', note: '+18% vs LW' },
        { label: 'Expected Footfall', val: '680 guests', note: 'Peak 180/hr' },
        { label: 'Required Staff', val: '9 Staff', note: 'Formula FTE' },
        { label: 'Labor Gap', val: '+4 Needed', note: '5 scheduled', isAlert: true },
      ],
      showChart: true,
    },
  ])

  /* ── KPI values ─────────────────────────────────────────────── */
  const kpiSales    = stats?.total_history_rows
    ? `₹${(stats.total_history_rows * 160).toLocaleString('en-IN')}` : '₹1,24,560'
  const kpiTx       = stats?.total_history_rows
    ? Math.round(stats.total_history_rows * 2.3).toLocaleString('en-IN') : '1,842'
  const kpiFootfall = stats?.total_history_rows
    ? Math.round(stats.total_history_rows * 3.8).toLocaleString('en-IN') : '2,980'

  /* ── Demand Chart ───────────────────────────────────────────── */
  const demandLabels = ['08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00']
  const demandData = {
    labels: demandLabels,
    datasets: [
      {
        type: 'bar', label: 'Actual Sales',
        data: [1200, 2400, 3100, 2200, 4800, 6200, 4100, 1500],
        backgroundColor: '#60a5fa', borderRadius: 5, barThickness: 14,
      },
      {
        type: 'bar', label: 'Predicted Sales',
        data: [1300, 2600, 3300, 2400, 5100, 6500, 4300, 1600],
        backgroundColor: '#a78bfa', borderRadius: 5, barThickness: 14,
      },
      {
        type: 'line', label: 'Customer Footfall',
        data: [55, 105, 150, 90, 185, 225, 160, 65],
        borderColor: '#34d399', backgroundColor: '#34d399',
        borderWidth: 2, tension: 0.4, pointRadius: 4, yAxisID: 'yF',
      },
    ],
  }

  const demandOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'start',
        labels: { boxWidth: 10, font: chartFont, padding: 14 } },
      tooltip: tooltipDefaults,
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#f0f4f8' }, ticks: { font: { size: 10 }, callback: v => `${v/1000}K` } },
      yF: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  }

  /* ── Staffing Chart ─────────────────────────────────────────── */
  const staffLabels = ['08','10','12','14','16','18','20','22']
  const staffData = {
    labels: staffLabels,
    datasets: [
      { label: 'Required', data: [3,5,7,6,9,10,7,3],
        backgroundColor: '#3b82f6', borderRadius: 5, barThickness: 13 },
      { label: 'Scheduled', data: [3,4,6,6,7,7,6,3],
        backgroundColor: '#c4b5fd', borderRadius: 5, barThickness: 13 },
    ],
  }

  const staffOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'start',
        labels: { boxWidth: 10, font: chartFont, padding: 14 } },
      tooltip: tooltipDefaults,
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#f0f4f8' }, ticks: { stepSize: 2, font: { size: 10 } }, beginAtZero: true },
    },
  }

  /* ── Mini Chart (Assistant Panel) ──────────────────────────── */
  const miniData = {
    labels: ['16:00','17:00','18:00','19:00','20:00'],
    datasets: [
      { label: 'Required', data: [7,9,10,8,6],
        backgroundColor: '#3b82f6', borderRadius: 3, barThickness: 9 },
      { label: 'Scheduled', data: [5,6,6,5,5],
        backgroundColor: '#93c5fd', borderRadius: 3, barThickness: 9 },
    ],
  }
  const miniOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } }, y: { display: false, beginAtZero: true } },
  }

  /* ── Table rows ─────────────────────────────────────────────── */
  const rows = [
    { t: '08:00 – 09:00', sales: '4,200', ff: 80,  tx: 45,  req: 3,  sched: 3,  gap: 0 },
    { t: '09:00 – 10:00', sales: '5,600', ff: 110, tx: 70,  req: 4,  sched: 4,  gap: 0 },
    { t: '10:00 – 11:00', sales: '6,800', ff: 130, tx: 85,  req: 5,  sched: 4,  gap: 1 },
    { t: '11:00 – 12:00', sales: '8,200', ff: 160, tx: 100, req: 6,  sched: 5,  gap: 1 },
    { t: '12:00 – 13:00', sales: '9,500', ff: 180, tx: 120, req: 7,  sched: 6,  gap: 1 },
    { t: '13:00 – 14:00', sales: '7,800', ff: 150, tx: 90,  req: 6,  sched: 6,  gap: 0 },
    { t: '14:00 – 15:00', sales: '6,400', ff: 120, tx: 75,  req: 5,  sched: 5,  gap: 0 },
    { t: '15:00 – 16:00', sales: '8,900', ff: 170, tx: 110, req: 7,  sched: 6,  gap: 1 },
  ]

  /* ── Chat send ──────────────────────────────────────────────── */
  const handleSend = (textInput) => {
    const textToSend = typeof textInput === 'string' ? textInput : chatInput
    if (!textToSend || !textToSend.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text: textToSend }
    setChatMessages(p => [...p, userMsg])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(p => [
        ...p,
        {
          id: Date.now() + 1,
          from: 'bot',
          header: `Advisory: ${textToSend.slice(0, 24)}...`,
          timeWindow: 'Real-time XGBoost',
          metrics: [
            { label: 'Peak Hour', val: '17:00 – 18:00', note: 'Demand Surge' },
            { label: 'Expected Footfall', val: '180 / hr', note: 'Checkout Load' },
            { label: 'Optimal Staff', val: '10 Staff', note: '98% Coverage' },
            { label: 'Roster Action', val: '+3 Cashiers', note: 'UKG Write-back', isAlert: true },
          ],
          showChart: false,
        }
      ])
    }, 450)
  }

  return (
    <div className="space-y-5 fade-up">
      {/* ══ ROW 1 — KPI CARDS ══════════════════════════════════════ */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div>
            <div className="kpi-label">Total Sales</div>
            <div className="kpi-value">{kpiSales}</div>
            <div className="kpi-badge up"><ArrowUp size={10} /> 12% vs last week</div>
          </div>
          <div className="kpi-icon-wrap blue"><Users size={18} /></div>
        </div>

        <div className="kpi-card green">
          <div>
            <div className="kpi-label">Total Transactions</div>
            <div className="kpi-value">{kpiTx}</div>
            <div className="kpi-badge up"><ArrowUp size={10} /> 8% vs last week</div>
          </div>
          <div className="kpi-icon-wrap green"><ShoppingCart size={18} /></div>
        </div>

        <div className="kpi-card purple">
          <div>
            <div className="kpi-label">Avg. Footfall</div>
            <div className="kpi-value">{kpiFootfall}</div>
            <div className="kpi-badge up"><ArrowUp size={10} /> 15% vs last week</div>
          </div>
          <div className="kpi-icon-wrap purple"><TrendingUp size={18} /></div>
        </div>

        <div className="kpi-card amber">
          <div>
            <div className="kpi-label">Recommended Staff</div>
            <div className="kpi-value">25</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                Currently Scheduled: 20
              </span>
              <span className="badge badge-amber">+5</span>
            </div>
          </div>
          <div className="kpi-icon-wrap amber"><Clock size={18} /></div>
        </div>
      </div>

      {/* ══ ROW 2 — ANALYTICS & COPILOT (BALANCED 2-COLUMN) ════════ */}
      <div className="dashboard-grid-main">
        {/* Left: 2 Charts Side-by-Side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Chart 1: Demand Forecast */}
          <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Demand Forecast (Next 24 Hours)</div>
                <div className="card-subtitle">Actual vs Predicted Demand Curve</div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                background: '#f8fafc', border: '1px solid #e4e9f2', borderRadius: 8,
                fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer'
              }}>
                Sales & Footfall <ChevronDown size={11} />
              </div>
            </div>
            <div style={{ height: 230 }}>
              <Chart type="bar" data={demandData} options={demandOpts} />
            </div>
          </div>

          {/* Chart 2: Staffing Requirement */}
          <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Staffing Requirement</div>
                <div className="card-subtitle">Required FTE vs Scheduled Coverage</div>
              </div>
              <span className="badge badge-blue">
                CHECKOUT SHIFT
              </span>
            </div>
            <div style={{ height: 230 }}>
              <Bar data={staffData} options={staffOpts} />
            </div>
          </div>
        </div>

        {/* Right: AI Copilot Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 420, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#ffffff', flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 30, height: 30,
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)', color: 'white'
              }}>
                <Bot size={15} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="card-title" style={{ fontSize: 13 }}>RetailPulse Copilot</span>
                  <span className="badge badge-purple" style={{ fontSize: 9, padding: '1px 5px' }}>MCP AI</span>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                  XGBoost Advisory
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('assistant')}
              title="Open full-screen AI chat"
              style={{
                fontSize: 10.5, fontWeight: 700, color: '#2563eb', background: '#eff6ff',
                border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 7px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
              }}
            >
              Full View <ArrowRight size={10} />
            </button>
          </div>

          {/* Chat Body */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex',
            flexDirection: 'column', gap: 10, background: '#fcfdfe'
          }}>
            {chatMessages.map(msg => {
              if (msg.from === 'user') return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: '#2563eb', color: 'white',
                    fontSize: 11, fontWeight: 500, lineHeight: 1.45,
                    padding: '7px 11px', borderRadius: '11px 11px 2px 11px',
                    maxWidth: '88%', boxShadow: '0 2px 4px rgba(37,99,235,0.15)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              )

              return (
                <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, background: '#f5f3ff', border: '1px solid #ddd6fe',
                    borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2, color: '#7c3aed'
                  }}>
                    <Bot size={12} />
                  </div>

                  <div style={{
                    background: 'white', border: '1px solid #e4e9f2',
                    borderRadius: '2px 11px 11px 11px', padding: '11px',
                    fontSize: 11, color: '#334155', lineHeight: 1.45,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)', width: '100%'
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 11.5 }}>
                        {msg.header || 'Advisory Insights'}
                      </span>
                      <span className="badge badge-amber" style={{ fontSize: 8.5 }}>
                        {msg.timeWindow || '16:00 – 20:00'}
                      </span>
                    </div>

                    {/* 2x2 Grid */}
                    {msg.metrics ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                        {msg.metrics.map((m, mi) => (
                          <div
                            key={mi}
                            style={{
                              background: m.isAlert ? '#fef2f2' : '#f8fafc',
                              border: m.isAlert ? '1px solid #fee2e2' : '1px solid #eef2f6',
                              padding: '6px 8px', borderRadius: 7
                            }}
                          >
                            <div style={{ fontSize: 9, color: m.isAlert ? '#dc2626' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                              {m.label}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: m.isAlert ? '#dc2626' : '#0f172a', marginTop: 1 }}>
                              {m.val}
                            </div>
                            <div style={{ fontSize: 9, color: m.isAlert ? '#ef4444' : '#64748b', fontWeight: 500 }}>
                              {m.note}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Mini Chart */}
                    {msg.showChart && (
                      <div style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: 7, border: '1px solid #eef2f6', marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                            Hourly FTE Gap (16:00 – 20:00)
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 2.5, fontSize: 8.5, color: '#475569', fontWeight: 600 }}>
                              <span style={{ width: 5, height: 5, background: '#3b82f6', borderRadius: 1.5 }}></span> Req
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 2.5, fontSize: 8.5, color: '#475569', fontWeight: 600 }}>
                              <span style={{ width: 5, height: 5, background: '#93c5fd', borderRadius: 1.5 }}></span> Sched
                            </span>
                          </div>
                        </div>
                        <div style={{ height: 55 }}>
                          <Bar data={miniData} options={miniOpts} />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => setActiveTab('approval')}
                      className="btn btn-primary btn-xs"
                      style={{ width: '100%', justifyContent: 'center', gap: 4, padding: '5px 8px' }}
                    >
                      Review & Approve Shift in Approvals <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Prompts */}
          <div style={{
            padding: '5px 12px', background: 'white', borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 5, overflowX: 'auto'
          }}>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>Quick:</span>
            {[
              'Friday Peak Hours',
              'Explain Variance',
              'Labor Gap Advisory',
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                style={{
                  fontSize: 10, fontWeight: 600, color: '#475569', background: '#f1f5f9',
                  border: '1px solid #e2e8f0', borderRadius: 9999, padding: '2px 7px',
                  whiteSpace: 'nowrap', cursor: 'pointer'
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{ padding: '8px 11px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 6, background: 'white', flexShrink: 0 }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask RetailPulse Copilot anything..."
              style={{
                flex: 1, padding: '7px 10px', background: '#f8fafc',
                border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 11,
                color: '#1e293b', outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend()}
              className="btn btn-primary"
              style={{ padding: '0 10px', height: 31, borderRadius: 7 }}
              title="Send"
            >
              <Send size={12} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ ROW 3 — OPERATIONAL INSIGHTS & ACTIONS (3 BALANCED COLUMNS) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Card 1: Forecast vs Actual Variance */}
        <div className="card card-body">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Forecast vs Actual Variance</div>
              <div className="card-subtitle">Model prediction accuracy metrics</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e4e9f2' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MAPE</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>8.2%</div>
              <span className="badge badge-green" style={{ marginTop: 6 }}>Good</span>
            </div>
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e4e9f2' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variance</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ArrowDown size={14} color="#3b82f6" /> -5.6%
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 500, marginTop: 6 }}>Below forecast</div>
            </div>
          </div>
        </div>

        {/* Card 2: Top Peak Hours (Predicted) */}
        <div className="card card-body">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-title">Top Peak Hours (Predicted)</div>
              <div className="card-subtitle">High footfall volume intervals</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { rank: 1, time: '17:00 – 18:00', tag: 'High',   tagClass: 'badge-red',   count: 180 },
              { rank: 2, time: '16:00 – 17:00', tag: 'High',   tagClass: 'badge-red',   count: 165 },
              { rank: 3, time: '12:00 – 13:00', tag: 'Medium', tagClass: 'badge-amber', count: 120 },
            ].map(p => (
              <div key={p.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 20, height: 20, background: '#2563eb', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 10, fontWeight: 800, flexShrink: 0
                  }}>{p.rank}</div>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{p.time}</span>
                </div>
                <span className={`badge ${p.tagClass}`}>{p.tag}</span>
                <span style={{ fontWeight: 600, color: '#64748b' }}>{p.count} cust.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Manager Approval Quick Action Card */}
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, background: '#fef2f2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <Users size={13} />
                </div>
                <div>
                  <div className="card-title" style={{ fontSize: 13 }}>Manager Approval</div>
                  <div style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 600 }}>CHECKOUT DEPT</div>
                </div>
              </div>
              <span className={`badge ${approvalDone ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 9.5 }}>
                {approvalDone ? 'Approved' : 'Action Required'}
              </span>
            </div>

            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.45, marginBottom: 10 }}>
              XGBoost recommends adding <strong>4 checkout staff</strong> for evening demand spike.
            </p>

            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e4e9f2', borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Additional Staff</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>+4 Staff</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Time Window</span>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} color="#94a3b8" /> 16:00 – 20:00
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!approvalDone ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-xs"
                onClick={() => setApprovalDone(true)}
              >
                Reject
              </button>
              <button
                className="btn btn-primary btn-xs"
                onClick={() => { setApprovalDone(true); onRefresh?.() }}
              >
                Approve & Update UKG
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7,
              fontSize: 11, fontWeight: 700, color: '#16a34a'
            }}>
              <CheckCircle2 size={13} color="#16a34a" />
              Approved & Synced to UKG Pro WFM
            </div>
          )}
        </div>
      </div>

      {/* ══ ROW 4 — HOURLY FORECAST & STAFFING DETAILS TABLE (FULL WIDTH) ══ */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">Hourly Forecast & Staffing Details</div>
            <div className="card-subtitle">FTE Formula: Workload × Mins/Unit ÷ Interval (Synced with UKG Pro WFM)</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            border: '1px solid #e4e9f2', borderRadius: 8, fontSize: 11, fontWeight: 600,
            color: '#64748b', background: '#f8fafc', cursor: 'pointer'
          }}>
            <Calendar size={12} color="#94a3b8" />
            06 Oct 2026
            <ChevronDown size={11} color="#94a3b8" />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Predicted Sales (₹)</th>
                <th>Footfall</th>
                <th>Transactions</th>
                <th>Required Staff</th>
                <th>Scheduled Staff</th>
                <th>Variance</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const done = addedSlots[r.t]
                const gap  = done ? 0 : r.gap
                const sch  = done ? r.req : r.sched
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#1e293b' }}>{r.t}</td>
                    <td style={{ fontFamily: 'monospace' }}>{r.sales}</td>
                    <td style={{ fontFamily: 'monospace' }}>{r.ff}</td>
                    <td style={{ fontFamily: 'monospace' }}>{r.tx}</td>
                    <td style={{ fontWeight: 700, color: '#1d4ed8', fontFamily: 'monospace' }}>{r.req}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sch}</td>
                    <td>
                      {gap > 0
                        ? <span style={{ fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>+{gap}</span>
                        : <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>0</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {gap > 0 ? (
                        <button
                          onClick={() => setAddedSlots(p => ({ ...p, [r.t]: true }))}
                          className="btn btn-xs"
                          style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontWeight: 700 }}
                        >
                          <Plus size={11} /> Add Staff
                        </button>
                      ) : (
                        <span className="badge badge-green">
                          <CheckCircle2 size={10} /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
