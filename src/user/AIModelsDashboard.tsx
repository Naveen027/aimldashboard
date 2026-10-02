import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Radar, Bar } from "react-chartjs-2";
import {
  Bot,
  Zap,
  Clock,
  CalendarDays,
  Activity,
  Radio,
  FileSearch,
  Fingerprint,
  Languages,
  MessageSquareText,
  ScanFace,
} from "lucide-react";
import { useDashboardTheme } from "./ThemeToggle";
import { aiModelCatalog } from "../data/aiModels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);



interface ModelMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  color: string;
  icon: React.ReactNode;
}

const modelColors = ["#4285f4", "#34a853", "#fbbc04", "#9c27b0", "#1ba098", "#ea4335"];
const modelIcons = [
  ScanFace,
  Fingerprint,
  MessageSquareText,
  FileSearch,
  Bot,
  Languages,
];
const MODELS: ModelMeta[] = aiModelCatalog.map((model, index) => {
  const Icon = modelIcons[index];
  return {
    ...model,
    color: modelColors[index],
    icon: <Icon size={16} />,
  };
});

const RADAR_AXES = ["Speed", "Accuracy", "Efficiency", "Reliability", "Cost Control"];

/* ------------------------------------------------------------------ */
/*  Deterministic mock telemetry generator                             */
/*  (swap this section out for a real API/analytics call)              */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface ModelStats {
  meta: ModelMeta;
  dailyTokens: number[]; // 14 days, in K tokens
  totalTokens: number; // K tokens
  timeSpentHours: number;
  daysActive: number; // out of last 30
  requests: number;
  lastUsedDaysAgo: number;
  radar: Record<string, number>; // 0-100 per axis
}

function buildStats(): ModelStats[] {
  return MODELS.map((meta, i) => {
    const base = 40 + i * 22;
    const volatility = 12 + seededRandom(i * 97 + 3) * 18;
    const dailyTokens = Array.from({ length: 14 }, (_, d) => {
      const wave = Math.sin(d / 2.1 + i) * volatility;
      const noise = (seededRandom(i * 1000 + d) - 0.5) * volatility * 0.8;
      return Math.max(4, Math.round(base + wave + noise));
    });
    const totalTokens = dailyTokens.reduce((a, b) => a + b, 0);
    const timeSpentHours = Math.round((totalTokens / (6 + i)) * 3.4) / 10;
    const daysActive = 9 + Math.floor(seededRandom(i * 55 + 2) * 20);
    const requests = Math.round(totalTokens * (4 + seededRandom(i * 13) * 3));
    const lastUsedDaysAgo = Math.floor(seededRandom(i * 8 + 5) * 3);
    const radar: Record<string, number> = {};
    RADAR_AXES.forEach((axis, ai) => {
      radar[axis] = Math.round(45 + seededRandom(i * 31 + ai * 7) * 50);
    });
    return { meta, dailyTokens, totalTokens, timeSpentHours, daysActive, requests, lastUsedDaysAgo, radar };
  });
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const step = (ts: number) => {
      if (start.current === null) start.current = ts;
      const progress = Math.min(1, (ts - start.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  accent,
  textValue,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  suffix?: string;
  accent: string;
  textValue?: string;
  valueColor?: string;
}) {
  const animated = useCountUp(value ?? 0);
  return (
    <div className="relative flex min-h-[116px] items-center gap-3.5 overflow-hidden rounded-2xl !border !border-[#eef0f4] border-l-4 bg-[color-mix(in_srgb,var(--accent)_9%,white)] p-[18px_20px] shadow-[0_1px_3px_rgba(20,30,60,0.08)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(20,30,60,0.1)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937]" style={{ ["--accent" as any]: accent, borderLeftColor: accent }}>
      <div className="grid size-10 shrink-0 place-items-center rounded-lg text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,white)] [.theme-dark_&]:!bg-[color-mix(in_srgb,var(--accent)_18%,#1f2937)]">{icon}</div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[0.82rem] font-medium text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">{label}</span>
        <span
          className="text-2xl font-bold text-[var(--accent)]"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {textValue ? (
            <span className="block truncate text-lg whitespace-nowrap">{textValue}</span>
          ) : (
            <>
              {animated.toLocaleString()}
              {suffix ? <em className="ml-0.5 text-[0.9rem] not-italic opacity-70">{suffix}</em> : null}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HUD-style external tooltip (shared by Line / Radar / Bar)          */
/* ------------------------------------------------------------------ */

function getOrCreateTooltipEl(chart: any): HTMLDivElement {
  const parent = chart.canvas.parentNode as HTMLElement;
  let el = parent.querySelector<HTMLDivElement>(".hud-tooltip");
  if (!el) {
    el = document.createElement("div");
    el.className =
      "hud-tooltip absolute z-20 pointer-events-none min-w-40 px-3 py-2.5 rounded-xl border border-[#eef0f4] bg-white shadow-lg transition-[opacity,left,top] duration-[120ms] opacity-0 [.theme-dark_&]:border-[#374151] [.theme-dark_&]:bg-[#1f2937]";
    parent.appendChild(el);
  }
  return el;
}

function makeExternalTooltip(headFormatter: (ctx: any) => string) {
  return (context: any) => {
    const { chart, tooltip } = context;
    const el = getOrCreateTooltipEl(chart);

    if (tooltip.opacity === 0) {
      el.style.opacity = "0";
      return;
    }

    const points = [...(tooltip.dataPoints || [])].sort(
      (a, b) => (b.parsed.y ?? b.parsed.r ?? b.parsed.x ?? 0) - (a.parsed.y ?? a.parsed.r ?? a.parsed.x ?? 0)
    );

    let rows = "";
    points.forEach((p: any) => {
      const color = p.dataset.borderColor || p.dataset.backgroundColor;
      const raw = p.parsed.y ?? p.parsed.r ?? p.parsed.x ?? 0;
      const unit = p.chart?.config?._config?.__hudUnit ?? "";
      rows += `<div class="flex items-center gap-2 text-[0.78rem] py-0.5 whitespace-nowrap">
          <span class="inline-block size-2 rounded-full" style="background:${color}"></span>
          <span class="flex-1 text-[#1c2033] [.theme-dark_&]:text-[#f3f4f6]">${p.dataset.label}</span>
          <span class="font-bold text-[#3d7bfc]">${Number(raw).toLocaleString()}${unit}</span>
        </div>`;
    });

    el.innerHTML = `<div class="text-[0.68rem] tracking-[0.06em] text-[#667085] mb-1.5 whitespace-nowrap">${headFormatter(context)}</div>${rows}`;

    const { offsetLeft: canvasX, offsetTop: canvasY } = chart.canvas;
    const parent = chart.canvas.parentNode as HTMLElement;
    const preferredLeft = canvasX + tooltip.caretX + 14;
    const preferredTop = canvasY + tooltip.caretY - 10;
    const maxLeft = Math.max(8, parent.clientWidth - el.offsetWidth - 8);
    const maxTop = Math.max(8, parent.clientHeight - el.offsetHeight - 8);
    el.style.opacity = "1";
    el.style.left = Math.min(Math.max(8, preferredLeft), maxLeft) + "px";
    el.style.top = Math.min(Math.max(8, preferredTop), maxTop) + "px";
  };
}

/* Glow plugin: adds a soft canvas shadow behind lines/points/bars so the
   sci-fi accent colors read as glowing rather than flat vector strokes. */
/* ------------------------------------------------------------------ */
/*  Main dashboard                                                      */
/* ------------------------------------------------------------------ */

export default function AIModelsDashboard() {
  const { isDarkMode } = useDashboardTheme();
  const chartTextColor = isDarkMode ? "#c1c8d3" : "#667085";
  const chartGridColor = isDarkMode ? "#374151" : "#eef0f4";
  const stats = useMemo(buildStats, []);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | undefined>(undefined);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => {
      clearInterval(t);
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const showRowDetails = (id: string) => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredRow(id);
  };

  const hideRowDetails = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredRow(null);
    }, 100);
  };

  const topModel = useMemo(() => [...stats].sort((a, b) => b.totalTokens - a.totalTokens)[0], [stats]);
  const totalTokens = stats.reduce((a, s) => a + s.totalTokens, 0);
  const totalRequests = stats.reduce((a, s) => a + s.requests, 0);
  const daysMonitored = 30;

  /* ---------------- Line: token throughput ---------------- */
  const lineData = {
    labels: Array.from({ length: 14 }, (_, d) => `D${d + 1}`),
    datasets: stats.map((s) => ({
      label: s.meta.name,
      data: s.dailyTokens,
      borderColor: s.meta.color,
      backgroundColor: s.meta.color + "22",
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: s.meta.color,
      tension: 0.35,
      fill: false,
    })),
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1400, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartTextColor,
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: { family: "Inter, 'Segoe UI', sans-serif", size: 11 },
        },
      },
      tooltip: {
        enabled: false,
        external: makeExternalTooltip((ctx) => `${ctx.tooltip.title?.[0] ?? ""} · TOKEN THROUGHPUT`),
        itemSort: (a: any, b: any) => b.parsed.y - a.parsed.y,
      },
    },
    scales: {
      x: {
        grid: { color: chartGridColor, display: true },
        ticks: { color: chartTextColor, font: { family: "Inter, 'Segoe UI', sans-serif", size: 11 } },
      },
      y: {
        grid: { color: chartGridColor },
        ticks: {
          color: chartTextColor,
          font: { family: "Inter, 'Segoe UI', sans-serif", size: 11 },
          callback: (v) => `${v}K`,
        },
      },
    },
  };

  /* ---------------- Radar: capability matrix ---------------- */
  const radarData = {
    labels: RADAR_AXES,
    datasets: stats.map((s) => ({
      label: s.meta.name,
      data: RADAR_AXES.map((axis) => s.radar[axis]),
      borderColor: s.meta.color,
      backgroundColor: s.meta.color + "14",
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: s.meta.color,
      pointHoverRadius: 6,
    })),
  };

  const radarOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: makeExternalTooltip((ctx) => ctx.tooltip.title?.[0] ?? ""),
        itemSort: (a: any, b: any) => b.parsed.r - a.parsed.r,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: { color: chartGridColor },
        grid: { color: chartGridColor },
        pointLabels: { color: chartTextColor, font: { family: "Inter, 'Segoe UI', sans-serif", size: 11 } },
        ticks: { display: false, backdropColor: "transparent" },
      },
    },
  };

  /* ---------------- Bar: time allocation ---------------- */
  const barSorted = [...stats].sort((a, b) => b.timeSpentHours - a.timeSpentHours);
  const barData = {
    labels: barSorted.map((s) => s.meta.name),
    datasets: [
      {
        label: "Hours",
        data: barSorted.map((s) => s.timeSpentHours),
        backgroundColor: barSorted.map((s) => s.meta.color),
        borderRadius: 4,
        barThickness: 22,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: makeExternalTooltip((ctx) => ctx.tooltip.dataPoints?.[0]?.label ?? ""),
      },
    },
    scales: {
      x: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor, font: { family: "Inter, 'Segoe UI', sans-serif", size: 11 }, callback: (v) => `${v}h` },
      },
      y: {
        grid: { display: false },
        ticks: { color: chartTextColor, font: { family: "Inter, 'Segoe UI', sans-serif", size: 11 } },
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden p-0 text-[#1c2033] [.theme-dark_&]:text-[#f3f4f6]">

      <header className="relative z-[2] mb-5 flex flex-wrap items-start justify-between gap-4 max-[560px]:flex-col">
        <div>
          <span className="mb-2.5 inline-flex items-center gap-1.5 text-[15px] font-semibold uppercase text-[#1ba098]">
            <Radio size={14} /> Model usage
          </span>
          <h2 className="m-0 text-[25px] font-bold">AI model activity</h2>
          <p className="mb-0 mt-2 text-[0.92rem] text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">Usage across your connected models, updated in real time.</p>
        </div>
        <div className="rounded-xl border border-[#eef0f4] bg-white px-4 py-2.5 text-xl font-semibold tabular-nums text-[#3d7bfc] shadow-[0_1px_3px_rgba(20,30,60,0.08)] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:bg-[#1f2937]">{clock.toLocaleTimeString([], { hour12: false })}</div>
      </header>

      <section className="relative z-[2] mb-6 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        <StatCard icon={<Zap size={18} />} label="Total tokens processed" value={totalTokens} suffix="K" accent="#4285f4" />
        <StatCard icon={<Activity size={18} />} label="Total requests" value={totalRequests} accent="#34a853" />
        <StatCard icon={<CalendarDays size={18} />} label="Days monitored" value={daysMonitored} accent="#fbbc04" />
        <StatCard icon={topModel.meta.icon} label="Most used model" textValue={topModel.meta.name} accent={topModel.meta.color} />
      </section>

      <section className="relative z-[2] mb-5 rounded-2xl !border !border-[#eef0f4] bg-white p-5 shadow-[0_1px_3px_rgba(20,30,60,0.08)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937]">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="m-0 text-base font-semibold">Token throughput — last 14 days</h2>
          <span className="text-xs text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">Click a legend tag to isolate a model</span>
        </div>
        <div className="relative" style={{ height: 320 }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </section>

      <section className="relative z-[2] mb-5 grid grid-cols-[1.1fr_0.9fr] gap-4 max-[980px]:grid-cols-1">
        <div className="relative z-[2] rounded-2xl !border !border-[#eef0f4] bg-white p-5 shadow-[0_1px_3px_rgba(20,30,60,0.08)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937]">
          <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="m-0 text-base font-semibold">Capability matrix</h2>
            <span className="text-xs text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">Hover a vertex for exact scores</span>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <div className="relative z-[1]" style={{ height: 340 }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-[18px] gap-y-3 text-xs text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">
            {stats.map((s) => (
              <span key={s.meta.id} className="inline-flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full" style={{ background: s.meta.color }} />
                {s.meta.name}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-[2] rounded-2xl !border !border-[#eef0f4] bg-white p-5 shadow-[0_1px_3px_rgba(20,30,60,0.08)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937]">
          <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="m-0 text-base font-semibold">Time allocation</h2>
            <span className="text-xs text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">Hours spent per model</span>
          </div>
          <div className="relative" style={{ height: 340 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </section>

      <section className="relative z-[2] mb-5 rounded-2xl !border !border-[#eef0f4] bg-white p-5 shadow-[0_1px_3px_rgba(20,30,60,0.08)] [.theme-dark_&]:!border-[#374151] [.theme-dark_&]:!bg-[#1f2937]">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="m-0 text-base font-semibold">Model registry</h2>
          <span className="text-xs text-[#667085] [.theme-dark_&]:text-[#c1c8d3]">Hover a row for full diagnostics</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Model</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Category</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Tokens</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Time spent</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Days active</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Requests</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Last used</th>
                <th className="border-b border-[#eef0f4] px-3 py-2.5 text-left text-xs font-medium text-[#667085] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#c1c8d3]">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const isTop = s.meta.id === topModel.meta.id;
                const isHover = hoveredRow === s.meta.id;
                return (
                  <React.Fragment key={s.meta.id}>
                    <tr
                      className={`border-l-2 border-transparent transition-colors duration-150 hover:bg-[#fafbfd] [.theme-dark_&]:hover:bg-[#273449] ${isHover ? "border-l-[#3d7bfc] bg-[#fafbfd] [.theme-dark_&]:bg-[#273449]" : ""}`}
                      onMouseEnter={() => showRowDetails(s.meta.id)}
                      onMouseLeave={hideRowDetails}
                    >
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] transition-colors [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">
                        <span className="mr-2 inline-grid place-items-center text-[#3d7bfc]">{s.meta.icon}</span>
                        {s.meta.name}
                      </td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">{s.meta.category}</td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">{s.totalTokens.toLocaleString()}K</td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">{s.timeSpentHours}h</td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">{s.daysActive}/30</td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">{s.requests.toLocaleString()}</td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">{s.lastUsedDaysAgo === 0 ? "Today" : `${s.lastUsedDaysAgo}d ago`}</td>
                      <td className="border-b border-[#eef0f4] px-3 py-3 text-[#1c2033] [.theme-dark_&]:border-[#374151] [.theme-dark_&]:text-[#f3f4f6]">
                        {isTop ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6e5] px-2.5 py-1 text-[0.68rem] font-semibold text-[#a3690f]">
                            <Zap size={11} /> Most used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5f3] px-2.5 py-1 text-[0.68rem] font-semibold text-[#1ba098]">Active</span>
                        )}
                      </td>
                    </tr>
                    <tr
                      className={`transition-[height,padding] duration-[250ms] [&>td]:h-0 [&>td]:px-3 [&>td]:py-0 [&>td]:border-b [&>td]:border-white/[0.04] ${isHover ? "[&>td]:h-[62px] [&>td]:pb-3" : ""}`}
                      onMouseEnter={() => showRowDetails(s.meta.id)}
                      onMouseLeave={hideRowDetails}
                    >
                        <td colSpan={8}>
                          <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] text-[#7f93bd] max-h-0 opacity-0 overflow-hidden -translate-y-1 transition-[opacity,max-height,transform] duration-[250ms] [.theme-light_&]:text-[#53657b] ${isHover ? "max-h-[56px] opacity-100 translate-y-0" : ""}`}>
                            <span className="inline-flex items-center gap-2">
                              <Clock size={13} />
                              {s.meta.description}
                            </span>
                            {s.meta.highlights.map((highlight) => (
                              <span
                                key={highlight}
                                className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[0.68rem] font-medium text-[#3d5fa8] [.theme-dark_&]:bg-[#273449] [.theme-dark_&]:text-[#c1d2f5]"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}