import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../context/AuthContext";
import { useDashboardTheme } from "../user/ThemeToggle";
interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ain-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const { authResponse, logout } = useAuth();
  const { isDarkMode } = useDashboardTheme();
  const navigate = useNavigate();
  const adminUsername = authResponse?.username || "Admin";

  useEffect(() => {
    try {
      localStorage.setItem("ain-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      /* storage unavailable, ignore */
    }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`ain-app d-flex ${isDarkMode ? "theme-dark" : "theme-light"} ${collapsed ? "sidebar-collapsed" : ""}
      [font-family:"Google_Sans_Flex",_sans-serif]
      [--ain-navy:#131b2e]
      [--ain-navy-light:#1b2540]
      [--ain-blue:#3d7bfc]
      [--ain-bg:#f5f6f9]
      [--ain-surface:#ffffff]
      [--ain-text:#1c2033]
      [--ain-text-muted:#8a90a2]
      [--ain-border:#eef0f4]
      [--ain-input-bg:#ffffff]
      [--ain-row-hover:#fafbfd]
      [--ain-progress-track:#eef0f4]
      [--ain-chart-grid:#eef0f4]
      [--ain-chart-cursor:rgba(0,_0,_0,_0.03)]
      [--ain-alert-bg:#fff6e5]
      [--ain-alert-text:#a3690f]
      [--ain-alert-border:#f6dfae]
      [--ain-shadow:0_1px_3px_rgba(20,_30,_60,_0.08)]
      [--ain-radius:16px]
      [--ain-sidebar-w:260px]
      max-[991px]:[--ain-sidebar-w:240px]
      [&.sidebar-collapsed]:[--ain-sidebar-w:72px]
      [&.theme-dark]:[--ain-navy:#101827]
      [&.theme-dark]:[--ain-navy-light:#1f2937]
      [&.theme-dark]:[--ain-bg:#111827]
      [&.theme-dark]:[--ain-surface:#1f2937]
      [&.theme-dark]:[--ain-text:#f3f4f6]
      [&.theme-dark]:[--ain-text-muted:#c1c8d3]
      [&.theme-dark]:[--ain-border:#374151]
      [&.theme-dark]:[--ain-input-bg:#111827]
      [&.theme-dark]:[--ain-row-hover:#273449]
      [&.theme-dark]:[--ain-progress-track:#374151]
      [&.theme-dark]:[--ain-chart-grid:#374151]
      [&.theme-dark]:[--ain-chart-cursor:rgba(255,_255,_255,_0.06)]
      [&.theme-dark]:[--ain-alert-bg:#3b3020]
      [&.theme-dark]:[--ain-alert-text:#f5c66b]
      [&.theme-dark]:[--ain-alert-border:#6b542e]
      [&.theme-dark]:[--ain-shadow:0_1px_3px_rgba(0,_0,_0,_0.35)]
      [&_*]:[box-sizing:border-box]
      [min-height:100vh]
      [background:var(--ain-bg)]
      [color:var(--ain-text)]
      [transition:background-color_300ms_ease,_color_300ms_ease]
      [&_.ain-avatar-sm]:[width:32px]
      [&_.ain-avatar-sm]:[height:32px]
      [&_.ain-avatar-sm]:[flex:0_0_32px]
      [&_.ain-avatar-sm]:[border-radius:50%]
      [&_.ain-avatar-sm]:[display:inline-flex]
      [&_.ain-avatar-sm]:[align-items:center]
      [&_.ain-avatar-sm]:[justify-content:center]
      [&_.ain-avatar-sm]:[font-size:0.72rem]
      [&_.ain-avatar-sm]:[font-weight:700]
      [&_.ain-avatar-sm]:[color:#23262f]
      [&_.ain-avatar-sm]:[background:#cbd5e1]
      [&_.ain-main]:[--admin-header-height:54px]
      [&_.ain-main]:[padding-top:var(--admin-header-height)]
      [&_.ain-main]:[margin-left:var(--ain-sidebar-w)]
      [&_.ain-main]:[max-width:100%]
      [&_.ain-main]:[min-width:0]
      [&_.ain-main]:[background:var(--ain-bg)]
      [&_.ain-main]:[color:var(--ain-text)]
      [&_.ain-main]:[transition:margin-left_0.45s_cubic-bezier(0.22,1,0.36,1),background-color_300ms_ease,color_300ms_ease]
      [&_.ain-content-wrapper]:[padding:15px]
      [&_.ain-main>.ain-admin-header]:[position:fixed]
      [&_.ain-main>.ain-admin-header]:[top:0]
      [&_.ain-main>.ain-admin-header]:[left:var(--ain-sidebar-w)]
      [&_.ain-main>.ain-admin-header]:[right:0]
      [&_.ain-main>.ain-admin-header]:[z-index:40]
      [&_.ain-admin-header]:[display:flex]
      [&_.ain-admin-header]:[justify-content:flex-end]
      [&_.ain-admin-header]:[align-items:center]
      [&_.ain-admin-header]:[height:54px]
      [&_.ain-admin-header]:[gap:20px]
      [&_.ain-admin-header]:[padding:8px_32px]
      [&_.ain-admin-header]:[background:var(--ain-surface)]
      [&_.ain-admin-header]:[border-bottom:1px_solid_var(--ain-border)]
      [&_.ain-admin-header]:[box-shadow:var(--ain-shadow)]
      [&_.ain-admin-header]:[transition:left_0.45s_cubic-bezier(0.22,1,0.36,1),background-color_300ms_ease,border-color_300ms_ease]
      [&_.ain-admin-notification]:[display:inline-flex]
      [&_.ain-admin-notification]:[align-items:center]
      [&_.ain-admin-notification]:[justify-content:center]
      [&_.ain-admin-notification]:[padding:0]
      [&_.ain-admin-notification]:[color:var(--ain-text)]
      [&_.ain-admin-notification]:[background:transparent]
      [&_.ain-admin-notification]:[border:0]
      [&_.ain-admin-notification]:[cursor:pointer]
      [&_.ain-admin-search-box]:[position:relative]
      [&_.ain-admin-search-box]:[width:min(300px,_100%)]
      [&_.ain-admin-search-icon]:[position:absolute]
      [&_.ain-admin-search-icon]:[top:50%]
      [&_.ain-admin-search-icon]:[left:12px]
      [&_.ain-admin-search-icon]:[color:var(--ain-text-muted)]
      [&_.ain-admin-search-icon]:[pointer-events:none]
      [&_.ain-admin-search-icon]:[transform:translateY(-50%)]
      [&_.ain-admin-search-input]:[width:100%]
      [&_.ain-admin-search-input]:[padding:8px_12px_8px_38px]
      [&_.ain-admin-search-input]:[color:var(--ain-text)]
      [&_.ain-admin-search-input]:[background:var(--ain-input-bg)]
      [&_.ain-admin-search-input]:[border:1px_solid_var(--ain-border)]
      [&_.ain-admin-search-input.form-control]:[width:100%]
      [&_.ain-admin-search-input.form-control]:[padding:8px_12px_8px_38px]
      [&_.ain-admin-search-input.form-control]:[color:var(--ain-text)]
      [&_.ain-admin-search-input.form-control]:[background:var(--ain-input-bg)]
      [&_.ain-admin-search-input.form-control]:[border:1px_solid_var(--ain-border)]
      [&_.ain-admin-search-input::placeholder]:[color:var(--ain-text-muted)]
      [&_.ain-admin-search-input::placeholder]:[opacity:1]
      [&_.ain-admin-search-input:focus]:[color:var(--ain-text)]
      [&_.ain-admin-search-input:focus]:[background:var(--ain-input-bg)]
      [&_.ain-admin-search-input:focus]:[border-color:var(--ain-blue)]
      [&_.ain-admin-search-input:focus]:[box-shadow:0_0_0_3px_rgba(61,_123,_252,_0.16)]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[display:inline-flex]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[align-items:center]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[justify-content:center]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[width:40px]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[height:40px]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[padding:0]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[margin:0]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[color:var(--ain-text)]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[background:transparent]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[border:0]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[border-radius:10px]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[cursor:pointer]
      [&_.ain-admin-theme-toggle_.theme-toggle]:[transition:background-color_200ms_ease]
      [&_.ain-admin-theme-toggle_.theme-toggle:hover]:[background:#f5f6f9]
      [&_.ain-admin-theme-toggle_.theme-toggle:focus-visible]:[background:#f5f6f9]
      [&_.ain-admin-theme-toggle_.theme-toggle:focus-visible]:[outline:2px_solid_#3d7bfc]
      [&_.ain-admin-theme-toggle_.theme-toggle:focus-visible]:[outline-offset:2px]
      [&.theme-dark_.ain-admin-theme-toggle_.theme-toggle:hover]:[background:#374151]
      [&.theme-dark_.ain-admin-theme-toggle_.theme-toggle:focus-visible]:[background:#374151]
      [&_.ain-admin-theme-toggle_.theme-toggle_.ain-stat-label]:[color:#101827]!
      [&_.ain-topbar]:[display:flex]
      [&_.ain-topbar]:[align-items:center]
      [&_.ain-topbar]:[justify-content:space-between]
      [&_.ain-topbar]:[flex-wrap:wrap]
      [&_.ain-topbar]:[gap:12px]
      [&_.ain-topbar]:[margin-bottom:0px]
      [&_.ain-welcome]:[text-transform:uppercase]
      [&_.ain-welcome]:[margin-bottom:0px]
      [&_.ain-welcome]:[font-size:15px]
      [&_.ain-welcome]:[font-weight:600]
      [&_.ain-welcome]:[color:#1ba098]!
      [&_.ain-welcome]:[margin-left:5px]
      [&_.ain-search]:[background:var(--ain-input-bg)]
      [&_.ain-search]:[border:1px_solid_var(--ain-border)]
      [&_.ain-search]:[border-radius:10px]
      [&_.ain-search]:[padding:8px_14px]
      [&_.ain-search]:[gap:8px]
      [&_.ain-search]:[color:var(--ain-text-muted)]
      [&_.ain-search_input]:[border:none]
      [&_.ain-search_input]:[outline:none]
      [&_.ain-search_input]:[font-size:0.85rem]
      [&_.ain-search_input]:[background:transparent]
      [&_.ain-search_input]:[width:140px]
      [&_.ain-icon-btn]:[border:1px_solid_var(--ain-border)]
      [&_.ain-icon-btn]:[background:var(--ain-surface)]
      [&_.ain-icon-btn]:[width:38px]
      [&_.ain-icon-btn]:[height:38px]
      [&_.ain-icon-btn]:[border-radius:10px]
      [&_.ain-icon-btn]:[display:inline-flex]
      [&_.ain-icon-btn]:[align-items:center]
      [&_.ain-icon-btn]:[justify-content:center]
      [&_.ain-icon-btn]:[color:var(--ain-text)]
      [&_.ain-icon-btn]:[transition:transform_0.15s_ease,_box-shadow_0.15s_ease]
      [&_.ain-icon-btn:hover]:[transform:translateY(-1px)]
      [&_.ain-icon-btn:hover]:[box-shadow:0_4px_10px_rgba(0,_0,_0,_0.06)]
      [&_.ain-badge-dot]:[position:absolute]
      [&_.ain-badge-dot]:[top:-6px]
      [&_.ain-badge-dot]:[right:-6px]
      [&_.ain-badge-dot]:[background:#ff5a5f]
      [&_.ain-badge-dot]:[color:#fff]
      [&_.ain-badge-dot]:[font-size:0.65rem]
      [&_.ain-badge-dot]:[font-weight:700]
      [&_.ain-badge-dot]:[min-width:18px]
      [&_.ain-badge-dot]:[height:18px]
      [&_.ain-badge-dot]:[border-radius:50%]
      [&_.ain-badge-dot]:[display:flex]
      [&_.ain-badge-dot]:[align-items:center]
      [&_.ain-badge-dot]:[justify-content:center]
      [&_.ain-badge-dot]:[padding:0_4px]
      [&_.ain-summary-header]:[margin:0_0_20px]
      [&_.ain-section-title]:[margin-top:0px]
      [&_.ain-section-title]:[font-size:25px]
      [&_.ain-section-title]:[font-weight:700]
      [&_.ain-section-title]:[margin-left:5px]
      [&_.ain-alert-pill]:[background:var(--ain-alert-bg)]
      [&_.ain-alert-pill]:[color:var(--ain-alert-text)]
      [&_.ain-alert-pill]:[border:1px_solid_var(--ain-alert-border)]
      [&_.ain-alert-pill]:[padding:7px_14px]
      [&_.ain-alert-pill]:[border-radius:10px]
      [&_.ain-alert-pill]:[font-size:0.82rem]
      [&_.ain-alert-pill]:[font-weight:600]
      [&_.ain-card]:[color:var(--ain-text)]
      [&_.ain-card]:[border:1px_solid_var(--ain-border)]
      [&_.ain-card]:[border-radius:var(--ain-radius)]
      [&_.ain-card]:[padding:20px]
      [&_.ain-stat-grid]:[align-items:stretch]
      [&_.ain-stat-grid]:[margin-bottom:24px]
      [&_.ain-stat-grid>[class*="col-"]]:[min-width:0]
      [&_.ain-dashboard-panels>[class*="col-"]]:[min-width:0]
      [&_.ain-stat-card]:[width:100%]
      [&_.ain-stat-card]:[min-height:116px]
      [&_.ain-stat-card]:[transition:transform_0.2s_ease,_box-shadow_0.2s_ease]
      [&_.ain-stat-card]:[background:var(--ain-surface)]
      [&_.ain-stat-grid_>_div:nth-child(1)_.ain-stat-card]:[background:#cbdbfa]!
      [&_.ain-stat-grid_>_div:nth-child(1)_.ain-stat-card]:[border-left:4px_solid_#4285f4]
      [&_.ain-stat-grid_>_div:nth-child(2)_.ain-stat-card]:[background:#caf7dd]!
      [&_.ain-stat-grid_>_div:nth-child(2)_.ain-stat-card]:[border-left:4px_solid_#34a853]
      [&_.ain-stat-grid_>_div:nth-child(3)_.ain-stat-card]:[background:#fde9cc]!
      [&_.ain-stat-grid_>_div:nth-child(3)_.ain-stat-card]:[border-left:4px_solid_#fbbc04]
      [&_.ain-stat-grid_>_div:nth-child(4)_.ain-stat-card]:[background:#fed7ec]!
      [&_.ain-stat-grid_>_div:nth-child(4)_.ain-stat-card]:[border-left:4px_solid_#ea4335]
      [&_.ain-stat-card:hover]:[transform:translateY(-3px)]
      [&_.ain-stat-card:hover]:[box-shadow:var(--ain-shadow)]
      [&_.ain-stat-label]:[color:#131b2e]
      [&_.ain-stat-label]:[font-size:0.82rem]
      [&_.ain-stat-label]:[font-weight:500]
      [&_.ain-stat-icon]:[width:30px]
      [&_.ain-stat-icon]:[height:30px]
      [&_.ain-stat-icon]:[border-radius:8px]
      [&_.ain-stat-icon]:[background:color-mix(in_srgb,_var(--ain-blue)_12%,_var(--ain-surface))]
      [&_.ain-stat-icon]:[color:#5b8dfb]
      [&_.ain-stat-icon]:[display:inline-flex]
      [&_.ain-stat-icon]:[align-items:center]
      [&_.ain-stat-icon]:[justify-content:center]
      [&_.ain-stat-icon]:[font-size:0.85rem]
      [&_.ain-stat-value]:[font-size:1.7rem]
      [&_.ain-stat-value]:[font-weight:700]
      [&_.ain-stat-value]:[margin-top:8px]
      [&_.ain-stat-value]:[color:#1c2033]
      [&_.ain-panel-card]:[width:100%]
      [&_.ain-panel-card]:[min-width:0]
      [&_.ain-panel-card]:[display:flex]
      [&_.ain-panel-card]:[flex-direction:column]
      [&_.ain-panel-card]:[padding:0px]
      [&_.ain-panel-card]:[border:0px]
      [&_.ain-panel-title]:[flex:0_0_auto]
      [&_.ain-panel-title]:[margin:0_0_16px]!
      [&_.ain-panel-content]:[flex:1_1_auto]
      [&_.ain-panel-content]:[min-width:0]
      [&_.ain-panel-content]:[min-height:0]
      [&_.ain-table-toolbar]:[flex:0_0_auto]
      [&_.ain-table-toolbar]:[min-height:38px]
      [&_.ain-table-toolbar]:[margin-bottom:12px]
      [&_.ain-table-card]:[padding:16px]
      [&_.ain-table-card]:[display:flex]
      [&_.ain-table-card]:[flex-direction:column]
      [&_.ain-table-card]:[overflow:hidden]
      [&_.ain-table-card]:[background:var(--ain-surface)]
      [&_.ain-table-title]:[font-weight:600]
      [&_.ain-table-title]:[font-size:0.92rem]
      [&_.ain-table-title]:[color:var(--ain-text)]
      [&_.ain-filter-btn]:[background:var(--ain-surface)]
      [&_.ain-filter-btn]:[border:1px_solid_var(--ain-border)]
      [&_.ain-filter-btn]:[border-radius:8px]
      [&_.ain-filter-btn]:[padding:6px_12px]
      [&_.ain-filter-btn]:[font-size:0.8rem]
      [&_.ain-filter-btn]:[color:var(--ain-text)]
      [&_.ain-filter-btn]:[transition:background_0.15s_ease]
      [&_.ain-filter-btn:hover]:[background:var(--ain-bg)]
      [&_.ain-table]:[font-size:0.85rem]
      [&_.ain-table]:[color:var(--ain-text)]
      [&_.ain-table]:[--bs-table-color:var(--ain-text)]
      [&_.ain-table]:[--bs-table-bg:transparent]
      [&_.ain-table]:[--bs-table-border-color:var(--ain-border)]
      [&_.ain-table-responsive]:[flex:1_1_auto]
      [&_.ain-table-responsive]:[min-width:0]
      [&_.ain-table_thead_th]:[color:var(--ain-text-muted)]
      [&_.ain-table_thead_th]:[font-weight:500]
      [&_.ain-table_thead_th]:[font-size:0.78rem]
      [&_.ain-table_thead_th]:[border-bottom:1px_solid_var(--ain-border)]
      [&_.ain-table_thead_th]:[padding-bottom:10px]
      [&_.ain-table_tbody_td]:[border-bottom:1px_solid_var(--ain-border)]
      [&_.ain-table_tbody_td]:[padding:12px_8px]
      [&_.ain-table_tbody_tr:last-child_td]:[border-bottom:none]
      [&_.ain-table_tbody_tr]:[transition:background_0.15s_ease]
      [&_.ain-table_tbody_tr:hover]:[background:var(--ain-row-hover)]
      [&_.ain-row-name]:[font-weight:600]
      [&_.ain-row-name]:[font-size:0.85rem]
      [&_.ain-row-name]:[color:var(--ain-text)]
      [&_.ain-row-muted]:[color:var(--ain-text-muted)]
      [&_.ain-row-usage]:[font-weight:600]
      [&_.ain-row-usage]:[font-size:0.8rem]
      [&_.ain-row-usage]:[min-width:42px]
      [&_.ain-progress]:[width:60px]
      [&_.ain-progress]:[height:5px]
      [&_.ain-progress]:[background:var(--ain-progress-track)]
      [&_.ain-progress]:[border-radius:4px]
      [&_.ain-progress]:[overflow:hidden]
      [&_.ain-progress-fill]:[height:100%]
      [&_.ain-progress-fill]:[border-radius:4px]
      [&_.ain-progress-fill]:[background:linear-gradient(90deg,_#5ec8d8,_#3fae6a)]
      [&_.ain-progress-fill]:[width:0%]
      [&_.ain-chevron]:[color:#c3c7d1]
      [&_.ain-chevron]:[font-size:0.8rem]
      [&_.ain-chart-card]:[padding:18px]
      [&_.ain-chart-card]:[display:flex]
      [&_.ain-chart-card]:[flex-direction:column]
      [&_.ain-chart-card]:[background:var(--ain-surface)]
      [&_.ain-dots]:[color:var(--ain-text-muted)]
      [&_.ain-dots]:[cursor:pointer]
      [&_.ain-metric-label]:[font-size:0.72rem]
      [&_.ain-metric-label]:[color:var(--ain-text-muted)]
      [&_.ain-metric-value]:[font-weight:700]
      [&_.ain-metric-value]:[font-size:1rem]
      [&_.ain-metric-value]:[color:var(--ain-text)]
      [&_.ain-chart-wrap]:[width:100%]
      [&_.ain-chart-wrap]:[flex:1]
      [&_.ain-chart-wrap]:[min-height:220px]
      [&_.ain-placeholder-page]:[color:var(--ain-text)]
      [&_.ain-placeholder-page_h1]:[margin:0]
      [&_.ain-placeholder-page_h1]:[font-size:1.25rem]
      [&_.ain-placeholder-page_h1]:[font-weight:600]
      [&_.ain-delay-1]:[animation-delay:0.05s]
      [&_.ain-delay-1]:[margin-bottom:10px]
      [&_.ain-delay-2]:[animation-delay:0.12s]
      [&_.ain-delay-3]:[animation-delay:0.2s]
      [&_.ain-fade-in]:[animation:ain-fade-up_0.5s_ease_both]
      [&_.ain-row-in]:[opacity:0]
      [&_.ain-row-in]:[animation:ain-row-fade_0.45s_ease_forwards]
      [&_.ain-progress-fill]:[animation:ain-grow-bar_1s_ease_forwards]
      motion-reduce:[&_.ain-main]:[transition:none]!
      motion-reduce:[&_.ain-admin-header]:[transition:none]!
      motion-reduce:[&_.ain-fade-in]:[animation:none]!
      motion-reduce:[&_.ain-fade-in]:[transition:none]!
      motion-reduce:[&_.ain-row-in]:[animation:none]!
      motion-reduce:[&_.ain-row-in]:[transition:none]!
      motion-reduce:[&_.ain-progress-fill]:[animation:none]!
      motion-reduce:[&_.ain-progress-fill]:[transition:none]!
      motion-reduce:[&_.ain-stat-card]:[animation:none]!
      motion-reduce:[&_.ain-stat-card]:[transition:none]!
      max-[991px]:[&_.ain-main]:[padding:var(--admin-header-height)_20px_40px]
      max-[767px]:[&_.ain-main]:[padding:var(--admin-header-height)_16px_40px]
      max-[767px]:[&_.ain-main]:[margin-left:0]
      max-[767px]:[&_.ain-panel-card]:[padding:16px]
      max-[767px]:[&_.ain-main>.ain-admin-header]:[left:0]
      max-[767px]:[&_.ain-admin-header]:[gap:12px]
      max-[767px]:[&_.ain-admin-header]:[padding:8px_16px]
      max-[767px]:[&_.ain-admin-search-box]:[max-width:300px]`}>
      <style>{`
        @keyframes ain-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ain-row-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ain-grow-bar {
          from { width: 0%; }
        }
        .ain-app.theme-dark .ain-stat-grid > div:nth-child(-n + 4) .ain-stat-card {
          background: var(--ain-surface) !important;
        }
        .ain-app.theme-dark .ain-stat-label,
        .ain-app.theme-dark .ain-stat-value {
          color: var(--ain-text) !important;
        }
        .ain-app.theme-dark .ain-main .bg-white {
          background-color: var(--ain-surface) !important;
        }
        .ain-app.theme-dark .ain-main .text-black {
          color: var(--ain-text) !important;
        }
        .ain-app.theme-dark .ain-main :is(.border-slate-100, .border-slate-200, .border-gray-200) {
          border-color: rgba(55, 65, 81, .6) !important;
        }
        .ain-app.theme-dark .ain-main .border {
          border-color: rgba(55, 65, 81, .6) !important;
        }
        .ain-app.theme-dark .user-management table,
        .ain-app.theme-dark .user-management thead,
        .ain-app.theme-dark .user-management tbody,
        .ain-app.theme-dark .user-management tr,
        .ain-app.theme-dark .user-management th,
        .ain-app.theme-dark .user-management td {
          border-color: rgba(55, 65, 81, .6) !important;
        }
        .ain-app.theme-dark .user-management td {
          border-bottom-color: rgba(55, 65, 81, .6) !important;
        }
      `}</style>
      <AdminSidebar
        adminUsername={adminUsername}
        onLogout={handleLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main className="ain-main flex-grow-1">
        <AdminHeader />
        <div className="ain-content-wrapper">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;