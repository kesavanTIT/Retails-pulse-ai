import { Bell, Calendar, ChevronDown, Menu } from 'lucide-react'

export default function TopNav({ activeTitle, activeSubtitle, onMenuClick }) {
  return (
    <header className="topnav">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="topnav-left">
        <button
          className="topnav-hamburger"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          title="Open menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1>{activeTitle || 'Dashboard'}</h1>
          <p>{activeSubtitle || 'Retail demand forecasting and workforce optimization'}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="topnav-right">
        {/* Date Range Selector */}
        <div className="topnav-date" title="Filter by date range">
          <Calendar size={13} className="text-slate-400" />
          <span>01 Oct 2026 – 07 Oct 2026</span>
          <ChevronDown size={12} className="text-slate-400" />
        </div>

        {/* Live System Beacon */}
        <div className="topnav-system-status" title="XGBoost demand engine & UKG Pro connector active">
          <span className="topnav-status-dot-pulse" />
          <span className="topnav-status-label">Engine Active</span>
        </div>

        {/* Notification Bell */}
        <button className="topnav-bell" aria-label="Notifications" title="Notifications">
          <Bell size={16} />
          <span className="topnav-bell-badge"></span>
        </button>

        {/* Divider */}
        <div className="topnav-divider" />

        {/* User Profile Pill */}
        <div className="topnav-user-pill" title="Logged in as Hendry Eprim (Admin)">
          <div className="topnav-avatar-wrapper">
            <div className="topnav-avatar">HE</div>
            <span className="topnav-online-dot" />
          </div>
          <div className="topnav-user-details">
            <span className="topnav-user-name">Hendry Eprim</span>
            <span className="topnav-user-badge">Admin</span>
          </div>
          <ChevronDown size={13} className="topnav-user-chevron" />
        </div>
      </div>
    </header>
  )
}
