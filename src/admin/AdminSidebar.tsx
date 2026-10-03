import seal from "../assets/Seal_of_Karnataka.svg";
import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

interface AdminSidebarProps {
  adminUsername: string;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "bi-grid-1x2-fill", to: "/admin-dashboard" },
  { label: "User Management", icon: "bi-person", to: "/admin/user-management" },
  { label: "Model Control", icon: "bi-gear", to: "/admin/model-control" },
  { label: "Billing Admin", icon: "bi-receipt", to: "/admin/billing" },
  { label: "Global Settings", icon: "bi-sliders", to: "/admin/global-settings" },
  { label: "System Logs", icon: "bi-file-earmark-text", to: "/admin/system-logs" },
];

/*
 * ICON AXIS
 * Collapsed width is 72px, so every icon is centered on x = 36px:
 *   logo        : padding-left 18 + 36px wide  -> center 36
 *   nav icon    : margin 12 + padding 14 + 20px -> center 36
 *   toggle      : margin-left 20 + 32px wide    -> center 36
 *   admin avatar: footer padding 20 + 32px wide -> center 36
 *   logout icon : footer padding 20 + 32px wide -> center 36
 * These offsets are constant (never change on collapse), so icons never
 * move horizontally while the sidebar animates.
 */

// Width classes: only one set is applied at a time, so they never conflict.
const expandedWidth = `
  [width:260px]
  [flex:0_0_260px]
  max-[991px]:[width:240px]
  max-[991px]:[flex-basis:240px]`;
const collapsedWidth = `
  [width:72px]
  [flex:0_0_72px]`;

function AdminSidebar({
  adminUsername,
  onLogout,
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const labelClass = `whitespace-nowrap transition-opacity duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${collapsed ? "opacity-0" : "opacity-100"
    }`;

  return (
    <aside
      className={`ain-sidebar
      ${collapsed ? collapsedWidth : expandedWidth}
      transition-[width]
      duration-[450ms]
      ease-[cubic-bezier(0.22,1,0.36,1)]
      motion-reduce:transition-none
      [display:flex]
      [flex-direction:column]
      [background:#131b2e]
      [color:#cfd3e0]
      [padding:0]
      [height:100vh]
      [overflow:hidden]
      [position:fixed]
      [top:0]
      [left:0]
      [z-index:30]
      max-[767px]:[display:none]

      [&_.ain-header]:[display:flex]
      [&_.ain-header]:[align-items:center]
      [&_.ain-header]:[gap:8px]
      [&_.ain-header]:[height:54px]
      [&_.ain-header]:[flex:0_0_54px]
      [&_.ain-header]:[padding:0_18px]
      [&_.ain-header]:[border-bottom:1px_solid_rgba(255,_255,_255,_0.1)]
      [&_.ain-toggle]:[flex:0_0_40px]
      [&_.ain-toggle]:[width:40px]
      [&_.ain-toggle]:[height:40px]
      [&_.ain-toggle]:[display:flex]
      [&_.ain-toggle]:[align-items:center]
      [&_.ain-toggle]:[justify-content:center]
      [&_.ain-toggle]:[border:0]
      [&_.ain-toggle]:[border-radius:8px]
      [&_.ain-toggle]:[background:transparent]
      [&_.ain-toggle]:[color:rgba(255,_255,_255,_0.7)]
      [&_.ain-toggle]:[font-size:20px]
      [&_.ain-toggle]:[cursor:pointer]
      [&_.ain-toggle]:[transition:color_0.2s_ease,_background-color_0.2s_ease]
      [&_.ain-toggle:hover]:[background:rgba(255,_255,_255,_0.1)]
      [&_.ain-toggle:hover]:[color:#fff]
      [&_.ain-toggle:focus-visible]:[outline:2px_solid_rgba(255,_255,_255,_0.5)]
      [&_.ain-brand]:[display:flex]
      [&_.ain-brand]:[align-items:center]
      [&_.ain-brand]:[gap:8px]
      [&_.ain-brand]:[flex:0_0_auto]
      [&_.ain-brand-seal]:[width:36px]
      [&_.ain-brand-seal]:[height:36px]
      [&_.ain-brand-seal]:[flex:0_0_36px]
      [&_.ain-brand-seal]:[object-fit:contain]
      [&_.ain-brand-text]:[color:#fff]
      [&_.ain-brand-text]:[font-size:18px]
      [&_.ain-brand-text]:[font-weight:700]
      [&_.ain-brand-text]:[line-height:1.15]
      [&_.ain-brand-text]:[white-space:nowrap]
      [&_.ain-brand-text]:[margin:0]

      [&_.ain-nav]:[flex:1_1_auto]
      [&_.ain-nav]:[min-height:0]
      [&_.ain-nav]:[overflow-y:auto]
      [&_.ain-nav]:[overflow-x:hidden]
      [&_.ain-nav]:[padding:16px_0]
      [&_.ain-nav_.nav-item]:[margin-bottom:0]
      [&_.ain-nav-link]:[display:flex]
      [&_.ain-nav-link]:[align-items:center]
      [&_.ain-nav-link]:[gap:12px]
      [&_.ain-nav-link]:[width:calc(100%_-_24px)]
      [&_.ain-nav-link]:[margin:4px_12px]
      [&_.ain-nav-link]:[padding:12px_14px]
      [&_.ain-nav-link]:[overflow:hidden]
      [&_.ain-nav-link]:[border:0]
      [&_.ain-nav-link]:[border-radius:8px]
      [&_.ain-nav-link]:[background:transparent]
      [&_.ain-nav-link]:[color:rgba(255,_255,_255,_0.7)]!
      [&_.ain-nav-link]:[font-size:14px]
      [&_.ain-nav-link]:[font-weight:500]
      [&_.ain-nav-link]:[text-decoration:none]
      [&_.ain-nav-link]:[transition:color_0.3s_ease,_background-color_0.3s_ease]
      [&_.ain-nav-link_i]:[flex:0_0_20px]
      [&_.ain-nav-link_i]:[width:20px]
      [&_.ain-nav-link_i]:[font-size:18px]
      [&_.ain-nav-link_i]:[line-height:1]
      [&_.ain-nav-link_i]:[text-align:center]
      [&_.ain-nav-link:hover]:[background:rgba(255,_255,_255,_0.1)]
      [&_.ain-nav-link:hover]:[color:#fff]!
      [&_.ain-nav-link:hover]:[outline:none]
      [&_.ain-nav-link:focus]:[background:rgba(255,_255,_255,_0.1)]
      [&_.ain-nav-link:focus]:[color:#fff]!
      [&_.ain-nav-link:focus]:[outline:none]
      [&_.ain-nav-link.active]:[background:rgba(255,_255,_255,_0.1)]
      [&_.ain-nav-link.active]:[color:#fff]!

      [&_.ain-footer-toggle]:[flex:0_0_32px]
      [&_.ain-footer-toggle]:[width:32px]
      [&_.ain-footer-toggle]:[height:32px]
      [&_.ain-footer-toggle]:[margin-left:20px]
      [&_.ain-footer-toggle]:[display:flex]
      [&_.ain-footer-toggle]:[align-items:center]
      [&_.ain-footer-toggle]:[justify-content:center]
      [&_.ain-footer-toggle]:[border:0]
      [&_.ain-footer-toggle]:[border-radius:8px]
      [&_.ain-footer-toggle]:[background:transparent]
      [&_.ain-footer-toggle]:[color:rgba(255,_255,_255,_0.7)]
      [&_.ain-footer-toggle]:[font-size:20px]
      [&_.ain-footer-toggle]:[line-height:1]
      [&_.ain-footer-toggle]:[cursor:pointer]
      [&_.ain-footer-toggle]:[transform:translateX(20px)]
      [&_.ain-footer-toggle]:[transition:color_0.2s_ease,_background-color_0.2s_ease]
      [&_.ain-footer-toggle:hover]:[background:rgba(255,_255,_255,_0.1)]
      [&_.ain-footer-toggle:hover]:[color:#fff]
      [&_.ain-footer-toggle:focus-visible]:[outline:2px_solid_rgba(255,_255,_255,_0.5)]
      [&_.ain-footer-toggle:focus-visible]:[outline-offset:2px]

      [&_.ain-sidebar-footer]:[flex:0_0_auto]
      [&_.ain-sidebar-footer]:[margin-top:auto]
      [&_.ain-sidebar-footer]:[padding:12px_20px]
      [&_.ain-sidebar-footer]:[border-top:1px_solid_rgba(255,_255,_255,_0.08)]
      [&_.ain-sidebar-footer]:[overflow:hidden]
      [&_.ain-footer-actions]:[width:100%]
      [&_.ain-footer-actions]:[display:flex]
      [&_.ain-footer-actions]:[align-items:center]
      [&_.ain-footer-actions]:[justify-content:flex-start]
      [&_.ain-footer-actions]:[gap:8px]
      [&_.ain-user-chip]:[padding:6px_0]
      [&_.ain-user-chip]:[margin-bottom:4px]
      [&_.ain-user-chip]:[min-width:0]
      [&_.ain-user-chip]:[justify-content:flex-start]
      [&_.ain-avatar-sm]:[flex:0_0_32px]
      [&_.ain-avatar-sm]:[width:32px]
      [&_.ain-avatar-sm]:[height:32px]
      [&_.ain-avatar-sm]:[display:flex]
      [&_.ain-avatar-sm]:[align-items:center]
      [&_.ain-avatar-sm]:[justify-content:center]
      [&_.ain-user-name]:[font-size:0.85rem]
      [&_.ain-user-name]:[color:#e5e7f0]
      [&_.ain-user-name]:[font-weight:500]
      [&_.ain-user-name]:[overflow:hidden]
      [&_.ain-user-name]:[text-overflow:ellipsis]
      [&_.ain-logout]:[color:#ef4444]!
      [&_.ain-logout]:[font-size:0.85rem]
      [&_.ain-logout]:[font-weight:400]
      [&_.ain-logout]:[gap:0]
      [&_.ain-logout]:[padding:6px_0]
      [&_.ain-logout]:[text-decoration:none]!
      [&_.ain-logout]:[display:flex]
      [&_.ain-logout]:[align-items:center]
      [&_.ain-logout]:[justify-content:flex-start]
      [&_.ain-logout]:[transition:color_0.2s_ease]
      [&_.ain-logout:hover]:[color:#f87171]!
      [&_.ain-logout:hover]:[text-decoration:none]!
      [&_.ain-logout:focus]:[text-decoration:none]!
      [&_.ain-logout:active]:[text-decoration:none]!
      [&_.ain-logout-icon-container]:[display:flex]
      [&_.ain-logout-icon-container]:[align-items:center]
      [&_.ain-logout-icon-container]:[justify-content:center]
      [&_.ain-logout-icon-container]:[width:32px]
      [&_.ain-logout-icon-container]:[height:32px]
      [&_.ain-logout-icon-container]:[flex:0_0_32px]
      [&_.ain-logout-icon-container_svg]:[width:18px]
      [&_.ain-logout-icon-container_svg]:[height:18px]
      [&_.ain-logout-icon-container_svg]:[flex:0_0_18px]
      motion-reduce:[&_.ain-nav-link]:[transition:none]!`}
    >
      {/* Sidebar brand */}
      <div className="ain-header">
        <div className="ain-brand">
          <img className="ain-brand-seal" src={seal} alt="Seal of Karnataka" />
          <span
            className={`ain-brand-text ${labelClass}`}
            aria-hidden={collapsed}
          >
            KARNATAKA AI CELL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="ain-nav">
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item" key={item.label}>
              <NavLink
                to={item.to}
                end={item.to === "/admin-dashboard"}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className={({ isActive }) =>
                  `nav-link ain-nav-link d-flex align-items-center ${isActive ? "active" : ""
                  }`
                }
              >
                <i className={`bi ${item.icon}`} />
                <span className={labelClass}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar toggle */}
      <button
        type="button"
        className="ain-footer-toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? "Show sidebar" : "Hide sidebar"}
      >
        <i className="bi bi-layout-sidebar" />
      </button>

      {/* Footer: admin and logout pinned to bottom */}
      <div className="ain-sidebar-footer">
        <div
          className="d-flex align-items-center gap-2 ain-user-chip"
          title={collapsed ? adminUsername : undefined}
        >
          <span className="ain-avatar-sm">
            {adminUsername.charAt(0).toUpperCase()}
          </span>
          <span className={`ain-user-name ${labelClass}`}>{adminUsername}</span>
        </div>
        <div className="ain-footer-actions">
          <a
            href="/"
            className="ain-logout"
            style={{ textDecoration: "none" }}
            title={collapsed ? "Logout" : undefined}
            aria-label="Logout"
            onClick={(event) => {
              event.preventDefault();
              onLogout();
            }}
          >
            <span className="ain-logout-icon-container">
              <LogOut aria-hidden="true" />
            </span>
            <span
              className={labelClass}
              style={{ marginLeft: 12 }}
              aria-hidden={collapsed}
            >
              Logout
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;