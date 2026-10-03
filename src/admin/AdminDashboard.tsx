import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

/* -------------------------------------------------------------------------- */
/*  User profile details (replace with API data, e.g. getUserDetails(userId)) */
/* -------------------------------------------------------------------------- */
interface UserProfile {
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  joined: string;
  plan: string;
  status: "Active" | "Idle";
}

const userProfiles: Record<string, UserProfile> = {
  "Alex Johnson": {
    email: "alex.johnson@tidepool.ai",
    phone: "+1 415 555 0142",
    role: "Data Scientist",
    department: "Research",
    location: "San Francisco, USA",
    joined: "12 Jan 2024",
    plan: "Enterprise",
    status: "Active",
  },
  "Mia Wong": {
    email: "mia.wong@tidepool.ai",
    phone: "+65 6555 0187",
    role: "ML Engineer",
    department: "Platform",
    location: "Singapore",
    joined: "03 Mar 2023",
    plan: "Pro",
    status: "Active",
  },
  "Mana Tuung": {
    email: "mana.tuung@tidepool.ai",
    phone: "+81 3 5555 0123",
    role: "Product Analyst",
    department: "Product",
    location: "Tokyo, Japan",
    joined: "21 Aug 2024",
    plan: "Team",
    status: "Idle",
  },
};

const fallbackProfile: UserProfile = {
  email: "—",
  phone: "—",
  role: "—",
  department: "—",
  location: "—",
  joined: "—",
  plan: "—",
  status: "Idle",
};

// Sample per-row metrics derived from the row id (replace with real API fields)
const getRowMetrics = (row: UsageRow) => ({
  avgLatency: `${180 + ((row.id * 37) % 200)} ms`,
  successRate: `${(97 + (row.id % 3) * 0.8).toFixed(1)}%`,
  requests: `${(row.usagePct * 112 + row.id * 37).toLocaleString()}`,
});

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

/* -------------------------------------------------------------------------- */
/*  User detail modal                                                         */
/* -------------------------------------------------------------------------- */
const CLOSE_DURATION = 250; // ms — keep in sync with duration-250 below

interface UserDetailModalProps {
  row: UsageRow;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ row, onClose }) => {
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const profile = userProfiles[row.name] ?? fallbackProfile;
  const metrics = getRowMetrics(row);

  const recentActivity = [
    { icon: "bi-chat-dots-fill", text: `Chat completion on ${row.model}`, time: row.lastActivity },
    { icon: "bi-file-earmark-text-fill", text: "Document summarisation request", time: "2 hours ago" },
    { icon: "bi-key-fill", text: "API key rotated", time: "Yesterday" },
    { icon: "bi-box-arrow-in-right", text: "Signed in from a new device", time: "3 days ago" },
  ];

  // Play the enter animation after first paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animate out, then unmount
  const handleClose = () => {
    if (closeTimer.current) return;
    setVisible(false);
    closeTimer.current = window.setTimeout(onClose, CLOSE_DURATION);
  };

  // Escape to close + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Staggered reveal for each section inside the panel
  const stagger = (i: number): React.CSSProperties => ({
    transitionDelay: visible ? `${120 + i * 70}ms` : "0ms",
  });
  const sectionAnim = `transition-all duration-500 ease-out motion-reduce:transition-none ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
    }`;

  const infoItems: { icon: string; label: string; value: string }[] = [
    { icon: "bi-envelope", label: "Email", value: profile.email },
    { icon: "bi-telephone", label: "Phone", value: profile.phone },
    { icon: "bi-briefcase", label: "Role", value: profile.role },
    { icon: "bi-diagram-3", label: "Department", value: profile.department },
    { icon: "bi-geo-alt", label: "Location", value: profile.location },
    { icon: "bi-calendar-check", label: "Joined", value: profile.joined },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-title"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* Panel */}
      <div
        className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-[250ms] ease-out motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-800 ${visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-6 scale-95 opacity-0"
          }`}
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 px-4 pb-3 pt-3 sm:px-7 sm:pb-6 sm:pt-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 [border-radius:10px]! bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 right-24 h-28 w-28 [border-radius:10px]! bg-white/10" />

          {/* Close (X) button — rotates, scales and turns rose on hover */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close user details"
            className="group absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center [border-radius:10px]! bg-white/15 text-white transition-all duration-300 ease-out hover:rotate-90 hover:scale-110 hover:bg-rose-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 motion-reduce:transition-none motion-reduce:hover:rotate-0 sm:right-4 sm:top-4"
          >
            <i className="bi bi-x-lg text-base transition-transform duration-300 group-hover:scale-110" />
          </button>

          <div className="relative flex items-center gap-4">
            <span
              className={`flex h-16 w-16 shrink-0 items-center justify-center [border-radius:10px]! text-xl font-bold text-slate-800 ring-4 ring-white/40 transition-all duration-500 ease-out motion-reduce:transition-none sm:h-20 sm:w-20 sm:text-2xl ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
              style={{ background: row.color, transitionDelay: visible ? "100ms" : "0ms" }}
            >
              {row.initials}
            </span>
            <div className="min-w-0 pr-10">
              <h3
                id="user-detail-title"
                className="truncate text-lg font-bold text-white sm:text-2xl"
              >
                {row.name}
              </h3>
              <p className="truncate text-sm text-indigo-100">
                {profile.role} · {profile.department}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 [border-radius:10px]! px-2.5 py-0.5 text-xs font-medium ${profile.status === "Active"
                    ? "bg-emerald-400/20 text-emerald-100"
                    : "bg-amber-400/20 text-amber-100"
                    }`}
                >
                  <span
                    className={`h-1.5 w-1.5 [border-radius:10px]! ${profile.status === "Active"
                      ? "animate-pulse bg-emerald-300"
                      : "bg-amber-300"
                      }`}
                  />
                  {profile.status}
                </span>
                <span className="[border-radius:10px]! bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white">
                  {profile.plan} plan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-3 py-3 sm:px-7 sm:py-6">
          {/* Usage stats */}
          <section className={sectionAnim} style={stagger(0)}>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Usage summary
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "API usage", value: row.usage },
                { label: "Requests", value: metrics.requests },
                { label: "Avg latency", value: metrics.avgLatency },
                { label: "Success rate", value: metrics.successRate },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-700/40"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {s.label}
                  </div>
                  <div className="mt-0.5 truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Quota used</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {row.usagePct}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden [border-radius:10px]! bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full [border-radius:10px]! bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out motion-reduce:transition-none"
                  style={{
                    width: visible ? `${row.usagePct}%` : "0%",
                    transitionDelay: visible ? "400ms" : "0ms",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Current model */}
          <section className={sectionAnim} style={stagger(1)}>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Current model
            </h4>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <i className="bi bi-cpu-fill" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {row.model}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Last activity {row.lastActivity}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact / profile info */}
          <section className={sectionAnim} style={stagger(2)}>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Profile details
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-700/60"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <section className={sectionAnim} style={stagger(3)}>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Recent activity
            </h4>
            <ul className="space-y-3">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center [border-radius:10px]! bg-indigo-50 text-sm text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <i className={`bi ${a.icon}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-800 dark:text-slate-100">
                      {a.text}
                    </div>
                    <div className="text-xs text-slate-400">{a.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-3 sm:px-7 dark:border-slate-700/60">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[10px]! border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* -------------------------------------------------------------------------- */
/*  Export menu (Model Performance card)                                      */
/* -------------------------------------------------------------------------- */
type ExportKind = "pdf" | "excel";

const ExportMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const [done, setDone] = useState<ExportKind | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // One row per model: Accuracy / Usage / Reliability + total calls
  const buildRows = () =>
    modelSeries.map((m, i) => ({
      Model: m.name,
      Accuracy: m.values[0],
      Usage: m.values[1],
      Reliability: m.values[2],
      "Total Calls": callsByModel[i]?.value ?? 0,
    }));

  const stamp = () => new Date().toISOString().slice(0, 10);

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = buildRows();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Model Performance");
    XLSX.writeFile(wb, `model-performance-${stamp()}.xlsx`);
  };

  const exportPdf = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const rows = buildRows();
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Model Performance Report", 40, 50);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 40, 68);

    autoTable(doc, {
      startY: 90,
      head: [["Model", "Accuracy", "Usage", "Reliability", "Total Calls"]],
      body: rows.map((r) => [
        r.Model,
        r.Accuracy,
        r.Usage,
        r.Reliability,
        formatCalls(r["Total Calls"]),
      ]),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`model-performance-${stamp()}.pdf`);
  };

  const run = async (kind: ExportKind) => {
    if (busy) return;
    setBusy(kind);
    try {
      // tiny delay so the spinner is visible even for fast exports
      await new Promise((r) => setTimeout(r, 350));
      if (kind === "pdf") await exportPdf();
      else await exportExcel();
      setBusy(null);
      setDone(kind);
      window.setTimeout(() => {
        setDone(null);
        setOpen(false);
      }, 900);
    } catch (err) {
      console.error("Export failed", err);
      setBusy(null);
    }
  };

  const items: { kind: ExportKind; label: string; icon: string; tint: string }[] = [
    {
      kind: "pdf",
      label: "Export to PDF",
      icon: "bi-file-earmark-pdf-fill",
      tint: "text-rose-500",
    },
    {
      kind: "excel",
      label: "Export to Excel",
      icon: "bi-file-earmark-excel-fill",
      tint: "text-emerald-600",
    },
  ];

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Export options"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          open
            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
        }`}
      >
        <i
          className={`bi bi-three-dots cursor-pointer transition-transform duration-300 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {/* Always mounted so it can animate in and out */}
      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 z-30 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg transition-all duration-200 ease-out motion-reduce:transition-none dark:border-slate-600 dark:bg-slate-800 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Export data
        </div>
        {items.map((item, i) => {
          const isBusy = busy === item.kind;
          const isDone = done === item.kind;
          return (
            <button
              key={item.kind}
              type="button"
              role="menuitem"
              tabIndex={open ? 0 : -1}
              disabled={busy !== null}
              onClick={() => run(item.kind)}
              style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-all duration-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70 dark:text-slate-200 dark:hover:bg-slate-700 ${
                open ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
              }`}
            >
              {isBusy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
              ) : isDone ? (
                <i className="bi bi-check-circle-fill text-emerald-500" />
              ) : (
                <i className={`bi ${item.icon} ${item.tint}`} />
              )}
              <span className="flex-1">
                {isBusy ? "Preparing…" : isDone ? "Downloaded" : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */
const AdminDashboard: React.FC = () => {
  // ---- Filter state ----
  const [filterOpen, setFilterOpen] = useState(false);
  const [modelFilter, setModelFilter] = useState<string>(ALL);
  const filterRef = useRef<HTMLDivElement>(null);

  // ---- User detail modal state ----
  const [selectedRow, setSelectedRow] = useState<UsageRow | null>(null);

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

      <div className="mx-auto w-full max-w-[1520px] px-0 py-0 sm:px-1">
        {/* Top bar */}
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <h2 className="break-words [font-size:1.2rem] !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">
            Dashboard
          </h2>

          <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-[10px]! bg-amber-50 px-3 py-1.5 !text-sm !font-thin !text-amber-700 ring-1 ring-amber-200 sm:px-3.5 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
            <i className="bi bi-exclamation-triangle-fill" />
            System-wide notifications
          </span>
        </div>

         <p className="mt-0 mb-2 text-[color:#6b7280]">
          System-wide Summary
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-1  mb-3 [height:100px]! gap-4 min-[480px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
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
              <ExportMenu />
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
            <div className="admin-model-performance-chart h-[240px] w-full sm:h-[260px] xl:h-[280px]">
              <style>{`
                .admin-model-performance-chart .recharts-surface:focus,
                .admin-model-performance-chart .recharts-layer:focus,
                .admin-model-performance-chart .recharts-rectangle:focus {
                  outline: none;
                }
              `}</style>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barGap={8}
                  barCategoryGap="20%"
                  margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
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
                      maxWidth: 220,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: "1px solid var(--ain-border, #e2e8f0)",
                      backgroundColor: "var(--ain-surface, #fff)",
                      color: "var(--ain-text, #0f172a)",
                      fontSize: 11,
                      lineHeight: 1.35,
                    }}
                    labelStyle={{ marginBottom: 3, fontSize: 10 }}
                    itemStyle={{ padding: 0, fontSize: 10 }}
                    wrapperStyle={{ outline: "none" }}
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
                      maxBarSize={28}
                      activeBar={false}
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


        </div>




        {/* Bottom row */}
        <div className="mt-3 grid grid-cols-1 items-start gap-3 sm:mt-5 sm:gap-5 xl:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
          {/* User usage table */}
          <div className="min-w-0">
            <div className={`${cardBase} flex flex-col p-4 sm:p-6`}>
              <h5 className="mb-3 text-lg font-semibold text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
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
                      <span className="flex h-5 min-w-5 items-center justify-center [border-radius:10px]! bg-indigo-600 px-1 text-[11px] font-semibold text-white">
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
                              className="flex h-8 w-8 shrink-0 items-center justify-center [border-radius:10px]! text-[11px] font-semibold text-slate-800 sm:h-9 sm:w-9 sm:text-xs"
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
                            <div className="h-2 w-14 overflow-hidden [border-radius:10px]! bg-slate-100 sm:w-20 lg:w-24 dark:bg-slate-700">
                              <div
                                className="h-full [border-radius:10px]! bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                style={{ width: `${row.usagePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-1 py-3 text-right sm:px-2 sm:py-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            aria-label={`View details for ${row.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center [border-radius:10px]! text-slate-400 transition-all duration-200 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                          >
                            <i className="bi bi-chevron-right" />
                          </button>
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

          {/* Calls by model */}
          <div className={`${cardBase} p-3 sm:p-4`}>
            <h5 className="mb-4 text-lg font-semibold text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
              Calls by Model
            </h5>
            <ul className="space-y-4 p-1!">
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
                  <div className="h-2.5 w-full overflow-hidden [border-radius:10px]! bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full [border-radius:10px]! bg-gradient-to-r ${m.color} transition-all duration-700`}
                      style={{ width: `${(m.value / maxCalls) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* User detail modal */}
      {selectedRow && (
        <UserDetailModal
          key={selectedRow.id}
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;