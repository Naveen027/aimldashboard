import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import './admincss/Globalsettings.css';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  createdAt: string;
  isActive: boolean;
}

interface SystemConfig {
  siteName: string;
  siteUrl: string;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  maxApiCalls: number;
  defaultRateLimit: number;
  allowedDomains: string;
  logRetention: number;
}

const GlobalSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'Karnataka AI Cell',
    siteUrl: 'https://karnatakaaicell.ai',
    emailNotifications: true,
    maintenanceMode: false,
    maxApiCalls: 10000000,
    defaultRateLimit: 5000,
    allowedDomains: 'localhost, *.ainexus.ai, *.company.com',
    logRetention: 90,
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Dashboard API Key',
      key: 'sk_live_4eC39HqLyjWDarhtT663',
      lastUsed: '2024-09-22 14:30',
      createdAt: '2024-01-15',
      isActive: true,
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'sk_test_51JWHQ7IxKxQ9D2eY6FZ',
      lastUsed: '2024-09-20 11:15',
      createdAt: '2024-02-01',
      isActive: true,
    },
    {
      id: '3',
      name: 'Legacy Integration',
      key: 'sk_live_old_8mQ2P9Rx4YvZ2LjK3',
      lastUsed: '2024-08-15 09:00',
      createdAt: '2023-06-10',
      isActive: false,
    },
  ]);

  const [notifications, setNotifications] = useState({
    emailOnErrors: true,
    emailOnLimits: true,
    dailySummary: true,
    weeklyReport: true,
    criticalAlerts: true,
  });

  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiName, setNewApiName] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'notifications' | 'security'>('general');

  const handleConfigChange = <Key extends keyof SystemConfig,>(
    key: Key,
    value: SystemConfig[Key],
  ) => {
    setConfig((currentConfig) => ({ ...currentConfig, [key]: value }));
  };

  const handleGenerateApiKey = () => {
    if (!newApiName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiName,
      key: `sk_live_${Math.random().toString(36).substring(2, 40)}`,
      lastUsed: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiName('');
    setShowApiForm(false);
  };

  const handleDeleteApiKey = (id: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  const handleToggleApiKey = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  return (
    <AdminLayout>
    <div className="global-settings">
      <div className="gs-header">
        <div>
          <h1>Global Settings</h1>
          <p>System configuration and admin preferences</p>
        </div>
        <button className="btn-primary" onClick={handleSaveSettings}>
          💾 Save Changes
        </button>
      </div>

      <div className="gs-tabs">
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          API Keys
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="gs-section">
          <h2>General Settings</h2>
          <div className="settings-form">
            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => handleConfigChange('siteName', e.target.value)}
              />
              <small>The name displayed across the platform</small>
            </div>

            <div className="form-group">
              <label>Site URL</label>
              <input
                type="url"
                value={config.siteUrl}
                onChange={(e) => handleConfigChange('siteUrl', e.target.value)}
              />
              <small>Base URL for your platform</small>
            </div>

            <div className="form-group">
              <label>Allowed Domains</label>
              <textarea
                value={config.allowedDomains}
                onChange={(e) => handleConfigChange('allowedDomains', e.target.value)}
                rows={3}
              />
              <small>Comma-separated list of allowed domains</small>
            </div>

            <div className="form-group">
              <label>Log Retention (days)</label>
              <input
                type="number"
                value={config.logRetention}
                onChange={(e) => handleConfigChange('logRetention', parseInt(e.target.value))}
              />
              <small>How long to keep system logs (90 days recommended)</small>
            </div>

            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.maintenanceMode}
                  onChange={(e) => handleConfigChange('maintenanceMode', e.target.checked)}
                />
                <span>Maintenance Mode</span>
              </label>
              <small>Disable user access during maintenance</small>
            </div>

            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.emailNotifications}
                  onChange={(e) => handleConfigChange('emailNotifications', e.target.checked)}
                />
                <span>Email Notifications</span>
              </label>
              <small>Send system notifications via email</small>
            </div>

            <div className="divider"></div>

            <h3>Rate Limiting</h3>
            <div className="form-group">
              <label>Default Rate Limit (requests/min)</label>
              <input
                type="number"
                value={config.defaultRateLimit}
                onChange={(e) => handleConfigChange('defaultRateLimit', parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Max API Calls per Month</label>
              <input
                type="number"
                value={config.maxApiCalls}
                onChange={(e) => handleConfigChange('maxApiCalls', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api' && (
        <div className="gs-section">
          <div className="section-header">
            <h2>API Keys Management</h2>
            <button className="btn-primary" onClick={() => setShowApiForm(!showApiForm)}>
              + Generate New Key
            </button>
          </div>

          {showApiForm && (
            <div className="form-card">
              <h3>Generate New API Key</h3>
              <div className="form-group">
                <label>Key Name</label>
                <input
                  type="text"
                  value={newApiName}
                  onChange={(e) => setNewApiName(e.target.value)}
                  placeholder="e.g., Production Key"
                />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowApiForm(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleGenerateApiKey}>Generate</button>
              </div>
            </div>
          )}

          <div className="api-keys-list">
            {apiKeys.map(apiKey => (
              <div key={apiKey.id} className="api-key-card">
                <div className="key-info">
                  <h3>{apiKey.name}</h3>
                  <div className="key-value">
                    <code>{apiKey.key}</code>
                    <button className="copy-btn" title="Copy key">
                      📋
                    </button>
                  </div>
                  <div className="key-meta">
                    <span>Created: {apiKey.createdAt}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                  </div>
                </div>
                <div className="key-actions">
                  <button
                    className={`status-btn ${apiKey.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleApiKey(apiKey.id)}
                  >
                    {apiKey.isActive ? '✓ Active' : '○ Inactive'}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="gs-section">
          <h2>Notification Preferences</h2>
          <div className="notifications-grid">
            <div className="notification-item">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.emailOnErrors}
                  onChange={(e) => setNotifications({ ...notifications, emailOnErrors: e.target.checked })}
                />
                <span>Email on Errors</span>
              </label>
              <small>Get notified when critical errors occur</small>
            </div>

            <div className="notification-item">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.emailOnLimits}
                  onChange={(e) => setNotifications({ ...notifications, emailOnLimits: e.target.checked })}
                />
                <span>Email on Rate Limit Alerts</span>
              </label>
              <small>Notify when users approach rate limits</small>
            </div>

            <div className="notification-item">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.criticalAlerts}
                  onChange={(e) => setNotifications({ ...notifications, criticalAlerts: e.target.checked })}
                />
                <span>Critical Alerts</span>
              </label>
              <small>High priority system alerts</small>
            </div>

            <div className="notification-item">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.dailySummary}
                  onChange={(e) => setNotifications({ ...notifications, dailySummary: e.target.checked })}
                />
                <span>Daily Summary</span>
              </label>
              <small>Daily usage and analytics summary</small>
            </div>

            <div className="notification-item">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                />
                <span>Weekly Report</span>
              </label>
              <small>Comprehensive weekly analytics</small>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="gs-section">
          <h2>Security Settings</h2>
          <div className="security-options">
            <div className="security-item">
              <div className="item-header">
                <h3>Two-Factor Authentication</h3>
                <span className="badge enabled">Enabled</span>
              </div>
              <p>2FA is enabled for all admin accounts</p>
              <button className="btn-secondary">Configure</button>
            </div>

            <div className="security-item">
              <div className="item-header">
                <h3>IP Whitelist</h3>
                <span className="badge">5 IPs</span>
              </div>
              <p>Restrict API access to specific IP addresses</p>
              <button className="btn-secondary">Manage IPs</button>
            </div>

            <div className="security-item">
              <div className="item-header">
                <h3>SSL/TLS Certificate</h3>
                <span className="badge enabled">Valid</span>
              </div>
              <p>Expires: 2025-09-22</p>
              <button className="btn-secondary">View Details</button>
            </div>

            <div className="security-item">
              <div className="item-header">
                <h3>Data Encryption</h3>
                <span className="badge enabled">Active</span>
              </div>
              <p>All sensitive data is encrypted at rest and in transit</p>
              <button className="btn-secondary">View Policy</button>
            </div>

            <div className="security-item">
              <div className="item-header">
                <h3>Audit Logs</h3>
              </div>
              <p>View all admin actions and system events</p>
              <button className="btn-secondary">View Logs</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default GlobalSettings;
