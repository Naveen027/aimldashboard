import { Bell, Search } from "lucide-react";
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
    <header className="ain-admin-header">
      <button
        type="button"
        className="ain-admin-notification"
        aria-label="Notifications"
      >
        <Bell strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className="ain-admin-search-box">
        <label htmlFor="admin-search-input" className="visually-hidden">
          Search
        </label>
        <Search
          className="ain-admin-search-icon"
          size={18}
          aria-hidden="true"
        />
        <input
          id="admin-search-input"
          type="search"
          className="form-control ain-admin-search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="ain-admin-theme-toggle">
        <GlobalThemeToggle />
      </div>
    </header>
  );
}

export default AdminHeader;