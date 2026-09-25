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
  type Plugin,
} from "chart.js";
import { Line, Radar, Bar } from "react-chartjs-2";
import {
  Cpu,
  ImageIcon,
  Mic,
  Code2,
  Sparkles,
  Zap,
  Clock,
  CalendarDays,
  Activity,
  Radio,
} from "lucide-react";
import "../css/AIModelsDashboard.css";

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

/* ------------------------------------------------------------------ */
/*  Source data (as supplied)                                          */
/* ------------------------------------------------------------------ */

interface ModelMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const MODELS: ModelMeta[] = [
  {
    id: "gpt4",
    name: "GPT-4",
    category: "Text Generation",
    description: "Advanced language generation for writing, analysis, and conversation.",
    color: "#00f0ff",
    icon: <Cpu size={16} />,
  },
  {
    id: "dalle3",
    name: "DALL-E 3",
    category: "Image Generation",
    description: "Create detailed images from natural language descriptions.",
    color: "#ff2fb0",
    icon: <ImageIcon size={16} />,
  },
  {
    id: "whisper",
    name: "Whisper",
    category: "Speech-to-Text",
    description: "Transcribe spoken audio accurately into written text.",
    color: "#ffb020",
    icon: <Mic size={16} />,
  },
  {
    id: "codex",
    name: "Codex",
    category: "Code Assistance",
    description: "Generate, explain, and improve code across popular languages.",
    color: "#39ff88",
    icon: <Code2 size={16} />,
  },
  {
    id: "sd",
    name: "Stable Diffusion",
    category: "Open-Source Image",
    description: "Generate creative images with a flexible open-source model.",
    color: "#b26bff",
    icon: <Sparkles size={16} />,
  },
];

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
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  suffix?: string;
  accent: string;
  textValue?: string;
}) {
  const animated = useCountUp(value ?? 0);
  return (
    <div className="stat-card" style={{ ["--accent" as any]: accent }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">
          {textValue ? (
            <span className="stat-card__value--text">{textValue}</span>
          ) : (
            <>
              {animated.toLocaleString()}
              {suffix ? <em>{suffix}</em> : null}
            </>
          )}
        </span>
      </div>
      <div className="stat-card__scan" />
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
    el.className = "hud-tooltip";
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
      rows += `<div class="hud-tooltip__row">
          <span class="dot" style="background:${color}"></span>
          <span class="hud-tooltip__name">${p.dataset.label}</span>
          <span class="hud-tooltip__value">${Number(raw).toLocaleString()}${unit}</span>
        </div>`;
    });

    el.innerHTML = `<div class="hud-tooltip__head">${headFormatter(context)}</div>${rows}`;

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
const glowPlugin: Plugin<"line" | "radar" | "bar"> = {
  id: "glow",
  beforeDatasetsDraw(chart) {
    chart.ctx.save();
    chart.ctx.shadowColor = "rgba(0, 240, 255, 0.35)";
    chart.ctx.shadowBlur = 10;
  },
  afterDatasetsDraw(chart) {
    chart.ctx.restore();
  },
};

/* ------------------------------------------------------------------ */
/*  Main dashboard                                                      */
/* ------------------------------------------------------------------ */

export default function AIModelsDashboard() {
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
          color: "#9db3d4",
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: { family: "var(--font-mono)", size: 11 },
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
        grid: { color: "rgba(0,240,255,0.08)", display: true },
        ticks: { color: "#5a6b8c", font: { family: "var(--font-mono)", size: 11 } },
      },
      y: {
        grid: { color: "rgba(0,240,255,0.08)" },
        ticks: {
          color: "#5a6b8c",
          font: { family: "var(--font-mono)", size: 11 },
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
        angleLines: { color: "rgba(0,240,255,0.15)" },
        grid: { color: "rgba(0,240,255,0.15)" },
        pointLabels: { color: "#9db3d4", font: { family: "var(--font-mono)", size: 11 } },
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
        grid: { color: "rgba(0,240,255,0.08)" },
        ticks: { color: "#5a6b8c", font: { family: "var(--font-mono)", size: 11 }, callback: (v) => `${v}h` },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#5a6b8c", font: { family: "var(--font-mono)", size: 11 } },
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard__grid" />

      <header className="dashboard__header">
        <div>
          <span className="eyebrow">
            <Radio size={12} className="pulse-icon" /> LIVE TELEMETRY
          </span>
          <h1>AI Model Command Deck</h1>
          <p>Usage across all connected models, updated in real time.</p>
        </div>
        <div className="dashboard__clock">{clock.toLocaleTimeString([], { hour12: false })}</div>
      </header>

      <section className="stat-strip">
        <StatCard icon={<Zap size={18} />} label="Total tokens processed" value={totalTokens} suffix="K" accent="#00f0ff" />
        <StatCard icon={<Activity size={18} />} label="Total requests" value={totalRequests} accent="#39ff88" />
        <StatCard icon={<CalendarDays size={18} />} label="Days monitored" value={daysMonitored} accent="#ffb020" />
        <StatCard icon={topModel.meta.icon} label="Most used model" textValue={topModel.meta.name} accent={topModel.meta.color} />
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>Token Throughput — Last 14 Days</h2>
          <span className="panel__sub">Click a legend tag to isolate a model</span>
        </div>
        <div className="chart-shell" style={{ height: 320 }}>
          <Line data={lineData} options={lineOptions} plugins={[glowPlugin]} />
        </div>
      </section>

      <section className="panel-row">
        <div className="panel panel--radar">
          <div className="panel__head">
            <h2>Capability Matrix</h2>
            <span className="panel__sub">Hover a vertex for exact scores</span>
          </div>
          <div className="radar-wrap">
            <div className="radar-sweep" />
            <div className="chart-shell" style={{ height: 340 }}>
              <Radar data={radarData} options={radarOptions} plugins={[glowPlugin]} />
            </div>
          </div>
          <div className="radar-legend">
            {stats.map((s) => (
              <span key={s.meta.id} className="radar-legend__item">
                <span className="dot" style={{ background: s.meta.color }} />
                {s.meta.name}
              </span>
            ))}
          </div>
        </div>

        <div className="panel panel--bar">
          <div className="panel__head">
            <h2>Time Allocation</h2>
            <span className="panel__sub">Hours spent per model</span>
          </div>
          <div className="chart-shell" style={{ height: 340 }}>
            <Bar data={barData} options={barOptions} plugins={[glowPlugin]} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>Model Registry</h2>
          <span className="panel__sub">Hover a row for full diagnostics</span>
        </div>
        <div className="table-wrap">
          <table className="hud-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Category</th>
                <th>Tokens</th>
                <th>Time spent</th>
                <th>Days active</th>
                <th>Requests</th>
                <th>Last used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const isTop = s.meta.id === topModel.meta.id;
                const isHover = hoveredRow === s.meta.id;
                return (
                  <React.Fragment key={s.meta.id}>
                    <tr
                      className={`hud-row ${isHover ? "hud-row--active" : ""}`}
                      style={{ ["--row-accent" as any]: s.meta.color }}
                      onMouseEnter={() => showRowDetails(s.meta.id)}
                      onMouseLeave={hideRowDetails}
                    >
                      <td className="hud-row__model">
                        <span className="model-icon">{s.meta.icon}</span>
                        {s.meta.name}
                      </td>
                      <td>{s.meta.category}</td>
                      <td>{s.totalTokens.toLocaleString()}K</td>
                      <td>{s.timeSpentHours}h</td>
                      <td>{s.daysActive}/30</td>
                      <td>{s.requests.toLocaleString()}</td>
                      <td>{s.lastUsedDaysAgo === 0 ? "Today" : `${s.lastUsedDaysAgo}d ago`}</td>
                      <td>
                        {isTop ? (
                          <span className="badge badge--top">
                            <Zap size={11} /> Most used
                          </span>
                        ) : (
                          <span className="badge">Active</span>
                        )}
                      </td>
                    </tr>
                    <tr
                      className={`hud-detail-row ${isHover ? "hud-detail-row--active" : ""}`}
                      onMouseEnter={() => showRowDetails(s.meta.id)}
                      onMouseLeave={hideRowDetails}
                    >
                        <td colSpan={8}>
                          <div className={`hud-detail ${isHover ? "hud-detail--active" : ""}`}>
                            <Clock size={13} />
                            {s.meta.description}
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