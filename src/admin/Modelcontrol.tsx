import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import './admincss/Modelcontrol.css';

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
      name: 'GPT-4 (Text Generation)',
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
      name: 'DALL-E 3',
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
      name: 'Whisper',
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
      name: 'Claude 3.5 Sonnet',
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
    <div className="model-control">
      <div className="mc-header">
        <div>
          <h1>Model Control</h1>
          <p>Manage AI models and endpoints</p>
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
            <div key={model.id} className={`model-card1 ${model.status}`}>
              <div className="model-header">
                <div>
                  <h3>{model.name}</h3>
                  <p className="model-provider">{model.provider} • v{model.version}</p>
                </div>
                <span className={`status-badge ${model.status}`}>
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
                      style={{ width: `${Math.min(model.usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-label">RPM Limit</div>
                  <div className="stat-value">{(model.rpmLimit / 1000).toFixed(1)}K</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Cost/1M</div>
                  <div className="stat-value">${model.costPerMRequest.toFixed(3)}</div>
                </div>
              </div>

              <div className="model-meta">
                <small>Last Updated: {model.lastUpdated}</small>
              </div>

              <div className="model-actions">
                <button 
                  className={`action-btn ${model.status === 'active' ? 'active' : 'inactive'}`}
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
                      <span className={`uptime ${endpoint.uptime > 99.9 ? 'excellent' : 'good'}`}>
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
