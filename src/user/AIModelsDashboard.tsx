import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowDown,
    ArrowUp,
    Bot,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    FileSearch,
    Fingerprint,
    Languages,
    MessageSquareText,
    Radio,
    ScanFace,
    Search,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { useDashboardTheme } from "./ThemeToggle";
import { aiModelCatalog } from "../data/aiModels";

/* ------------------------------------------------------------------ */
/* Model metadata (same catalog, colors and icons as before)           */
/* ------------------------------------------------------------------ */

const MODEL_PRESENTATION: Record<string, { color: string; Icon: LucideIcon }> = {
    "kartavya-face-matching": { color: "#4285f4", Icon: ScanFace },
    "muzzle-print-identification": { color: "#34a853", Icon: Fingerprint },
    "grievance-management": { color: "#fbbc04", Icon: MessageSquareText },
    "government-order-information": { color: "#9c27b0", Icon: FileSearch },
    "ai-enabled-chatbots": { color: "#1ba098", Icon: Bot },
    "kannada-kasthuri": { color: "#ea4335", Icon: Languages },
};

interface ModelStats {
    id: string;
    name: string;
    category: string;
    description: string;
    highlights: string[];
    color: string;
    Icon: LucideIcon;
    totalTokens: number; // K tokens
    timeSpentHours: number;
    daysActive: number; // out of last 30
    requests: number;
    lastUsedDaysAgo: number;
}

/* Deterministic mock telemetry (swap for your real API call) */
function seededRandom(seed: number): number {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function buildStats(): ModelStats[] {
    return aiModelCatalog.map((model, index) => {
        const presentation = MODEL_PRESENTATION[model.id];
        if (!presentation) {
            throw new Error(`Missing AI model presentation for "${model.id}".`);
        }

        const base = 40 + index * 22;
        const volatility = 12 + seededRandom(index * 97 + 3) * 18;
        const daily = Array.from({ length: 14 }, (_, d) => {
            const wave = Math.sin(d / 2.1 + index) * volatility;
            const noise = (seededRandom(index * 1000 + d) - 0.5) * volatility * 0.8;
            return Math.max(4, Math.round(base + wave + noise));
        });
        const totalTokens = daily.reduce((a, b) => a + b, 0);
        return {
            ...model,
            ...presentation,
            totalTokens,
            timeSpentHours: Math.round((totalTokens / (6 + index)) * 3.4) / 10,
            daysActive: 9 + Math.floor(seededRandom(index * 55 + 2) * 20),
            requests: Math.round(totalTokens * (4 + seededRandom(index * 13) * 3)),
            lastUsedDaysAgo: Math.floor(seededRandom(index * 8 + 5) * 3),
        };
    });
}

type Metric = "Tokens" | "Requests" | "Hours";
const METRICS: Record<Metric, { getValue: (stats: ModelStats) => number; unit: string }> = {
    Tokens: { getValue: (stats) => stats.totalTokens, unit: "K" },
    Requests: { getValue: (stats) => stats.requests, unit: "" },
    Hours: { getValue: (stats) => stats.timeSpentHours, unit: "h" },
};
const PAGE_SIZE = 4;
const METRIC_OPTIONS = ["Hours", "Tokens", "Requests"] as const;
const TABLE_VIEWS = ["All", "Most used", "Active"] as const;

const DASHBOARD_COPY = {
    eyebrow: "Model usage",
    title: "AI model activity",
    description: "Usage across your connected models, updated in real time.",
    totalTokens: "Total tokens processed",
    totalRequests: "Total requests",
    daysMonitored: "Days monitored",
    mostUsedModel: "Most used model",
    timeAllocation: "Time allocation",
    timeAllocationHint: "Click a bar to filter the registry",
    tokenShare: "Token share",
    tokenShareHint: "Click a segment to filter",
    modelRegistry: "Model registry",
    modelRegistryHint: "Open a row for full details",
} as const;

const SUMMARY_CARD_STYLES = {
    tokens: { Icon: Zap, gradient: "from-blue-500 to-indigo-500" },
    requests: { Icon: Activity, gradient: "from-emerald-500 to-teal-500" },
    days: { Icon: CalendarDays, gradient: "from-amber-500 to-orange-500" },
} as const;

const CSV_HEADER = "Model,Category,Tokens (K),Hours,Days active,Requests,Last used";

function getLastUsedLabel(daysAgo: number): string {
    return daysAgo === 0 ? "Today" : `${daysAgo}d ago`;
}

function compareValues(a: string | number, b: string | number): number {
    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }
    return String(a).localeCompare(String(b));
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function useMounted(delay = 60) {
    const [m, setM] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setM(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    return m;
}

function useCountUp(target: number, duration = 1000) {
    const [v, setV] = useState(0);
    useEffect(() => {
        let raf = 0;
        let start: number | null = null;
        const step = (ts: number) => {
            if (start === null) start = ts;
            const p = Math.min(1, (ts - start) / duration);
            setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return v;
}

function LiveClock() {
    const { isDarkMode: d } = useDashboardTheme();
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div
            className={`rounded-xl border px-3 py-2 text-lg font-semibold tabular-nums text-indigo-500 ${
                d ? "border-gray-700 bg-gray-800" : "border-slate-200 bg-white"
            }`}
        >
            {now.toLocaleTimeString([], { hour12: false })}
        </div>
    );
}

function Panel({
    title,
    hint,
    action,
    children,
    className = "",
}: {
    title: string;
    hint?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    const { isDarkMode: d } = useDashboardTheme();
    return (
        <section
            className={`min-w-0 rounded-xl border p-[15px] ${
                d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700"
            } ${className}`}
        >
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className={`text-sm font-semibold sm:text-base ${d ? "text-white" : "text-slate-900"}`}>{title}</h2>
                    {hint && <p className={`text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>{hint}</p>}
                </div>
                {action}
            </header>
            {children}
        </section>
    );
}

function Segmented<T extends string>({
    options,
    value,
    onChange,
}: {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
}) {
    const { isDarkMode: d } = useDashboardTheme();
    return (
        <div className={`flex rounded-lg p-0.5 ${d ? "bg-gray-700" : "bg-slate-100"}`}>
            {options.map((o) => (
                <button
                    key={o}
                    type="button"
                    onClick={() => onChange(o)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                        value === o
                            ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow"
                            : d
                              ? "text-slate-300 hover:text-white"
                              : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                    {o}
                </button>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Profile card (from your original, 15px padding)                     */
/* ------------------------------------------------------------------ */

interface ProfileCardProps {
    label: string;
    value: string;
    Icon: LucideIcon;
    gradient?: string;
    live?: boolean;
}

export function ProfileCard({
    label,
    value,
    Icon,
    gradient = "from-violet-500 to-indigo-500",
    live = false,
}: ProfileCardProps) {
    const { isDarkMode: d } = useDashboardTheme();
    return (
        <div
            className={`group flex min-w-0 items-center gap-3 rounded-xl border p-[15px] transition-shadow hover:shadow-md max-[360px]:flex-col max-[360px]:items-start ${
                d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700"
            }`}
        >
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-[50px] sm:w-[50px] ${gradient}`}
            >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" className="sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0 flex-1">
                <div className={`truncate text-xs sm:text-[15px] ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    {live && (
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                    )}
                    <span className={`truncate text-lg font-bold leading-tight sm:text-2xl ${d ? "text-white" : "text-slate-900"}`}>
                        {value}
                    </span>
                </div>
            </div>
        </div>
    );
}

function CountCard({
    label,
    target,
    suffix = "",
    Icon,
    gradient,
}: {
    label: string;
    target: number;
    suffix?: string;
    Icon: LucideIcon;
    gradient: string;
}) {
    const v = useCountUp(target);
    return <ProfileCard label={label} value={`${v.toLocaleString()}${suffix}`} Icon={Icon} gradient={gradient} />;
}

/* ------------------------------------------------------------------ */
/* Bar chart (horizontal, animated, metric switch)                     */
/* ------------------------------------------------------------------ */

function BarChart({
    stats,
    metric,
    selected,
    onSelect,
}: {
    stats: ModelStats[];
    metric: Metric;
    selected: string | "All";
    onSelect: (id: string | "All") => void;
}) {
    const { isDarkMode: d } = useDashboardTheme();
    const mounted = useMounted();
    const { getValue, unit } = METRICS[metric];
    const sorted = [...stats].sort((a, b) => getValue(b) - getValue(a));
    const max = Math.max(...sorted.map(getValue)) || 1;

    return (
        <ul className="flex flex-col gap-2.5">
            {sorted.map((s, i) => {
                const dim = selected !== "All" && selected !== s.id;
                return (
                    <li key={s.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(selected === s.id ? "All" : s.id)}
                            className={`group grid w-full grid-cols-[96px_1fr_64px] items-center gap-2 text-left transition-opacity duration-300 sm:grid-cols-[130px_1fr_72px] ${
                                dim ? "opacity-40" : "opacity-100"
                            }`}
                            aria-label={`Filter table by ${s.name}`}
                        >
                            <span className={`truncate text-xs ${d ? "text-slate-300" : "text-slate-600"}`}>{s.name}</span>
                            <span className={`h-5 overflow-hidden rounded-md ${d ? "bg-gray-700" : "bg-slate-100"}`}>
                                <span
                                    className="block h-full rounded-md transition-[width] duration-700 ease-out group-hover:brightness-110"
                                    style={{
                                        width: mounted ? `${(getValue(s) / max) * 100}%` : "0%",
                                        background: s.color,
                                        transitionDelay: `${i * 70}ms`,
                                    }}
                                />
                            </span>
                            <span className={`text-right text-xs font-semibold tabular-nums ${d ? "text-white" : "text-slate-900"}`}>
                                {getValue(s).toLocaleString()}
                                {unit}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

/* ------------------------------------------------------------------ */
/* Donut chart (token share)                                           */
/* ------------------------------------------------------------------ */

function DonutChart({
    stats,
    selected,
    onSelect,
}: {
    stats: ModelStats[];
    selected: string | "All";
    onSelect: (id: string | "All") => void;
}) {
    const { isDarkMode: d } = useDashboardTheme();
    const mounted = useMounted();
    const total = stats.reduce((a, s) => a + s.totalTokens, 0) || 1;
    const R = 54;
    const C = 2 * Math.PI * R;
    const toggle = (id: string) => onSelect(selected === id ? "All" : id);
    const segments = stats.map((model, index) => {
        const length = (model.totalTokens / total) * C;
        const offset = stats
            .slice(0, index)
            .reduce((sum, previous) => sum + (previous.totalTokens / total) * C, 0);
        return { model, length, offset };
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-40 w-40">
                <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                    <circle cx="70" cy="70" r={R} fill="none" strokeWidth="16" stroke={d ? "#374151" : "#f1f5f9"} />
                    {segments.map(({ model, length, offset }) => (
                        <circle
                            key={model.id}
                            cx="70"
                            cy="70"
                            r={R}
                            fill="none"
                            stroke={model.color}
                            strokeWidth={selected === model.id ? 20 : 16}
                            strokeDasharray={`${mounted ? Math.max(length - 2, 0) : 0} ${C}`}
                            strokeDashoffset={-offset}
                            className="cursor-pointer transition-all duration-700 ease-out"
                            onClick={() => toggle(model.id)}
                        />
                    ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${d ? "text-white" : "text-slate-900"}`}>{total.toLocaleString()}K</span>
                    <span className={`text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>Tokens</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
                {stats.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s.id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors ${
                            selected === s.id
                                ? "border-indigo-500 text-indigo-500"
                                : d
                                  ? "border-gray-700 text-slate-300 hover:bg-gray-700"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <i className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        {s.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Model registry table                                                */
/* ------------------------------------------------------------------ */

type SortKey =
    | "name"
    | "category"
    | "totalTokens"
    | "timeSpentHours"
    | "daysActive"
    | "requests"
    | "lastUsedDaysAgo";

type SortState = { key: SortKey; dir: 1 | -1 };

function SortableHeader({
    sortKey,
    label,
    sort,
    onSort,
}: {
    sortKey: SortKey;
    label: string;
    sort: SortState;
    onSort: (key: SortKey) => void;
}) {
    return (
        <th className="whitespace-nowrap px-2 py-2 text-left font-medium">
            <button type="button" onClick={() => onSort(sortKey)} className="flex items-center gap-1 hover:text-indigo-500">
                {label}
                {sort.key === sortKey && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
            </button>
        </th>
    );
}

function ModelTable({
    stats,
    topId,
    selected,
    onSelect,
}: {
    stats: ModelStats[];
    topId: string;
    selected: string | "All";
    onSelect: (id: string | "All") => void;
}) {
    const { isDarkMode: d } = useDashboardTheme();
    const [query, setQuery] = useState("");
    const [view, setView] = useState<(typeof TABLE_VIEWS)[number]>("All");
    const [sort, setSort] = useState<SortState>({ key: "totalTokens", dir: -1 });
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return stats
            .filter((s) => selected === "All" || s.id === selected)
            .filter((s) => view === "All" || (view === "Most used" ? s.id === topId : s.id !== topId))
            .filter((s) => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
            .sort((x, y) => {
                return compareValues(x[sort.key], y[sort.key]) * sort.dir;
            });
    }, [stats, query, view, selected, sort, topId]);

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, pages);
    const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
        setOpen(null);
    }, [query, view, selected]);

    const toggleSort = (key: SortKey) =>
        setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));

    const exportCsv = () => {
        const body = filtered
            .map((s) => `${s.name},${s.category},${s.totalTokens},${s.timeSpentHours},${s.daysActive}/30,${s.requests},${getLastUsedLabel(s.lastUsedDaysAgo)}`)
            .join("\n");
        const url = URL.createObjectURL(new Blob([`${CSV_HEADER}\n${body}`], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "model-usage.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const iconBtn = `rounded-lg p-1.5 transition-all duration-200 active:scale-90 ${
        d ? "text-slate-300 hover:bg-gray-700" : "text-slate-500 hover:bg-slate-100"
    }`;

    return (
        <Panel
            title={DASHBOARD_COPY.modelRegistry}
            hint={DASHBOARD_COPY.modelRegistryHint}
            action={
                <div className="flex flex-wrap items-center gap-2">
                    <label className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${d ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-slate-50"}`}>
                        <Search size={13} aria-hidden="true" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            aria-label="Search models"
                            className="w-24 bg-transparent outline-none sm:w-36"
                        />
                    </label>
                    <Segmented options={TABLE_VIEWS} value={view} onChange={setView} />
                    <button
                        type="button"
                        onClick={exportCsv}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 px-2.5 py-1.5 text-xs font-medium text-white shadow transition-transform active:scale-95"
                    >
                        <Download size={13} aria-hidden="true" /> Export
                    </button>
                </div>
            }
        >
            {selected !== "All" && (
                <button
                    type="button"
                    onClick={() => onSelect("All")}
                    className="mb-2 rounded-lg border border-indigo-500 px-2 py-1 text-xs text-indigo-500 transition-colors hover:bg-indigo-500/10"
                >
                    Showing one model. Clear
                </button>
            )}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                    <thead className={d ? "text-slate-400" : "text-slate-500"}>
                        <tr>
                            <SortableHeader sortKey="name" label="Model" sort={sort} onSort={toggleSort} />
                            <SortableHeader sortKey="category" label="Category" sort={sort} onSort={toggleSort} />
                            <SortableHeader sortKey="totalTokens" label="Tokens" sort={sort} onSort={toggleSort} />
                            <SortableHeader sortKey="timeSpentHours" label="Time spent" sort={sort} onSort={toggleSort} />
                            <SortableHeader sortKey="daysActive" label="Days active" sort={sort} onSort={toggleSort} />
                            <SortableHeader sortKey="requests" label="Requests" sort={sort} onSort={toggleSort} />
                            <SortableHeader sortKey="lastUsedDaysAgo" label="Last used" sort={sort} onSort={toggleSort} />
                            <th className="px-2 py-2 text-left font-medium">Status</th>
                            <th className="px-2 py-2 text-right font-medium">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((s) => (
                            <React.Fragment key={s.id}>
                                <tr className={`row-in border-t transition-colors ${d ? "border-gray-700 hover:bg-gray-700/40" : "border-slate-100 hover:bg-slate-50"}`}>
                                    <td className={`px-2 py-2.5 font-medium ${d ? "text-white" : "text-slate-900"}`}>
                                        <span className="flex items-center gap-2">
                                            <span style={{ color: s.color }}>
                                                <s.Icon size={16} aria-hidden="true" />
                                            </span>
                                            {s.name}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2.5">{s.category}</td>
                                    <td className="px-2 py-2.5">{s.totalTokens.toLocaleString()}K</td>
                                    <td className="px-2 py-2.5">{s.timeSpentHours}h</td>
                                    <td className="px-2 py-2.5">{s.daysActive}/30</td>
                                    <td className="px-2 py-2.5">{s.requests.toLocaleString()}</td>
                                    <td className="px-2 py-2.5">{getLastUsedLabel(s.lastUsedDaysAgo)}</td>
                                    <td className="px-2 py-2.5">
                                        {s.id === topId ? (
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${d ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
                                                <Zap size={11} aria-hidden="true" /> Most used
                                            </span>
                                        ) : (
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-2 py-2.5">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                className={iconBtn}
                                                onClick={() => setOpen(open === s.id ? null : s.id)}
                                                aria-expanded={open === s.id}
                                                aria-label={`${open === s.id ? "Hide" : "Show"} details for ${s.name}`}
                                            >
                                                <ChevronDown size={16} className={`transition-transform duration-300 ${open === s.id ? "rotate-180" : ""}`} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {open === s.id && (
                                    <tr className={d ? "bg-gray-900/40" : "bg-slate-50"}>
                                        <td colSpan={9} className="row-in px-3 py-2.5">
                                            <div className={`flex flex-wrap items-center gap-2 text-xs ${d ? "text-slate-300" : "text-slate-600"}`}>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock size={13} aria-hidden="true" />
                                                    {s.description}
                                                </span>
                                                {s.highlights.map((h) => (
                                                    <span key={h} className={`rounded-full px-2 py-0.5 ${d ? "bg-gray-700 text-indigo-200" : "bg-indigo-50 text-indigo-700"}`}>
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={9} className={`px-2 py-8 text-center text-sm ${d ? "text-slate-400" : "text-slate-500"}`}>
                                    No models match. Clear the search or filters to see all models.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <footer className={`mt-3 flex items-center justify-between text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>
                <span>
                    {filtered.length} model{filtered.length === 1 ? "" : "s"} · Page {safePage} of {pages}
                </span>
                <div className="flex gap-1">
                    <button type="button" className={`${iconBtn} disabled:opacity-40`} disabled={safePage === 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page">
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" className={`${iconBtn} disabled:opacity-40`} disabled={safePage === pages} onClick={() => setPage(safePage + 1)} aria-label="Next page">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </footer>
        </Panel>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AIModelsDashboard() {
    const { isDarkMode: d } = useDashboardTheme();
    const stats = useMemo(() => buildStats(), []);
    const [metric, setMetric] = useState<Metric>("Hours");
    const [selected, setSelected] = useState<string | "All">("All");

    const top = useMemo(() => [...stats].sort((a, b) => b.totalTokens - a.totalTokens)[0], [stats]);
    const totalTokens = stats.reduce((a, s) => a + s.totalTokens, 0);
    const totalRequests = stats.reduce((a, s) => a + s.requests, 0);
    const summaryCards = [
        {
            ...SUMMARY_CARD_STYLES.tokens,
            label: DASHBOARD_COPY.totalTokens,
            target: totalTokens,
            suffix: "K",
        },
        {
            ...SUMMARY_CARD_STYLES.requests,
            label: DASHBOARD_COPY.totalRequests,
            target: totalRequests,
        },
        {
            ...SUMMARY_CARD_STYLES.days,
            label: DASHBOARD_COPY.daysMonitored,
            target: 30,
        },
    ];

    return (
        <main className={`min-h-screen p-[15px] ${d ? "bg-gray-900" : "bg-slate-50"}`}>
            <style>{`
                @keyframes dash-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
                .dash-in { animation: dash-rise .5s ease-out both; }
                .row-in { animation: dash-rise .35s ease-out both; }
                @media (prefers-reduced-motion: reduce) { .dash-in, .row-in { animation: none; } }
            `}</style>

            <div className="mx-auto flex max-w-6xl flex-col gap-[15px]">
                <header className="dash-in flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
                            <Radio size={14} aria-hidden="true" /> {DASHBOARD_COPY.eyebrow}
                        </span>
                        <h1 className={`text-xl font-bold sm:text-[25px] ${d ? "text-white" : "text-slate-900"}`}>
                            {DASHBOARD_COPY.title}
                        </h1>
                        <p className={`text-sm ${d ? "text-slate-400" : "text-slate-500"}`}>
                            {DASHBOARD_COPY.description}
                        </p>
                    </div>
                    <LiveClock />
                </header>

                <div className="dash-in grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "80ms" }}>
                    {summaryCards.map((card) => (
                        <CountCard key={card.label} {...card} />
                    ))}
                    <ProfileCard
                        label={DASHBOARD_COPY.mostUsedModel}
                        value={top.name}
                        Icon={top.Icon}
                        gradient="from-violet-500 to-fuchsia-500"
                    />
                </div>

                <div className="dash-in grid grid-cols-1 gap-[15px] lg:grid-cols-3" style={{ animationDelay: "160ms" }}>
                    <Panel
                        title={DASHBOARD_COPY.timeAllocation}
                        hint={DASHBOARD_COPY.timeAllocationHint}
                        className="lg:col-span-2"
                        action={<Segmented options={METRIC_OPTIONS} value={metric} onChange={setMetric} />}
                    >
                        <BarChart stats={stats} metric={metric} selected={selected} onSelect={setSelected} />
                    </Panel>
                    <Panel title={DASHBOARD_COPY.tokenShare} hint={DASHBOARD_COPY.tokenShareHint}>
                        <DonutChart stats={stats} selected={selected} onSelect={setSelected} />
                    </Panel>
                </div>

                <div className="dash-in" style={{ animationDelay: "240ms" }}>
                    <ModelTable stats={stats} topId={top.id} selected={selected} onSelect={setSelected} />
                </div>
            </div>
        </main>
    );
}