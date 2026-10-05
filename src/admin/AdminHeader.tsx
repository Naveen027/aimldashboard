import { Bell } from "lucide-react";
import { GlobalThemeToggle } from "../user/ThemeToggle";

const headerStyles = `
.ain-admin-header {
  --ain-hdr-border: rgba(15, 23, 42, 0.12);
  --ain-hdr-border-hover: rgba(15, 23, 42, 0.22);
  --ain-hdr-bg: #ffffff;
  --ain-hdr-bg-hover: rgba(15, 23, 42, 0.05);
  --ain-hdr-text: #0f172a;
  --ain-hdr-muted: #64748b;
  --ain-hdr-focus: #6366f1;
  display: flex;
  align-items: center;
  gap: 12px;
}

:root[data-theme="dark"] .ain-admin-header,
:root[data-bs-theme="dark"] .ain-admin-header,
.dark .ain-admin-header,
[data-theme="dark"] .ain-admin-header {
  --ain-hdr-border: rgba(255, 255, 255, 0.14);
  --ain-hdr-border-hover: rgba(255, 255, 255, 0.28);
  --ain-hdr-bg: #111827;
  --ain-hdr-bg-hover: rgba(255, 255, 255, 0.08);
  --ain-hdr-text: #f1f5f9;
  --ain-hdr-muted: #94a3b8;
  --ain-hdr-focus: #818cf8;
}

/* Icon buttons (notification + theme toggle wrapper) */
.ain-admin-header .ain-admin-notification,
.ain-admin-header .ain-admin-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 6px;
  color: var(--ain-hdr-text);
  background: transparent;
  // border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.ain-admin-header .ain-admin-notification svg {
  width: 20px;
  height: 20px;
}

.ain-admin-header .ain-admin-notification:hover,
.ain-admin-header .ain-admin-theme-toggle:hover,
.ain-admin-header .ain-admin-notification:focus-visible,
.ain-admin-header .ain-admin-theme-toggle:focus-within {
  background: var(--ain-hdr-bg-hover);
  border-color: var(--ain-hdr-border-hover);
}

/* Search */
.ain-admin-header .ain-admin-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-submit {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--ain-hdr-muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-submit:hover,
.ain-admin-header .ain-admin-search-box .ain-admin-search-submit:focus-visible {
  color: var(--ain-hdr-focus);
  background: var(--ain-hdr-bg-hover);
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-input {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 42px; /* left space reserved for the icon button */
  color: var(--ain-hdr-text);
  background: var(--ain-hdr-bg);
  border: 1px solid var(--ain-hdr-border);
  border-radius: 10px;
  box-shadow: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-input::placeholder {
  color: var(--ain-hdr-muted);
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-input:hover {
  border-color: var(--ain-hdr-border-hover);
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-input:focus {
  outline: none;
  color: var(--ain-hdr-text);
  background: var(--ain-hdr-bg);
  border-color: var(--ain-hdr-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ain-hdr-focus) 22%, transparent);
}

/* hide the browser's native clear "x" – we render our own */
.ain-admin-header .ain-admin-search-input::-webkit-search-cancel-button,
.ain-admin-header .ain-admin-search-input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--ain-hdr-muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.ain-admin-header .ain-admin-search-box .ain-admin-search-clear:hover {
  color: var(--ain-hdr-text);
  background: var(--ain-hdr-bg-hover);
}
`;

function AdminHeader() {
  return (
    <header className="ain-admin-header">
      <style>{headerStyles}</style>

      <button
        type="button"
        className="ain-admin-notification"
        aria-label="Notifications"
      >
        <Bell strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div className="ain-admin-theme-toggle">
        <GlobalThemeToggle />
      </div>
    </header>
  );
}

export default AdminHeader;