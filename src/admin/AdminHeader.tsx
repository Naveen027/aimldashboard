import { Bell, Search } from "lucide-react";
import "../css/UserDashboard.css";
import { GlobalThemeToggle } from "../user/ThemeToggle";

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

function AdminHeader({
  searchQuery,
  onSearchChange,
}: AdminHeaderProps) {
  return (
    <header className="top-header">
      <button
        type="button"
        className="btn-notification"
        aria-label="Notifications"
      >
        <Bell strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className="search-box">
        <label htmlFor="admin-search-input" className="visually-hidden">
          Search
        </label>
        <Search
          className="search-icon"
          size={18}
          aria-hidden="true"
        />
        <input
          id="admin-search-input"
          type="search"
          className="form-control search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <GlobalThemeToggle />
    </header>
  );
}

export default AdminHeader;