import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../context/AuthContext";
import { useDashboardTheme } from "../user/ThemeToggle";
import "./admincss/AdminDashboard.css";

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { authResponse, logout } = useAuth();
  const { isDarkMode } = useDashboardTheme();
  const navigate = useNavigate();
  const adminUsername = authResponse?.username || "Admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`ain-app d-flex ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      <AdminSidebar adminUsername={adminUsername} onLogout={handleLogout} />
      <main className="ain-main flex-grow-1">
        <AdminHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
