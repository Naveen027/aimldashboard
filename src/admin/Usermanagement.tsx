import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import './admincss/Usermanagement.css';

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
    <div className="user-management">
      <div className="um-header">
        <div>
          <h1>User Management</h1>
          <p>Manage and monitor user accounts</p>
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
