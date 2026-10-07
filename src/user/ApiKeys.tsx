import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bot,
    Check,
    Copy,
    Cpu,
    Eye,
    EyeOff,
    FileSearch,
    Fingerprint,
    KeyRound,
    Languages,
    MessageSquareText,
    ScanFace,
    ShieldCheck,
    Terminal,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { aiModelCatalog } from "../data/aiModels";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import { useDashboardTheme } from "./ThemeToggle";

function ApiKeys() {
    const { authResponse, logout } = useAuth();
    const { isDarkMode: d } = useDashboardTheme();
    const navigate = useNavigate();
    const userName = authResponse?.username ?? "User";

    /* ---------- one key per model ---------- */
    // TODO: real keys must be created and stored by your backend. This only generates demo keys.
    const makeKey = () =>
        "ak_live_" +
        Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");

    const [keys] = useState<Record<string, string>>(() =>
        Object.fromEntries(aiModelCatalog.map((m) => [m.id, makeKey()]))
    );
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [quickModelId, setQuickModelId] = useState(aiModelCatalog[0]?.id ?? "");

    /* ---------- model look (same icons and colours as the usage dashboard) ---------- */
    const modelLook: Record<string, { color: string; Icon: LucideIcon }> = {
        "kartavya-face-matching": { color: "#4285f4", Icon: ScanFace },
        "muzzle-print-identification": { color: "#34a853", Icon: Fingerprint },
        "grievance-management": { color: "#fbbc04", Icon: MessageSquareText },
        "government-order-information": { color: "#9c27b0", Icon: FileSearch },
        "ai-enabled-chatbots": { color: "#1ba098", Icon: Bot },
        "kannada-kasthuri": { color: "#ea4335", Icon: Languages },
    };

    /* ---------- derived data ---------- */
    const q = searchQuery.trim().toLowerCase();
    const visibleModels = aiModelCatalog.filter(
        (m) => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );

    // TODO: replace with your real API base URL
    const snippet = `curl -X POST https://api.your-domain.com/v1/models/${quickModelId}/run \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Hello"}'`;

    /* ---------- handlers ---------- */
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const copy = async (id: string, text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1800);
    };

    /* ---------- theme classes ---------- */
    const title = d ? "text-white" : "text-slate-900";
    const muted = d ? "text-slate-400" : "text-slate-500";
    const card = d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700";
    const inset = d ? "border-gray-700 bg-gray-900/60" : "border-slate-200 bg-slate-50";

    const btn =
        "inline-flex items-center justify-center gap-1.5 !rounded-[10px] border px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";
    const btnPrimary = `${btn} !border-transparent !bg-gradient-to-br !from-violet-500 !to-indigo-500 !text-white shadow-sm hover:brightness-110`;

    /* ---------- UI ---------- */
    return (
        <div
            className={`relative isolate flex min-h-screen ${d ? "theme-dark bg-[#111827] text-[#f3f4f6]" : "theme-light bg-[#f8fafc] text-[#2c3e50]"
                }`}
        >
            <style>{`
                @keyframes ak-rise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
                .ak-rise { animation: ak-rise .5s cubic-bezier(.22,1,.36,1) both }
                .ak-root { overflow-x: hidden; -webkit-text-size-adjust: 100%; }
                .ak-root h2, .ak-root h3 { overflow-wrap: anywhere; }
                @media (prefers-reduced-motion: reduce) { .ak-rise { animation: none } }
            `}</style>

            <UserSidebar userName={userName} onLogout={handleLogout} />

            <main className="min-h-screen min-w-0 flex-1 bg-transparent ml-[var(--user-sidebar-width,260px)] transition-[margin] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-[767px]:ml-0">
                <UserHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                <div className="ak-root mx-auto flex w-full min-w-0 max-w-[1520px] flex-col gap-3 p-3 sm:gap-4 sm:p-[15px]">
                    {/* ---------- heading ---------- */}
                    <header className="ak-rise flex min-w-0 flex-wrap items-end justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">API Keys</h2>
                            <p className="mt-0.5 mb-0 text-sm text-[color:var(--muted)]">
                                Each AI model has its own key. Use it to connect your applications to Karnataka AI.
                            </p>
                        </div>
                        <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${d ? "bg-indigo-500/15 text-indigo-200" : "bg-indigo-50 text-indigo-700"
                                }`}
                        >
                            <KeyRound size={14} aria-hidden="true" />
                            {aiModelCatalog.length} keys active
                        </span>
                    </header>

                    {/* ---------- security note ---------- */}
                    <div
                        className={`ak-rise flex min-w-0 items-start gap-3 rounded-xl border p-3 text-sm ${d ? "border-amber-500/20 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                        style={{ animationDelay: "60ms" }}
                    >
                        <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <p className="m-0 min-w-0 break-words">
                            Keep keys secret. Store them in environment variables, never in browser code or source control.
                        </p>
                    </div>

                    {/* ---------- one card per model ---------- */}
                    <section className="grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3 sm:gap-4">
                        {visibleModels.map((model, i) => {
                            const { color, Icon } = modelLook[model.id] ?? { color: "#6366f1", Icon: Cpu };
                            const keyValue = keys[model.id];
                            const isShown = revealed[model.id];
                            const masked = `${keyValue.slice(0, 8)}${"•".repeat(16)}${keyValue.slice(-4)}`;

                            return (
                                <article
                                    key={model.id}
                                    className={`ak-rise flex min-w-0 flex-col gap-3 rounded-2xl border p-3 shadow-sm transition-shadow hover:shadow-lg sm:p-4 hover:shadow-indigo-500/10 ${card}`}
                                    style={{ animationDelay: `${(i + 2) * 60}ms` }}
                                >
                                    {/* model + status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                                style={{ color, background: `${color}1f` }}
                                            >
                                                <Icon size={22} aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className={`m-0 break-words [font-size:20px]! font-semibold leading-snug ${title}`}>{model.name}</h3>
                                                <p className={`m-0 break-words text-xs leading-snug sm:text-sm ${muted}`}>{model.category}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                                                }`}
                                        >
                                            Active
                                        </span>
                                    </div>

                                    {/* key value + show/hide */}
                                    <div className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 ${inset}`}>
                                        <code className={`min-w-0 flex-1 truncate font-mono text-xs sm:text-sm ${title}`}>
                                            {isShown ? keyValue : masked}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => setRevealed({ ...revealed, [model.id]: !isShown })}
                                            aria-label={isShown ? "Hide key" : "Show key"}
                                            className={`shrink-0 !rounded-[8px] p-1.5 transition-colors ${muted} hover:text-indigo-500`}
                                        >
                                            {isShown ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => copy(model.id, keyValue)}
                                            className={`${btnPrimary} min-w-[96px] flex-1`}
                                        >
                                            {copiedId === model.id ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedId === model.id ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}

                        {visibleModels.length === 0 && (
                            <p className={`col-span-full rounded-2xl border border-dashed p-8 text-center text-sm ${card}`}>
                                No models match your search.
                            </p>
                        )}
                    </section>

                    {/* ---------- quick start ---------- */}
                    <section className={`ak-rise w-full min-w-0 rounded-2xl border p-3 sm:p-4 ${card}`} style={{ animationDelay: "420ms" }}>
                        <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <Terminal size={18} className="text-indigo-500" aria-hidden="true" />
                                <h3 className={`m-0 text-base font-semibold ${title}`}>Quick start</h3>
                            </div>
                            <select
                                value={quickModelId}
                                onChange={(e) => setQuickModelId(e.target.value)}
                                aria-label="Choose a model for the example"
                                className={`w-full min-w-0 rounded-[10px] border px-3 py-1.5 text-base outline-none sm:w-auto sm:max-w-full sm:text-sm focus:border-indigo-500 ${d ? "border-gray-600 bg-gray-900 text-gray-100" : "border-slate-200 bg-white text-slate-700"
                                    }`}
                            >
                                {aiModelCatalog.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative min-w-0">
                            <pre className="m-0 max-w-full overflow-x-auto rounded-xl bg-slate-900 p-3 pt-12 text-xs leading-relaxed text-slate-100 sm:p-4 sm:pr-24 sm:pt-4 sm:text-sm">
                                <code>{snippet}</code>
                            </pre>
                            <button
                                type="button"
                                onClick={() => copy("snippet", snippet)}
                                className="absolute right-2 top-2 inline-flex items-center gap-1.5 !rounded-[8px] !bg-white/10 px-2.5 py-1.5 text-xs font-medium !text-white transition-colors hover:!bg-white/20"
                            >
                                {copiedId === "snippet" ? <Check size={13} /> : <Copy size={13} />}
                                {copiedId === "snippet" ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <p className={`m-0 mt-2 text-xs ${muted}`}>Replace YOUR_API_KEY with the key of the selected model.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default ApiKeys;