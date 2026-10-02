import React, { useState } from 'react';
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

interface EndpointFormData {
  modelId: string;
  url: string;
  region: string;
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

const statCardStyles = [
  'bg-[#c2d4f6] border-l-4 border-[#667eea]',
  'bg-[#c8f5d9] border-l-4 border-[#28a745]',
  'bg-[#fce5c4] border-l-4 border-[#ff9800]',
  'bg-[#e6cbff] border-l-4 border-[#9c27b0]',
];

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
    }))
  );

  const [endpoints, setEndpoints] = useState<ModelEndpoint[]>([
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
  const [showEndpointForm, setShowEndpointForm] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelFormData, setModelFormData] = useState<Partial<Model>>({});
  const [endpointFormData, setEndpointFormData] = useState<EndpointFormData>({
    modelId: '',
    url: '',
    region: '',
  });

  const handleAddModel = () => {
    setEditingModel(null);
    setModelFormData({});
    setShowModelForm(true);
  };

  const handleEditModel = (model: Model) => {
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
    }
  };

  const handleAddEndpoint = () => {
    if (!endpointFormData.modelId || !endpointFormData.url.trim() || !endpointFormData.region.trim()) {
      alert('Please fill all endpoint fields');
      return;
    }

    setEndpoints([
      ...endpoints,
      {
        id: Date.now().toString(),
        modelId: endpointFormData.modelId,
        url: endpointFormData.url.trim(),
        apiKey: 'sk-***',
        region: endpointFormData.region.trim(),
        latency: 0,
        uptime: 100,
      },
    ]);
    setEndpointFormData({ modelId: '', url: '', region: '' });
    setShowEndpointForm(false);
  };

  const totalUsage = models.reduce((sum, m) => sum + m.usagePercentage, 0);

  const stats = [
    { value: models.length, label: 'Total Models' },
    { value: models.filter(m => m.status === 'active').length, label: 'Active Models' },
    { value: endpoints.length, label: 'Endpoints' },
    { value: `${totalUsage.toFixed(1)}%`, label: 'Total Usage' },
  ];

  const delay = (i: number, step = 70): React.CSSProperties => ({ animationDelay: `${i * step}ms` });

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
          <div>
            <h2 className="break-words text-xl font-bold leading-tight tracking-tight text-slate-700 dark:text-white [.ain-app.theme-dark_&]:text-white">
              Model Control
            </h2>
            <p className="mb-4 text-[15px] font-normal text-slate-500 sm:mb-5 [.ain-app.theme-dark_&]:text-slate-300">
              Manage AI models and endpoints
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <button className={`${btnPrimary} w-full md:w-auto`} onClick={handleAddModel}>
              + Add Model
            </button>
            <button
              className={`${btnSecondary} w-full md:w-auto`}
              onClick={() => setShowEndpointForm(true)}
            >
              + Add Endpoint
            </button>
          </div>
        </div>

        {/* ---------- Stats ---------- */}
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={delay(i + 1)}
              className={`mc-rise group relative overflow-hidden rounded-[10px] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${statCardStyles[i]} ${dark}:bg-gray-800 ${dark}:text-gray-100`}
            >
              {/* one-time sheen sweep on hover */}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[320%]" />
              <div className="mb-2 text-[32px] font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                {s.value}
              </div>
              <div className="text-sm text-slate-600 [.ain-app.theme-dark_&]:text-slate-300">{s.label}</div>
            </div>
          ))}
        </div>

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
                    placeholder="e.g., OpenAI"
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

        {/* ---------- Endpoint Modal ---------- */}
        {showEndpointForm && (
          <div className="mc-fade fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`mc-pop w-[95%] max-w-[550px] rounded-[10px] bg-white p-6 shadow-2xl md:w-[90%] md:p-8 ${dark}:bg-gray-800 ${dark}:text-gray-100`}
            >
              <h2 className="mb-6 text-xl font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                Add API Endpoint
              </h2>
              <div className="mb-4">
                <label className={labelCls}>Model</label>
                <select
                  className={inputCls}
                  value={endpointFormData.modelId}
                  onChange={(event) =>
                    setEndpointFormData({
                      ...endpointFormData,
                      modelId: event.target.value,
                    })
                  }
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Endpoint URL</label>
                <input
                  type="url"
                  className={inputCls}
                  value={endpointFormData.url}
                  onChange={(event) =>
                    setEndpointFormData({
                      ...endpointFormData,
                      url: event.target.value,
                    })
                  }
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Region</label>
                <input
                  type="text"
                  className={inputCls}
                  value={endpointFormData.region}
                  onChange={(event) =>
                    setEndpointFormData({
                      ...endpointFormData,
                      region: event.target.value,
                    })
                  }
                  placeholder="e.g., US-East"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className={`${btnSecondary} min-w-[100px]`} onClick={() => setShowEndpointForm(false)}>
                  Cancel
                </button>
                <button className={`${btnPrimary} min-w-[100px]`} onClick={handleAddEndpoint}>
                  Add Endpoint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Models ---------- */}
        <div className="mb-4">
          <h2 className="mc-rise mb-2 text-xl font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white" style={delay(5)}>
            Active Models
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
            {models.map((model, i) => {
              const isActive = model.status === 'active';
              return (
                <div
                  key={model.id}
                  style={delay(i + 6)}
                  className={`mc-rise group relative flex min-h-[200px] flex-col overflow-hidden rounded-[10px]! border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 ${
                    model.status === 'disabled' ? 'bg-slate-50 opacity-70' : ''
                  } ${dark}:border-gray-700 ${dark}:bg-gray-800 ${dark}:text-gray-100 ${
                    model.status === 'disabled' ? `${dark}:bg-[#273449]` : ''
                  }`}
                >
                  {/* top accent line grows in on hover */}
                  <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-transform duration-500 group-hover:scale-x-100" />

                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 !text-[20px] font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                        {model.name}
                      </h3>
                      <p className="m-0 text-xs text-slate-500 [.ain-app.theme-dark_&]:text-slate-300">
                        {model.provider} • {model.category}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[10px]! px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-300 ${statusBadgeCls[model.status]}`}
                    >
                      {isActive && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="mc-ping absolute inline-flex h-full w-full [border-radius:10px]! bg-green-500" />
                          <span className="relative inline-flex h-1.5 w-1.5 [border-radius:10px]! bg-green-600" />
                        </span>
                      )}
                      {isActive ? '✓' : '○'} {model.status}
                    </span>
                  </div>

                  <div className="mb-1 w-fit rounded-[10px] bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase text-indigo-500 transition-colors duration-300 group-hover:bg-indigo-500 group-hover:text-white">
                    {model.type.charAt(0).toUpperCase() + model.type.slice(1)}
                  </div>

                  {model.description && (
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-slate-600 [.ain-app.theme-dark_&]:text-slate-300">
                      {model.description}
                    </p>
                  )}
                  {model.highlights.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {model.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700 [.ain-app.theme-dark_&]:bg-gray-700 [.ain-app.theme-dark_&]:text-indigo-200"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mb-3 grid grid-cols-1 gap-3 border-y border-slate-100 py-2 md:grid-cols-3 [.ain-app.theme-dark_&]:border-gray-700">
                    <div className="text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                        Usage
                      </div>
                      <div className="text-lg font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                        {model.usagePercentage.toFixed(1)}%
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="mc-fill relative h-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          style={{ ['--mc-w' as string]: `${Math.min(model.usagePercentage, 100)}%`, width: `${Math.min(model.usagePercentage, 100)}%` } as React.CSSProperties}
                        >
                          <span className="mc-sheen absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                        RPM Limit
                      </div>
                      <div className="text-lg font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                        {(model.rpmLimit / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                        Cost/1M
                      </div>
                      <div className="text-lg font-bold text-slate-900 [.ain-app.theme-dark_&]:text-white">
                        ₹{model.costPerMRequest.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 text-[11px] text-slate-400 [.ain-app.theme-dark_&]:text-slate-300">
                    <small>Last Updated: {model.lastUpdated}</small>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <button
                      className={`${actionBtn} ${
                        isActive
                          ? 'hover:border-red-800 hover:bg-red-100 hover:text-red-800'
                          : 'hover:border-green-800 hover:bg-green-100 hover:text-green-800'
                      }`}
                      onClick={() => handleToggleModel(model.id)}
                      title={isActive ? 'Disable' : 'Enable'}
                    >
                      {isActive ? '⊙' : '⊗'} {isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className={`${actionBtn} hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700`}
                      onClick={() => handleEditModel(model)}
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={`${actionBtn} hover:border-red-800 hover:bg-red-100 hover:text-red-800`}
                      onClick={() => handleDeleteModel(model.id)}
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- Endpoints ---------- */}
        <div>
          <h2 className="mc-rise mb-5 text-xl font-semibold text-slate-900 [.ain-app.theme-dark_&]:text-white" style={delay(12)}>
            API Endpoints
          </h2>
          <div
            style={delay(13)}
            className={`mc-rise overflow-x-auto rounded-[10px] bg-white shadow-sm ${dark}:bg-gray-800 ${dark}:text-gray-100`}
          >
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead className="border-b-2 border-slate-200 bg-slate-50 [.ain-app.theme-dark_&]:border-gray-700 [.ain-app.theme-dark_&]:bg-[#273449]">
                <tr>
                  {['Model', 'Endpoint URL', 'Region', 'Latency (ms)', 'Uptime', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 md:p-4 [.ain-app.theme-dark_&]:text-slate-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint, i) => {
                  const model = models.find(m => m.id === endpoint.modelId);
                  return (
                    <tr
                      key={endpoint.id}
                      style={delay(i, 80)}
                      className="mc-rise transition-colors duration-200 hover:bg-slate-50 [.ain-app.theme-dark_&]:hover:bg-[#273449]"
                    >
                      <td className="border-b border-slate-200 px-2 py-2.5 text-slate-600 md:px-4 md:py-3.5 [.ain-app.theme-dark_&]:border-gray-700 [.ain-app.theme-dark_&]:text-slate-300">
                        {model?.name || 'Unknown'}
                      </td>
                      <td className="break-all border-b border-slate-200 px-2 py-2.5 font-mono text-xs text-indigo-500 md:px-4 md:py-3.5 [.ain-app.theme-dark_&]:border-gray-700">
                        {endpoint.url}
                      </td>
                      <td className="border-b border-slate-200 px-2 py-2.5 text-slate-600 md:px-4 md:py-3.5 [.ain-app.theme-dark_&]:border-gray-700 [.ain-app.theme-dark_&]:text-slate-300">
                        {endpoint.region}
                      </td>
                      <td className="border-b border-slate-200 px-2 py-2.5 font-semibold text-slate-900 md:px-4 md:py-3.5 [.ain-app.theme-dark_&]:border-gray-700 [.ain-app.theme-dark_&]:text-white">
                        {endpoint.latency}ms
                      </td>
                      <td className="border-b border-slate-200 px-2 py-2.5 md:px-4 md:py-3.5 [.ain-app.theme-dark_&]:border-gray-700">
                        <span
                          className={`inline-block rounded-[10px] px-2.5 py-1 text-xs font-semibold ${
                            endpoint.uptime > 99.9
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {endpoint.uptime}%
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-2 py-2.5 md:px-4 md:py-3.5 [.ain-app.theme-dark_&]:border-gray-700">
                        <div className="flex gap-2">
                          <button
                            className={`${actionBtn} !min-w-0 !flex-none !px-2 !py-1.5 hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700`}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${actionBtn} !min-w-0 !flex-none !px-2 !py-1.5 hover:border-red-800 hover:bg-red-100 hover:text-red-800`}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ModelControl;