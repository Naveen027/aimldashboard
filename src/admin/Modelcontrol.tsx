import React, { useEffect, useMemo, useState } from 'react';
import {
  Cpu,
  Eye,
  MessageSquare,
  Network,
  ScanFace,
  Fingerprint,
  LayoutGrid,
  Sparkles,
  Plug,
  ShieldCheck,
  Target,
  Check,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import DeleteIcon from '../components/DeleteIcon';
import { aiModelCatalog, type AiModelType } from '../data/aiModels';

interface Model {
  id: string;
  name: string;
  type: AiModelType;
  category: string;
  description: string;
  highlights: string[];
  provider: string;
  status: 'active' | 'maintenance' | 'disabled';
  usagePercentage: number;
  lastUpdated: string;
  rpmLimit: number;
  costPerMRequest: number;
  version: string;
  requests: number;
  latency: number;
}

interface ModelEndpoint {
  id: string;
  modelId: string;
  url: string;
  apiKey: string;
  region: string;
  latency: number;
  uptime: number;
}

/* ---------- shared Tailwind class strings ---------- */
const dark = '[.ain-app.theme-dark_&]';

// text-base on mobile (16px) prevents iOS Safari from zooming into focused inputs
const inputCls =
  `w-full min-w-0 rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm ` +
  `${dark}:border-gray-700 ${dark}:bg-gray-900 ${dark}:text-gray-100`;

const labelCls = `mb-1.5 block text-sm font-medium text-slate-700 sm:mb-2 ${dark}:text-slate-300`;

const btnPrimary =
  'inline-flex items-center justify-center rounded-[10px]! bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30';

const btnSecondary =
  `inline-flex items-center justify-center rounded-[10px]! border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-200 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/30 ` +
  `${dark}:border-gray-600 ${dark}:bg-gray-700/60 ${dark}:text-gray-200 ${dark}:hover:bg-gray-700`;

const actionBtn =
  `flex-1 min-w-[110px] !rounded-[10px] border border-slate-300 bg-white px-2.5 py-2.5 text-center text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 sm:min-w-[80px] sm:py-2 ` +
  `${dark}:border-gray-600 ${dark}:bg-gray-700/60 ${dark}:text-gray-200`;

const statusBadgeCls: Record<Model['status'], string> = {
  active: 'bg-green-100 text-green-800',
  disabled: 'bg-red-100 text-red-800',
  maintenance: 'bg-amber-100 text-amber-800',
};

/* soft pill used on the cards (matches reference design) */
const cardStatusCls: Record<Model['status'], string> = {
  active: `bg-emerald-50 text-emerald-700 ${dark}:bg-emerald-500/15 ${dark}:text-emerald-300`,
  disabled: `bg-rose-50 text-rose-700 ${dark}:bg-rose-500/15 ${dark}:text-rose-300`,
  maintenance: `bg-amber-50 text-amber-700 ${dark}:bg-amber-500/15 ${dark}:text-amber-300`,
};
const statusLabel: Record<Model['status'], string> = {
  active: 'Active',
  disabled: 'Disabled',
  maintenance: 'Maintenance',
};

/* ---------- Lucide icons for models ---------- */
// Fallback icon by model type
const modelTypeIcon: Record<string, LucideIcon> = {
  llm: MessageSquare,
  vision: Eye,
  embedding: Network,
  other: Cpu,
};

// Specific icon overrides by model id (ids must match aiModelCatalog)
const modelIdIcon: Record<string, LucideIcon> = {
  'kartavya-face-matching': ScanFace,
  'muzzle-print-identification': Fingerprint,
};

const getModelIcon = (model: Pick<Model, 'id' | 'type'>): LucideIcon =>
  modelIdIcon[model.id] ?? modelTypeIcon[model.type] ?? Cpu;

const modelTypeLabel: Record<string, string> = {
  llm: 'Language',
  vision: 'Vision',
  embedding: 'Embedding',
  other: 'Other',
};
const getTypeLabel = (type: string) => modelTypeLabel[type] ?? 'Other';

/* ---------- description parser ---------- */
interface ParsedDescription {
  intro: string;
  sections: { title: string; items: string[] }[];
  links: string[];
}

// Stray call-to-action lines that live inside some descriptions
const CTA_LABELS = ['Request Demo', 'Technical Documentation', 'Case Studies'];

const parseDescription = (raw: string): ParsedDescription => {
  const intro: string[] = [];
  const sections: ParsedDescription['sections'] = [];
  const links: string[] = [];
  let current: ParsedDescription['sections'][number] | null = null;

  raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (CTA_LABELS.includes(line)) {
        links.push(line);
        return;
      }
      if (line.endsWith(':')) {
        current = { title: line.slice(0, -1), items: [] };
        sections.push(current);
        return;
      }
      const text = line.replace(/^[-•]\s*/, '');
      if (current) current.items.push(text);
      else intro.push(text);
    });

  return { intro: intro.join(' '), sections, links };
};

const sectionMeta = (title: string): { label: string; Icon: LucideIcon } => {
  const t = title.toLowerCase();
  if (t.includes('capabilit')) return { label: 'Capabilities', Icon: Sparkles };
  if (t.includes('integration')) return { label: 'Integration', Icon: Plug };
  if (t.includes('governance')) return { label: 'Governance', Icon: ShieldCheck };
  if (t.includes('outcome')) return { label: 'Outcome', Icon: Target };
  return { label: title, Icon: Sparkles };
};

const ModelControl: React.FC = () => {
  const [models, setModels] = useState<Model[]>(
    aiModelCatalog.map((model, index) => ({
      ...model,
      provider: 'Karnataka AI Cell',
      status: 'active',
      usagePercentage: [48.3, 21.8, 15.2, 14.7, 14.7, 12.4][index],
      lastUpdated: '2026-10-01',
      rpmLimit: [10000, 5000, 3000, 8000, 8000, 6000][index],
      costPerMRequest: [0.03, 0.02, 0.01, 0.025, 0.025, 0.015][index],
      version: model.highlights.find((highlight) => highlight.startsWith('v'))?.slice(1) ?? '1.0',
      requests: [48210, 21840, 15230, 14720, 14690, 12410][index] ?? 0,
      latency: [820, 312, 245, 410, 395, 360][index] ?? 0,
    }))
  );

  const [endpoints] = useState<ModelEndpoint[]>([
    {
      id: 'endpoint-face-matching',
      modelId: 'kartavya-face-matching',
      url: 'https://api.karnataka.gov.in/v1/face-matching',
      apiKey: 'sk-***',
      region: 'US-East',
      latency: 245,
      uptime: 99.98,
    },
    {
      id: 'endpoint-muzzle-print',
      modelId: 'muzzle-print-identification',
      url: 'https://api.karnataka.gov.in/v1/muzzle-print/identify',
      apiKey: 'sk-***',
      region: 'US-West',
      latency: 312,
      uptime: 99.95,
    },
  ]);

  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelFormData, setModelFormData] = useState<Partial<Model>>({});
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Always derive from `models` so status changes stay in sync
  const selectedModel = models.find((m) => m.id === selectedModelId) || null;

  // Parse the multi-line description into intro + sections + CTA links
  const parsed = useMemo(
    () => (selectedModel ? parseDescription(selectedModel.description) : null),
    [selectedModel?.description] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const tabs = parsed
    ? [
        { key: 'overview', label: 'Overview', Icon: LayoutGrid },
        ...parsed.sections.map((s) => ({ key: s.title, ...sectionMeta(s.title) })),
      ]
    : [];

  // Start on Overview whenever a different model is opened
  useEffect(() => {
    setActiveTab('overview');
  }, [selectedModelId]);

  // Close the details modal with Escape
  useEffect(() => {
    if (!selectedModelId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedModelId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedModelId]);

  // Lock background scroll while any modal is open (important on mobile)
  const modalOpen = Boolean(selectedModelId) || showModelForm;
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const handleEditModel = (model: Model) => {
    setSelectedModelId(null);
    setEditingModel(model);
    setModelFormData(model);
    setShowModelForm(true);
  };

  const handleSaveModel = () => {
    if (!modelFormData.name || !modelFormData.provider) {
      alert('Please fill required fields');
      return;
    }

    if (editingModel) {
      setModels(models.map((m) => (m.id === editingModel.id ? { ...m, ...modelFormData } : m)));
    } else {
      const newModel: Model = {
        id: Date.now().toString(),
        name: modelFormData.name || '',
        type: modelFormData.type || 'llm',
        category: modelFormData.category || 'Custom',
        description: modelFormData.description || '',
        highlights: modelFormData.highlights || [],
        provider: modelFormData.provider || '',
        status: 'active',
        usagePercentage: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        rpmLimit: modelFormData.rpmLimit || 5000,
        costPerMRequest: modelFormData.costPerMRequest || 0.01,
        version: modelFormData.version || '1.0',
        requests: 0,
        latency: 0,
      };
      setModels([...models, newModel]);
    }
    setShowModelForm(false);
  };

  const handleToggleModel = (id: string) => {
    setModels(
      models.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'disabled' : 'active' } : m
      )
    );
  };

  const handleDeleteModel = (id: string) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter((m) => m.id !== id));
      setSelectedModelId(null);
    }
  };

  const totalUsage = models.reduce((sum, m) => sum + m.usagePercentage, 0);

  const stats = [
    { value: models.length, label: 'Total Models', icon: 'bi-cpu-fill', healthy: false },
    { value: models.filter((m) => m.status === 'active').length, label: 'Active Models', icon: 'bi-check-circle-fill', healthy: true },
    { value: endpoints.length, label: 'Endpoints', icon: 'bi-hdd-network-fill', healthy: false },
    { value: `${totalUsage.toFixed(1)}%`, label: 'Total Usage', icon: 'bi-lightning-charge-fill', healthy: false },
  ];

  const delay = (i: number, step = 70): React.CSSProperties => ({ animationDelay: `${i * step}ms` });

  // Resolved icon components (capitalised so JSX treats them as components)
  const SelectedIcon = selectedModel ? getModelIcon(selectedModel) : Cpu;

  return (
    <AdminLayout>
      {/* Keyframes (Tailwind has no built-in ones for these) */}
      <style>{`
        @keyframes mc-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes mc-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes mc-pop { from { opacity: 0; transform: translateY(16px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes mc-fill { from { width: 0 } to { width: var(--mc-w) } }
        @keyframes mc-sheen { 0% { transform: translateX(-120%) } 100% { transform: translateX(220%) } }
        @keyframes mc-ping { 0% { transform: scale(1); opacity: .6 } 80%,100% { transform: scale(2.4); opacity: 0 } }
        .mc-rise { animation: mc-rise .55s cubic-bezier(.22,1,.36,1) both }
        .mc-fade { animation: mc-fade .25s ease-out both }
        .mc-pop  { animation: mc-pop .35s cubic-bezier(.22,1,.36,1) both }
        .mc-fill { animation: mc-fill 1s cubic-bezier(.22,1,.36,1) .35s both }
        .mc-sheen { animation: mc-sheen 2.4s ease-in-out infinite }
        .mc-ping { animation: mc-ping 1.8s cubic-bezier(0,0,.2,1) infinite }
        /* never allow sideways page scroll from this screen */
        .mc-root { overflow-x: hidden; -webkit-text-size-adjust: 100%; }
        .mc-root h2, .mc-root h3 { overflow-wrap: anywhere; }
        @media (prefers-reduced-motion: reduce) {
          .mc-rise,.mc-fade,.mc-pop,.mc-fill,.mc-sheen,.mc-ping { animation: none !important }
        }
      `}</style>

      <div
        className={`mc-root mx-auto min-h-[100dvh] w-full max-w-[1520px] bg-slate-100 p-0 text-slate-700 2xl:max-w-[1760px] ${dark}:bg-transparent ${dark}:text-gray-100`}
      >
        {/* ---------- Header ---------- */}
        <div className="mc-rise mb-0 flex flex-col items-start justify-between gap-2 sm:gap-4 md:flex-row md:gap-0">
          <div className="mb-2 min-w-0">
            <h2 className="m-0 break-words [font-size:clamp(1.25rem,1rem+1.2vw,1.6rem)]! !font-bold leading-tight tracking-tight text-black dark:text-white">Model Control</h2>
            <p className="mt-0.5 mb-0 text-[13px] text-[color:#6b7280] sm:text-sm dark:text-slate-400">Manage AI models and endpoints</p>
          </div>
        </div>

        {/* ---------- Stats ---------- */}
        <div className="mb-3 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={delay(i + 1)}
              className={`mc-rise flex min-w-0 items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:gap-4 sm:px-5 sm:py-4 ${dark}:border-gray-700 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg sm:h-[50px] sm:w-[50px] sm:text-2xl ${s.healthy
                    ? `bg-emerald-50 text-emerald-600 ${dark}:bg-emerald-500/10 ${dark}:text-emerald-400`
                    : `bg-indigo-50 text-indigo-600 ${dark}:bg-indigo-500/10 ${dark}:text-indigo-300`
                  }`}
              >
                <i className={`bi ${s.icon}`} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs text-slate-500 sm:text-[15px] [.ain-app.theme-dark_&]:text-slate-400">
                  {s.label}
                </div>
                <div className="truncate !text-xl font-bold leading-tight text-slate-900 sm:text-[25px] [.ain-app.theme-dark_&]:text-white">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- Model Details Modal (opens on card click) ---------- */}
        {selectedModel && parsed && (
          <div
            className="mc-fade fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/60 backdrop-blur-md sm:items-center sm:p-4"
            onClick={() => setSelectedModelId(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={selectedModel.name}
              onClick={(e) => e.stopPropagation()}
              className="mc-pop relative flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:max-h-[90dvh] sm:rounded-3xl [.ain-app.theme-dark_&]:bg-gray-900 [.ain-app.theme-dark_&]:text-gray-100 [.ain-app.theme-dark_&]:ring-white/10"
            >
              {/* close */}
              <button
                type="button"
                onClick={() => setSelectedModelId(null)}
                aria-label="Close model details"
                className="group absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center [border-radius:10px]! bg-white/20 text-white backdrop-blur transition-all duration-300 hover:rotate-90 hover:scale-110 hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 motion-reduce:hover:rotate-0 sm:h-8 sm:w-8"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>

              {/* ---------- hero (fixed) ---------- */}
              <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-4 pb-4 pt-4 md:px-6">
                <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <span className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-white/10" />

                <div className="relative flex items-center gap-3 pr-11">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur sm:h-12 sm:w-12">
                    <SelectedIcon size={24} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="m-0 break-words [font-size:clamp(1rem,.9rem+.8vw,1.25rem)]! font-semibold leading-tight text-white">
                      {selectedModel.name}
                    </h2>
                    <p className="m-0 mt-0.5 break-words text-xs text-white/80">
                      {selectedModel.provider} • {selectedModel.category}
                    </p>
                  </div>
                </div>

                <div className="relative mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase text-white ring-1 ring-white/25">
                    {getTypeLabel(selectedModel.type)}
                  </span>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25">
                    v{selectedModel.version}
                  </span>
                  <span
                    className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-[10px]! px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${statusBadgeCls[selectedModel.status]}`}
                  >
                    {selectedModel.status === 'active' ? '✓' : '○'} {selectedModel.status}
                  </span>
                </div>
              </div>

              {/* ---------- tabs (fixed) ---------- */}
              {tabs.length > 1 && (
                <div
                  role="tablist"
                  className="flex shrink-0 gap-1.5 overflow-x-auto overscroll-x-contain border-b border-slate-100 px-4 py-2.5 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [.ain-app.theme-dark_&]:border-gray-800"
                >
                  {tabs.map(({ key, label, Icon }) => {
                    const on = activeTab === key;
                    return (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={on}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`inline-flex shrink-0 items-center gap-1.5 !rounded-[10px] px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:py-1.5 ${
                          on
                            ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 [.ain-app.theme-dark_&]:bg-gray-800 [.ain-app.theme-dark_&]:text-slate-300 [.ain-app.theme-dark_&]:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={14} aria-hidden="true" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ---------- tab content (only this area can scroll) ---------- */}
              <div
                key={`${selectedModel.id}-${activeTab}`}
                className="mc-fade min-h-[140px] flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:min-h-[250px] md:px-6 [scrollbar-width:thin]"
              >
                {activeTab === 'overview' ? (
                  <div className="space-y-4">
                    {parsed.intro && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 [.ain-app.theme-dark_&]:text-slate-300">
                        {parsed.intro}
                      </p>
                    )}

                    {selectedModel.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedModel.highlights.map((h) => (
                          <span
                            key={h}
                            className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100 [.ain-app.theme-dark_&]:bg-indigo-500/10 [.ain-app.theme-dark_&]:text-indigo-200 [.ain-app.theme-dark_&]:ring-indigo-400/20"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* metrics */}
                    <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3">
                      <div className="min-w-0 rounded-[12px] bg-slate-50 p-3 ring-1 ring-slate-100 [.ain-app.theme-dark_&]:bg-gray-800 [.ain-app.theme-dark_&]:ring-white/5">
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">Usage</div>
                        <div className="text-lg font-bold text-slate-900 sm:text-xl [.ain-app.theme-dark_&]:text-white">
                          {selectedModel.usagePercentage.toFixed(1)}%
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 [.ain-app.theme-dark_&]:bg-gray-700">
                          <div
                            className="mc-fill relative h-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                            style={{ ['--mc-w' as string]: `${Math.min(selectedModel.usagePercentage, 100)}%`, width: `${Math.min(selectedModel.usagePercentage, 100)}%` } as React.CSSProperties}
                          >
                            <span className="mc-sheen absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                          </div>
                        </div>
                      </div>
                      {[
                        { label: 'RPM Limit', value: `${(selectedModel.rpmLimit / 1000).toFixed(1)}K` },
                        { label: 'Requests', value: selectedModel.requests.toLocaleString('en-IN') },
                        { label: 'Latency', value: `${selectedModel.latency} ms` },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="min-w-0 rounded-[12px] bg-slate-50 p-3 ring-1 ring-slate-100 [.ain-app.theme-dark_&]:bg-gray-800 [.ain-app.theme-dark_&]:ring-white/5"
                        >
                          <div className="text-[11px] uppercase tracking-wide text-slate-400">{m.label}</div>
                          <div className="truncate text-lg font-bold text-slate-900 sm:text-xl [.ain-app.theme-dark_&]:text-white">{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {parsed.links.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {parsed.links.map((l) => (
                          <button
                            key={l}
                            type="button"
                            className="inline-flex items-center gap-1 !rounded-[10px] border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-all hover:-translate-y-0.5 hover:bg-indigo-100 active:scale-95 sm:py-1.5 [.ain-app.theme-dark_&]:border-indigo-400/20 [.ain-app.theme-dark_&]:bg-indigo-500/10 [.ain-app.theme-dark_&]:text-indigo-200"
                          >
                            {l} <ArrowUpRight size={12} aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-center text-[11px] text-slate-400">
                      Last Updated: {selectedModel.lastUpdated}
                    </div>
                  </div>
                ) : (
                  <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
                    {parsed.sections
                      .find((s) => s.title === activeTab)
                      ?.items.map((item, idx) => (
                        <li
                          key={item}
                          style={delay(idx, 40)}
                          className="mc-rise flex items-start gap-2.5 rounded-[12px] border border-slate-100 bg-slate-50 p-3 text-[13px] leading-snug text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/60 [.ain-app.theme-dark_&]:border-white/5 [.ain-app.theme-dark_&]:bg-gray-800 [.ain-app.theme-dark_&]:text-slate-200 [.ain-app.theme-dark_&]:hover:border-indigo-400/30"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                            <Check size={12} strokeWidth={3} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 break-words">{item}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              {/* ---------- actions (fixed footer, respects iPhone home bar) ---------- */}
              <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 [.ain-app.theme-dark_&]:border-gray-800">
                <button
                  className={`${actionBtn} hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700`}
                  onClick={() => handleEditModel(selectedModel)}
                  title="Edit"
                >
                  ✏️ Edit
                </button>
                <button
                  className={`${actionBtn} hover:border-red-800 hover:bg-red-100 hover:text-red-800`}
                  onClick={() => handleDeleteModel(selectedModel.id)}
                  title="Delete"
                >
                  <DeleteIcon className="mr-1 inline-block h-4 w-4 align-[-3px]" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Model Form Modal (scrolls on short / small screens) ---------- */}
        {showModelForm && (
          <div className="mc-fade fixed inset-0 z-[1000] overflow-y-auto overscroll-contain bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
              <div
                role="dialog"
                aria-modal="true"
                className={`mc-pop w-full max-w-[550px] rounded-t-[20px] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[10px] sm:p-6 md:p-8 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
              >
                <h2 className="mb-4 text-lg font-semibold text-slate-900 sm:mb-6 sm:text-xl [.ain-app.theme-dark_&]:text-white">
                  {editingModel ? 'Edit Model' : 'Add New Model'}
                </h2>
                <div className="mb-3 sm:mb-4">
                  <label className={labelCls}>Model Name</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={modelFormData.name || ''}
                    onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                    placeholder="e.g., AI-Based Grievance Management"
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className={labelCls}>Category</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={modelFormData.category || ''}
                    onChange={(e) => setModelFormData({ ...modelFormData, category: e.target.value })}
                    placeholder="e.g., Government Documents"
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={modelFormData.description || ''}
                    onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                    placeholder="Describe this AI model"
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className={labelCls}>Highlights (comma-separated)</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={modelFormData.highlights?.join(', ') || ''}
                    onChange={(e) =>
                      setModelFormData({
                        ...modelFormData,
                        highlights: e.target.value.split(',').map((highlight) => highlight.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g., 99% Accuracy, Multi-lingual"
                  />
                </div>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <div className="mb-3 sm:mb-4">
                    <label className={labelCls}>Type</label>
                    <select
                      className={inputCls}
                      value={modelFormData.type || 'llm'}
                      onChange={(e) =>
                        setModelFormData({
                          ...modelFormData,
                          type: e.target.value as Model['type'],
                        })
                      }
                    >
                      <option value="llm">LLM</option>
                      <option value="vision">Vision</option>
                      <option value="embedding">Embedding</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <label className={labelCls}>Provider</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={modelFormData.provider || ''}
                      onChange={(e) => setModelFormData({ ...modelFormData, provider: e.target.value })}
                      placeholder="e.g., Karnataka AI Cell"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <div className="mb-3 sm:mb-4">
                    <label className={labelCls}>RPM Limit</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className={inputCls}
                      value={modelFormData.rpmLimit || 5000}
                      onChange={(e) => setModelFormData({ ...modelFormData, rpmLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <label className={labelCls}>Cost per 1M Requests</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.001"
                      className={inputCls}
                      value={modelFormData.costPerMRequest || 0.01}
                      onChange={(e) =>
                        setModelFormData({ ...modelFormData, costPerMRequest: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className={labelCls}>Version</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={modelFormData.version || ''}
                    onChange={(e) => setModelFormData({ ...modelFormData, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
                  <button className={`${btnSecondary} w-full sm:w-auto sm:min-w-[100px]`} onClick={() => setShowModelForm(false)}>
                    Cancel
                  </button>
                  <button className={`${btnPrimary} w-full sm:w-auto sm:min-w-[100px]`} onClick={handleSaveModel}>
                    Save Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Models (cards styled like the reference image) ---------- */}
        <div className="mb-2 rounded-[16px]! border border-slate-200 bg-white p-3 sm:p-4 [.ain-app.theme-dark_&]:border-gray-700 [.ain-app.theme-dark_&]:bg-transparent">
          <h2 className="mc-rise mb-2 [font-size:clamp(1rem,.9rem+.6vw,1.25rem)]! font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white" style={delay(5)}>
            Active Models
          </h2>
          {/* min(100%,300px) guarantees a card never overflows narrow screens */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))]">
            {models.map((model, i) => {
              const isActive = model.status === 'active';
              const ModelIcon = getModelIcon(model);
              return (
                <div
                  key={model.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedModelId(model.id)}
                  onKeyDown={(e) => {
                    // ignore key presses coming from the nested Disable/Enable button
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedModelId(model.id);
                    }
                  }}
                  style={delay(i + 6)}
                  className={`mc-rise ![gap:10px] group relative flex min-w-0 cursor-pointer flex-col rounded-[16px]! border border-slate-200 bg-white p-3 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/20 active:scale-[.99] ${model.status === 'disabled' ? 'opacity-80' : ''
                    } ${dark}:border-gray-700 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
                >
                  {/* animated border: draws left → right on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-px z-10 rounded-[16px]! border-2 border-indigo-500 [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-out group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
                  />

                  {/* top row: icon + title + status pill (pill wraps below on very narrow cards) */}
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                    <div className="flex min-w-0 flex-1 basis-[180px] items-center gap-3 sm:gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]! bg-gradient-to-br text-2xl [color:rgb(19 27 46)] [background:white] [border:1px solid #131b2e] shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105 sm:h-[52px] sm:w-[52px]">
                        <ModelIcon size={24} strokeWidth={2} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="m-0 line-clamp-2 !text-base font-semibold leading-tight text-slate-900 sm:!text-[18px] [.ain-app.theme-dark_&]:text-white">
                          {model.name}
                        </h3>
                        <p className="m-0 mt-1 truncate text-[13px] text-slate-500 sm:text-sm [.ain-app.theme-dark_&]:text-slate-300">
                          v{model.version} · {getTypeLabel(model.type)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${cardStatusCls[model.status]}`}
                    >
                      {isActive && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="mc-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        </span>
                      )}
                      {statusLabel[model.status]}
                    </span>
                  </div>

                  {/* stat tiles */}
                  <div className="mb-2 grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="min-w-0 rounded-[10px]! bg-slate-50 px-3 py-2 [.ain-app.theme-dark_&]:bg-gray-900/60">
                      <div className="text-xs text-slate-500 sm:text-sm [.ain-app.theme-dark_&]:text-slate-400">Requests</div>
                      <div className="truncate text-base font-bold text-slate-900 sm:text-lg [.ain-app.theme-dark_&]:text-white">
                        {model.requests.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="min-w-0 rounded-[10px]! bg-slate-50 px-3 py-2 [.ain-app.theme-dark_&]:bg-gray-900/60">
                      <div className="text-xs text-slate-500 sm:text-sm [.ain-app.theme-dark_&]:text-slate-400">Latency</div>
                      <div className="truncate text-base font-bold text-slate-900 sm:text-lg [.ain-app.theme-dark_&]:text-white">
                        {model.latency} ms
                      </div>
                    </div>
                  </div>

                  {/* enable / disable button (does not open the modal) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleModel(model.id);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={`mt-auto w-full !rounded-[14px] border px-3 py-2.5 text-center text-sm font-medium transition-all duration-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 sm:text-base ${
                      isActive
                        ? // ENABLED: coloured background
                          'border-indigo-500 bg-indigo-500 text-white hover:border-indigo-600 hover:bg-indigo-600 focus-visible:ring-indigo-500/30'
                        : // DISABLED: original look, unchanged
                          `border-slate-200 bg-white text-slate-800 hover:border-green-300 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-400/20 ${dark}:border-gray-600 ${dark}:bg-gray-700/60 ${dark}:text-gray-100`
                    }`}
                  >
                    {isActive ? 'Disable model' : 'Enable model'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ModelControl;