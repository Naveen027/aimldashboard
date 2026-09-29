import seal from "../assets/Seal_of_Karnataka.svg";
import logoutImage from "../assets/logout.png";
import "./admincss/Adminsidebar.css";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

interface AdminSidebarProps {
  adminUsername: string;
  onLogout: () => void;
}

const navItems: NavItem[] = [
  { label: "System Overview", icon: "bi-grid-1x2-fill", to: "/admin-dashboard" },
  { label: "User Management", icon: "bi-person", to: "/admin/user-management" },
  { label: "Model Control", icon: "bi-gear", to: "/admin/model-control" },
  { label: "Billing Admin", icon: "bi-receipt", to: "/admin/billing" },
  { label: "Global Settings", icon: "bi-sliders", to: "/admin/global-settings" },
  { label: "System Logs", icon: "bi-file-earmark-text", to: "/admin/system-logs" },
];

function AdminSidebar({ adminUsername, onLogout }: AdminSidebarProps) {
  return (
    <aside className="ain-sidebar d-flex flex-column flex-shrink-0">
      <div className="ain-brand d-flex align-items-center gap-2">
        <img className="ain-brand-seal" src={seal} alt="Seal of Karnataka" />
        <span className="ain-brand-text">KARNATAKA AI CELL</span>
      </div>

      <nav className="ain-nav flex-grow-1">
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item" key={item.label}>
              <NavLink
                to={item.to}
                end={item.to === "/admin-dashboard"}
                className={({ isActive }) =>
                  `nav-link ain-nav-link d-flex align-items-center gap-2 ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ain-sidebar-footer">
        <div className="d-flex align-items-center gap-2 ain-user-chip">
          <span className="ain-avatar-sm">
            {adminUsername.charAt(0).toUpperCase()}
          </span>
          <span className="ain-user-name">{adminUsername}</span>
        </div>
        <a
          href="/"
          className="ain-logout d-flex align-items-center gap-2"
          onClick={(event) => {
            event.preventDefault();
            onLogout();
          }}
        >
          <span className="ain-logout-icon-container">
            <img src={logoutImage} alt="" aria-hidden="true" />
          </span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
}

export default AdminSidebar;