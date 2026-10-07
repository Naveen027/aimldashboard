import React, { useEffect, useMemo, useRef, useState } from "react";
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

type Metric = "Tokens" | "Requests" | "Hours";
type View = "All" | "Most used" | "Active";
type SortKey = "name" | "category" | "totalTokens" | "timeSpentHours" | "daysActive" | "requests" | "lastUsedDaysAgo";

/*
 * Layout breakpoints are based on the width of THIS dashboard (not the browser window),
 * so the layout adapts correctly whether the sidebar is open or collapsed.
 */
const CHARTS_SIDE_BY_SIDE = 860; // bar chart + donut next to each other
const SHOW_TABLE = 980; // full table instead of cards

export default function AIModelsDashboard() {
    const { isDarkMode: d } = useDashboardTheme();

    /* ---------- state ---------- */
    const [now, setNow] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0); // 0 → 1 count-up animation
    const [metric, setMetric] = useState<Metric>("Hours");
    const [selected, setSelected] = useState<string>("All"); // model id or "All"
    const [query, setQuery] = useState("");
    const [view, setView] = useState<View>("All");
    const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "totalTokens", dir: -1 });
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState<string | null>(null);

    /* ---------- measure the space this dashboard actually has ---------- */
    const rootRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1280);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        setWidth(el.getBoundingClientRect().width);
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const chartsSideBySide = width >= CHARTS_SIDE_BY_SIDE;
    const showTable = width >= SHOW_TABLE;

    /* ---------- mock telemetry (swap for your real API call) ---------- */
    const stats = useMemo<ModelStats[]>(() => {
        const presentation: Record<string, { color: string; Icon: LucideIcon }> = {
            "kartavya-face-matching": { color: "#4285f4", Icon: ScanFace },
            "muzzle-print-identification": { color: "#34a853", Icon: Fingerprint },
            "grievance-management": { color: "#fbbc04", Icon: MessageSquareText },
            "government-order-information": { color: "#9c27b0", Icon: FileSearch },
            "ai-enabled-chatbots": { color: "#1ba098", Icon: Bot },
            "kannada-kasthuri": { color: "#ea4335", Icon: Languages },
        };

        const seededRandom = (seed: number) => {
            let t = seed + 0x6d2b79f5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        return aiModelCatalog.map((model, index) => {
            const style = presentation[model.id];
            if (!style) throw new Error(`Missing AI model presentation for "${model.id}".`);

            const base = 40 + index * 22;
            const volatility = 12 + seededRandom(index * 97 + 3) * 18;
            const daily = Array.from({ length: 14 }, (_, day) => {
                const wave = Math.sin(day / 2.1 + index) * volatility;
                const noise = (seededRandom(index * 1000 + day) - 0.5) * volatility * 0.8;
                return Math.max(4, Math.round(base + wave + noise));
            });
            const totalTokens = daily.reduce((a, b) => a + b, 0);

            return {
                ...model,
                ...style,
                totalTokens,
                timeSpentHours: Math.round((totalTokens / (6 + index)) * 3.4) / 10,
                daysActive: 9 + Math.floor(seededRandom(index * 55 + 2) * 20),
                requests: Math.round(totalTokens * (4 + seededRandom(index * 13) * 3)),
                lastUsedDaysAgo: Math.floor(seededRandom(index * 8 + 5) * 3),
            };
        });
    }, []);

    /* ---------- effects ---------- */
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000); // live clock
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60); // charts mount animation
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        let raf = 0;
        let start: number | null = null;
        const step = (ts: number) => {
            if (start === null) start = ts;
            const p = Math.min(1, (ts - start) / 1000);
            setProgress(1 - Math.pow(1 - p, 3)); // count-up for summary cards
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        setPage(1); // reset table paging when filters change
        setOpen(null);
    }, [query, view, selected]);

    /* ---------- derived data ---------- */
    const top = [...stats].sort((a, b) => b.totalTokens - a.totalTokens)[0];
    const totalTokens = stats.reduce((a, s) => a + s.totalTokens, 0);
    const totalRequests = stats.reduce((a, s) => a + s.requests, 0);
    const selectedStat = stats.find((s) => s.id === selected);

    // bar chart
    const metricLabel = { Hours: "Hours spent", Tokens: "Tokens processed", Requests: "Requests served" }[metric];
    const getValue = (s: ModelStats) =>
        metric === "Tokens" ? s.totalTokens : metric === "Requests" ? s.requests : s.timeSpentHours;
    const unit = metric === "Tokens" ? "K" : metric === "Hours" ? "h" : "";
    const barStats = [...stats].sort((a, b) => getValue(b) - getValue(a));
    const barMax = Math.max(...barStats.map(getValue)) || 1;
    const barTotal = barStats.reduce((sum, s) => sum + getValue(s), 0) || 1;
    const barAverage = barTotal / barStats.length;

    // donut chart
    const R = 54;
    const C = 2 * Math.PI * R;
    const segments = stats.map((model, index) => ({
        model,
        share: (model.totalTokens / totalTokens) * 100,
        length: (model.totalTokens / totalTokens) * C,
        offset: stats.slice(0, index).reduce((sum, prev) => sum + (prev.totalTokens / totalTokens) * C, 0),
    }));

    // table + cards
    const columns: [SortKey, string][] = [
        ["name", "Model"],
        ["category", "Category"],
        ["totalTokens", "Tokens"],
        ["timeSpentHours", "Time spent"],
        ["daysActive", "Days active"],
        ["requests", "Requests"],
        ["lastUsedDaysAgo", "Last used"],
    ];
    const q = query.trim().toLowerCase();
    const filtered = stats
        .filter((s) => selected === "All" || s.id === selected)
        .filter((s) => view === "All" || (view === "Most used" ? s.id === top.id : s.id !== top.id))
        .filter((s) => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
        .sort((a, b) => {
            const x = a[sort.key];
            const y = b[sort.key];
            const result = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
            return result * sort.dir;
        });
    const pages = Math.max(1, Math.ceil(filtered.length / 4));
    const safePage = Math.min(page, pages);
    const visible = filtered.slice((safePage - 1) * 4, safePage * 4);

    /* ---------- theme classes ---------- */
    const muted = d ? "text-slate-400" : "text-slate-500";
    const heading = d ? "text-white" : "text-slate-900";
    const panel = `w-full min-w-0 rounded-xl border p-3 sm:p-[15px] ${
        d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700"
    }`;
    const track = d ? "bg-gray-700" : "bg-slate-100";
    const segmentedWrap = `flex max-w-full overflow-x-auto rounded-lg p-0.5 ${d ? "bg-gray-700" : "bg-slate-100"}`;
    const segmentBtn = (on: boolean) =>
        `shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
            on
                ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow"
                : d
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
        }`;
    const iconBtn = `rounded-lg p-1.5 transition-all duration-200 active:scale-90 ${
        d ? "text-slate-300 hover:bg-gray-700" : "text-slate-500 hover:bg-slate-100"
    }`;
    const mostUsedBadge = d ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700";
    const activeBadge = d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700";

    /* ---------- UI ---------- */
    return (
        <main className={`min-h-screen min-w-0 ${d ? "bg-gray-900" : "bg-slate-50"}`}>
            <style>{`
                @keyframes dash-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
                .dash-in { animation: dash-rise .5s ease-out both; }
                .row-in { animation: dash-rise .35s ease-out both; }
                @media (prefers-reduced-motion: reduce) { .dash-in, .row-in { animation: none; } }
            `}</style>

            {/* the ref'd wrapper fills whatever space the sidebar leaves */}
            <div ref={rootRef} className="mx-auto flex w-full min-w-0 max-w-[1520px] flex-col gap-3 overflow-x-hidden sm:gap-[15px]">
                {/* ---------- header ---------- */}
                <header className="dash-in flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <span className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
                            <Radio size={14} aria-hidden="true" /> Model usage
                        </span>
                        <h1 className="m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">AI model activity</h1>
                        <p className="mt-0.5 mb-0 text-sm text-[color:var(--muted)]">Usage across your connected models, updated in real time.</p>
                    </div>
                    <div
                        className={`shrink-0 rounded-xl border px-3 py-2 text-lg font-semibold tabular-nums text-indigo-500 ${
                            d ? "border-gray-700 bg-gray-800" : "border-slate-200 bg-white"
                        }`}
                    >
                        {now.toLocaleTimeString([], { hour12: false })}
                    </div>
                </header>

                {/* ---------- summary cards (auto-fit: 1-4 columns depending on free width) ---------- */}
                <div
                    className="dash-in grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3 sm:gap-[15px]"
                    style={{ animationDelay: "80ms" }}
                >
                    {[
                        { label: "Total tokens processed", value: `${Math.round(totalTokens * progress).toLocaleString()}K`, Icon: Zap },
                        { label: "Total requests", value: Math.round(totalRequests * progress).toLocaleString(), Icon: Activity },
                        { label: "Days monitored", value: Math.round(30 * progress).toLocaleString(), Icon: CalendarDays },
                        { label: "Most used model", value: top.name, Icon: top.Icon },
                    ].map(({ label, value, Icon }) => (
                        <div
                            key={label}
                            className={`group flex min-w-0 items-center gap-3 rounded-xl border p-3 transition-shadow hover:shadow-md sm:p-[15px] ${
                                d ? "border-gray-700 bg-gray-800 text-gray-100" : "border-slate-200 bg-white text-slate-700"
                            }`}
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 transition-transform duration-300 group-hover:scale-105 sm:h-[50px] sm:w-[50px] dark:bg-indigo-500/10 dark:text-indigo-300">
                                <Icon size={20} strokeWidth={1.8} aria-hidden="true" className="sm:h-6 sm:w-6" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className={`break-words text-xs sm:text-[15px] ${muted}`}>{label}</div>
                                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                    <span className={`break-words text-lg font-bold leading-tight sm:text-2xl ${heading}`}>{value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ---------- charts (side by side only when there is room) ---------- */}
                <div
                    className="dash-in grid w-full min-w-0 gap-3 sm:gap-[15px]"
                    style={{
                        animationDelay: "160ms",
                        gridTemplateColumns: chartsSideBySide ? "minmax(0, 2fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
                    }}
                >
                    {/* time allocation (bar chart) */}
                    <section className={panel}>
                        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                                <h2 className={`text-sm font-semibold sm:text-base ${heading}`}>Time allocation</h2>
                                <p className={`text-xs ${muted}`}>{metricLabel} per model · click a bar to filter the registry</p>
                            </div>
                            <div className={segmentedWrap}>
                                {(["Hours", "Tokens", "Requests"] as Metric[]).map((o) => (
                                    <button key={o} type="button" onClick={() => setMetric(o)} className={segmentBtn(metric === o)}>
                                        {o}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <ul className="m-0 flex list-none flex-col gap-1 p-0">
                            {barStats.map((s, i) => {
                                const value = getValue(s);
                                const isSelected = selected === s.id;
                                return (
                                    <li key={s.id} className="min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => setSelected(isSelected ? "All" : s.id)}
                                            aria-label={`Filter table by ${s.name}`}
                                            aria-pressed={isSelected}
                                            className={`group block w-full min-w-0 rounded-lg p-2 text-left transition-all duration-300 ${
                                                isSelected
                                                    ? "bg-indigo-500/10 ring-1 ring-indigo-500/40"
                                                    : d
                                                      ? "hover:bg-gray-700/40"
                                                      : "hover:bg-slate-50"
                                            } ${selected !== "All" && !isSelected ? "opacity-40" : "opacity-100"}`}
                                        >
                                            {/* label row: rank + icon + name … value + share */}
                                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <span className={`w-4 shrink-0 text-[11px] font-semibold tabular-nums ${muted}`}>{i + 1}</span>
                                                    <span className="shrink-0" style={{ color: s.color }}>
                                                        <s.Icon size={14} aria-hidden="true" />
                                                    </span>
                                                    <span className={`break-words text-xs font-medium sm:text-sm ${heading}`}>{s.name}</span>
                                                </span>
                                                <span className={`shrink-0 text-xs font-semibold tabular-nums sm:text-sm ${heading}`}>
                                                    {value.toLocaleString()}
                                                    {unit}
                                                    <span className={`ml-1.5 text-[11px] font-normal ${muted}`}>{((value / barTotal) * 100).toFixed(1)}%</span>
                                                </span>
                                            </div>

                                            {/* bar */}
                                            <div className={`h-2.5 w-full overflow-hidden rounded-full sm:h-3 ${track}`}>
                                                <div
                                                    className="h-full rounded-full transition-[width] duration-700 ease-out group-hover:brightness-110"
                                                    style={{
                                                        width: mounted ? `${(value / barMax) * 100}%` : "0%",
                                                        background: `linear-gradient(90deg, ${s.color}99, ${s.color})`,
                                                        transitionDelay: `${i * 70}ms`,
                                                    }}
                                                />
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* summary strip */}
                        <div className={`mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center ${d ? "border-gray-700" : "border-slate-100"}`}>
                            {[
                                { label: "Total", value: `${barTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}` },
                                { label: "Average", value: `${barAverage.toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}` },
                                { label: "Leader", value: barStats[0].name },
                            ].map((m) => (
                                <div key={m.label} className="min-w-0">
                                    <div className={`text-[11px] uppercase tracking-wide ${muted}`}>{m.label}</div>
                                    <div className={`break-words text-xs font-semibold sm:text-sm ${heading}`}>{m.value}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* token share (donut chart) */}
                    <section className={panel}>
                        <header className="mb-3">
                            <h2 className={`text-sm font-semibold sm:text-base ${heading}`}>Token share</h2>
                            <p className={`text-xs ${muted}`}>Click a segment or a model to filter</p>
                        </header>

                        <div className="flex min-w-0 flex-col items-center gap-4">
                            <div className="relative aspect-square w-full max-w-[11rem]">
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
                                            onClick={() => setSelected(selected === model.id ? "All" : model.id)}
                                        />
                                    ))}
                                </svg>
                                {/* centre shows the total, or the selected model */}
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                                    <span className={`text-xl font-bold ${heading}`}>
                                        {(selectedStat ? selectedStat.totalTokens : totalTokens).toLocaleString()}K
                                    </span>
                                    <span className={`max-w-full break-words text-xs ${muted}`}>
                                        {selectedStat ? `${selectedStat.name} · ${((selectedStat.totalTokens / totalTokens) * 100).toFixed(1)}%` : "Tokens"}
                                    </span>
                                </div>
                            </div>

                            {/* legend with share %: one column beside the bar chart, auto-fit columns when stacked */}
                            <ul
                                className="m-0 grid w-full list-none gap-1 p-0"
                                style={{
                                    gridTemplateColumns: chartsSideBySide
                                        ? "minmax(0, 1fr)"
                                        : "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                                }}
                            >
                                {segments.map(({ model, share }) => (
                                    <li key={model.id} className="min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => setSelected(selected === model.id ? "All" : model.id)}
                                            className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                                                selected === model.id
                                                    ? "border-indigo-500 text-indigo-500"
                                                    : d
                                                      ? "border-gray-700 text-slate-300 hover:bg-gray-700"
                                                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-1.5">
                                                <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: model.color }} />
                                                <span className="break-words">{model.name}</span>
                                            </span>
                                            <span className="shrink-0 font-semibold tabular-nums">{share.toFixed(1)}%</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>

                {/* ---------- model registry ---------- */}
                <div className="dash-in w-full min-w-0" style={{ animationDelay: "240ms" }}>
                    <section className={panel}>
                        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                                <h2 className={`text-sm font-semibold sm:text-base ${heading}`}>Model registry</h2>
                                <p className={`text-xs ${muted}`}>Open a row for full details</p>
                            </div>
                            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                                <label className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs sm:max-w-[220px] ${d ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-slate-50"}`}>
                                    <Search size={13} aria-hidden="true" className="shrink-0" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search"
                                        aria-label="Search models"
                                        className="w-full min-w-0 bg-transparent outline-none"
                                    />
                                </label>
                                <div className={segmentedWrap}>
                                    {(["All", "Most used", "Active"] as View[]).map((o) => (
                                        <button key={o} type="button" onClick={() => setView(o)} className={segmentBtn(view === o)}>
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>

                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {selected !== "All" && (
                                <button
                                    type="button"
                                    onClick={() => setSelected("All")}
                                    className="rounded-lg border border-indigo-500 px-2 py-1 text-xs text-indigo-500 transition-colors hover:bg-indigo-500/10"
                                >
                                    Showing one model. Clear
                                </button>
                            )}

                            {/* sort control for the card layout (the table sorts from its headers) */}
                            {!showTable && (
                                <div className={`ml-auto flex items-center gap-1.5 text-xs ${muted}`}>
                                    <label htmlFor="registry-sort">Sort by</label>
                                    <select
                                        id="registry-sort"
                                        value={sort.key}
                                        onChange={(e) => setSort({ key: e.target.value as SortKey, dir: -1 })}
                                        className={`rounded-lg border px-2 py-1 text-xs outline-none ${d ? "border-gray-700 bg-gray-900 text-gray-100" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                                    >
                                        {columns.map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setSort({ key: sort.key, dir: (sort.dir * -1) as 1 | -1 })}
                                        aria-label={sort.dir === 1 ? "Ascending" : "Descending"}
                                        className={iconBtn}
                                    >
                                        {sort.dir === 1 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ----- card layout (when the dashboard is too narrow for the table) ----- */}
                        {!showTable && (
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3">
                                {visible.map((s) => (
                                    <article
                                        key={s.id}
                                        className={`row-in min-w-0 rounded-xl border p-3 ${d ? "border-gray-700 bg-gray-900/40" : "border-slate-200 bg-slate-50/60"}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span style={{ color: s.color }} className="shrink-0">
                                                    <s.Icon size={18} aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className={`m-0 break-words text-[20px] font-semibold leading-snug ${heading}`}>{s.name}</h3>
                                                    <div className={`break-words text-xs ${muted}`}>{s.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                {s.id === top.id ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${mostUsedBadge}`}>
                                                        <Zap size={11} aria-hidden="true" /> Most used
                                                    </span>
                                                ) : (
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${activeBadge}`}>Active</span>
                                                )}
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
                                        </div>

                                        <dl className="m-0 mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                            {[
                                                { label: "Tokens", value: `${s.totalTokens.toLocaleString()}K` },
                                                { label: "Time spent", value: `${s.timeSpentHours}h` },
                                                { label: "Requests", value: s.requests.toLocaleString() },
                                                { label: "Days active", value: `${s.daysActive}/30` },
                                                { label: "Last used", value: s.lastUsedDaysAgo === 0 ? "Today" : `${s.lastUsedDaysAgo}d ago` },
                                            ].map((m) => (
                                                <div key={m.label} className="min-w-0">
                                                    <dt className={muted}>{m.label}</dt>
                                                    <dd className={`m-0 break-words font-semibold ${heading}`}>{m.value}</dd>
                                                </div>
                                            ))}
                                            <div className="min-w-0">
                                                <dt className={muted}>Token share</dt>
                                                <dd className="m-0 mt-1">
                                                    <div className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}>
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{ width: `${(s.totalTokens / totalTokens) * 100}%`, background: s.color }}
                                                        />
                                                    </div>
                                                </dd>
                                            </div>
                                        </dl>

                                        {open === s.id && (
                                            <div className={`row-in mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs ${d ? "border-gray-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                                                <span className="inline-flex min-w-0 items-start gap-1.5 break-words">
                                                    <Clock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                    {s.description}
                                                </span>
                                                {s.highlights.map((h) => (
                                                    <span key={h} className={`rounded-full px-2 py-0.5 ${d ? "bg-gray-700 text-indigo-200" : "bg-indigo-50 text-indigo-700"}`}>
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                ))}
                                {visible.length === 0 && (
                                    <p className={`col-span-full py-8 text-center text-sm ${muted}`}>
                                        No models match. Clear the search or filters to see all models.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ----- table layout (when the dashboard is wide enough) ----- */}
                        {showTable && (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className={muted}>
                                        <tr>
                                            {columns.map(([key, label]) => (
                                                <th key={key} className="whitespace-nowrap px-2 py-2 text-left font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSort(sort.key === key ? { key, dir: (sort.dir * -1) as 1 | -1 } : { key, dir: 1 })
                                                        }
                                                        className="flex items-center gap-1 hover:text-indigo-500"
                                                    >
                                                        {label}
                                                        {sort.key === key && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                                                    </button>
                                                </th>
                                            ))}
                                            <th className="px-2 py-2 text-left font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visible.map((s) => (
                                            <React.Fragment key={s.id}>
                                                <tr className={`row-in border-t transition-colors ${d ? "border-gray-700 hover:bg-gray-700/40" : "border-slate-100 hover:bg-slate-50"}`}>
                                                    <td className={`px-2 py-2.5 font-medium ${heading}`}>
                                                        <span className="flex items-center gap-2">
                                                            <span style={{ color: s.color }}>
                                                                <s.Icon size={16} aria-hidden="true" />
                                                            </span>
                                                            {s.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2.5">{s.category}</td>
                                                    <td className="px-2 py-2.5">
                                                        <div>{s.totalTokens.toLocaleString()}K</div>
                                                        <div className={`mt-1 h-1 w-16 overflow-hidden rounded-full ${track}`}>
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{ width: `${(s.totalTokens / totalTokens) * 100}%`, background: s.color }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2.5">{s.timeSpentHours}h</td>
                                                    <td className="px-2 py-2.5">{s.daysActive}/30</td>
                                                    <td className="px-2 py-2.5">{s.requests.toLocaleString()}</td>
                                                    <td className="px-2 py-2.5">{s.lastUsedDaysAgo === 0 ? "Today" : `${s.lastUsedDaysAgo}d ago`}</td>
                                                    <td className="px-2 py-2.5">
                                                        {s.id === top.id ? (
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${mostUsedBadge}`}>
                                                                <Zap size={11} aria-hidden="true" /> Most used
                                                            </span>
                                                        ) : (
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${activeBadge}`}>Active</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {open === s.id && (
                                                    <tr className={d ? "bg-gray-900/40" : "bg-slate-50"}>
                                                        <td colSpan={8} className="row-in px-3 py-2.5">
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
                                                <td colSpan={8} className={`px-2 py-8 text-center text-sm ${muted}`}>
                                                    No models match. Clear the search or filters to see all models.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <footer className={`mt-3 flex flex-wrap items-center justify-between gap-2 text-xs ${muted}`}>
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
                    </section>
                </div>
            </div>
        </main>
    );
}