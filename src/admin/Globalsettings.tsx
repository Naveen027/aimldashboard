import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
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
    <div className={`global-settings
      [padding:0px]
      [background:#f5f5f5]
      [min-height:100vh]
      [&_.gs-header]:[display:flex]
      [&_.gs-header]:[justify-content:space-between]
      [&_.gs-header]:[align-items:flex-start]
      [&_.gs-header]:[margin-bottom:32px]
      [&_.gs-header_h1]:[font-size:25px]
      [&_.gs-header_h1]:[font-weight:700]
      [&_.gs-header_h1]:[color:#1a1a1a]
      [&_.gs-header_h1]:[margin:0_0_8px_0]
      [&_.gs-header_p]:[font-size:14px]
      [&_.gs-header_p]:[color:#666]
      [&_.gs-header_p]:[margin:0]
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
      [&_.gs-tabs]:[display:flex]
      [&_.gs-tabs]:[gap:0]
      [&_.gs-tabs]:[margin-bottom:32px]
      [&_.gs-tabs]:[border-bottom:2px_solid_#e0e0e0]
      [&_.gs-tabs]:[background:white]
      [&_.gs-tabs]:[border-radius:8px_8px_0_0]
      [&_.tab]:[padding:14px_24px]
      [&_.tab]:[border:none]
      [&_.tab]:[background:none]
      [&_.tab]:[color:#666]
      [&_.tab]:[font-size:14px]
      [&_.tab]:[font-weight:500]
      [&_.tab]:[cursor:pointer]
      [&_.tab]:[transition:all_0.3s_ease]
      [&_.tab]:[border-bottom:3px_solid_transparent]
      [&_.tab]:[position:relative]
      [&_.tab]:[bottom:-2px]
      [&_.tab:hover]:[color:#333]
      [&_.tab.active]:[color:#667eea]
      [&_.tab.active]:[border-bottom-color:#667eea]
      [&_.gs-section]:[background:white]
      [&_.gs-section]:[border-radius:8px]
      [&_.gs-section]:[padding:24px]
      [&_.gs-section]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.gs-section_h2]:[font-size:20px]
      [&_.gs-section_h2]:[font-weight:600]
      [&_.gs-section_h2]:[color:#1a1a1a]
      [&_.gs-section_h2]:[margin:0_0_20px_0]
      [&_.gs-section_h3]:[font-size:16px]
      [&_.gs-section_h3]:[font-weight:600]
      [&_.gs-section_h3]:[color:#1a1a1a]
      [&_.gs-section_h3]:[margin:0_0_16px_0]
      [&_.section-header]:[display:flex]
      [&_.section-header]:[justify-content:space-between]
      [&_.section-header]:[align-items:center]
      [&_.section-header]:[margin-bottom:24px]
      [&_.section-header_h2]:[margin:0]
      [&_.settings-form]:[max-width:600px]
      [&_.form-group]:[margin-bottom:24px]
      [&_.form-group_label]:[display:block]
      [&_.form-group_label]:[margin-bottom:8px]
      [&_.form-group_label]:[font-size:14px]
      [&_.form-group_label]:[font-weight:500]
      [&_.form-group_label]:[color:#333]
      [&_.form-group_input[type="text"]]:[width:100%]
      [&_.form-group_input[type="text"]]:[padding:10px_12px]
      [&_.form-group_input[type="text"]]:[border:1px_solid_#ddd]
      [&_.form-group_input[type="text"]]:[border-radius:6px]
      [&_.form-group_input[type="text"]]:[font-size:14px]
      [&_.form-group_input[type="text"]]:[font-family:inherit]
      [&_.form-group_input[type="text"]]:[background:white]
      [&_.form-group_input[type="text"]]:[color:#333]
      [&_.form-group_input[type="text"]]:[box-sizing:border-box]
      [&_.form-group_input[type="url"]]:[width:100%]
      [&_.form-group_input[type="url"]]:[padding:10px_12px]
      [&_.form-group_input[type="url"]]:[border:1px_solid_#ddd]
      [&_.form-group_input[type="url"]]:[border-radius:6px]
      [&_.form-group_input[type="url"]]:[font-size:14px]
      [&_.form-group_input[type="url"]]:[font-family:inherit]
      [&_.form-group_input[type="url"]]:[background:white]
      [&_.form-group_input[type="url"]]:[color:#333]
      [&_.form-group_input[type="url"]]:[box-sizing:border-box]
      [&_.form-group_input[type="number"]]:[width:100%]
      [&_.form-group_input[type="number"]]:[padding:10px_12px]
      [&_.form-group_input[type="number"]]:[border:1px_solid_#ddd]
      [&_.form-group_input[type="number"]]:[border-radius:6px]
      [&_.form-group_input[type="number"]]:[font-size:14px]
      [&_.form-group_input[type="number"]]:[font-family:inherit]
      [&_.form-group_input[type="number"]]:[background:white]
      [&_.form-group_input[type="number"]]:[color:#333]
      [&_.form-group_input[type="number"]]:[box-sizing:border-box]
      [&_.form-group_textarea]:[width:100%]
      [&_.form-group_textarea]:[padding:10px_12px]
      [&_.form-group_textarea]:[border:1px_solid_#ddd]
      [&_.form-group_textarea]:[border-radius:6px]
      [&_.form-group_textarea]:[font-size:14px]
      [&_.form-group_textarea]:[font-family:inherit]
      [&_.form-group_textarea]:[background:white]
      [&_.form-group_textarea]:[color:#333]
      [&_.form-group_textarea]:[box-sizing:border-box]
      [&_.form-group_input:focus]:[outline:none]
      [&_.form-group_input:focus]:[border-color:#667eea]
      [&_.form-group_input:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.form-group_textarea:focus]:[outline:none]
      [&_.form-group_textarea:focus]:[border-color:#667eea]
      [&_.form-group_textarea:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.form-group_small]:[display:block]
      [&_.form-group_small]:[margin-top:6px]
      [&_.form-group_small]:[font-size:12px]
      [&_.form-group_small]:[color:#888]
      [&_.toggle-group]:[margin-bottom:24px]
      [&_.toggle-group_label]:[display:flex]
      [&_.toggle-group_label]:[align-items:center]
      [&_.toggle-group_label]:[gap:10px]
      [&_.toggle-group_label]:[margin-bottom:0]
      [&_.toggle-group_label]:[cursor:pointer]
      [&_.toggle-group_label]:[font-weight:500]
      [&_.toggle-group_label]:[color:#333]
      [&_.toggle-group_input[type="checkbox"]]:[width:18px]
      [&_.toggle-group_input[type="checkbox"]]:[height:18px]
      [&_.toggle-group_input[type="checkbox"]]:[cursor:pointer]
      [&_.toggle-group_small]:[display:block]
      [&_.toggle-group_small]:[margin-top:6px]
      [&_.toggle-group_small]:[margin-left:28px]
      [&_.toggle-group_small]:[font-size:12px]
      [&_.toggle-group_small]:[color:#888]
      [&_.divider]:[height:1px]
      [&_.divider]:[background:#e0e0e0]
      [&_.divider]:[margin:32px_0]
      [&_.form-card]:[border:1px_solid_#e0e0e0]
      [&_.form-card]:[border-radius:6px]
      [&_.form-card]:[padding:20px]
      [&_.form-card]:[margin-bottom:24px]
      [&_.form-card]:[background:#f9f9f9]
      [&_.form-card_h3]:[margin-top:0]
      [&_.form-actions]:[display:flex]
      [&_.form-actions]:[gap:12px]
      [&_.form-actions]:[justify-content:flex-end]
      [&_.form-actions]:[margin-top:16px]
      [&_.form-actions_.btn-primary]:[min-width:100px]
      [&_.form-actions_.btn-secondary]:[min-width:100px]
      [&_.api-keys-list]:[display:grid]
      [&_.api-keys-list]:[gap:16px]
      [&_.api-key-card]:[border:1px_solid_#e0e0e0]
      [&_.api-key-card]:[border-radius:6px]
      [&_.api-key-card]:[padding:16px]
      [&_.api-key-card]:[display:flex]
      [&_.api-key-card]:[justify-content:space-between]
      [&_.api-key-card]:[align-items:flex-start]
      [&_.api-key-card]:[transition:all_0.2s_ease]
      [&_.api-key-card:hover]:[border-color:#667eea]
      [&_.api-key-card:hover]:[box-shadow:0_2px_8px_rgba(102,_126,_234,_0.1)]
      [&_.key-info_h3]:[margin:0_0_12px_0]
      [&_.key-info_h3]:[font-size:15px]
      [&_.key-value]:[display:flex]
      [&_.key-value]:[align-items:center]
      [&_.key-value]:[gap:10px]
      [&_.key-value]:[margin-bottom:8px]
      [&_.key-value_code]:[background:#f5f5f5]
      [&_.key-value_code]:[padding:8px_12px]
      [&_.key-value_code]:[border-radius:4px]
      [&_.key-value_code]:[font-size:12px]
      [&_.key-value_code]:[color:#333]
      [&_.key-value_code]:[font-family:Courier_New,_monospace]
      [&_.key-value_code]:[flex:1]
      [&_.key-value_code]:[word-break:break-all]
      [&_.copy-btn]:[background:none]
      [&_.copy-btn]:[border:none]
      [&_.copy-btn]:[font-size:16px]
      [&_.copy-btn]:[cursor:pointer]
      [&_.copy-btn]:[padding:4px_8px]
      [&_.copy-btn]:[transition:all_0.2s_ease]
      [&_.copy-btn:hover]:[background:#e0e0e0]
      [&_.copy-btn:hover]:[border-radius:4px]
      [&_.key-meta]:[display:flex]
      [&_.key-meta]:[gap:16px]
      [&_.key-meta]:[font-size:12px]
      [&_.key-meta]:[color:#888]
      [&_.key-actions]:[display:flex]
      [&_.key-actions]:[gap:8px]
      [&_.key-actions]:[flex-direction:column]
      [&_.key-actions]:[align-items:flex-end]
      [&_.status-btn]:[padding:8px_12px]
      [&_.status-btn]:[border-radius:4px]
      [&_.status-btn]:[border:1px_solid_#ddd]
      [&_.status-btn]:[background:white]
      [&_.status-btn]:[color:#333]
      [&_.status-btn]:[font-size:12px]
      [&_.status-btn]:[font-weight:500]
      [&_.status-btn]:[cursor:pointer]
      [&_.status-btn]:[transition:all_0.2s_ease]
      [&_.status-btn]:[white-space:nowrap]
      [&_.delete-btn]:[padding:8px_12px]
      [&_.delete-btn]:[border-radius:4px]
      [&_.delete-btn]:[border:1px_solid_#ddd]
      [&_.delete-btn]:[background:white]
      [&_.delete-btn]:[color:#333]
      [&_.delete-btn]:[font-size:12px]
      [&_.delete-btn]:[font-weight:500]
      [&_.delete-btn]:[cursor:pointer]
      [&_.delete-btn]:[transition:all_0.2s_ease]
      [&_.delete-btn]:[white-space:nowrap]
      [&_.status-btn.active:hover]:[background:#dcfce7]
      [&_.status-btn.active:hover]:[border-color:#166534]
      [&_.status-btn.active:hover]:[color:#166534]
      [&_.status-btn.inactive:hover]:[background:#fee2e2]
      [&_.status-btn.inactive:hover]:[border-color:#991b1b]
      [&_.status-btn.inactive:hover]:[color:#991b1b]
      [&_.delete-btn:hover]:[background:#fee2e2]
      [&_.delete-btn:hover]:[border-color:#991b1b]
      [&_.delete-btn:hover]:[color:#991b1b]
      [&_.notifications-grid]:[display:grid]
      [&_.notifications-grid]:[grid-template-columns:repeat(auto-fit,_minmax(300px,_1fr))]
      [&_.notifications-grid]:[gap:20px]
      [&_.notification-item]:[border:1px_solid_#e0e0e0]
      [&_.notification-item]:[border-radius:6px]
      [&_.notification-item]:[padding:16px]
      [&_.notification-item]:[transition:all_0.2s_ease]
      [&_.notification-item:hover]:[border-color:#667eea]
      [&_.notification-item:hover]:[box-shadow:0_2px_8px_rgba(102,_126,_234,_0.1)]
      [&_.notification-item_label]:[display:flex]
      [&_.notification-item_label]:[align-items:center]
      [&_.notification-item_label]:[gap:10px]
      [&_.notification-item_label]:[margin:0]
      [&_.notification-item_label]:[cursor:pointer]
      [&_.notification-item_label]:[font-weight:500]
      [&_.notification-item_label]:[color:#333]
      [&_.notification-item_label]:[margin-bottom:8px]
      [&_.notification-item_input[type="checkbox"]]:[width:18px]
      [&_.notification-item_input[type="checkbox"]]:[height:18px]
      [&_.notification-item_input[type="checkbox"]]:[cursor:pointer]
      [&_.notification-item_small]:[display:block]
      [&_.notification-item_small]:[font-size:12px]
      [&_.notification-item_small]:[color:#888]
      [&_.security-options]:[display:grid]
      [&_.security-options]:[gap:20px]
      [&_.security-item]:[border:1px_solid_#e0e0e0]
      [&_.security-item]:[border-radius:6px]
      [&_.security-item]:[padding:20px]
      [&_.security-item]:[transition:all_0.2s_ease]
      [&_.security-item:hover]:[border-color:#667eea]
      [&_.security-item:hover]:[box-shadow:0_2px_8px_rgba(102,_126,_234,_0.1)]
      [&_.item-header]:[display:flex]
      [&_.item-header]:[justify-content:space-between]
      [&_.item-header]:[align-items:center]
      [&_.item-header]:[margin-bottom:12px]
      [&_.item-header_h3]:[margin:0]
      [&_.item-header_h3]:[font-size:16px]
      [&_.badge]:[display:inline-block]
      [&_.badge]:[padding:4px_12px]
      [&_.badge]:[background:#f0f0f0]
      [&_.badge]:[color:#333]
      [&_.badge]:[border-radius:20px]
      [&_.badge]:[font-size:11px]
      [&_.badge]:[font-weight:600]
      [&_.badge]:[text-transform:uppercase]
      [&_.badge]:[letter-spacing:0.3px]
      [&_.badge.enabled]:[background:#dcfce7]
      [&_.badge.enabled]:[color:#166534]
      [&_.security-item_p]:[margin:0_0_16px_0]
      [&_.security-item_p]:[font-size:14px]
      [&_.security-item_p]:[color:#666]
      [&_.security-item_.btn-secondary]:[font-size:13px]
      [&_.security-item_.btn-secondary]:[padding:8px_16px]
      max-[768px]:[&_.gs-header]:[flex-direction:column]
      max-[768px]:[&_.gs-header]:[gap:16px]
      max-[768px]:[&_.gs-tabs]:[flex-wrap:wrap]
      max-[768px]:[&_.tab]:[padding:12px_16px]
      max-[768px]:[&_.tab]:[font-size:13px]
      max-[768px]:[&_.settings-form]:[max-width:100%]
      [.ain-app.theme-dark_&]:[color:#f3f4f6]
      [.ain-app.theme-dark_&]:[background:transparent]
      [.ain-app.theme-dark_&_.gs-header_h1]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.gs-section_h2]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.gs-section_h3]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.item-header_h3]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.gs-header_p]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.form-group_label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.toggle-group_label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.notification-item_label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.gs-tabs]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.gs-tabs]:[background:#1f2937]
      [.ain-app.theme-dark_&_.gs-tabs]:[border-color:#374151]
      [.ain-app.theme-dark_&_.gs-section]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.gs-section]:[background:#1f2937]
      [.ain-app.theme-dark_&_.gs-section]:[border-color:#374151]
      [.ain-app.theme-dark_&_.tab]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.tab:hover]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_input]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_input]:[background:#111827]
      [.ain-app.theme-dark_&_.form-group_input]:[border-color:#374151]
      [.ain-app.theme-dark_&_.form-group_textarea]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_textarea]:[background:#111827]
      [.ain-app.theme-dark_&_.form-group_textarea]:[border-color:#374151]
      [.ain-app.theme-dark_&_.key-value_code]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.key-value_code]:[background:#111827]
      [.ain-app.theme-dark_&_.key-value_code]:[border-color:#374151]
      [.ain-app.theme-dark_&_.form-group_small]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.toggle-group_small]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.notification-item_small]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.security-item_p]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.key-meta]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.form-card]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-card]:[background:#1f2937]
      [.ain-app.theme-dark_&_.form-card]:[border-color:#374151]
      [.ain-app.theme-dark_&_.api-key-card]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.api-key-card]:[background:#1f2937]
      [.ain-app.theme-dark_&_.api-key-card]:[border-color:#374151]
      [.ain-app.theme-dark_&_.notification-item]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.notification-item]:[background:#1f2937]
      [.ain-app.theme-dark_&_.notification-item]:[border-color:#374151]
      [.ain-app.theme-dark_&_.security-item]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.security-item]:[background:#1f2937]
      [.ain-app.theme-dark_&_.security-item]:[border-color:#374151]
      [.ain-app.theme-dark_&_.divider]:[background:#374151]
      [.ain-app.theme-dark_&_.status-btn]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.status-btn]:[background:#273449]
      [.ain-app.theme-dark_&_.status-btn]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.delete-btn]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.delete-btn]:[background:#273449]
      [.ain-app.theme-dark_&_.delete-btn]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.btn-secondary]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.btn-secondary]:[background:#273449]
      [.ain-app.theme-dark_&_.btn-secondary]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.status-btn:hover]:[background:#374151]
      [.ain-app.theme-dark_&_.delete-btn:hover]:[background:#374151]
      [.ain-app.theme-dark_&_.btn-secondary:hover]:[background:#374151]
      [.ain-app.theme-dark_&_.badge:not(.enabled)]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.badge:not(.enabled)]:[background:#374151]
      max-[768px]:[&_.notifications-grid]:[grid-template-columns:1fr]
      max-[768px]:[&_.key-actions]:[flex-direction:row]
      max-[768px]:[&_.key-actions]:[align-items:center]
      max-[768px]:[&_.api-key-card]:[flex-direction:column]
      max-[768px]:[&_.api-key-card]:[gap:12px]
      max-[768px]:[&_.key-value]:[flex-direction:column]
      max-[768px]:[&_.key-value]:[align-items:flex-start]
      max-[768px]:[&_.key-value_code]:[width:100%]
      max-[768px]:[&_.key-meta]:[flex-direction:column]
      max-[768px]:[&_.key-meta]:[gap:4px]`}>
      <div className="gs-header">
        <div>
          <h2 className="break-words !text-xl !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">
            Global Settings
          </h2>
          <p className="mb-4  font-normal !text-slate-500 text-[15px]  sm:mb-5  !dark:text-slate-400">
            System configuration and admin preferences
          </p>
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
