import seal from "../assets/Seal_of_Karnataka.svg";
import logoutImage from "../assets/logout.png";
import dashboardImage from "../assets/dashboard.png";
import myProfileImage from "../assets/myprofile.png";
import apiKeyImage from "../assets/apikey.png";
import supportImage from "../assets/support.png";
import { FlaskConical, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

interface NavItem {
  label: string;
  icon?: string;
  Icon?: LucideIcon;
  to: string;
  end?: boolean;
}

interface UserSidebarProps {
  userName: string;
  onLogout: () => void;
  collapsed?: boolean; // optional: if omitted, the sidebar manages its own state
  onToggle?: () => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: dashboardImage, to: "/user-dashboard", end: true },
  { label: "My Profile", icon: myProfileImage, to: "/my-profile", end: true },
  { label: "API Keys", icon: apiKeyImage, to: "/api-keys" },
  { label: "Playground", Icon: FlaskConical, to: "/playground" },
  { label: "Support", icon: supportImage, to: "/support" },
];

/*
 * RESPONSIVE BEHAVIOUR (identical to AdminSidebar)
 * ---------------------------------------------------------------------------
 * Desktop / tablet (>= 768px)
 *   Fixed sidebar, 260px expanded / 72px collapsed.
 *   Controlled when the parent passes `collapsed`, otherwise self-managed.
 *
 * Mobile (< 768px)
 *   - Off-canvas drawer (width: min(280px, 85vw)) with a hamburger <-> X button.
 *   - Closes via: X button, overlay tap, Escape, nav link tap, Logout,
 *     swipe left, route change, viewport growing past 767px.
 *   - Page scroll is locked while the drawer is open.
 *   - Drawer is `inert` while closed so Tab never lands on hidden links.
 *
 * NOTE: the hamburger floats over page content on mobile, so give your main
 * content wrapper top padding on small screens (e.g. `pt-16 md:pt-0`).
 *
 * ICON AXIS (desktop): every icon is centered on x = 36px (collapsed width 72px).
 */

const MOBILE_QUERY = "(max-width: 767px)";
const SWIPE_CLOSE_DISTANCE = 60; // px
const COLLAPSED_STORAGE_KEY = "ain-user-sidebar-collapsed";

const getInitialCollapsedState = () => {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

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

function UserSidebar({
  userName,
  onLogout,
  collapsed: collapsedProp,
  onToggle: onToggleProp,
}: UserSidebarProps) {
  // Controlled when the parent passes `collapsed`, otherwise self-managed
  const [internalCollapsed, setInternalCollapsed] = useState(getInitialCollapsedState);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? collapsedProp : internalCollapsed;

  const onToggle = useCallback(() => {
    if (!isControlled) {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? "1" : "0");
        } catch {
          // Keep the in-memory toggle working if browser storage is unavailable.
        }
        return next;
      });
    }
    onToggleProp?.();
  }, [isControlled, onToggleProp]);

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

  useEffect(() => {
    const sidebar = asideRef.current;
    const container = sidebar?.parentElement;
    if (!sidebar || !container) return;

    const observer = new ResizeObserver(([entry]) => {
      container.style.setProperty(
        "--user-sidebar-width",
        `${Math.round(entry.contentRect.width)}px`
      );
    });
    observer.observe(sidebar);

    return () => {
      observer.disconnect();
      container.style.removeProperty("--user-sidebar-width");
    };
  }, []);

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
          aria-controls="user-sidebar"
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
        id="user-sidebar"
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
      [&_.ain-nav-link_img]:[flex:0_0_20px]
      [&_.ain-nav-link_img]:[width:20px]
      [&_.ain-nav-link_img]:[height:20px]
      [&_.ain-nav-link_img]:[object-fit:contain]
      [&_.ain-nav-link_img]:[filter:brightness(0)_invert(1)]
      [&_.ain-nav-link_img]:[opacity:0.7]
      [&_.ain-nav-link_img]:[transition:opacity_0.3s_ease]
      [&_.ain-nav-link:hover_img]:[opacity:1]
      [&_.ain-nav-link:focus_img]:[opacity:1]
      [&_.ain-nav-link.active_img]:[opacity:1]
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
      [&_.ain-logout-icon-container_img]:[width:18px]
      [&_.ain-logout-icon-container_img]:[height:18px]
      [&_.ain-logout-icon-container_img]:[flex:0_0_18px]
      [&_.ain-logout-icon-container_img]:[object-fit:contain]
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
        <nav className="ain-nav" aria-label="Main navigation">
          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li className="nav-item" key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  title={labelsHidden ? item.label : undefined}
                  aria-label={item.label}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `nav-link ain-nav-link d-flex align-items-center ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  {item.Icon ? (
                    <item.Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  ) : (
                    <img src={item.icon} alt="" aria-hidden="true" />
                  )}
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

        {/* Footer: user and logout pinned to bottom */}
        <div className="ain-sidebar-footer">
          <div
            className="d-flex align-items-center gap-2 ain-user-chip"
            title={labelsHidden ? userName : undefined}
          >
            <span className="ain-avatar-sm">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className={`ain-user-name ${labelClass}`}>{userName}</span>
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
                <img
                  src={logoutImage}
                  alt=""
                  aria-hidden="true"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
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

export default UserSidebar;