import { useState } from 'react'
import {
  Calendar, CheckCircle2, Clock, UserPlus,
  AlertTriangle, Check, X, ShieldCheck, ArrowRight,
  TrendingUp, Users, RefreshCw, Zap
} from 'lucide-react'
import { approveRecommendation } from '../services/api'

export default function ManagerApprovalPage({ onApproved }) {
  const [selectedDate, setSelectedDate] = useState('06 Oct 2026')
  const [isApproved, setIsApproved] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [syncStatus, setSyncStatus] = useState('')

  const handleApprove = async () => {
    setSubmitting(true)
    setSyncStatus('Pushing schedule update to UKG Pro WFM via Boomi Integration...')
    try {
      try {
        await approveRecommendation(101)
      } catch (e) {
        // demo fallback
      }
      setIsApproved(true)
      setSyncStatus('Schedule successfully approved! Headcount updated in UKG Pro WFM.')
      onApproved?.()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = () => {
    setIsRejected(true)
    setSyncStatus('Recommendation rejected. Existing UKG roster preserved.')
  }

  return (
    <div className="space-y-6 fade-up">
      {/* ─── Top Stats Row ─── */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div>
            <div className="kpi-label">Pending Approval</div>
            <div className="kpi-value">{isApproved || isRejected ? '0' : '1'}</div>
            <span className={`kpi-badge ${isApproved || isRejected ? 'green' : 'warn'}`}>
              {isApproved || isRejected ? 'All cleared' : 'Action required'}
            </span>
          </div>
          <div className="kpi-icon-wrap blue">
            <UserPlus size={18} />
          </div>
        </div>

        <div className="kpi-card green">
          <div>
            <div className="kpi-label">UKG Pro WFM Sync</div>
            <div className="kpi-value" style={{ fontSize: '20px', marginTop: '10px' }}>Active</div>
            <span className="kpi-badge up">
              <CheckCircle2 size={10} /> Live Connector
            </span>
          </div>
          <div className="kpi-icon-wrap green">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="kpi-card purple">
          <div>
            <div className="kpi-label">Schedule Compliance</div>
            <div className="kpi-value">98.4%</div>
            <span className="kpi-badge up">
              <TrendingUp size={10} /> +1.2% this week
            </span>
          </div>
          <div className="kpi-icon-wrap purple">
            <Users size={18} />
          </div>
        </div>

        <div className="kpi-card amber">
          <div>
            <div className="kpi-label">Automated Actions</div>
            <div className="kpi-value">88.5%</div>
            <span className="kpi-badge up">
              <Zap size={10} /> ML Confidence High
            </span>
          </div>
          <div className="kpi-icon-wrap amber">
            <Zap size={18} />
          </div>
        </div>
      </div>

      {/* ─── Notification Toast ─── */}
      {syncStatus && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          isApproved
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isRejected
            ? 'bg-slate-100 text-slate-800 border-slate-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {isApproved ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : isRejected ? (
              <X className="w-4 h-4 text-slate-600 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
            )}
            <span>{syncStatus}</span>
          </div>
          <button
            onClick={() => setSyncStatus('')}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Pending Recommendation Card ─── */}
      {!isApproved && !isRejected ? (
        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Add 4 Checkout Staff</h3>
                    <span className="badge badge-red">High Priority</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target Department: <strong className="text-slate-800">CHECKOUT</strong> • Integration Target: <span className="text-blue-600 font-semibold">UKG Pro WFM</span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedDate}</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required Headcount</span>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                  <span>+4 Staff</span>
                  <span className="text-xs text-red-600 font-semibold">Gap: 4 FTE</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Scheduled: 5 • Required: 9</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Time Window</span>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                  <span>16:00 – 20:00</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Evening Rush (4-hour block)</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Model Driver</span>
                <div className="text-2xl font-black text-blue-600 mt-1 flex items-baseline gap-2">
                  <span>+18% Surge</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">660 footfall vs 540 baseline</p>
              </div>
            </div>

            {/* Justification Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>XGBoost Demand Forecasting Justification</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Predicted transaction velocity reaches <strong>180 transactions/hr</strong> between 17:00 and 19:30.
                Without 4 additional cashiers, customer queue wait times are estimated to exceed <strong>8.5 minutes</strong>, causing checkout abandonment.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Changes will automatically write back to UKG Pro WFM schedule roster.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="btn btn-secondary w-full sm:w-auto"
                >
                  <X size={14} />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Syncing to UKG...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Approve & Update UKG Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isApproved ? 'Schedule Approved & Pushed to UKG Pro WFM' : 'Recommendation Rejected'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isApproved
              ? 'Shift updates have been synced through Dell Boomi to UKG Pro WFM. Staff members have been notified.'
              : 'The existing schedule has been maintained without any modifications.'}
          </p>
          <div className="mt-4">
            <button
              onClick={() => { setIsApproved(false); setIsRejected(false); setSyncStatus(''); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Demo State
            </button>
          </div>
        </div>
      )}

      {/* ─── Approved Schedule Audit Log ─── */}
      <div className="card">
        <div className="card-header" style={{ padding: '20px 24px 0' }}>
          <div>
            <div className="card-title">Schedule Approval Audit Trail</div>
            <div className="card-subtitle">Verified history of recommendations synced to UKG Pro WFM</div>
          </div>
          <span className="badge badge-gray">2 Total Events</span>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action & Description</th>
                <th>Department</th>
                <th>Time Window</th>
                <th>Approved By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isApproved && (
                <tr className="fade-up" style={{ background: '#f0fdf4' }}>
                  <td>
                    <div className="font-bold text-slate-900">Add 4 Checkout Staff</div>
                    <div className="text-[11px] text-slate-400">UKG Pro Shift ID: #UKG-8842</div>
                  </td>
                  <td><span className="badge badge-blue">CHECKOUT</span></td>
                  <td className="font-semibold text-slate-700">16:00 – 20:00 (Today)</td>
                  <td>
                    <div className="font-semibold text-slate-800">Hendry Eprim</div>
                    <div className="text-[10px] text-slate-400">Store Admin</div>
                  </td>
                  <td><span className="badge badge-green">Synced to UKG</span></td>
                </tr>
              )}
              <tr>
                <td>
                  <div className="font-bold text-slate-900">Added 2 Checkout Staff</div>
                  <div className="text-[11px] text-slate-400">UKG Pro Shift ID: #UKG-7104</div>
                </td>
                <td><span className="badge badge-blue">CHECKOUT</span></td>
                <td className="font-semibold text-slate-700">12:00 – 14:00 (05 Oct)</td>
                <td>
                  <div className="font-semibold text-slate-800">Hendry Eprim</div>
                  <div className="text-[10px] text-slate-400">Store Admin</div>
                </td>
                <td><span className="badge badge-green">Synced to UKG</span></td>
              </tr>
              <tr>
                <td>
                  <div className="font-bold text-slate-900">Shift Extension: 2 Grocery Associates</div>
                  <div className="text-[11px] text-slate-400">UKG Pro Shift ID: #UKG-6921</div>
                </td>
                <td><span className="badge badge-purple">GROCERY</span></td>
                <td className="font-semibold text-slate-700">18:00 – 20:00 (04 Oct)</td>
                <td>
                  <div className="font-semibold text-slate-800">System Auto-Rule</div>
                  <div className="text-[10px] text-slate-400">Automation Engine</div>
                </td>
                <td><span className="badge badge-green">Synced to UKG</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
