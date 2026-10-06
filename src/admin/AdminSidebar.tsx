import seal from "../assets/Seal_of_Karnataka.svg";
import { LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

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
  { label: "AI Products", icon: "bi-gear", to: "/admin/model-control" },
  { label: "Billing Admin", icon: "bi-receipt", to: "/admin/billing" },
  { label: "Global Settings", icon: "bi-sliders", to: "/admin/global-settings" },
  { label: "System Logs", icon: "bi-file-earmark-text", to: "/admin/system-logs" },
];

/*
 * RESPONSIVE BEHAVIOUR
 * ---------------------------------------------------------------------------
 * Desktop / tablet (>= 768px)
 *   Fixed sidebar, 260px expanded / 72px collapsed (controlled by the
 *   `collapsed` + `onToggle` props, exactly as before).
 *
 * Mobile (< 768px)
 *   - Sidebar becomes an off-canvas drawer (width: min(280px, 85vw)).
 *   - A hamburger button is fixed at the top-left. It morphs into an "X"
 *     and slides to the drawer's right edge while the drawer is open.
 *   - Ways to close the drawer:
 *       1. Tap the X button
 *       2. Tap the dark overlay
 *       3. Press Escape
 *       4. Tap any nav link
 *       5. Tap Logout
 *       6. Swipe the drawer to the left
 *       7. Route change (browser back/forward, programmatic navigation)
 *       8. Viewport grows past 767px (rotate / resize)
 *   - Page scroll is locked while the drawer is open.
 *   - Drawer is `inert` while closed so Tab never lands on hidden links.
 *
 * NOTE: the hamburger floats over your page content on mobile, so give your
 * main content wrapper some top padding on small screens (e.g. `pt-16
 * md:pt-0`) so it doesn't sit under the button.
 *
 * ICON AXIS (desktop)
 * Collapsed width is 72px, so every icon is centered on x = 36px:
 *   logo        : padding-left 18 + 36px wide  -> center 36
 *   nav icon    : margin 12 + padding 14 + 20px -> center 36
 *   toggle      : margin-left 20 + 32px wide    -> center 36
 *   admin avatar: footer padding 20 + 32px wide -> center 36
 *   logout icon : footer padding 20 + 32px wide -> center 36
 * These offsets are constant (never change on collapse), so icons never
 * move horizontally while the sidebar animates.
 */

const MOBILE_QUERY = "(max-width: 767px)";
const SWIPE_CLOSE_DISTANCE = 60; // px

// Width classes: only one set is applied at a time, so they never conflict.
const expandedWidth = `
  [width:260px]
  [flex:0_0_260px]
  max-[991px]:[width:240px]
  max-[991px]:[flex-basis:240px]`;
const collapsedWidth = `
  [width:72px]
  [flex:0_0_72px]`;
const mobileWidth = `
  [width:min(280px,85vw)]`;

function AdminSidebar({
  adminUsername,
  onLogout,
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const location = useLocation();
  const asideRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_QUERY).matches
      : false
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  // Labels are always visible in the mobile drawer; the desktop collapse
  // state only applies on >= 768px.
  const labelsHidden = collapsed && !isMobile;
  const drawerOpen = isMobile && mobileOpen;

  /* Track viewport; close drawer when leaving the mobile breakpoint */
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      if (!event.matches) setMobileOpen(false);
    };
    setIsMobile(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  /* Close on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Close on Escape + return focus to the toggle button */
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  /* Lock page scroll while the drawer is open */
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  /* Keep hidden drawer out of the tab order / accessibility tree */
  useEffect(() => {
    const el = asideRef.current as (HTMLElement & { inert?: boolean }) | null;
    if (!el) return;
    el.inert = isMobile && !mobileOpen;
  }, [isMobile, mobileOpen]);

  /* Swipe-left to close */
  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (deltaX < -SWIPE_CLOSE_DISTANCE) closeMobile();
  };

  const easing = "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";
  const labelClass = `whitespace-nowrap transition-opacity duration-[450ms] ${easing} motion-reduce:transition-none ${
    labelsHidden ? "opacity-0" : "opacity-100"
  }`;

  const barBase = `absolute left-1/2 top-1/2 block h-[2px] w-5 -ml-2.5 -mt-px rounded-full bg-white transition-[transform,opacity] duration-[350ms] ${easing} motion-reduce:transition-none`;

  return (
    <>
      {/* Mobile: hamburger <-> X toggle (slides with the drawer) */}
      {isMobile && (
        <button
          ref={menuButtonRef}
          type="button"
          onClick={toggleMobile}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
          className={`
            [position:fixed]
            [top:7px]
            [left:12px]
            [z-index:60]
            [width:40px]
            [height:40px]
            [border:0]
            [border-radius:10px]!
            [background:#131b2e]
            [box-shadow:0_2px_10px_rgba(0,0,0,0.25)]
            [cursor:pointer]
            [-webkit-tap-highlight-color:transparent]
            transition-transform
            duration-[450ms]
            ${easing}
            motion-reduce:transition-none
            focus-visible:[outline:2px_solid_rgba(255,255,255,0.6)]
            focus-visible:[outline-offset:2px]
            ${
              mobileOpen
                ? "[transform:translateX(calc(min(280px,85vw)_-_64px))] [box-shadow:none]"
                : "[transform:translateX(0)]"
            }`}
        >
          <span
            aria-hidden="true"
            className={`${barBase} ${
              mobileOpen
                ? "[transform:translateY(0)_rotate(45deg)]"
                : "[transform:translateY(-6px)]"
            }`}
          />
          <span
            aria-hidden="true"
            className={`${barBase} ${
              mobileOpen
                ? "opacity-0 [transform:scaleX(0)]"
                : "opacity-100 [transform:scaleX(1)]"
            }`}
          />
          <span
            aria-hidden="true"
            className={`${barBase} ${
              mobileOpen
                ? "[transform:translateY(0)_rotate(-45deg)]"
                : "[transform:translateY(6px)]"
            }`}
          />
        </button>
      )}

      {/* Mobile: dark overlay, tap to close */}
      {isMobile && (
        <div
          onClick={closeMobile}
          aria-hidden="true"
          className={`
            [position:fixed]
            [inset:0]
            [z-index:40]
            [background:rgba(8,12,24,0.55)]
            [backdrop-filter:blur(2px)]
            transition-opacity
            duration-[450ms]
            ${easing}
            motion-reduce:transition-none
            ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />
      )}

      <aside
        id="admin-sidebar"
        ref={asideRef}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        className={`ain-sidebar [border-radius:0px_10px_10px_0px]!
      ${isMobile ? mobileWidth : collapsed ? collapsedWidth : expandedWidth}
      ${
        isMobile
          ? `[height:100dvh] [z-index:50] ${
              mobileOpen
                ? "[transform:translateX(0)] [box-shadow:0_0_40px_rgba(0,0,0,0.45)]"
                : "[transform:translateX(-100%)]"
            }`
          : "[height:100vh]  [z-index:30]"
      }
      transition-[width,transform]
      duration-[450ms]
      ease-[cubic-bezier(0.22,1,0.36,1)]
      motion-reduce:transition-none
      [display:flex]
      [flex-direction:column]
      [background:#131b2e]
      [color:#cfd3e0]
      [padding:0]
      [overflow:hidden]
      [position:fixed]
      [top:0]
      [left:0]

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
      ${isMobile ? "[&_.ain-brand-text]:[font-size:15px]" : "[&_.ain-brand-text]:[font-size:18px]"}
      [&_.ain-brand-text]:[font-weight:700]
      [&_.ain-brand-text]:[line-height:1.15]
      [&_.ain-brand-text]:[white-space:nowrap]
      [&_.ain-brand-text]:[margin:0]

      [&_.ain-nav]:[flex:1_1_auto]
      [&_.ain-nav]:[min-height:0]
      [&_.ain-nav]:[overflow-y:auto]
      [&_.ain-nav]:[overflow-x:hidden]
      [&_.ain-nav]:[overscroll-behavior:contain]
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
     [&_.ain-nav-link.active]:![border-left:2px_solid_#fff]


      [&_.ain-footer-toggle]:[height:32px]
      [&_.ain-footer-toggle]:[margin-left:20px]
      [&_.ain-footer-toggle]:[display:flex]
      [&_.ain-footer-toggle]:[align-items:left]
      [&_.ain-footer-toggle]:[justify-content:left]
      [&_.ain-footer-toggle]:[border:0]
      [&_.ain-footer-toggle]:[border-radius:8px]
      [&_.ain-footer-toggle]:[background:transparent]
      [&_.ain-footer-toggle]:[color:rgba(255,_255,_255,_0.7)]
      [&_.ain-footer-toggle]:[font-size:20px]
      [&_.ain-footer-toggle]:[line-height:1]
      [&_.ain-footer-toggle]:[cursor:pointer]
      [&_.ain-footer-toggle]:[transform:translateX(26px)]
      [&_.ain-footer-toggle]:[transition:color_0.2s_ease,_background-color_0.2s_ease]

      [&_.ain-footer-toggle:hover]:[color:#fff]
      [&_.ain-footer-toggle:focus-visible]:[outline:2px_solid_rgba(255,_255,_255,_0.5)]
      [&_.ain-footer-toggle:focus-visible]:[outline-offset:2px]

      [&_.ain-sidebar-footer]:[flex:0_0_auto]
      [&_.ain-sidebar-footer]:[margin-top:auto]
      ${
        isMobile
          ? "[&_.ain-sidebar-footer]:[padding:12px_20px_calc(12px_+_env(safe-area-inset-bottom,_0px))]"
          : "[&_.ain-sidebar-footer]:[padding:12px_20px]"
      }
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
        <div className="ain-header ">
          <div className="ain-brand">
            <img
              className="ain-brand-seal"
              src={seal}
              alt="Seal of Karnataka"
            />
            <span
              className={`ain-brand-text ${labelClass}`}
              aria-hidden={labelsHidden}
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
                  title={labelsHidden ? item.label : undefined}
                  aria-label={item.label}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `nav-link ain-nav-link d-flex align-items-center ${
                      isActive ? "active" : ""
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

        {/* Desktop sidebar collapse toggle (not needed in the mobile drawer) */}
        {!isMobile && (
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
        )}

        {/* Footer: admin and logout pinned to bottom */}
        <div className="ain-sidebar-footer">
          <div
            className="d-flex align-items-center gap-2 ain-user-chip"
            title={labelsHidden ? adminUsername : undefined}
          >
            <span className="ain-avatar-sm">
              {adminUsername.charAt(0).toUpperCase()}
            </span>
            <span className={`ain-user-name ${labelClass}`}>
              {adminUsername}
            </span>
          </div>
          <div className="ain-footer-actions">
            <a
              href="/"
              className="ain-logout"
              style={{ textDecoration: "none" }}
              title={labelsHidden ? "Logout" : undefined}
              aria-label="Logout"
              onClick={(event) => {
                event.preventDefault();
                closeMobile();
                onLogout();
              }}
            >
              <span className="ain-logout-icon-container">
                <LogOut aria-hidden="true" />
              </span>
              <span
                className={labelClass}
                style={{ marginLeft: 12 }}
                aria-hidden={labelsHidden}
              >
                Logout
              </span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;