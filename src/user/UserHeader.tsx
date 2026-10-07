import { Bell } from "lucide-react";
import { GlobalThemeToggle } from "./ThemeToggle";

interface UserHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

const headerStyles = `
.ain-user-header {
  --ain-hdr-border: rgba(15, 23, 42, 0.12);
  --ain-hdr-border-hover: rgba(15, 23, 42, 0.22);
  --ain-hdr-bg: #ffffff;
  --ain-hdr-bg-hover: rgba(15, 23, 42, 0.05);
  --ain-hdr-text: #0f172a;
  --ain-hdr-muted: #64748b;
  --ain-hdr-focus: #6366f1;
  --ain-hdr-bar-border: #eef0f4;
  --ain-hdr-bar-shadow: 0 1px 3px rgba(20, 30, 60, 0.08);

  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  height: 54px;
  padding: 8px 32px;
  background: var(--ain-hdr-bg);
  border-bottom: 1px solid var(--ain-hdr-bar-border);
  box-shadow: var(--ain-hdr-bar-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

:root[data-theme="dark"] .ain-user-header,
:root[data-bs-theme="dark"] .ain-user-header,
.ain-app.theme-dark .ain-user-header,
.theme-dark .ain-user-header,
.dark .ain-user-header,
[data-theme="dark"] .ain-user-header {
  --ain-hdr-border: rgba(255, 255, 255, 0.14);
  --ain-hdr-border-hover: rgba(255, 255, 255, 0.28);
  --ain-hdr-bg: #1f2937;
  --ain-hdr-bg-hover: rgba(255, 255, 255, 0.08);
  --ain-hdr-text: #f1f5f9;
  --ain-hdr-muted: #94a3b8;
  --ain-hdr-focus: #818cf8;
  --ain-hdr-bar-border: #374151;
  --ain-hdr-bar-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

@media (max-width: 768px) {
  .ain-user-header {
    padding: 8px 16px;
  }
}

/* Icon buttons (notification + theme toggle wrapper) */
.ain-user-header .ain-user-notification,
.ain-user-header .ain-user-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 6px;
  color: var(--ain-hdr-text);
  background: transparent;
  /* border: 1px solid transparent; */
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.ain-user-header .ain-user-notification svg {
  width: 20px;
  height: 20px;
}

.ain-user-header .ain-user-notification:hover,
.ain-user-header .ain-user-theme-toggle:hover,
.ain-user-header .ain-user-notification:focus-visible,
.ain-user-header .ain-user-theme-toggle:focus-within {
  background: var(--ain-hdr-bg-hover);
  border-color: var(--ain-hdr-border-hover);
}

.ain-user-header .ain-user-notification:focus-visible {
  outline: 2px solid var(--ain-hdr-focus);
  outline-offset: 2px;
}
`;

function UserHeader(_props: UserHeaderProps) {
    return (
        <header className="ain-user-header">
            <style>{headerStyles}</style>

            <button
                type="button"
                className="ain-user-notification"
                aria-label="Notifications"
            >
                <Bell strokeWidth={1.5} aria-hidden="true" />
            </button>

            <div className="ain-user-theme-toggle">
                <GlobalThemeToggle />
            </div>
        </header>
    );
}

export default UserHeader;