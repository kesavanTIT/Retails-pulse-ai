import { useState } from 'react'
import {
  Sparkles, Calendar, ArrowRight, UserPlus,
  RefreshCw, UserMinus, Clock, CheckCircle2, ChevronRight,
  TrendingUp, ShieldCheck
} from 'lucide-react'

export default function RecommendationsPage({ recommendations, setActiveTab }) {
  const [selectedDate, setSelectedDate] = useState('06 Oct 2026')

  const recList = [
    {
      id: 1,
      title: 'Add 4 Checkout Staff',
      priority: 'High Priority',
      badgeClass: 'badge-red',
      icon: UserPlus,
      iconWrapClass: 'bg-red-50 text-red-600 border-red-100',
      reason: 'Evening demand is expected to be 18% higher than last week (peak at 17:00 – 19:30).',
      time: '16:00 – 20:00',
      dept: 'CHECKOUT',
      actionText: 'Review Approval',
      highlight: true,
    },
    {
      id: 2,
      title: 'Reassign 2 Staff to Grocery',
      priority: 'Medium Priority',
      badgeClass: 'badge-amber',
      icon: RefreshCw,
      iconWrapClass: 'bg-amber-50 text-amber-600 border-amber-100',
      reason: 'Predicted footfall in Grocery department is 24% higher than scheduled coverage.',
      time: '12:00 – 14:00',
      dept: 'GROCERY',
      actionText: 'Review Approval',
      highlight: false,
    },
    {
      id: 3,
      title: 'Reduce 1 Staff (Over-provisioned)',
      priority: 'Low Priority',
      badgeClass: 'badge-blue',
      icon: UserMinus,
      iconWrapClass: 'bg-blue-50 text-blue-600 border-blue-100',
      reason: 'Morning demand is 12% lower than historical baseline. Conserves labor hours.',
      time: '08:00 – 10:00',
      dept: 'CHECKOUT',
      actionText: 'Review Approval',
      highlight: false,
    },
    {
      id: 4,
      title: 'Stagger Break Times',
      priority: 'Efficiency',
      badgeClass: 'badge-purple',
      icon: Clock,
      iconWrapClass: 'bg-purple-50 text-purple-600 border-purple-100',
      reason: 'Stagger cashiers’ 15-min breaks between 16:00 – 20:00 to prevent lane closures.',
      time: '15:30 – 19:30',
      dept: 'STORE-WIDE',
      actionText: 'Review Approval',
      highlight: false,
    },
  ]

  return (
    <div className="space-y-6 fade-up">
      {/* ─── Top Stats Row ─── */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div>
            <div className="kpi-label">Active AI Suggestions</div>
            <div className="kpi-value">4</div>
            <span className="kpi-badge up">1 High Priority</span>
          </div>
          <div className="kpi-icon-wrap blue">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="kpi-card green">
          <div>
            <div className="kpi-label">Optimization Engine</div>
            <div className="kpi-value" style={{ fontSize: '20px', marginTop: '10px' }}>Active</div>
            <span className="kpi-badge up">
              <ShieldCheck size={10} /> Model v2.4 (XGBoost)
            </span>
          </div>
          <div className="kpi-icon-wrap green">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="kpi-card purple">
          <div>
            <div className="kpi-label">Target Roster</div>
            <div className="kpi-value">UKG Pro</div>
            <span className="kpi-badge up">Direct API write-back</span>
          </div>
          <div className="kpi-icon-wrap purple">
            <RefreshCw size={18} />
          </div>
        </div>

        <div className="kpi-card amber">
          <div>
            <div className="kpi-label">Estimated Savings</div>
            <div className="kpi-value">₹4,200</div>
            <span className="kpi-badge up">Weekly labor efficiency</span>
          </div>
          <div className="kpi-icon-wrap amber">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* ─── Header & Date ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">AI Staffing Recommendations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated roster adjustments generated from XGBoost demand curves</p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{selectedDate}</span>
        </div>
      </div>

      {/* ─── Recommendations Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recList.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="card"
              style={{
                borderLeft: item.highlight ? '4px solid #ef4444' : undefined,
              }}
            >
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.iconWrapClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {item.dept} • {item.time}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${item.badgeClass}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed mb-4">
                    {item.reason}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Integration: <strong className="text-slate-600">UKG Pro WFM</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('approval')}
                    className="btn btn-primary btn-sm"
                  >
                    <span>{item.actionText}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
