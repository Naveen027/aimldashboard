import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

interface SystemConfig {
  emailNotifications: boolean;
  maintenanceMode: boolean;
  maxApiCalls: number;
  defaultRateLimit: number;
}

const card =
  '[border-radius:10px] border border-slate-200 bg-white shadow-sm [.ain-app.theme-dark_&]:border-slate-700 [.ain-app.theme-dark_&]:bg-slate-800';
const heading = 'text-slate-900 [.ain-app.theme-dark_&]:text-slate-100';
const muted = 'text-slate-500 [.ain-app.theme-dark_&]:text-slate-400';
const label = 'mb-1.5 block text-sm font-medium text-slate-700 [.ain-app.theme-dark_&]:text-slate-300';
const input =
  'block w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-800 outline-none transition-all duration-200 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 [.ain-app.theme-dark_&]:border-slate-700 [.ain-app.theme-dark_&]:bg-slate-900 [.ain-app.theme-dark_&]:text-slate-100 [.ain-app.theme-dark_&]:hover:border-slate-600';
const button =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px]! bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-indigo-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 sm:min-h-0';
const row =
  'mb-2 rounded-xl border border-slate-200 p-3 transition-all duration-200 hover:border-indigo-300 hover:shadow-sm [.ain-app.theme-dark_&]:border-slate-700 [.ain-app.theme-dark_&]:hover:border-indigo-500/60';

const keyframes = `
@keyframes gs-panel { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes gs-toast { from { opacity: 0; transform: translateY(12px) scale(.96) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) {
  .gs-root * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}`;

const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  hint: string;
}> = ({ checked, onChange, title, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`${row} group flex w-full min-w-0 items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:gap-4`}
  >
    <span className="min-w-0 flex-1">
      <span className={`block break-words text-base font-medium ${heading}`}>{title}</span>
      <span className={`block break-words text-xs ${muted}`}>{hint}</span>
    </span>
    <span
      className={`relative h-6 w-11 shrink-0 rounded-[10px]! transition-colors duration-300 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 [.ain-app.theme-dark_&]:bg-slate-600'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-[10px]! bg-white shadow transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </span>
  </button>
);

const Field: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-w-0">
    <label className={label}>{title}</label>
    {children}
  </div>
);

const GlobalSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    emailNotifications: true,
    maintenanceMode: false,
    maxApiCalls: 10000000,
    defaultRateLimit: 5000,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const setConfigValue = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const setNumberValue = (key: 'defaultRateLimit' | 'maxApiCalls', value: string) => {
    const parsed = Number.parseInt(value, 10);
    setConfigValue(key, Number.isNaN(parsed) ? 0 : parsed);
  };

  return (
    <AdminLayout>
      <style>{keyframes}</style>

      <div className="gs-root relative min-h-screen w-full min-w-0">
        <header className="mb-3 flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="m-0 break-words text-[1.35rem]! font-bold leading-tight tracking-tight text-black dark:text-white sm:text-[1.6rem]!">
              Global Settings
            </h2>
            <p className="mb-0 mt-0.5 text-sm text-[#6b7280] dark:text-slate-400">
              System configuration and admin preferences
            </p>
          </div>
          <button className={`${button} w-full shrink-0 sm:w-auto`} onClick={() => setToast('Settings saved')}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M3 4a1 1 0 0 1 1-1h9.6a1 1 0 0 1 .7.3l2.4 2.4a1 1 0 0 1 .3.7V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm4 0v3h5V4H7Zm3 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
            </svg>
            Save changes
          </button>
        </header>

        <section className={`${card} min-w-0 p-4 sm:p-5 lg:p-6 [animation:gs-panel_.35s_cubic-bezier(.2,.7,.2,1)_both]`}>
          <div className="w-full max-w-2xl space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <Toggle
                checked={config.maintenanceMode}
                onChange={(value) => setConfigValue('maintenanceMode', value)}
                title="Maintenance mode"
                hint="Disable user access during maintenance"
              />
              <Toggle
                checked={config.emailNotifications}
                onChange={(value) => setConfigValue('emailNotifications', value)}
                title="Email notifications"
                hint="Send system notifications via email"
              />
            </div>

            <div className="h-px bg-slate-200 [.ain-app.theme-dark_&]:bg-slate-700" />

            <h3 className={`m-0 text-base font-semibold ${heading}`}>Rate limiting</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <Field title="Default rate limit (requests/min)">
                <input
                  type="number"
                  inputMode="numeric"
                  className={input}
                  value={config.defaultRateLimit}
                  onChange={(event) => setNumberValue('defaultRateLimit', event.target.value)}
                />
              </Field>
              <Field title="Max API calls per month">
                <input
                  type="number"
                  inputMode="numeric"
                  className={input}
                  value={config.maxApiCalls}
                  onChange={(event) => setNumberValue('maxApiCalls', event.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>

        {toast && (
          <div
            role="status"
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
