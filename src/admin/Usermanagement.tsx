import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'analyst';
  status: 'active' | 'inactive';
  joinDate: string;
  apiUsage: number;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.johnson@company.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      apiUsage: 270000,
      lastActive: '5 mins ago'
    },
    {
      id: '2',
      name: 'Mia Wong',
      email: 'mia.wong@company.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-02-20',
      apiUsage: 1510000,
      lastActive: '3 minutes ago'
    },
    {
      id: '3',
      name: 'Mana Tuung',
      email: 'mana.tuung@company.com',
      role: 'analyst',
      status: 'active',
      joinDate: '2024-03-10',
      apiUsage: 421000,
      lastActive: '3 minutes ago'
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: User['role'];
    status: User['status'];
  }>({
    name: '',
    email: '',
    role: 'user' as const,
    status: 'active' as const,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user' | 'analyst'>('all');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const handleAddUser = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'user', status: 'active' });
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowForm(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill all fields');
      return;
    }

    if (editingId) {
      setUsers(users.map(u => u.id === editingId
        ? { ...u, ...formData }
        : u
      ));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        apiUsage: 0,
        lastActive: 'Just now',
      };
      setUsers([...users, newUser]);
    }
    setShowForm(false);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleStatusToggle = (id: string) => {
    setUsers(users.map(u => u.id === id
      ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
      : u
    ));
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
  };

  return (
    <AdminLayout>
    <div className={`user-management
      [padding:0px]
      [background:#f5f5f5]
      [min-height:100vh]
      [&_.um-header]:[display:flex]
      [&_.um-header]:[justify-content:space-between]
      [&_.um-header]:[align-items:flex-start]
      [&_.um-header]:[margin-bottom:20px]
      [&_.um-header_h1]:[font-size:25px]
      [&_.um-header_h1]:[font-weight:700]
      [&_.um-header_h1]:[color:#1a1a1a]
      [&_.um-header_h1]:[margin:0_0_8px_0]
      [&_.um-header_p]:[font-size:14px]
      [&_.um-header_p]:[color:#666]
      [&_.um-header_p]:[margin:0]
      [&_.um-stats]:[display:grid]
      [&_.um-stats]:[grid-template-columns:repeat(auto-fit,_minmax(200px,_1fr))]
      [&_.um-stats]:[gap:16px]
      [&_.um-stats]:[margin-bottom:32px]
      [&_.stat-card]:[background:white]
      [&_.stat-card]:[padding:20px]
      [&_.stat-card]:[border-radius:8px]
      [&_.stat-card]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.stat-card]:[border-left:4px_solid_#667eea]
      [&_.stat-value]:[font-size:32px]
      [&_.stat-value]:[font-weight:700]
      [&_.stat-value]:[color:#1a1a1a]
      [&_.stat-value]:[margin-bottom:8px]
      [&_.stat-label]:[font-size:14px]
      [&_.stat-label]:[color:#666]
      [&_.um-controls]:[display:flex]
      [&_.um-controls]:[gap:16px]
      [&_.um-controls]:[margin-bottom:24px]
      [&_.um-controls]:[width:400px]
      [&_.search-input]:[padding:10px_16px]
      [&_.search-input]:[border:1px_solid_#ddd]
      [&_.search-input]:[border-radius:6px]
      [&_.search-input]:[font-size:14px]
      [&_.search-input]:[background:white]
      [&_.search-input]:[color:#333]
      [&_.filter-select]:[padding:10px_16px]
      [&_.filter-select]:[border:1px_solid_#ddd]
      [&_.filter-select]:[border-radius:6px]
      [&_.filter-select]:[font-size:14px]
      [&_.filter-select]:[background:white]
      [&_.filter-select]:[color:#333]
      [&_.search-input]:[flex:1]
      [&_.search-input]:[min-width:300px]
      [&_.search-input::placeholder]:[color:#999]
      [&_.filter-select]:[min-width:150px]
      [&_.filter-select]:[cursor:pointer]
      [&_.search-input:focus]:[outline:none]
      [&_.search-input:focus]:[border-color:#667eea]
      [&_.search-input:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.filter-select:focus]:[outline:none]
      [&_.filter-select:focus]:[border-color:#667eea]
      [&_.filter-select:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.btn-primary]:[padding:10px_20px]
      [&_.btn-primary]:[border:none]
      [&_.btn-primary]:[border-radius:10px]!
      [&_.btn-primary]:[font-size:14px]
      [&_.btn-primary]:[font-weight:500]
      [&_.btn-primary]:[cursor:pointer]
      [&_.btn-primary]:[transition:all_0.3s_ease]
      [&_.btn-secondary]:[padding:10px_20px]
      [&_.btn-secondary]:[border:1px_solid_#ddd]
      [&_.btn-secondary]:[border-radius:10px]!
      [&_.btn-secondary]:[font-size:14px]
      [&_.btn-secondary]:[font-weight:500]
      [&_.btn-secondary]:[cursor:pointer]
      [&_.btn-secondary]:[transition:all_0.3s_ease]
      [&_.btn-primary]:[background:#667eea]
      [&_.btn-primary]:[color:white]
      [&_.btn-primary]:[border-radius:10px]
      [&_.btn-primary:hover]:[background:#5568d3]
      [&_.btn-primary:hover]:[box-shadow:0_4px_12px_rgba(102,_126,_234,_0.3)]
      [&_.btn-secondary]:[background:#f0f0f0]
      [&_.btn-secondary]:[color:#333]
      [&_.btn-secondary:hover]:[background:#e8e8e8]
      [&_.um-form-container]:[position:fixed]
      [&_.um-form-container]:[top:0]
      [&_.um-form-container]:[left:0]
      [&_.um-form-container]:[right:0]
      [&_.um-form-container]:[bottom:0]
      [&_.um-form-container]:[background:rgba(0,_0,_0,_0.5)]
      [&_.um-form-container]:[display:flex]
      [&_.um-form-container]:[align-items:center]
      [&_.um-form-container]:[justify-content:center]
      [&_.um-form-container]:[z-index:1000]
      [&_.um-form]:[background:white]
      [&_.um-form]:[border-radius:8px]
      [&_.um-form]:[padding:32px]
      [&_.um-form]:[width:90%]
      [&_.um-form]:[max-width:500px]
      [&_.um-form]:[box-shadow:0_20px_25px_rgba(0,_0,_0,_0.15)]
      [&_.um-form_h2]:[margin:0_0_24px_0]
      [&_.um-form_h2]:[font-size:20px]
      [&_.um-form_h2]:[color:#1a1a1a]
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
      [&_.um-table-container]:[background:white]
      [&_.um-table-container]:[border-radius:8px]
      [&_.um-table-container]:[overflow:hidden]
      [&_.um-table-container]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.um-table]:[width:100%]
      [&_.um-table]:[border-collapse:collapse]
      [&_.um-table]:[font-size:14px]
      [&_.um-table_thead]:[background:#f9f9f9]
      [&_.um-table_thead]:[border-bottom:2px_solid_#e0e0e0]
      [&_.um-table_th]:[padding:16px]
      [&_.um-table_th]:[text-align:left]
      [&_.um-table_th]:[font-weight:600]
      [&_.um-table_th]:[color:#333]
      [&_.um-table_th]:[text-transform:uppercase]
      [&_.um-table_th]:[font-size:12px]
      [&_.um-table_th]:[letter-spacing:0.5px]
      [&_.um-table_td]:[padding:14px_5px]
      [&_.um-table_td]:[border-bottom:1px_solid_#e8e8e8]
      [&_.um-table_td]:[color:#555]
      [&_.um-table_tbody_tr:hover]:[background:#fafafa]
      [&_.um-table_.user-name]:[font-weight:500]
      [&_.um-table_.user-name]:[color:#1a1a1a]
      [&_.badge]:[display:inline-block]
      [&_.badge]:[padding:4px_12px]
      [&_.badge]:[border-radius:20px]
      [&_.badge]:[font-size:12px]
      [&_.badge]:[font-weight:500]
      [&_.badge]:[text-transform:uppercase]
      [&_.badge]:[letter-spacing:0.3px]
      [&_.badge-admin]:[background:#fee2e2]
      [&_.badge-admin]:[color:#991b1b]
      [&_.badge-user]:[background:#dbeafe]
      [&_.badge-user]:[color:#1e40af]
      [&_.badge-analyst]:[background:#f3e8ff]
      [&_.badge-analyst]:[color:#6b21a8]
      [&_.status-badge]:[display:inline-flex]
      [&_.status-badge]:[align-items:center]
      [&_.status-badge]:[gap:6px]
      [&_.status-badge]:[padding:4px_10px]
      [&_.status-badge]:[border-radius:4px]
      [&_.status-badge]:[font-size:12px]
      [&_.status-badge]:[font-weight:500]
      [&_.status-badge.active]:[background:#dcfce7]
      [&_.status-badge.active]:[color:#166534]
      [&_.status-badge.inactive]:[background:#fee2e2]
      [&_.status-badge.inactive]:[color:#991b1b]
      [&_.actions]:[display:flex]
      [&_.actions]:[gap:8px]
      [&_.actions]:[justify-content:center]
      [&_.action-btn]:[background:none]
      [&_.action-btn]:[border:none]
      [&_.action-btn]:[font-size:16px]
      [&_.action-btn]:[cursor:pointer]
      [&_.action-btn]:[padding:4px_8px]
      [&_.action-btn]:[border-radius:4px]
      [&_.action-btn]:[transition:all_0.2s_ease]
      [&_.action-btn:hover]:[background:#f0f0f0]
      [&_.action-btn.edit:hover]:[background:#e3f2fd]
      [&_.action-btn.delete:hover]:[background:#fee2e2]
      [&_.action-btn.toggle:hover]:[background:#f3e8ff]
      max-[768px]:[&_.um-header]:[flex-direction:column]
      max-[768px]:[&_.um-header]:[gap:16px]
      max-[768px]:[&_.um-stats]:[grid-template-columns:1fr]
      max-[768px]:[&_.um-controls]:[flex-direction:column]
      max-[768px]:[&_.search-input]:[min-width:auto]
      max-[768px]:[&_.um-form]:[width:95%]
      max-[768px]:[&_.um-form]:[padding:24px]
      max-[768px]:[&_.form-row]:[grid-template-columns:1fr]
      max-[768px]:[&_.um-table]:[font-size:12px]
      max-[768px]:[&_.um-table_th]:[padding:10px_8px]
      max-[768px]:[&_.um-table_td]:[padding:10px_8px]
      max-[768px]:[&_.actions]:[flex-direction:column]
      [.ain-app.theme-dark_&]:[color:#f3f4f6]
      [.ain-app.theme-dark_&]:[background:transparent]
      [.ain-app.theme-dark_&_.um-header_h1]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.um-form_h2]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.stat-value]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.um-table_.user-name]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.um-header_p]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.stat-label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.um-table_th]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.um-table_td]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.form-group_label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.ain-app.theme-dark_.user-management_.um-form]:[background:#1f2937]
      [.ain-app.theme-dark_&_.ain-app.theme-dark_.user-management_.um-form]:[border-color:#374151]
      [.ain-app.theme-dark_&_.um-table-container]:[background:#1f2937]
      [.ain-app.theme-dark_&_.um-table-container]:[border-color:#374151]
      [.ain-app.theme-dark_&_.stat-card_.stat-value]:[color:#273449]!
      [.ain-app.theme-dark_&_.stat-card_.stat-label]:[color:#273449]!
      [.ain-app.theme-dark_&_.um-table_thead]:[background:#273449]
      [.ain-app.theme-dark_&_.um-table_thead]:[border-color:#374151]
      [.ain-app.theme-dark_&_.um-table_td]:[border-color:#374151]
      [.ain-app.theme-dark_&_.um-table_tbody_tr:hover]:[background:#273449]
      [.ain-app.theme-dark_&_.search-input]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.search-input]:[background:#111827]
      [.ain-app.theme-dark_&_.search-input]:[border-color:#374151]
      [.ain-app.theme-dark_&_.filter-select]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.filter-select]:[background:#111827]
      [.ain-app.theme-dark_&_.filter-select]:[border-color:#374151]
      [.ain-app.theme-dark_&_.form-group_input]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_input]:[background:#111827]
      [.ain-app.theme-dark_&_.form-group_input]:[border-color:#374151]
      [.ain-app.theme-dark_&_.form-group_select]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.form-group_select]:[background:#111827]
      [.ain-app.theme-dark_&_.form-group_select]:[border-color:#374151]
      [.ain-app.theme-dark_&_.search-input::placeholder]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.btn-secondary]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.btn-secondary]:[background:#374151]
      [.ain-app.theme-dark_&_.btn-secondary]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.btn-secondary:hover]:[background:#4b5563]
      [.ain-app.theme-dark_&_.action-btn:hover]:[background:#374151]`}>
      <div className="um-header">
        <div>
          <h1 className="break-words !text-xl !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">User Management</h1>
          <p className="mb-4  font-normal !text-slate-500 text-[15px]  sm:mb-5  !dark:text-slate-400">
            Manage and monitor user accounts
          </p>
        </div>
        <button className="btn-primary" onClick={handleAddUser}>
          + Add New User
        </button>
      </div>

      <div className="um-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.adminUsers}</div>
          <div className="stat-label">Admins</div>
        </div>
      </div>

      <div className="um-controls">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterRole}
          onChange={(e) =>
            setFilterRole(e.target.value as 'all' | User['role'])
          }
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="analyst">Analyst</option>
        </select>
      </div>

      {showForm && (
        <div className="um-form-container">
          <div className="um-form">
            <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as User['role'],
                    })
                  }
                >
                  <option value="user">User</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as User['status'],
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveUser}>Save User</button>
            </div>
          </div>
        </div>
      )}

      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>API Usage</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? '🟢' : '🔴'} {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>{(user.apiUsage / 1000).toFixed(1)}K</td>
                <td>{user.lastActive}</td>
                <td className="actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditUser(user)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className={`action-btn toggle ${user.status === 'active' ? 'active' : 'inactive'}`}
                    onClick={() => handleStatusToggle(user.id)}
                    title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {user.status === 'active' ? '⊙' : '⊗'}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminLayout>
  );
};

export default UserManagement;
