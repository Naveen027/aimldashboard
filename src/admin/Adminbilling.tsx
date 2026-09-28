import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import './admincss/Adminbilling.css';

interface BillingData {
  period: string;
  totalCost: number;
  apiCalls: number;
  costPerCall: number;
  topUser: string;
  topModel: string;
}

interface UserBilling {
  userId: string;
  userName: string;
  email: string;
  apiCalls: number;
  totalCost: number;
  status: 'paid' | 'pending' | 'overdue';
  lastInvoice: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  itemCount: number;
}

const BillingAdmin: React.FC = () => {
  const [billingData] = useState<BillingData>({
    period: 'September 2024',
    totalCost: 2847.50,
    apiCalls: 5230000,
    costPerCall: 0.000544,
    topUser: 'Mia Wong',
    topModel: 'GPT-4',
  });

  const [userBillings] = useState<UserBilling[]>([
    {
      userId: '1',
      userName: 'Alex Johnson',
      email: 'alex.johnson@company.com',
      apiCalls: 270000,
      totalCost: 146.90,
      status: 'paid',
      lastInvoice: '2024-09-01',
    },
    {
      userId: '2',
      userName: 'Mia Wong',
      email: 'mia.wong@company.com',
      apiCalls: 1510000,
      totalCost: 821.45,
      status: 'paid',
      lastInvoice: '2024-09-01',
    },
    {
      userId: '3',
      userName: 'Mana Tuung',
      email: 'mana.tuung@company.com',
      apiCalls: 421000,
      totalCost: 228.93,
      status: 'pending',
      lastInvoice: '2024-09-05',
    },
    {
      userId: '4',
      userName: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      apiCalls: 1045000,
      totalCost: 568.45,
      status: 'paid',
      lastInvoice: '2024-09-01',
    },
    {
      userId: '5',
      userName: 'James Smith',
      email: 'james.smith@company.com',
      apiCalls: 984000,
      totalCost: 534.87,
      status: 'overdue',
      lastInvoice: '2024-08-15',
    },
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-0901',
      date: '2024-09-01',
      amount: 2847.50,
      status: 'paid',
      itemCount: 5,
    },
    {
      id: 'INV-2024-0802',
      date: '2024-08-01',
      amount: 2654.30,
      status: 'paid',
      itemCount: 5,
    },
    {
      id: 'INV-2024-0703',
      date: '2024-07-01',
      amount: 2421.75,
      status: 'paid',
      itemCount: 5,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const filteredUsers = userBillings.filter(u => filter === 'all' || u.status === filter);

  const paidRevenue = userBillings.filter(u => u.status === 'paid').reduce((sum, u) => sum + u.totalCost, 0);
  const pendingRevenue = userBillings.filter(u => u.status === 'pending').reduce((sum, u) => sum + u.totalCost, 0);
  const overdueRevenue = userBillings.filter(u => u.status === 'overdue').reduce((sum, u) => sum + u.totalCost, 0);

  const handleSendInvoice = (userId: string) => {
    alert(`Invoice sent to user ₹₹{userId}`);
  };

  const handleExportReport = () => {
    const csv = [
      ['User', 'Email', 'API Calls', 'Cost', 'Status'],
      ...userBillings.map(u => [u.userName, u.email, u.apiCalls, u.totalCost.toFixed(2), u.status])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-report-₹{new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
    <div className="billing-admin">
      <div className="ba-header">
        <div>
          <h1>Billing & Analytics</h1>
          <p>Revenue tracking and invoice management</p>
        </div>
        <button className="btn-primary" onClick={handleExportReport}>
          📊 Export Report
        </button>
      </div>

      <div className="ba-period">
        <h3>{billingData.period}</h3>
      </div>

      <div className="ba-overview">
        <div className="overview-card primary">
          <div className="card-label">Total Revenue</div>
          <div className="card-value">₹{billingData.totalCost.toFixed(2)}</div>
          <div className="card-meta">{billingData.apiCalls.toLocaleString()} API calls</div>
        </div>

        <div className="overview-card success">
          <div className="card-label">Paid</div>
          <div className="card-value">₹{paidRevenue.toFixed(2)}</div>
          <div className="card-meta">{userBillings.filter(u => u.status === 'paid').length} users</div>
        </div>

        <div className="overview-card warning">
          <div className="card-label">Pending</div>
          <div className="card-value">₹{pendingRevenue.toFixed(2)}</div>
          <div className="card-meta">{userBillings.filter(u => u.status === 'pending').length} users</div>
        </div>

        <div className="overview-card danger">
          <div className="card-label">Overdue</div>
          <div className="card-value">₹{overdueRevenue.toFixed(2)}</div>
          <div className="card-meta">{userBillings.filter(u => u.status === 'overdue').length} users</div>
        </div>
      </div>

      <div className="ba-section">
        <div className="section-header">
          <h2>User Billing Details</h2>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')
            }
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="billing-table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>API Calls</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Last Invoice</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.userId} className={`row-₹{user.status}`}>
                  <td className="user-name">{user.userName}</td>
                  <td>{user.email}</td>
                  <td className="api-calls">{user.apiCalls.toLocaleString()}</td>
                  <td className="cost">₹{user.totalCost.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ₹{user.status}`}>
                      {user.status === 'paid' && '✓'}
                      {user.status === 'pending' && '⏳'}
                      {user.status === 'overdue' && '⚠️'}
                      {' '}{user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td>{user.lastInvoice}</td>
                  <td className="actions">
                    <button 
                      className="action-btn send"
                      onClick={() => handleSendInvoice(user.userId)}
                      title="Send Invoice"
                    >
                      📧
                    </button>
                    <button 
                      className="action-btn view"
                      title="View Details"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ba-section">
        <h2>Recent Invoices</h2>
        <div className="invoices-grid">
          {invoices.map(invoice => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <div>
                  <h3>{invoice.id}</h3>
                  <p className="invoice-date">{invoice.date}</p>
                </div>
                <span className={`invoice-status ₹{invoice.status}`}>
                  {invoice.status === 'paid' && '✓'}
                  {invoice.status === 'sent' && '→'}
                  {invoice.status === 'draft' && '✎'}
                  {' '}{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>

              <div className="invoice-amount">
                <div className="label">Amount</div>
                <div className="value">₹{invoice.amount.toFixed(2)}</div>
              </div>

              <div className="invoice-meta">
                <small>{invoice.itemCount} line items</small>
              </div>

              <div className="invoice-actions">
                <button className="action-btn">📥 Download</button>
                <button className="action-btn">✉️ Send</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ba-section">
        <h2>Cost Breakdown</h2>
        <div className="cost-breakdown">
          <div className="breakdown-item">
            <div className="item-info">
              <span className="item-label">Cost per API Call</span>
              <span className="item-value">₹{billingData.costPerCall.toFixed(6)}</span>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="item-info">
              <span className="item-label">Top User</span>
              <span className="item-value">{billingData.topUser}</span>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="item-info">
              <span className="item-label">Top Model</span>
              <span className="item-value">{billingData.topModel}</span>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="item-info">
              <span className="item-label">Total API Calls</span>
              <span className="item-value">{(billingData.apiCalls / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default BillingAdmin;
