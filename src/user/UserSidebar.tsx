import { NavLink, useLocation } from "react-router-dom";
import seal from "../assets/Seal_of_Karnataka.svg";
import logoutImage from "../assets/logout.png";
import dashboardImage from "../assets/dashboard.png";
import myProfileImage from "../assets/myprofile.png";
import apiKeyImage from "../assets/apikey.png";
import billingImage from "../assets/billing.png";
import supportImage from "../assets/support.png";

interface UserSidebarProps {
    userName: string;
    onLogout: () => void;
    onProfileClick: () => void;
    onDashboardClick: () => void;
    activeView?: "dashboard" | "profile";
}

function UserSidebar({
    userName,
    onLogout,
    onProfileClick,
    onDashboardClick,
    activeView,
}: UserSidebarProps) {
    const { pathname } = useLocation();
    const isDashboardRoute = pathname === "/user-dashboard";

    return (
        <aside className="sidebar">
            <header className="sidebar-header">
                <h1 className="sidebar-title">
                    <img src={seal} alt="Seal of Karnataka" />
                    KARNATAKA AI
                </h1>
            </header>
            <nav
                aria-label="Main navigation"
                className="sidebar-nav"
            >
                <button
                    type="button"
                    className={`nav-link ${
                        isDashboardRoute && activeView !== "profile"
                            ? "active"
                            : ""
                    }`}
                    aria-current={
                        isDashboardRoute && activeView !== "profile"
                            ? "page"
                            : undefined
                    }
                    onClick={onDashboardClick}
                >
                    <img className="nav-icon" src={dashboardImage} alt="" aria-hidden="true" />
                    Dashboard
                </button>
                <button
                    type="button"
                    className={`nav-link ${
                        isDashboardRoute && activeView === "profile"
                            ? "active"
                            : ""
                    }`}
                    aria-current={
                        isDashboardRoute && activeView === "profile"
                            ? "page"
                            : undefined
                    }
                    onClick={(event) => {
                        event.preventDefault();
                        onProfileClick();
                    }}
                >
                    <img className="nav-icon" src={myProfileImage} alt="" aria-hidden="true" />
                    My Profile
                </button>
                <NavLink to="/api-keys" className="nav-link">
                    <img className="nav-icon" src={apiKeyImage} alt="" aria-hidden="true" />
                    API Keys
                </NavLink>
                <NavLink to="/billing" className="nav-link">
                    <img className="nav-icon" src={billingImage} alt="" aria-hidden="true" />
                    Billing
                </NavLink>
                <NavLink to="/support" className="nav-link">
                    <img className="nav-icon" src={supportImage} alt="" aria-hidden="true" />
                    Support
                </NavLink>
            </nav>
            <section className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">
                        {userName.charAt(0)}
                    </div>
                    <p className="user-name">{userName}</p>
                </div>
                <button
                    type="button"
                    className="btn btn-logout"
                    onClick={onLogout}
                >
                    <span className="logout-icon-container">
                        <img
                            className="logout-icon"
                            src={logoutImage}
                            alt=""
                            aria-hidden="true"
                        />
                    </span>
                    <span>Logout</span>
                </button>
            </section>
        </aside>
    );
}

export default UserSidebar;
