import {
  LayoutDashboard, UploadCloud, TrendingUp, CalendarDays,
  GitCompare, Sparkles, CheckSquare, Bot, Settings,
  ShoppingCart, Building2, ChevronDown, X
} from 'lucide-react'

const navSections = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard',   label: 'Dashboard',           icon: LayoutDashboard },
      { id: 'ingestion',   label: 'Data Ingestion',      icon: UploadCloud },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'forecasting',     label: 'Forecasting',         icon: TrendingUp },
      { id: 'staffing',        label: 'Staffing & Schedule', icon: CalendarDays },
      { id: 'variance',        label: 'Variance Analysis',   icon: GitCompare },
    ],
  },
  {
    label: 'Actions',
    items: [
      { id: 'recommendations', label: 'Recommendations',     icon: Sparkles },
      { id: 'approval',        label: 'Manager Approval',    icon: CheckSquare },
      { id: 'assistant',       label: 'MCP Assistant',       icon: Bot },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId)
    onClose?.()
  }

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div className="sidebar-logo">
            <ShoppingCart size={17} color="white" />
          </div>
          <div className="sidebar-brand-text">
            <h1>RetailPulse AI</h1>
            <p>AI Retail Intelligence Platform</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close menu"
          title="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav Sections */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`sidebar-link${isActive ? ' active' : ''}`}
                >
                  <Icon className="sidebar-icon" size={15} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Store Card */}
      <div className="sidebar-footer">
        <div className="sidebar-store-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-store-icon">
              <Building2 size={14} />
            </div>
            <div>
              <div className="sidebar-store-name">Demo Store</div>
              <div className="sidebar-store-sub">STORE-001</div>
            </div>
          </div>
          <ChevronDown size={13} color="rgba(148,163,184,0.7)" />
        </div>
      </div>
    </aside>
  )
}
