import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';

/* ───────────────────────── Types ───────────────────────── */

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  createdAt: string;
  isActive: boolean;
}

interface SystemConfig {
  siteName: string;
  siteUrl: string;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  maxApiCalls: number;
  defaultRateLimit: number;
  allowedDomains: string;
  logRetention: number;
}

type TabId = 'general' | 'api' | 'notifications' | 'security';

/* ───────────── Shared class strings (full literals so Tailwind can see them) ─────────────
   Dark mode follows your existing `.ain-app.theme-dark` ancestor class.
   Responsive notes:
   - Inputs use text-base on mobile (prevents iOS Safari zoom-on-focus), text-sm from sm: up.
   - Buttons get a 44px min touch target on mobile.
*/

const card =
  '[border-radius:10px] border border-slate-200 bg-white shadow-sm [.ain-app.theme-dark_&]:border-slate-700 [.ain-app.theme-dark_&]:bg-slate-800';
const heading = 'text-slate-900 [.ain-app.theme-dark_&]:text-slate-100';
const muted = 'text-slate-500 [.ain-app.theme-dark_&]:text-slate-400';
const label = 'mb-1.5 block text-sm font-medium text-slate-700 [.ain-app.theme-dark_&]:text-slate-300';
const input =
  'block w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 [.ain-app.theme-dark_&]:border-slate-700 [.ain-app.theme-dark_&]:bg-slate-900 [.ain-app.theme-dark_&]:text-slate-100 [.ain-app.theme-dark_&]:hover:border-slate-600';
const btnPrimary =
  'inline-flex min-h-[44px] sm:min-h-0 items-center justify-center gap-2 [border-radius:10px]! bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-px hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-600/30 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30';
const btnGhost =
  'inline-flex min-h-[44px] sm:min-h-0 items-center justify-center gap-2 [border-radius:10px]! border border-slate-300 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 [.ain-app.theme-dark_&]:border-slate-600 [.ain-app.theme-dark_&]:text-slate-200 [.ain-app.theme-dark_&]:hover:bg-slate-700';
const row =
  'rounded-xl mb-2 border border-slate-200 p-3 transition-all duration-200 hover:border-indigo-300 hover:shadow-sm [.ain-app.theme-dark_&]:border-slate-700 [.ain-app.theme-dark_&]:hover:border-indigo-500/60';

/* Keyframes live here so the file works with no tailwind.config changes. */
const keyframes = `
@keyframes gs-panel { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes gs-pop   { from { opacity: 0; transform: scale(.96) translateY(-6px) } to { opacity: 1; transform: none } }
@keyframes gs-toast { from { opacity: 0; transform: translateY(12px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes gs-out   { to { opacity: 0; transform: translateX(24px) scale(.97) } }
.gs-root { max-width: 100%; }
.gs-tabs { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
.gs-tabs::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .gs-root * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}`;

/* ───────────────────────── Small building blocks ───────────────────────── */

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
}> = ({ checked, onChange, title, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`${row} group [border-radius:10px]! flex w-full min-w-0 items-center justify-between gap-3 text-left sm:gap-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20`}
  >
    <span className="min-w-0 flex-1">
      <span className={`block break-words [font-size:1rem] font-medium ${heading}`}>{title}</span>
      <span className={`block break-words text-xs ${muted}`}>{hint}</span>
    </span>
    <span
      className={`relative h-6 w-11 shrink-0 [border-radius:10px]! transition-colors duration-300 ${checked ? 'bg-indigo-600' : 'bg-slate-300 [.ain-app.theme-dark_&]:bg-slate-600'
        }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 [border-radius:10px]! bg-white shadow transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-active:w-6 ${checked ? 'translate-x-5 group-active:translate-x-4' : 'translate-x-0'
          }`}
      />
    </span>
  </button>
);

const Field: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <div className="min-w-0">
    <label className={label}>{title}</label>
    {children}
    {hint && <p className={`mt-1.5 text-xs ${muted}`}>{hint}</p>}
  </div>
);

const Badge: React.FC<{ on?: boolean; children: React.ReactNode }> = ({ on, children }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-medium ${on
        ? 'bg-emerald-100 text-emerald-700 [.ain-app.theme-dark_&]:bg-emerald-500/15 [.ain-app.theme-dark_&]:text-emerald-300'
        : 'bg-slate-100 text-slate-600 [.ain-app.theme-dark_&]:bg-slate-700 [.ain-app.theme-dark_&]:text-slate-300'
      }`}
  >
    {children}
  </span>
);

const tabs: { id: TabId; label: string }[] = [
  { id: 'general', label: 'General' },
  // { id: 'api', label: 'API keys' },
  { id: 'notifications', label: 'Notifications' },
  // { id: 'security', label: 'Security' },
];

const maskKey = (k: string) => `${k.slice(0, 8)}${'•'.repeat(14)}${k.slice(-4)}`;

const makeKey = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `sk_live_${Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 32)}`;
};

/* ───────────────────────── Component ───────────────────────── */

const GlobalSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'Karnataka AI Cell',
    siteUrl: 'https://karnatakaaicell.ai',
    emailNotifications: true,
    maintenanceMode: false,
    maxApiCalls: 10000000,
    defaultRateLimit: 5000,
    allowedDomains: 'localhost, *.ainexus.ai, *.company.com',
    logRetention: 90,
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Dashboard API Key', key: 'sk_live_4eC39HqLyjWDarhtT663', lastUsed: '2024-09-22 14:30', createdAt: '2024-01-15', isActive: true },
    { id: '2', name: 'Development Key', key: 'sk_test_51JWHQ7IxKxQ9D2eY6FZ', lastUsed: '2024-09-20 11:15', createdAt: '2024-02-01', isActive: true },
    { id: '3', name: 'Legacy Integration', key: 'sk_live_old_8mQ2P9Rx4YvZ2LjK3', lastUsed: '2024-08-15 09:00', createdAt: '2023-06-10', isActive: false },
  ]);

  const [notifications, setNotifications] = useState({
    emailOnErrors: true,
    emailOnLimits: true,
    dailySummary: true,
    weeklyReport: true,
    criticalAlerts: true,
  });

  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* Sliding tab indicator */
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const navRef = useRef<HTMLElement | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const measure = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  useLayoutEffect(measure, [measure]);

  /* Re-measure on window resize AND whenever the nav itself changes size
     (orientation change, sidebar collapse, font load, etc.) */
  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(navRef.current);
    }
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      ro?.disconnect();
    };
  }, [measure]);

  /* Keep the active tab visible when the tab bar scrolls horizontally on small screens */
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    const nav = navRef.current;
    if (!el || !nav) return;
    const target = el.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [activeTab]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const setCfg = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const num = (v: string) => (Number.isNaN(parseInt(v, 10)) ? 0 : parseInt(v, 10));

  const handleGenerate = () => {
    if (!newApiName.trim()) {
      setNameError(true);
      return;
    }
    setApiKeys((k) => [
      {
        id: Date.now().toString(),
        name: newApiName.trim(),
        key: makeKey(),
        lastUsed: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
      },
      ...k,
    ]);
    setNewApiName('');
    setNameError(false);
    setShowApiForm(false);
    setToast('API key generated');
  };

  const handleDelete = (id: string) => {
    setConfirmId(null);
    setRemovingId(id);
    setTimeout(() => {
      setApiKeys((k) => k.filter((x) => x.id !== id));
      setRemovingId(null);
      setToast('API key deleted');
    }, 280);
  };

  const handleCopy = async (k: ApiKey) => {
    try {
      await navigator.clipboard.writeText(k.key);
      setCopiedId(k.id);
      setTimeout(() => setCopiedId((c) => (c === k.id ? null : c)), 1600);
    } catch {
      setToast('Copy failed. Select the key and copy it manually.');
    }
  };

  const notificationItems: { key: keyof typeof notifications; title: string; hint: string }[] = [
    { key: 'emailOnErrors', title: 'Email on errors', hint: 'Get notified when critical errors occur' },
    { key: 'emailOnLimits', title: 'Rate limit alerts', hint: 'Notify when users approach rate limits' },
    { key: 'criticalAlerts', title: 'Critical alerts', hint: 'High-priority system alerts' },
    { key: 'dailySummary', title: 'Daily summary', hint: 'Daily usage and analytics digest' },
    { key: 'weeklyReport', title: 'Weekly report', hint: 'Comprehensive weekly analytics' },
  ];

  const securityItems = [
    { title: 'Two-factor authentication', badge: 'Enabled', on: true, text: '2FA is enabled for all admin accounts', action: 'Configure' },
    { title: 'IP whitelist', badge: '5 IPs', on: false, text: 'Restrict API access to specific IP addresses', action: 'Manage IPs' },
    { title: 'SSL/TLS certificate', badge: 'Valid', on: true, text: 'Expires: 2025-09-22', action: 'View details' },
    { title: 'Data encryption', badge: 'Active', on: true, text: 'All sensitive data is encrypted at rest and in transit', action: 'View policy' },
    { title: 'Audit logs', badge: '', on: false, text: 'View all admin actions and system events', action: 'View logs' },
  ];

  return (
    <AdminLayout>
      <style>{keyframes}</style>

      <div className="gs-root relative min-h-screen w-full min-w-0">
        {/* Header */}
        <header className="mb-3 flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">
              Global Settings
            </h2>
            <p className="mt-0.5 mb-0 text-sm text-[color:#6b7280] dark:text-slate-400">
              System configuration and admin preferences
            </p>
          </div>
          <button className={`${btnPrimary} w-full shrink-0 sm:w-auto`} onClick={() => setToast('Settings saved')}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M3 4a1 1 0 0 1 1-1h9.6a1 1 0 0 1 .7.3l2.4 2.4a1 1 0 0 1 .3.7V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm4 0v3h5V4H7Zm3 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
            </svg>
            Save changes
          </button>
        </header>

        {/* Tabs with sliding indicator (scrolls horizontally if they don't fit) */}
        <nav
          ref={navRef}
          role="tablist"
          className={`gs-tabs relative mb-3 flex w-full overflow-x-auto p-1.5 ${card}`}
        >
          <span
            aria-hidden
            className="absolute bottom-1.5 top-1.5 rounded-xl bg-indigo-600/10 ring-1 ring-indigo-600/20 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ left: indicator.left, width: indicator.width }}
          />
          {tabs.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative z-10 min-h-[44px] flex-1 shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-center text-sm font-medium transition-colors duration-200 sm:min-h-0 sm:flex-none sm:px-5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 ${activeTab === t.id
                  ? 'text-indigo-600 [.ain-app.theme-dark_&]:text-indigo-300'
                  : `${muted} hover:text-slate-800 [.ain-app.theme-dark_&]:hover:text-slate-200`
                }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Panels: keyed so the entrance replays on every tab change */}
        <section
          key={activeTab}
          role="tabpanel"
          className={`${card} min-w-0 p-4 sm:p-5 lg:p-6 [animation:gs-panel_.35s_cubic-bezier(.2,.7,.2,1)_both]`}
        >
          {/* ── General ── */}
          {activeTab === 'general' && (
            <div className="w-full max-w-2xl space-y-5 sm:space-y-6">
              <h2 className={`m-0 [font-size:1.25rem]! sm:[font-size:1.5rem]! font-semibold ${heading}`}>General</h2>

              <Field title="Site name" hint="The name displayed across the platform">
                <input className={input} value={config.siteName} onChange={(e) => setCfg('siteName', e.target.value)} />
              </Field>
              <Field title="Site URL" hint="Base URL for your platform">
                <input type="url" inputMode="url" className={input} value={config.siteUrl} onChange={(e) => setCfg('siteUrl', e.target.value)} />
              </Field>
              <Field title="Allowed domains" hint="Comma-separated list of allowed domains">
                <textarea rows={3} className={`${input} resize-y`} value={config.allowedDomains} onChange={(e) => setCfg('allowedDomains', e.target.value)} />
              </Field>
              <Field title="Log retention (days)" hint="90 days is recommended">
                <input type="number" inputMode="numeric" className={input} value={config.logRetention} onChange={(e) => setCfg('logRetention', num(e.target.value))} />
              </Field>

              <div className="space-y-3">
                <Toggle
                  checked={config.maintenanceMode}
                  onChange={(v) => setCfg('maintenanceMode', v)}
                  title="Maintenance mode"
                  hint="Disable user access during maintenance"
                />
                <Toggle
                  checked={config.emailNotifications}
                  onChange={(v) => setCfg('emailNotifications', v)}
                  title="Email notifications"
                  hint="Send system notifications via email"
                />
              </div>

              <div className="h-px bg-slate-200 [.ain-app.theme-dark_&]:bg-slate-700" />

              <h3 className={`m-0 [font-size:1rem]! font-semibold ${heading}`}>Rate limiting</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <Field title="Default rate limit (requests/min)">
                  <input type="number" inputMode="numeric" className={input} value={config.defaultRateLimit} onChange={(e) => setCfg('defaultRateLimit', num(e.target.value))} />
                </Field>
                <Field title="Max API calls per month">
                  <input type="number" inputMode="numeric" className={input} value={config.maxApiCalls} onChange={(e) => setCfg('maxApiCalls', num(e.target.value))} />
                </Field>
              </div>
            </div>
          )}

          {/* ── API keys ── */}
          {activeTab === 'api' && (
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-2">
                <h2 className={`m-0 [font-size:1.25rem]! sm:[font-size:1.5rem]! font-semibold ${heading}`}>API keys</h2>
                <button className={btnPrimary} onClick={() => setShowApiForm((s) => !s)}>
                  <span
                    className={`inline-block text-base leading-none transition-transform duration-300 ${showApiForm ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                  {showApiForm ? 'Close' : 'Generate key'}
                </button>
              </div>

              {/* Animated collapse using grid-rows */}
              <div
                className={`grid transition-all duration-300 ease-out ${showApiForm ? 'mb-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
              >
                <div className="overflow-hidden">
                  <div className={`${row} bg-slate-50 [.ain-app.theme-dark_&]:bg-slate-900/50`}>
                    <Field title="Key name" hint={undefined}>
                      <input
                        className={`${input} ${nameError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                        value={newApiName}
                        placeholder="e.g. Production key"
                        onChange={(e) => {
                          setNewApiName(e.target.value);
                          setNameError(false);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        tabIndex={showApiForm ? 0 : -1}
                      />
                      {nameError && <p className="mt-1.5 text-xs text-red-500">Enter a name so you can recognise this key later.</p>}
                    </Field>
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                      <button className={`${btnGhost} w-full sm:w-auto`} tabIndex={showApiForm ? 0 : -1} onClick={() => { setShowApiForm(false); setNameError(false); }}>
                        Cancel
                      </button>
                      <button className={`${btnPrimary} w-full sm:w-auto`} tabIndex={showApiForm ? 0 : -1} onClick={handleGenerate}>
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="m-0 grid list-none gap-3 p-0!">
                {apiKeys.length === 0 && (
                  <li className={`rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm [.ain-app.theme-dark_&]:border-slate-600 ${muted}`}>
                    No API keys yet. Generate one to start making requests.
                  </li>
                )}
                {apiKeys.map((k, i) => (
                  <li
                    key={k.id}
                    style={{ animationDelay: removingId ? undefined : `${i * 50}ms` }}
                    className={`${row} [border-radius:10px]! mb-0 flex min-w-0 flex-col gap-3 p-3! sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${removingId === k.id
                        ? '[animation:gs-out_.28s_ease_forwards]'
                        : '[animation:gs-pop_.35s_cubic-bezier(.2,.7,.2,1)_both]'
                      } ${k.isActive ? '' : 'opacity-70'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className={`mb-2 break-words [font-size:1rem]! font-semibold ${heading}`}>{k.name}</h3>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <code className="w-full min-w-0 break-all rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 sm:w-auto sm:flex-1 sm:truncate sm:break-normal [.ain-app.theme-dark_&]:bg-slate-900 [.ain-app.theme-dark_&]:text-slate-200">
                          {revealed[k.id] ? k.key : maskKey(k.key)}
                        </code>
                        <button
                          className="min-h-[40px] rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-slate-100 active:scale-95 sm:min-h-0 sm:px-2.5 [.ain-app.theme-dark_&]:hover:bg-slate-700"
                          onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                        >
                          {revealed[k.id] ? 'Hide' : 'Show'}
                        </button>
                        <button
                          className={`min-h-[40px] w-16 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200 active:scale-95 sm:min-h-0 ${copiedId === k.id
                              ? 'bg-emerald-100 text-emerald-700 [.ain-app.theme-dark_&]:bg-emerald-500/15 [.ain-app.theme-dark_&]:text-emerald-300'
                              : 'text-slate-500 hover:bg-slate-100 [.ain-app.theme-dark_&]:hover:bg-slate-700'
                            }`}
                          onClick={() => handleCopy(k)}
                        >
                          {copiedId === k.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className={`m-0 flex flex-wrap gap-x-4 gap-y-0.5 text-xs ${muted}`}>
                        <span>Created {k.createdAt}</span>
                        <span>Last used {k.lastUsed}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0 [.ain-app.theme-dark_&]:border-slate-700">
                      <button
                        onClick={() => setApiKeys((ks) => ks.map((x) => (x.id === k.id ? { ...x, isActive: !x.isActive } : x)))}
                        className={`min-h-[40px] [border-radius:10px]! px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95 sm:min-h-0 ${k.isActive
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 [.ain-app.theme-dark_&]:bg-emerald-500/15 [.ain-app.theme-dark_&]:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 [.ain-app.theme-dark_&]:bg-slate-700 [.ain-app.theme-dark_&]:text-slate-300'
                          }`}
                      >
                        {k.isActive ? 'Active' : 'Inactive'}
                      </button>

                      {confirmId === k.id ? (
                        <span className="flex items-center gap-1 [animation:gs-pop_.2s_ease_both]">
                          <button
                            className="min-h-[40px] [border-radius:10px]! bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-500 active:scale-95 sm:min-h-0"
                            onClick={() => handleDelete(k.id)}
                          >
                            Delete key
                          </button>
                          <button className="min-h-[40px] rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 sm:min-h-0 sm:px-2 [.ain-app.theme-dark_&]:hover:bg-slate-700" onClick={() => setConfirmId(null)}>
                            Keep
                          </button>
                        </span>
                      ) : (
                        <button
                          className="min-h-[40px] [border-radius:10px]! px-3 py-1.5 text-xs font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-95 sm:min-h-0 [.ain-app.theme-dark_&]:hover:bg-red-500/10 [.ain-app.theme-dark_&]:hover:text-red-400"
                          onClick={() => setConfirmId(k.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="min-w-0">
              <h2 className={`mb-3 mt-0 [font-size:1.25rem]! sm:mb-2 sm:[font-size:1.5rem]! font-semibold ${heading}`}>Notifications</h2>
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:gap-y-3 md:grid-cols-2 md:gap-x-4">
                {notificationItems.map((n) => (
                  <Toggle
                    key={n.key}
                    checked={notifications[n.key]}
                    onChange={(v) => setNotifications((s) => ({ ...s, [n.key]: v }))}
                    title={n.title}
                    hint={n.hint}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="min-w-0">
              <h2 className={`mb-3 mt-0 [font-size:1.25rem]! sm:mb-1 sm:[font-size:1.5rem]! font-semibold ${heading}`}>Security</h2>
              <div className="grid gap-3">
                {securityItems.map((s) => (
                  <div
                    key={s.title}
                    className={`${row} mb-0 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4`}
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className={`m-0 break-words [font-size:1rem]! font-semibold ${heading}`}>{s.title}</h3>
                        {s.badge && <Badge on={s.on}>{s.badge}</Badge>}
                      </div>
                      <p className={`m-0 break-words text-sm ${muted}`}>{s.text}</p>
                    </div>
                    <button className={`${btnGhost} w-full shrink-0 !px-3.5 !py-2 text-[13px] sm:w-auto`}>{s.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Toast: full-width bar on mobile, floating card on larger screens */}
        {toast && (
          <div
            role="status"
            key={toast}
            className="fixed inset-x-4 bottom-4 z-50 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm sm:text-left [animation:gs-toast_.3s_cubic-bezier(.2,.7,.2,1)_both]"
            style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {toast}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GlobalSettings;