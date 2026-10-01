import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
interface Model {
  id: string;
  name: string;
  type: 'llm' | 'vision' | 'embedding' | 'other';
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

const ModelControl: React.FC = () => {
  const [models, setModels] = useState<Model[]>([
    {
      id: '1',
      name: 'Text Generation',
      type: 'llm',
      provider: 'OpenAI',
      status: 'active',
      usagePercentage: 48.3,
      lastUpdated: '2024-09-22',
      rpmLimit: 10000,
      costPerMRequest: 0.03,
      version: 'gpt-4-turbo',
    },
    {
      id: '2',
      name: 'Image Generation',
      type: 'vision',
      provider: 'OpenAI',
      status: 'active',
      usagePercentage: 21.8,
      lastUpdated: '2024-09-21',
      rpmLimit: 5000,
      costPerMRequest: 0.02,
      version: '3.0',
    },
    {
      id: '3',
      name: 'Speech-to-Text',
      type: 'other',
      provider: 'OpenAI',
      status: 'active',
      usagePercentage: 15.2,
      lastUpdated: '2024-09-20',
      rpmLimit: 3000,
      costPerMRequest: 0.01,
      version: 'v3-large',
    },
    {
      id: '4',
      name: 'Code Assistance',
      type: 'llm',
      provider: 'Anthropic',
      status: 'active',
      usagePercentage: 14.7,
      lastUpdated: '2024-09-22',
      rpmLimit: 8000,
      costPerMRequest: 0.025,
      version: '3.5',
    },
     {
      id: '5',
      name: 'Open Source Image',
      type: 'llm',
      provider: 'Anthropic',
      status: 'active',
      usagePercentage: 14.7,
      lastUpdated: '2024-09-22',
      rpmLimit: 8000,
      costPerMRequest: 0.025,
      version: '3.5',
    },
  ]);

  const [endpoints, setEndpoints] = useState<ModelEndpoint[]>([
    {
      id: '1',
      modelId: '1',
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-***',
      region: 'US-East',
      latency: 245,
      uptime: 99.98,
    },
    {
      id: '2',
      modelId: '2',
      url: 'https://api.openai.com/v1/images/generations',
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
      setModels(models.map(m => m.id === editingModel.id ? { ...m, ...modelFormData } : m));
    } else {
      const newModel: Model = {
        id: Date.now().toString(),
        name: modelFormData.name || '',
        type: modelFormData.type || 'llm',
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
    setModels(models.map(m => m.id === id
      ? { ...m, status: m.status === 'active' ? 'disabled' : 'active' }
      : m
    ));
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

  return (
    <AdminLayout>
    <div className={`model-control
      [padding:0px]
      [background:#f5f5f5]
      [min-height:100vh]
      [&_.mc-header]:[display:flex]
      [&_.mc-header]:[justify-content:space-between]
      [&_.mc-header]:[align-items:flex-start]
      [&_.mc-header]:[margin-bottom:32px]
      [&_.mc-header_h1]:[font-size:25px]
      [&_.mc-header_h1]:[font-weight:700]
      [&_.mc-header_h1]:[color:#1a1a1a]
      [&_.mc-header_h1]:[margin:0_0_8px_0]
      [&_.mc-header_p]:[font-size:14px]
      [&_.mc-header_p]:[color:#666]
      [&_.mc-header_p]:[margin:0]
      [&_.mc-header-actions]:[display:flex]
      [&_.mc-header-actions]:[gap:12px]
      [&_.mc-stats]:[display:grid]
      [&_.mc-stats]:[grid-template-columns:repeat(auto-fit,_minmax(200px,_1fr))]
      [&_.mc-stats]:[gap:16px]
      [&_.mc-stats]:[margin-bottom:32px]
      [&_.stat-card]:[padding:20px]
      [&_.stat-card]:[border-radius:8px]
      [&_.stat-card]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.stat-card:nth-child(1)]:[background:#c2d4f6]
      [&_.stat-card:nth-child(1)]:[border-left:4px_solid_#667eea]
      [&_.stat-card:nth-child(2)]:[background:#c8f5d9]
      [&_.stat-card:nth-child(2)]:[border-left:4px_solid_#28a745]
      [&_.stat-card:nth-child(3)]:[background:#fce5c4]
      [&_.stat-card:nth-child(3)]:[border-left:4px_solid_#ff9800]
      [&_.stat-card:nth-child(4)]:[background:#e6cbff]
      [&_.stat-card:nth-child(4)]:[border-left:4px_solid_#9c27b0]
      [&_.stat-value]:[font-size:32px]
      [&_.stat-value]:[font-weight:700]
      [&_.stat-value]:[color:#1a1a1a]
      [&_.stat-value]:[margin-bottom:8px]
      [&_.stat-label]:[font-size:14px]
      [&_.stat-label]:[color:#666]
      [&_.btn-primary]:[padding:10px_20px]
      [&_.btn-primary]:[border:none]
      [&_.btn-primary]:[border-radius:6px]
      [&_.btn-primary]:[font-size:14px]
      [&_.btn-primary]:[font-weight:500]
      [&_.btn-primary]:[cursor:pointer]
      [&_.btn-primary]:[transition:all_0.3s_ease]
      [&_.btn-secondary]:[padding:10px_20px]
      [&_.btn-secondary]:[border:1px_solid_#ddd]
      [&_.btn-secondary]:[border-radius:6px]
      [&_.btn-secondary]:[font-size:14px]
      [&_.btn-secondary]:[font-weight:500]
      [&_.btn-secondary]:[cursor:pointer]
      [&_.btn-secondary]:[transition:all_0.3s_ease]
      [&_.btn-primary]:[background:#667eea]
      [&_.btn-primary]:[color:white]
      [&_.btn-primary:hover]:[background:#5568d3]
      [&_.btn-primary:hover]:[box-shadow:0_4px_12px_rgba(102,_126,_234,_0.3)]
      [&_.btn-secondary]:[background:#f0f0f0]
      [&_.btn-secondary]:[color:#333]
      [&_.btn-secondary:hover]:[background:#e8e8e8]
      [&_.mc-form-container]:[position:fixed]
      [&_.mc-form-container]:[top:0]
      [&_.mc-form-container]:[left:0]
      [&_.mc-form-container]:[right:0]
      [&_.mc-form-container]:[bottom:0]
      [&_.mc-form-container]:[background:rgba(0,_0,_0,_0.5)]
      [&_.mc-form-container]:[display:flex]
      [&_.mc-form-container]:[align-items:center]
      [&_.mc-form-container]:[justify-content:center]
      [&_.mc-form-container]:[z-index:1000]
      [&_.mc-form]:[background:white]
      [&_.mc-form]:[border-radius:8px]
      [&_.mc-form]:[padding:32px]
      [&_.mc-form]:[width:90%]
      [&_.mc-form]:[max-width:550px]
      [&_.mc-form]:[box-shadow:0_20px_25px_rgba(0,_0,_0,_0.15)]
      [&_.mc-form_h2]:[margin:0_0_24px_0]
      [&_.mc-form_h2]:[font-size:20px]
      [&_.mc-form_h2]:[color:#1a1a1a]
      [&_.form-group]:[margin-bottom:16px]
      [&_.form-group_label]:[display:block]
      [&_.form-group_label]:[margin-bottom:8px]
      [&_.form-group_label]:[font-size:14px]
      [&_.form-group_label]:[font-weight:500]
      [&_.form-group_label]:[color:#333]
      [&_.form-group_input]:[width:100%]
      [&_.form-group_input]:[padding:10px_12px]
      [&_.form-group_input]:[border:1px_solid_#ddd]
      [&_.form-group_input]:[border-radius:6px]
      [&_.form-group_input]:[font-size:14px]
      [&_.form-group_input]:[box-sizing:border-box]
      [&_.form-group_input]:[background:white]
      [&_.form-group_input]:[color:#333]
      [&_.form-group_select]:[width:100%]
      [&_.form-group_select]:[padding:10px_12px]
      [&_.form-group_select]:[border:1px_solid_#ddd]
      [&_.form-group_select]:[border-radius:6px]
      [&_.form-group_select]:[font-size:14px]
      [&_.form-group_select]:[box-sizing:border-box]
      [&_.form-group_select]:[background:white]
      [&_.form-group_select]:[color:#333]
      [&_.form-group_input:focus]:[outline:none]
      [&_.form-group_input:focus]:[border-color:#667eea]
      [&_.form-group_input:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.form-group_select:focus]:[outline:none]
      [&_.form-group_select:focus]:[border-color:#667eea]
      [&_.form-group_select:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.form-row]:[display:grid]
      [&_.form-row]:[grid-template-columns:1fr_1fr]
      [&_.form-row]:[gap:16px]
      [&_.form-actions]:[display:flex]
      [&_.form-actions]:[gap:12px]
      [&_.form-actions]:[margin-top:24px]
      [&_.form-actions]:[justify-content:flex-end]
      [&_.form-actions_.btn-primary]:[min-width:100px]
      [&_.form-actions_.btn-secondary]:[min-width:100px]
      [&_.mc-section]:[margin-bottom:32px]
      [&_.mc-section_h2]:[font-size:20px]
      [&_.mc-section_h2]:[font-weight:600]
      [&_.mc-section_h2]:[color:#1a1a1a]
      [&_.mc-section_h2]:[margin:0_0_20px_0]
      [&_.mc-grid]:[display:grid]
      [&_.mc-grid]:[grid-template-columns:repeat(auto-fill,_minmax(320px,_1fr))]
      [&_.mc-grid]:[gap:20px]
      [&_.model-card1]:[background:white]
      [&_.model-card1]:[border-radius:8px]
      [&_.model-card1]:[padding:20px]
      [&_.model-card1]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.model-card1]:[border:1px_solid_#e0e0e0]
      [&_.model-card1]:[transition:all_0.3s_ease]
      [&_.model-card1]:[height:300px]
      [&_.model-card:hover]:[box-shadow:0_4px_12px_rgba(0,_0,_0,_0.1)]
      [&_.model-card:hover]:[border-color:#667eea]
      [&_.model-card.disabled]:[opacity:0.7]
      [&_.model-card.disabled]:[background:#f9f9f9]
      [&_.model-header]:[display:flex]
      [&_.model-header]:[justify-content:space-between]
      [&_.model-header]:[align-items:flex-start]
      [&_.model-header]:[margin-bottom:12px]
      [&_.model-header_h3]:[font-size:16px]
      [&_.model-header_h3]:[font-weight:600]
      [&_.model-header_h3]:[color:#1a1a1a]
      [&_.model-header_h3]:[margin:0_0_4px_0]
      [&_.model-provider]:[font-size:12px]
      [&_.model-provider]:[color:#888]
      [&_.model-provider]:[margin:0]
      [&_.status-badge]:[display:inline-block]
      [&_.status-badge]:[padding:4px_12px]
      [&_.status-badge]:[border-radius:20px]
      [&_.status-badge]:[font-size:11px]
      [&_.status-badge]:[font-weight:600]
      [&_.status-badge]:[text-transform:uppercase]
      [&_.status-badge]:[letter-spacing:0.3px]
      [&_.status-badge.active]:[background:#dcfce7]
      [&_.status-badge.active]:[color:#166534]
      [&_.status-badge.disabled]:[background:#fee2e2]
      [&_.status-badge.disabled]:[color:#991b1b]
      [&_.status-badge.maintenance]:[background:#fef3c7]
      [&_.status-badge.maintenance]:[color:#92400e]
      [&_.model-type-badge]:[display:inline-block]
      [&_.model-type-badge]:[padding:4px_10px]
      [&_.model-type-badge]:[background:#f0f0ff]
      [&_.model-type-badge]:[color:#667eea]
      [&_.model-type-badge]:[border-radius:4px]
      [&_.model-type-badge]:[font-size:11px]
      [&_.model-type-badge]:[font-weight:600]
      [&_.model-type-badge]:[margin-bottom:12px]
      [&_.model-type-badge]:[text-transform:uppercase]
      [&_.model-stats]:[display:grid]
      [&_.model-stats]:[grid-template-columns:1fr_1fr_1fr]
      [&_.model-stats]:[gap:12px]
      [&_.model-stats]:[margin-bottom:16px]
      [&_.model-stats]:[padding:12px_0]
      [&_.model-stats]:[border-top:1px_solid_#f0f0f0]
      [&_.model-stats]:[border-bottom:1px_solid_#f0f0f0]
      [&_.model-stats_.stat]:[text-align:center]
      [&_.model-stats_.stat-label]:[font-size:11px]
      [&_.model-stats_.stat-label]:[color:#999]
      [&_.model-stats_.stat-label]:[text-transform:uppercase]
      [&_.model-stats_.stat-label]:[letter-spacing:0.3px]
      [&_.model-stats_.stat-label]:[margin-bottom:4px]
      [&_.model-stats_.stat-value]:[font-size:18px]
      [&_.model-stats_.stat-value]:[font-weight:700]
      [&_.model-stats_.stat-value]:[color:#1a1a1a]
      [&_.progress-bar]:[width:100%]
      [&_.progress-bar]:[height:4px]
      [&_.progress-bar]:[background:#e0e0e0]
      [&_.progress-bar]:[border-radius:2px]
      [&_.progress-bar]:[margin-top:6px]
      [&_.progress-bar]:[overflow:hidden]
      [&_.progress-fill]:[height:100%]
      [&_.progress-fill]:[background:linear-gradient(90deg,_#667eea,_#764ba2)]
      [&_.progress-fill]:[border-radius:2px]
      [&_.progress-fill]:[transition:width_0.3s_ease]
      [&_.model-meta]:[font-size:11px]
      [&_.model-meta]:[color:#999]
      [&_.model-meta]:[margin-bottom:12px]
      [&_.model-actions]:[display:flex]
      [&_.model-actions]:[gap:8px]
      [&_.model-actions]:[flex-wrap:wrap]
      [&_.action-btn]:[flex:1]
      [&_.action-btn]:[min-width:80px]
      [&_.action-btn]:[padding:8px_10px]
      [&_.action-btn]:[border:1px_solid_#ddd]
      [&_.action-btn]:[border-radius:4px]
      [&_.action-btn]:[background:white]
      [&_.action-btn]:[color:#333]
      [&_.action-btn]:[font-size:12px]
      [&_.action-btn]:[font-weight:500]
      [&_.action-btn]:[cursor:pointer]
      [&_.action-btn]:[transition:all_0.2s_ease]
      [&_.action-btn]:[text-align:center]
      [&_.action-btn:hover]:[background:#f0f0f0]
      [&_.action-btn:hover]:[border-color:#999]
      [&_.action-btn.active:hover]:[background:#fee2e2]
      [&_.action-btn.active:hover]:[border-color:#991b1b]
      [&_.action-btn.active:hover]:[color:#991b1b]
      [&_.action-btn.inactive:hover]:[background:#dcfce7]
      [&_.action-btn.inactive:hover]:[border-color:#166534]
      [&_.action-btn.inactive:hover]:[color:#166534]
      [&_.action-btn.edit:hover]:[background:#e3f2fd]
      [&_.action-btn.edit:hover]:[border-color:#1976d2]
      [&_.action-btn.edit:hover]:[color:#1976d2]
      [&_.action-btn.delete:hover]:[background:#fee2e2]
      [&_.action-btn.delete:hover]:[border-color:#991b1b]
      [&_.action-btn.delete:hover]:[color:#991b1b]
      [&_.endpoints-table-container]:[background:white]
      [&_.endpoints-table-container]:[border-radius:8px]
      [&_.endpoints-table-container]:[overflow:hidden]
      [&_.endpoints-table-container]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.endpoints-table]:[width:100%]
      [&_.endpoints-table]:[border-collapse:collapse]
      [&_.endpoints-table]:[font-size:14px]
      [&_.endpoints-table_thead]:[background:#f9f9f9]
      [&_.endpoints-table_thead]:[border-bottom:2px_solid_#e0e0e0]
      [&_.endpoints-table_th]:[padding:16px]
      [&_.endpoints-table_th]:[text-align:left]
      [&_.endpoints-table_th]:[font-weight:600]
      [&_.endpoints-table_th]:[color:#333]
      [&_.endpoints-table_th]:[text-transform:uppercase]
      [&_.endpoints-table_th]:[font-size:12px]
      [&_.endpoints-table_th]:[letter-spacing:0.5px]
      [&_.endpoints-table_td]:[padding:14px_16px]
      [&_.endpoints-table_td]:[border-bottom:1px_solid_#e8e8e8]
      [&_.endpoints-table_td]:[color:#555]
      [&_.endpoints-table_tbody_tr:hover]:[background:#fafafa]
      [&_.endpoint-url]:[font-family:Courier_New,_monospace]
      [&_.endpoint-url]:[font-size:12px]
      [&_.endpoint-url]:[color:#667eea]
      [&_.endpoint-url]:[word-break:break-all]
      [&_.latency]:[font-weight:600]
      [&_.latency]:[color:#1a1a1a]
      [&_.uptime]:[display:inline-block]
      [&_.uptime]:[padding:4px_10px]
      [&_.uptime]:[border-radius:4px]
      [&_.uptime]:[font-size:12px]
      [&_.uptime]:[font-weight:600]
      [&_.uptime.excellent]:[background:#dcfce7]
      [&_.uptime.excellent]:[color:#166534]
      [&_.uptime.good]:[background:#dbeafe]
      [&_.uptime.good]:[color:#1e40af]
      [&_.endpoint-actions]:[display:flex]
      [&_.endpoint-actions]:[gap:8px]
      [&_.endpoint-actions_.action-btn]:[min-width:auto]
      [&_.endpoint-actions_.action-btn]:[padding:6px_8px]
      max-[768px]:[&_.mc-header]:[flex-direction:column]
      max-[768px]:[&_.mc-header]:[gap:16px]
      max-[768px]:[&_.mc-header-actions]:[flex-direction:column]
      max-[768px]:[&_.mc-header-actions]:[width:100%]
      max-[768px]:[&_.mc-header-actions_.btn-primary]:[width:100%]
      max-[768px]:[&_.mc-header-actions_.btn-secondary]:[width:100%]
      max-[768px]:[&_.mc-stats]:[grid-template-columns:repeat(2,_1fr)]
      max-[768px]:[&_.mc-grid]:[grid-template-columns:1fr]
      max-[768px]:[&_.model-stats]:[grid-template-columns:1fr]
      [.ain-app.theme-dark_&]:[color:#f3f4f6]
      [.ain-app.theme-dark_&]:[background:transparent]
      [.ain-app.theme-dark_&_.mc-header_h1]:[color:#ffffff]
      [.ain-app.theme-dark_&_.mc-section_h2]:[color:#ffffff]
      [.ain-app.theme-dark_&_.mc-form_h2]:[color:#ffffff]
      [.ain-app.theme-dark_&_.model-header_h3]:[color:#ffffff]
      [.ain-app.theme-dark_&_.model-stats_.stat-value]:[color:#ffffff]
      [.ain-app.theme-dark_&_.latency]:[color:#ffffff]
      [.ain-app.theme-dark_&_.stat-value]:[color:#ffffff]
      [.ain-app.theme-dark_&_.mc-header_p]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.stat-label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.form-group_label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.model-provider]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.model-stats_.stat-label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.model-meta]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.endpoints-table_th]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.endpoints-table_td]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.mc-stats]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.mc-stats]:[background:#1f2937]
      [.ain-app.theme-dark_&_.mc-stats]:[border-color:#374151]
      [.ain-app.theme-dark_&_.mc-form]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.mc-form]:[background:#1f2937]
      [.ain-app.theme-dark_&_.mc-form]:[border-color:#374151]
      [.ain-app.theme-dark_&_.model-card1]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.model-card1]:[background:#1f2937]
      [.ain-app.theme-dark_&_.model-card1]:[border-color:#374151]
      [.ain-app.theme-dark_&_.endpoints-table-container]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.endpoints-table-container]:[background:#1f2937]
      [.ain-app.theme-dark_&_.endpoints-table-container]:[border-color:#374151]
      [.ain-app.theme-dark_&_.model-card1.disabled]:[background:#273449]
      [.ain-app.theme-dark_&_.model-stats]:[border-color:#374151]
      [.ain-app.theme-dark_&_.endpoints-table_thead]:[background:#273449]
      [.ain-app.theme-dark_&_.endpoints-table_thead]:[border-color:#374151]
      [.ain-app.theme-dark_&_.endpoints-table_td]:[border-color:#374151]
      [.ain-app.theme-dark_&_.endpoints-table_tbody_tr:hover]:[background:#273449]
      [.ain-app.theme-dark_&_.form-group_input]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_input]:[background:#111827]
      [.ain-app.theme-dark_&_.form-group_input]:[border-color:#374151]
      [.ain-app.theme-dark_&_.form-group_select]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_select]:[background:#111827]
      [.ain-app.theme-dark_&_.form-group_select]:[border-color:#374151]
      [.ain-app.theme-dark_&_.btn-secondary]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.btn-secondary]:[background:#273449]
      [.ain-app.theme-dark_&_.btn-secondary]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.action-btn]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.action-btn]:[background:#273449]
      [.ain-app.theme-dark_&_.action-btn]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.btn-secondary:hover]:[background:#374151]
      [.ain-app.theme-dark_&_.action-btn:hover]:[background:#374151]
      max-[768px]:[&_.mc-form]:[width:95%]
      max-[768px]:[&_.mc-form]:[padding:24px]
      max-[768px]:[&_.form-row]:[grid-template-columns:1fr]
      max-[768px]:[&_.endpoints-table]:[font-size:12px]
      max-[768px]:[&_.endpoints-table_th]:[padding:10px_8px]
      max-[768px]:[&_.endpoints-table_td]:[padding:10px_8px]`}>
      <div className="mc-header">
        <div>
          <h2 className="break-words !text-xl !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">
            Model Control
          </h2>
          <p className="mb-4  font-normal !text-slate-500 text-[15px]  sm:mb-5  !dark:text-slate-400">
            Manage AI models and endpoints
          </p>
        </div>
        <div className="mc-header-actions">
          <button className="btn-primary" onClick={handleAddModel}>
            + Add Model
          </button>
          <button className="btn-secondary" onClick={() => setShowEndpointForm(true)}>
            + Add Endpoint
          </button>
        </div>
      </div>

      <div className="mc-stats">
        <div className="stat-card">
          <div className="stat-value">{models.length}</div>
          <div className="stat-label">Total Models</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{models.filter(m => m.status === 'active').length}</div>
          <div className="stat-label">Active Models</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{endpoints.length}</div>
          <div className="stat-label">Endpoints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalUsage.toFixed(1)}%</div>
          <div className="stat-label">Total Usage</div>
        </div>
      </div>

      {showModelForm && (
        <div className="mc-form-container">
          <div className="mc-form">
            <h2>{editingModel ? 'Edit Model' : 'Add New Model'}</h2>
            <div className="form-group">
              <label>Model Name</label>
              <input
                type="text"
                value={modelFormData.name || ''}
                onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                placeholder="e.g., GPT-4 Turbo"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
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
              <div className="form-group">
                <label>Provider</label>
                <input
                  type="text"
                  value={modelFormData.provider || ''}
                  onChange={(e) => setModelFormData({ ...modelFormData, provider: e.target.value })}
                  placeholder="e.g., OpenAI"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>RPM Limit</label>
                <input
                  type="number"
                  value={modelFormData.rpmLimit || 5000}
                  onChange={(e) => setModelFormData({ ...modelFormData, rpmLimit: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Cost per 1M Requests</label>
                <input
                  type="number"
                  step="0.001"
                  value={modelFormData.costPerMRequest || 0.01}
                  onChange={(e) => setModelFormData({ ...modelFormData, costPerMRequest: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Version</label>
              <input
                type="text"
                value={modelFormData.version || ''}
                onChange={(e) => setModelFormData({ ...modelFormData, version: e.target.value })}
                placeholder="1.0"
              />
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowModelForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveModel}>Save Model</button>
            </div>
          </div>
        </div>
      )}

      {showEndpointForm && (
        <div className="mc-form-container">
          <div className="mc-form">
            <h2>Add API Endpoint</h2>
            <div className="form-group">
              <label>Model</label>
              <select
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
            <div className="form-group">
              <label>Endpoint URL</label>
              <input
                type="url"
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
            <div className="form-group">
              <label>Region</label>
              <input
                type="text"
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
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowEndpointForm(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddEndpoint}>
                Add Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mc-section">
        <h2>Active Models</h2>
        <div className="mc-grid">
          {models.map(model => (
            <div key={model.id} className={`model-card1 ₹{model.status}`}>
              <div className="model-header">
                <div>
                  <h3>{model.name}</h3>
                  <p className="model-provider">{model.provider} • v{model.version}</p>
                </div>
                <span className={`status-badge ₹{model.status}`}>
                  {model.status === 'active' ? '✓' : '○'} {model.status}
                </span>
              </div>

              <div className="model-type-badge">
                {model.type.charAt(0).toUpperCase() + model.type.slice(1)}
              </div>

              <div className="model-stats">
                <div className="stat">
                  <div className="stat-label">Usage</div>
                  <div className="stat-value">{model.usagePercentage.toFixed(1)}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `₹{Math.min(model.usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-label">RPM Limit</div>
                  <div className="stat-value">{(model.rpmLimit / 1000).toFixed(1)}K</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Cost/1M</div>
                  <div className="stat-value">₹{model.costPerMRequest.toFixed(3)}</div>
                </div>
              </div>

              <div className="model-meta">
                <small>Last Updated: {model.lastUpdated}</small>
              </div>

              <div className="model-actions">
                <button 
                  className={`action-btn ₹{model.status === 'active' ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleModel(model.id)}
                  title={model.status === 'active' ? 'Disable' : 'Enable'}
                >
                  {model.status === 'active' ? '⊙' : '⊗'} {model.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button 
                  className="action-btn edit"
                  onClick={() => handleEditModel(model)}
                  title="Edit"
                >
                  ✏️ Edit
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteModel(model.id)}
                  title="Delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mc-section">
        <h2>API Endpoints</h2>
        <div className="endpoints-table-container">
          <table className="endpoints-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Endpoint URL</th>
                <th>Region</th>
                <th>Latency (ms)</th>
                <th>Uptime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(endpoint => {
                const model = models.find(m => m.id === endpoint.modelId);
                return (
                  <tr key={endpoint.id}>
                    <td>{model?.name || 'Unknown'}</td>
                    <td className="endpoint-url">{endpoint.url}</td>
                    <td>{endpoint.region}</td>
                    <td className="latency">{endpoint.latency}ms</td>
                    <td>
                      <span className={`uptime ₹{endpoint.uptime > 99.9 ? 'excellent' : 'good'}`}>
                        {endpoint.uptime}%
                      </span>
                    </td>
                    <td className="endpoint-actions">
                      <button className="action-btn edit">✏️</button>
                      <button className="action-btn delete">🗑️</button>
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
