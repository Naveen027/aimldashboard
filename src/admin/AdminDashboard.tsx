import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../context/AuthContext";
import { aiModelCatalog } from "../data/aiModels";

interface UsageRow {
  id: number;
  name: string;
  initials: string;
  color: string;
  model: string;
  lastActivity: string;
  usage: string;
  usagePct: number;
}

const usageRows: UsageRow[] = [
  {
    id: 1,
    name: "Alex Johnson",
    initials: "AJ",
    color: "#f6c453",
    model: aiModelCatalog[0].name,
    lastActivity: "5 mins ago",
    usage: "270K",
    usagePct: 78,
  },
  {
    id: 2,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: aiModelCatalog[1].name,
    lastActivity: "3 minuts ago",
    usage: "1.51K",
    usagePct: 35,
  },
  {
    id: 3,
    name: "Mana Tuung",
    initials: "MT",
    color: "#8fd3c7",
    model: aiModelCatalog[2].name,
    lastActivity: "3 minuts ago",
    usage: "421K",
    usagePct: 55,
  },
  {
    id: 4,
    name: "Alex Johnson",
    initials: "AJ",
    color: "#f6c453",
    model: aiModelCatalog[3].name,
    lastActivity: "10 rours ago",
    usage: "270K",
    usagePct: 78,
  },
  {
    id: 5,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: aiModelCatalog[4].name,
    lastActivity: "5 monts ago",
    usage: "2.1M",
    usagePct: 95,
  },
  {
    id: 6,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: aiModelCatalog[5].name,
    lastActivity: "14 minutes ago",
    usage: "470K",
    usagePct: 62,
  },
    {
    id: 7,
    name: "Alex Johnson",
    initials: "AJ",
    color: "#f6c453",
    model: aiModelCatalog[0].name,
    lastActivity: "5 mins ago",
    usage: "270K",
    usagePct: 78,
  },
    {
    id: 8,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: aiModelCatalog[1].name,
    lastActivity: "3 mins ago",
    usage: "270K",
    usagePct: 78,
  },
    {
    id: 9,
    name: "Alex Johnson",
    initials: "AJ",
    color: "#f6c453",
    model: aiModelCatalog[2].name,
    lastActivity: "5 mins ago",
    usage: "270K",
    usagePct: 78,
  },
];

const modelPerformance = [
  [82, 45, 60],
  [65, 88, 78],
  [58, 70, 92],
  [74, 68, 85],
  [88, 72, 80],
  [91, 84, 93],
];
const modelColors = ["#5ec8d8", "#8b7cf6", "#3fae6a", "#f59e0b", "#ec4899", "#06b6d4"];
const modelSeries = aiModelCatalog.map((model, index) => ({
  name: model.name,
  color: modelColors[index],
  values: modelPerformance[index],
}));
const chartData = ["Accuracy", "Usage", "Reliability"].map((name, metricIndex) => ({
  name,
  ...Object.fromEntries(
    modelSeries.map((model) => [model.name, model.values[metricIndex]])
  ),
}));

// Calls by model (replace with API data, e.g. from a getModels() call)
const callsByModel = [
  { label: aiModelCatalog[0].name, value: 48300, color: "from-cyan-400 to-sky-500" },
  { label: aiModelCatalog[1].name, value: 31200, color: "from-indigo-500 to-violet-500" },
  { label: aiModelCatalog[2].name, value: 25400, color: "from-emerald-400 to-green-600" },
  { label: aiModelCatalog[3].name, value: 22100, color: "from-amber-400 to-orange-500" },
  { label: aiModelCatalog[4].name, value: 18600, color: "from-pink-400 to-rose-500" },
  { label: aiModelCatalog[5].name, value: 15200, color: "from-teal-400 to-cyan-600" },
];

const formatCalls = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : String(n);

const statCards = [
  {
    label: "Total Active Users",
    value: "14,235",
    icon: "bi-people-fill",
  },
  {
    label: "API Calls Today",
    value: "2.1M",
    icon: "bi-lightning-charge-fill",
  },
  {
    label: "Active Model Nodes",
    value: "42",
    icon: "bi-gear-fill",
  },
  {
    label: "System Health",
    value: "99.8%",
    icon: "bi-check-circle-fill",
    healthy: true,
  },
];

const ALL = "All models";

const cardBase =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-700/60 dark:bg-slate-800";

const AdminDashboard: React.FC = () => {
  const { authResponse } = useAuth();
  const adminUsername = authResponse?.username || "Admin";

  // ---- Filter state ----
  const [filterOpen, setFilterOpen] = useState(false);
  const [modelFilter, setModelFilter] = useState<string>(ALL);
  const filterRef = useRef<HTMLDivElement>(null);

  const modelOptions = useMemo(
    () => [ALL, ...Array.from(new Set(usageRows.map((r) => r.model)))],
    []
  );

  const filteredRows = useMemo(
    () =>
      modelFilter === ALL
        ? usageRows
        : usageRows.filter((r) => r.model === modelFilter),
    [modelFilter]
  );

  const maxCalls = useMemo(
    () => Math.max(...callsByModel.map((m) => m.value), 1),
    []
  );

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const filterActive = modelFilter !== ALL;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1520px] px-0 py-2 sm:px-1">
        {/* Top bar */}
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <h2 className="break-words [font-size:1.2rem] !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">
            Welcome, {adminUsername}!
          </h2>

          <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-[10px]! bg-amber-50 px-3 py-1.5 !text-sm !font-thin !text-amber-700 ring-1 ring-amber-200 sm:px-3.5 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
            <i className="bi bi-exclamation-triangle-fill" />
            System-wide notifications
          </span>
        </div>

        <p className="mb-4  font-normal !text-slate-500! text-[15px]  sm:mb-5  !dark:text-slate-400">
          System-wide Summary
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`${cardBase} flex items-center gap-3 px-2 py-2 transition-shadow hover:shadow-md sm:gap-4 sm:px-6 sm:py-6`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl sm:h-[50px] sm:w-[50px] sm:text-2xl ${card.healthy
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                  }`}
              >
                <i className={`bi ${card.icon}`} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm text-slate-500 sm:text-[15px] dark:text-slate-400">
                  {card.label}
                </div>
                <div className="!text-xl font-bold leading-tight text-slate-900 sm:text-[25px] dark:text-white">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:mt-5 sm:gap-5 xl:grid-cols-12">
          {/* User usage table */}
          <div className="min-w-0 xl:col-span-7">
            <div className={`${cardBase} flex h-full flex-col p-4 sm:p-6`}>
              <h5 className="mb-4 text-lg font-semibold text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
                User Usage Overview
              </h5>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-500 sm:text-[15px] dark:text-slate-400">
                  All Activity
                </span>

                {/* Filter */}
                <div className="relative" ref={filterRef}>
                  <button
                    type="button"
                    onClick={() => setFilterOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={filterOpen}
                    className={`inline-flex items-center gap-2 !rounded-[10px] border px-3 py-1.5 text-sm font-medium transition-colors sm:px-3.5 sm:py-2 ${filterActive || filterOpen
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                    <i className="bi bi-funnel" />
                    Filters
                    {filterActive && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[11px] font-semibold text-white">
                        1
                      </span>
                    )}
                  </button>

                  {filterOpen && (
                    <div
                      role="listbox"
                      className="absolute right-0 z-20 mt-2 w-64 max-w-[calc(100vw-3rem)] origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-600 dark:bg-slate-800"
                    >
                      <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Filter by model
                      </div>
                      {modelOptions.map((opt) => {
                        const selected = opt === modelFilter;
                        return (
                          <button
                            key={opt}
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setModelFilter(opt);
                              setFilterOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${selected
                              ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                              }`}
                          >
                            <span className="truncate">{opt}</span>
                            {selected && <i className="bi bi-check2" />}
                          </button>
                        );
                      })}
                      {filterActive && (
                        <button
                          onClick={() => {
                            setModelFilter(ALL);
                            setFilterOpen(false);
                          }}
                          className="mt-1 w-full rounded-lg border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-500/10"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="-mx-1 overflow-x-auto sm:-mx-2">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                      <th className="px-1 py-3 sm:px-2">User</th>
                      <th className="hidden px-2 py-3 sm:table-cell">
                        Current Model
                      </th>
                      <th className="hidden px-2 py-3 md:table-cell">
                        Last Activity
                      </th>
                      <th className="px-1 py-3 sm:px-2">API Usage</th>
                      <th className="px-1 py-3 sm:px-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-slate-700/60 dark:hover:bg-slate-700/30"
                      >
                        <td className="px-1 py-3 sm:px-2 sm:py-3.5">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-slate-800 sm:h-9 sm:w-9 sm:text-xs"
                              style={{ background: row.color }}
                            >
                              {row.initials}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-slate-900 sm:text-[15px] dark:text-white">
                                {row.name}
                              </div>
                              {/* Model + activity shown under the name on small screens */}
                              <div className="truncate text-xs text-slate-500 sm:hidden dark:text-slate-400">
                                {row.model}
                              </div>
                              <div className="truncate text-xs text-slate-400 sm:hidden">
                                {row.lastActivity}
                              </div>
                              <div className="hidden truncate text-xs text-slate-400 sm:block md:hidden">
                                {row.lastActivity}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-2 py-3.5 text-sm text-slate-500 sm:table-cell dark:text-slate-400">
                          {row.model}
                        </td>
                        <td className="hidden px-2 py-3.5 text-sm text-slate-500 md:table-cell dark:text-slate-400">
                          {row.lastActivity}
                        </td>
                        <td className="px-1 py-3 sm:px-2 sm:py-3.5">
                          <div className="flex flex-col gap-1.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-3">
                            <span className="text-sm font-medium text-slate-700 min-[420px]:w-12 dark:text-slate-200">
                              {row.usage}
                            </span>
                            <div className="h-2 w-14 overflow-hidden rounded-full bg-slate-100 sm:w-20 lg:w-24 dark:bg-slate-700">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                style={{ width: `${row.usagePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-1 py-3 text-right text-slate-400 sm:px-2 sm:py-3.5">
                          <i className="bi bi-chevron-right" />
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-2 py-10 text-center text-sm text-slate-400"
                        >
                          No activity found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column: Model performance + Calls by model */}
          <div className="flex min-w-0 flex-col gap-3 sm:gap-5 xl:col-span-5">
            {/* Model performance chart */}
            <div className={`${cardBase} flex flex-col p-4 sm:p-6`}>
              <h5 className="mb-4 text-lg font-semibold text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
                Model Performance
              </h5>

              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <span className="text-sm font-medium text-slate-500 sm:text-[15px] dark:text-slate-400">
                  Real-time metrics chart
                </span>
                <i className="bi bi-three-dots cursor-pointer text-slate-400 hover:text-slate-600" />
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                {callsByModel.slice(0, 3).map((m) => (
                  <div
                    key={m.label}
                    className="min-w-0 rounded-xl bg-slate-50 px-1.5 py-2.5 sm:px-2 sm:py-3 dark:bg-slate-700/40"
                  >
                    <div className="truncate text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
                      {m.label}
                    </div>
                    <div className="truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                      {formatCalls(m.value)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Height scales with screen size; chart fills it */}
              <div className="h-[240px] w-full sm:h-[260px] xl:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    barGap={4}
                    margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--ain-chart-grid, #eef0f4)"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tick={{ fill: "var(--ain-text-muted, #64748b)", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      tick={{ fill: "var(--ain-text-muted, #64748b)", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--ain-chart-cursor, rgba(99,102,241,0.06))" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--ain-border, #e2e8f0)",
                        backgroundColor: "var(--ain-surface, #fff)",
                        color: "var(--ain-text, #0f172a)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: 12,
                        paddingTop: 8,
                        color: "var(--ain-text, #334155)",
                      }}
                    />
                    {modelSeries.map((model, index) => (
                      <Bar
                        key={model.name}
                        dataKey={model.name}
                        fill={model.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={18}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                        animationBegin={index * 120}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Calls by model */}
            <div className={`${cardBase} p-3 sm:p-4`}>
              <h5 className="mb-4 text-lg font-semibold text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
                Calls by Model
              </h5>
              <ul className="space-y-4">
                {callsByModel.map((m) => (
                  <li key={m.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {m.label}
                      </span>
                      <span className="shrink-0 text-slate-500 dark:text-slate-400">
                        {formatCalls(m.value)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`}
                        style={{ width: `${(m.value / maxCalls) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;