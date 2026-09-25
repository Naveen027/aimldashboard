import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

interface UserSidebarProps {
    userName: string;
    onLogout: () => void;
    onProfileClick: () => void;
    onDashboardClick: () => void;
}

function UserSidebar({
    userName,
    onLogout,
    onProfileClick,
    onDashboardClick,
}: UserSidebarProps) {
    return (
        <aside className="sidebar">
            <header className="sidebar-header">
                <h1 className="sidebar-title">
                    <img src={logo} alt="Karnataka Ai Logo" />
                    KARNATAKA AI
                </h1>
            </header>
            <nav
                aria-label="Main navigation"
                className="sidebar-nav"
            >
                <button
                    type="button"
                    className="nav-link"
                    onClick={onDashboardClick}
                >
                    <span className="nav-icon">📊</span>
                    Dashboard
                </button>
                <button
                    type="button"
                    className="nav-link"
                    onClick={(event) => {
                        event.preventDefault();
                        onProfileClick();
                    }}
                >
                    <span className="nav-icon">👤</span>
                    My Profile
                </button>
                <Link to="/api-keys" className="nav-link">
                    <span className="nav-icon">🔑</span>
                    API Keys
                </Link>
                <Link to="/billing" className="nav-link">
                    <span className="nav-icon">💳</span>
                    Billing
                </Link>
                <Link to="/support" className="nav-link">
                    <span className="nav-icon">❓</span>
                    Support
                </Link>
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
                    className="btn btn-logout w-100"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </section>
        </aside>
    );
}

export default UserSidebar;

