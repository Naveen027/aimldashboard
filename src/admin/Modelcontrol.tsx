import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Eye,
  MessageSquare,
  Network,
  ScanFace,
  Fingerprint,
  type LucideIcon,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
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

const inputCls =
  `w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ` +
  `${dark}:border-gray-700 ${dark}:bg-gray-900 ${dark}:text-gray-100`;

const labelCls = `mb-2 block text-sm font-medium text-slate-700 ${dark}:text-slate-300`;

const btnPrimary =
  'inline-flex items-center justify-center rounded-[10px]! bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30';

const btnSecondary =
  `inline-flex items-center justify-center rounded-[10px]! border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-200 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/30 ` +
  `${dark}:border-gray-600 ${dark}:bg-gray-700/60 ${dark}:text-gray-200 ${dark}:hover:bg-gray-700`;

const actionBtn =
  `flex-1 min-w-[80px] !rounded-[10px] border border-slate-300 bg-white px-2.5 py-2 text-center text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ` +
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

// Specific icon overrides by model id
const modelIdIcon: Record<string, LucideIcon> = {
  'face-matching': ScanFace,
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
      modelId: 'face-matching',
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

  // Always derive from `models` so status changes stay in sync
  const selectedModel = models.find(m => m.id === selectedModelId) || null;

  // Close the details modal with Escape
  useEffect(() => {
    if (!selectedModelId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedModelId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedModelId]);

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
      setModels(models.map(m => (m.id === editingModel.id ? { ...m, ...modelFormData } : m)));
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
      models.map(m =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'disabled' : 'active' } : m
      )
    );
  };

  const handleDeleteModel = (id: string) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter(m => m.id !== id));
      setSelectedModelId(null);
    }
  };

  const totalUsage = models.reduce((sum, m) => sum + m.usagePercentage, 0);

  const stats = [
    { value: models.length, label: 'Total Models', icon: 'bi-cpu-fill', healthy: false },
    { value: models.filter(m => m.status === 'active').length, label: 'Active Models', icon: 'bi-check-circle-fill', healthy: true },
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
        @media (prefers-reduced-motion: reduce) {
          .mc-rise,.mc-fade,.mc-pop,.mc-fill,.mc-sheen,.mc-ping { animation: none !important }
        }
      `}</style>

      <div
        className={`min-h-screen bg-slate-100 p-0 text-slate-700 ${dark}:bg-transparent ${dark}:text-gray-100`}
      >
        {/* ---------- Header ---------- */}
        <div className="mc-rise mb-0 flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
          <div className="mb-2">
            <h2 className="m-0 break-words [font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">Model Control</h2>
            <p className="mt-0.5 mb-0 text-sm text-[color:#6b7280] dark:text-slate-400">Manage AI models and endpoints</p>
          </div>
        </div>

        {/* ---------- Stats ---------- */}
        <div className="mb-3 grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={delay(i + 1)}
              className={`mc-rise flex items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:gap-4 sm:px-5 sm:py-4 ${dark}:border-gray-700 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl sm:h-[50px] sm:w-[50px] sm:text-2xl ${s.healthy
                    ? `bg-emerald-50 text-emerald-600 ${dark}:bg-emerald-500/10 ${dark}:text-emerald-400`
                    : `bg-indigo-50 text-indigo-600 ${dark}:bg-indigo-500/10 ${dark}:text-indigo-300`
                  }`}
              >
                <i className={`bi ${s.icon}`} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm text-slate-500 sm:text-[15px] [.ain-app.theme-dark_&]:text-slate-400">
                  {s.label}
                </div>
                <div className="!text-xl font-bold leading-tight text-slate-900 sm:text-[25px] [.ain-app.theme-dark_&]:text-white">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- Model Details Modal (opens on card click) ---------- */}
        {selectedModel && (
          <div
            className="mc-fade fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSelectedModelId(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={selectedModel.name}
              onClick={(e) => e.stopPropagation()}
              className={`mc-pop relative max-h-[90vh] w-[95%] max-w-[600px] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 md:w-[90%] ${dark}:bg-gray-900 ${dark}:text-gray-100 ${dark}:ring-white/10`}
            >
              {/* Close (X) button */}
              <button
                type="button"
                onClick={() => setSelectedModelId(null)}
                aria-label="Close model details"
                className="group absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center [border-radius:10px]! bg-white/20 text-white backdrop-blur transition-all duration-300 ease-out hover:rotate-90 hover:scale-110 hover:bg-rose-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 motion-reduce:transition-none motion-reduce:hover:rotate-0"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>

              {/* hero banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-4 pb-10 pt-3 md:px-6">
                <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <span className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-white/10" />

                <div className="relative flex items-start justify-between gap-3 pr-10">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur">
                      <SelectedIcon size={24} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="m-0 break-words [font-size:1.25rem]! font-semibold leading-tight text-white">
                        {selectedModel.name}
                      </h2>
                      <p className="m-0 mt-0.5 text-xs text-white/80">
                        {selectedModel.provider} • {selectedModel.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase text-white ring-1 ring-white/25">
                    {selectedModel.type.charAt(0).toUpperCase() + selectedModel.type.slice(1)}
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

              {/* body — overlaps the banner */}
              <div className="relative -mt-6 rounded-t-3xl bg-white p-4 md:p-6 [.ain-app.theme-dark_&]:bg-gray-900">
                {selectedModel.description && (
                  <p className="mb-4 text-sm leading-relaxed text-slate-600 [.ain-app.theme-dark_&]:text-slate-300">
                    {selectedModel.description}
                  </p>
                )}

                {selectedModel.highlights.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {selectedModel.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-700 ring-1 ring-indigo-100 [.ain-app.theme-dark_&]:bg-indigo-500/10 [.ain-app.theme-dark_&]:text-indigo-200 [.ain-app.theme-dark_&]:ring-indigo-400/20"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}

                {/* metrics */}
                <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="[border-radius:10px]! bg-slate-50 p-2 text-center ring-1 ring-slate-100 [.ain-app.theme-dark_&]:bg-gray-800 [.ain-app.theme-dark_&]:ring-white/5">
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                      Usage
                    </div>
                    <div className="text-2xl font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
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
                  <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100 [.ain-app.theme-dark_&]:bg-gray-800 [.ain-app.theme-dark_&]:ring-white/5">
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                      RPM Limit
                    </div>
                    <div className="text-2xl font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                      {(selectedModel.rpmLimit / 1000).toFixed(1)}K
                    </div>
                  </div>
                </div>

                <div className="mb-2 text-center text-[11px] text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                  <small>Last Updated: {selectedModel.lastUpdated}</small>
                </div>

                {/* actions */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2 [.ain-app.theme-dark_&]:border-gray-800">
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
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Model Modal ---------- */}
        {showModelForm && (
          <div className="mc-fade fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`mc-pop w-[95%] max-w-[550px] rounded-[10px] bg-white p-6 shadow-2xl md:w-[90%] md:p-8 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
            >
              <h2 className="mb-6 text-xl font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </h2>
              <div className="mb-4">
                <label className={labelCls}>Model Name</label>
                <input
                  type="text"
                  className={inputCls}
                  value={modelFormData.name || ''}
                  onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                  placeholder="e.g., AI-Based Grievance Management"
                />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Category</label>
                <input
                  type="text"
                  className={inputCls}
                  value={modelFormData.category || ''}
                  onChange={(e) => setModelFormData({ ...modelFormData, category: e.target.value })}
                  placeholder="e.g., Government Documents"
                />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Description</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={modelFormData.description || ''}
                  onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                  placeholder="Describe this AI model"
                />
              </div>
              <div className="mb-4">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="mb-4">
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
                <div className="mb-4">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="mb-4">
                  <label className={labelCls}>RPM Limit</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={modelFormData.rpmLimit || 5000}
                    onChange={(e) => setModelFormData({ ...modelFormData, rpmLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="mb-4">
                  <label className={labelCls}>Cost per 1M Requests</label>
                  <input
                    type="number"
                    step="0.001"
                    className={inputCls}
                    value={modelFormData.costPerMRequest || 0.01}
                    onChange={(e) =>
                      setModelFormData({ ...modelFormData, costPerMRequest: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Version</label>
                <input
                  type="text"
                  className={inputCls}
                  value={modelFormData.version || ''}
                  onChange={(e) => setModelFormData({ ...modelFormData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className={`${btnSecondary} min-w-[100px]`} onClick={() => setShowModelForm(false)}>
                  Cancel
                </button>
                <button className={`${btnPrimary} min-w-[100px]`} onClick={handleSaveModel}>
                  Save Model
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Models (cards styled like the reference image) ---------- */}
        <div className="mb-2 rounded-[16px]! border border-slate-200 bg-white p-4 ">
          <h2 className="mc-rise  mb-2 [font-size:20px]! font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white" style={delay(5)}>
            Active Models
          </h2>
          <div className="grid  grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
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
                  className={`mc-rise ![gap:10px] group relative flex cursor-pointer flex-col rounded-[16px]! border border-slate-200 bg-white p-3 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/20 active:scale-[.99] ${model.status === 'disabled' ? 'opacity-80' : ''
                    } ${dark}:border-gray-700 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
                >
                  {/* animated border: draws left → right on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-px z-10 rounded-[16px]! border-2 border-indigo-500 [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-out group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
                  />

                  {/* top row: icon + title + status pill */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4 ">
                      <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[10px]! bg-gradient-to-br text-2xl [color:rgb(19 27 46)] [background:white] [border:1px solid #131b2e] shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
                        <ModelIcon size={26} strokeWidth={2} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="m-0 line-clamp-2 !text-[18px] font-semibold leading-tight text-slate-900 [.ain-app.theme-dark_&]:text-white">
                          {model.name}
                        </h3>
                        <p className="m-0 mt-1 truncate text-sm text-slate-500 [.ain-app.theme-dark_&]:text-slate-300">
                          v{model.version} · {getTypeLabel(model.type)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cardStatusCls[model.status]}`}
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
                  <div className="mb-2 grid grid-cols-2 gap-3">
                    <div className="rounded-[10px]! bg-slate-50 px-3 py-2  [.ain-app.theme-dark_&]:bg-gray-900/60">
                      <div className="text-sm text-slate-500 [.ain-app.theme-dark_&]:text-slate-400 ">Requests</div>
                      <div className="text-lg font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                        {model.requests.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="rounded-[10px]! bg-slate-50 px-3 py-2 [.ain-app.theme-dark_&]:bg-gray-900/60">
                      <div className="text-sm text-slate-500 [.ain-app.theme-dark_&]:text-slate-400">Latency</div>
                      <div className="text-lg font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
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
                    className={`mt-auto w-full !rounded-[14px] border px-3 py-2 text-center text-base font-medium transition-all duration-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 ${
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