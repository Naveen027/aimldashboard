import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import './admincss/Systemlogs.css';

interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ipAddress: string;
}

const SystemLogs: React.FC = () => {
  const [logs] = useState<SystemLog[]>([
    {
      id: '1',
      timestamp: '2024-09-22 14:35:22',
      user: 'Sarah Chen (Admin)',
      action: 'User Deleted',
      resource: 'User #1024',
      status: 'success',
      details: 'User account permanently deleted',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-09-22 14:30:15',
      user: 'System',
      action: 'API Rate Limit',
      resource: 'User: Mia Wong',
      status: 'warning',
      details: 'Rate limit exceeded: 5000 requests/min threshold reached',
      ipAddress: 'N/A',
    },
    {
      id: '3',
      timestamp: '2024-09-22 14:25:08',
      user: 'Alex Johnson',
      action: 'API Call',
      resource: 'GPT-4 Model',
      status: 'success',
      details: 'Model: gpt-4-turbo | Tokens: 1245 | Cost: $0.04',
      ipAddress: '203.0.113.45',
    },
    {
      id: '4',
      timestamp: '2024-09-22 14:20:33',
      user: 'System',
      action: 'Database Backup',
      resource: 'Main Database',
      status: 'success',
      details: 'Automated backup completed successfully. Size: 2.3GB',
      ipAddress: 'N/A',
    },
    {
      id: '5',
      timestamp: '2024-09-22 14:15:47',
      user: 'Admin Panel',
      action: 'Settings Updated',
      resource: 'Global Configuration',
      status: 'success',
      details: 'Rate limiting configuration changed',
      ipAddress: '192.168.1.100',
    },
    {
      id: '6',
      timestamp: '2024-09-22 14:10:22',
      user: 'System',
      action: 'Error Detected',
      resource: 'API Endpoint',
      status: 'error',
      details: 'Connection timeout: OpenAI API - Retrying...',
      ipAddress: 'N/A',
    },
    {
      id: '7',
      timestamp: '2024-09-22 14:05:11',
      user: 'Mia Wong',
      action: 'Login',
      resource: 'User Session',
      status: 'success',
      details: 'User logged in successfully',
      ipAddress: '203.0.113.67',
    },
    {
      id: '8',
      timestamp: '2024-09-22 13:58:45',
      user: 'System',
      action: 'Model Deployment',
      resource: 'Claude 3.5 Sonnet',
      status: 'success',
      details: 'New model version deployed: 3.5-20240920',
      ipAddress: 'N/A',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'warning' | 'error' | 'info'>('all');
  const [filterAction, setFilterAction] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '2024-09-22', end: '2024-09-22' });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesAction && matchesSearch;
    });
  }, [logs, filterStatus, filterAction, searchTerm]);

  const stats = {
    totalLogs: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    warning: logs.filter(l => l.status === 'warning').length,
    error: logs.filter(l => l.status === 'error').length,
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'Details', 'IP Address'],
      ...filteredLogs.map(l => [
        l.timestamp,
        l.user,
        l.action,
        l.resource,
        l.status,
        l.details,
        l.ipAddress
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleClearOldLogs = () => {
    if (window.confirm('Delete logs older than 30 days? This action cannot be undone.')) {
      alert('Logs older than 30 days have been deleted');
    }
  };

  return (
    <AdminLayout>
    <div className="system-logs">
      <div className="sl-header">
        <div>
          <h1>System Logs</h1>
          <p>Monitor all system events and user activities</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleExportLogs}>
            📥 Export Logs
          </button>
          <button className="btn-secondary" onClick={handleClearOldLogs}>
            🗑️ Clear Old Logs
          </button>
        </div>
      </div>

      <div className="sl-stats">
        <div className="stat-card">
          <div className="stat-label">Total Logs</div>
          <div className="stat-value">{stats.totalLogs}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Success</div>
          <div className="stat-value">{stats.success}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Warnings</div>
          <div className="stat-value">{stats.warning}</div>
        </div>
        <div className="stat-card error">
          <div className="stat-label">Errors</div>
          <div className="stat-value">{stats.error}</div>
        </div>
      </div>

      <div className="sl-controls">
        <div className="controls-group">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="controls-group">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as 'all' | 'success' | 'warning' | 'error' | 'info',
              )
            }
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div className="controls-group">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="date-input"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="date-input"
          />
        </div>
      </div>

      <div className="sl-logs-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Status</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id} className={`row-${log.status}`}>
                  <td className="timestamp">{log.timestamp}</td>
                  <td className="user">{log.user}</td>
                  <td className="action">{log.action}</td>
                  <td className="resource">{log.resource}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status === 'success' && '✓'}
                      {log.status === 'warning' && '⚠️'}
                      {log.status === 'error' && '✕'}
                      {log.status === 'info' && 'ℹ'}
                      {' '}{log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="details" title={log.details}>{log.details}</td>
                  <td className="ip-address">{log.ipAddress}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-logs">
                  No logs found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sl-footer">
        <small>
          Showing {filteredLogs.length} of {logs.length} logs
          {filteredLogs.length !== logs.length && ' (filtered)'}
        </small>
      </div>
    </div>
    </AdminLayout>
  );
};

export default SystemLogs;
