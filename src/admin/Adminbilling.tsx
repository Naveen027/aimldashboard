import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { aiModelCatalog } from '../data/aiModels';
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
    topModel: aiModelCatalog[0].name,
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
    alert(`Invoice sent to user ${userId}`);
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
    <div className={`billing-admin
      [padding:0px]
      [background:#f5f5f5]
      [min-height:100vh]
      [&_.ba-header]:[display:flex]
      [&_.ba-header]:[justify-content:space-between]
      [&_.ba-header]:[align-items:flex-start]
      [&_.ba-header]:[margin-bottom:32px]
      [&_.ba-header_h1]:[font-size:25px]
      [&_.ba-header_h1]:[font-weight:700]
      [&_.ba-header_h1]:[color:#1a1a1a]
      [&_.ba-header_h1]:[margin:0_0_8px_0]
      [&_.ba-header_p]:[font-size:14px]
      [&_.ba-header_p]:[color:#666]
      [&_.ba-header_p]:[margin:0]
      [&_.btn-primary]:[padding:10px_20px]
      [&_.btn-primary]:[background:#667eea]
      [&_.btn-primary]:[color:white]
      [&_.btn-primary]:[border:none]
      [&_.btn-primary]:[border-radius:6px]
      [&_.btn-primary]:[font-size:14px]
      [&_.btn-primary]:[font-weight:500]
      [&_.btn-primary]:[cursor:pointer]
      [&_.btn-primary]:[transition:all_0.3s_ease]
      [&_.btn-primary:hover]:[background:#5568d3]
      [&_.btn-primary:hover]:[box-shadow:0_4px_12px_rgba(102,_126,_234,_0.3)]
      [&_.ba-period]:[margin-bottom:24px]
      [&_.ba-period_h3]:[font-size:16px]
      [&_.ba-period_h3]:[font-weight:500]
      [&_.ba-period_h3]:[color:#666]
      [&_.ba-period_h3]:[margin:0]
      [&_.ba-overview]:[display:grid]
      [&_.ba-overview]:[grid-template-columns:repeat(auto-fit,_minmax(250px,_1fr))]
      [&_.ba-overview]:[gap:16px]
      [&_.ba-overview]:[margin-bottom:32px]
      [&_.overview-card]:[padding:20px]
      [&_.overview-card]:[border-radius:8px]
      [&_.overview-card]:[color:white]
      [&_.overview-card]:[box-shadow:0_2px_8px_rgba(0,_0,_0,_0.1)]
      [&_.overview-card.primary]:[background:linear-gradient(135deg,_#667eea_0%,_#764ba2_100%)]
      [&_.overview-card.success]:[background:linear-gradient(135deg,_#fa8984_0%,_#8fd3f4_100%)]
      [&_.overview-card.warning]:[background:linear-gradient(135deg,_#fa709a_0%,_#fee140_100%)]
      [&_.overview-card.danger]:[background:linear-gradient(135deg,_#ff6b6b_0%,_#ee5a6f_100%)]
      [&_.card-label]:[font-size:12px]
      [&_.card-label]:[font-weight:600]
      [&_.card-label]:[text-transform:uppercase]
      [&_.card-label]:[letter-spacing:0.5px]
      [&_.card-label]:[opacity:0.85]
      [&_.card-label]:[margin-bottom:8px]
      [&_.card-value]:[font-size:28px]
      [&_.card-value]:[font-weight:700]
      [&_.card-value]:[margin-bottom:4px]
      [&_.card-meta]:[font-size:12px]
      [&_.card-meta]:[opacity:0.8]
      [&_.ba-section]:[margin-bottom:32px]
      [&_.ba-section_h2]:[font-size:20px]
      [&_.ba-section_h2]:[font-weight:600]
      [&_.ba-section_h2]:[color:#1a1a1a]
      [&_.ba-section_h2]:[margin:0_0_20px_0]
      [&_.section-header]:[display:flex]
      [&_.section-header]:[justify-content:space-between]
      [&_.section-header]:[align-items:center]
      [&_.section-header]:[margin-bottom:20px]
      [&_.section-header_h2]:[margin:0]
      [&_.filter-select]:[padding:8px_16px]
      [&_.filter-select]:[border:1px_solid_#ddd]
      [&_.filter-select]:[border-radius:6px]
      [&_.filter-select]:[background:white]
      [&_.filter-select]:[color:#333]
      [&_.filter-select]:[font-size:14px]
      [&_.filter-select]:[cursor:pointer]
      [&_.filter-select:focus]:[outline:none]
      [&_.filter-select:focus]:[border-color:#667eea]
      [&_.filter-select:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.billing-table-container]:[background:white]
      [&_.billing-table-container]:[border-radius:8px]
      [&_.billing-table-container]:[overflow:hidden]
      [&_.billing-table-container]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.billing-table]:[width:100%]
      [&_.billing-table]:[border-collapse:collapse]
      [&_.billing-table]:[font-size:14px]
      [&_.billing-table_thead]:[background:#f9f9f9]
      [&_.billing-table_thead]:[border-bottom:2px_solid_#e0e0e0]
      [&_.billing-table_th]:[padding:16px]
      [&_.billing-table_th]:[text-align:left]
      [&_.billing-table_th]:[font-weight:600]
      [&_.billing-table_th]:[color:#333]
      [&_.billing-table_th]:[text-transform:uppercase]
      [&_.billing-table_th]:[font-size:12px]
      [&_.billing-table_th]:[letter-spacing:0.5px]
      [&_.billing-table_td]:[padding:14px_16px]
      [&_.billing-table_td]:[border-bottom:1px_solid_#e8e8e8]
      [&_.billing-table_td]:[color:#555]
      [&_.billing-table_tbody_tr:hover]:[background:#fafafa]
      [&_.billing-table_.user-name]:[font-weight:500]
      [&_.billing-table_.user-name]:[color:#1a1a1a]
      [&_.billing-table_.api-calls]:[font-weight:600]
      [&_.billing-table_.api-calls]:[color:#1a1a1a]
      [&_.billing-table_.cost]:[font-weight:600]
      [&_.billing-table_.cost]:[color:#1a1a1a]
      [&_.status-badge]:[display:inline-block]
      [&_.status-badge]:[padding:6px_12px]
      [&_.status-badge]:[border-radius:20px]
      [&_.status-badge]:[font-size:12px]
      [&_.status-badge]:[font-weight:600]
      [&_.status-badge]:[text-transform:capitalize]
      [&_.status-badge.paid]:[background:#dcfce7]
      [&_.status-badge.paid]:[color:#166534]
      [&_.status-badge.pending]:[background:#fef3c7]
      [&_.status-badge.pending]:[color:#92400e]
      [&_.status-badge.overdue]:[background:#fee2e2]
      [&_.status-badge.overdue]:[color:#991b1b]
      [&_.actions]:[display:flex]
      [&_.actions]:[gap:8px]
      [&_.actions]:[justify-content:center]
      [&_.action-btn]:[background:none]
      [&_.action-btn]:[border:1px_solid_#ddd]
      [&_.action-btn]:[border-radius:4px]
      [&_.action-btn]:[padding:6px_8px]
      [&_.action-btn]:[font-size:14px]
      [&_.action-btn]:[cursor:pointer]
      [&_.action-btn]:[transition:all_0.2s_ease]
      [&_.action-btn]:[color:#666]
      [&_.action-btn:hover]:[background:#f0f0f0]
      [&_.action-btn:hover]:[border-color:#999]
      [&_.action-btn.send:hover]:[background:#e3f2fd]
      [&_.action-btn.send:hover]:[border-color:#1976d2]
      [&_.action-btn.send:hover]:[color:#1976d2]
      [&_.action-btn.view:hover]:[background:#f3e5f5]
      [&_.action-btn.view:hover]:[border-color:#7b1fa2]
      [&_.action-btn.view:hover]:[color:#7b1fa2]
      [&_.invoices-grid]:[display:grid]
      [&_.invoices-grid]:[grid-template-columns:repeat(auto-fill,_minmax(280px,_1fr))]
      [&_.invoices-grid]:[gap:20px]
      [&_.invoice-card]:[background:white]
      [&_.invoice-card]:[border-radius:8px]
      [&_.invoice-card]:[padding:20px]
      [&_.invoice-card]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.invoice-card]:[border:1px_solid_#e0e0e0]
      [&_.invoice-card]:[transition:all_0.3s_ease]
      [&_.invoice-card:hover]:[box-shadow:0_4px_12px_rgba(0,_0,_0,_0.1)]
      [&_.invoice-card:hover]:[border-color:#667eea]
      [&_.invoice-header]:[display:flex]
      [&_.invoice-header]:[justify-content:space-between]
      [&_.invoice-header]:[align-items:flex-start]
      [&_.invoice-header]:[margin-bottom:16px]
      [&_.invoice-header_h3]:[font-size:15px]
      [&_.invoice-header_h3]:[font-weight:600]
      [&_.invoice-header_h3]:[color:#1a1a1a]
      [&_.invoice-header_h3]:[margin:0_0_4px_0]
      [&_.invoice-date]:[font-size:12px]
      [&_.invoice-date]:[color:#888]
      [&_.invoice-date]:[margin:0]
      [&_.invoice-status]:[display:inline-block]
      [&_.invoice-status]:[padding:4px_10px]
      [&_.invoice-status]:[border-radius:4px]
      [&_.invoice-status]:[font-size:11px]
      [&_.invoice-status]:[font-weight:600]
      [&_.invoice-status]:[text-transform:uppercase]
      [&_.invoice-status.paid]:[background:#dcfce7]
      [&_.invoice-status.paid]:[color:#166534]
      [&_.invoice-status.sent]:[background:#dbeafe]
      [&_.invoice-status.sent]:[color:#1e40af]
      [&_.invoice-status.draft]:[background:#f0f0f0]
      [&_.invoice-status.draft]:[color:#555]
      [&_.invoice-amount]:[padding:12px_0]
      [&_.invoice-amount]:[border-top:1px_solid_#f0f0f0]
      [&_.invoice-amount]:[border-bottom:1px_solid_#f0f0f0]
      [&_.invoice-amount]:[margin-bottom:12px]
      [&_.invoice-amount_.label]:[font-size:12px]
      [&_.invoice-amount_.label]:[color:#888]
      [&_.invoice-amount_.label]:[text-transform:uppercase]
      [&_.invoice-amount_.label]:[letter-spacing:0.3px]
      [&_.invoice-amount_.label]:[margin-bottom:4px]
      [&_.invoice-amount_.value]:[font-size:22px]
      [&_.invoice-amount_.value]:[font-weight:700]
      [&_.invoice-amount_.value]:[color:#1a1a1a]
      [&_.invoice-meta]:[font-size:12px]
      [&_.invoice-meta]:[color:#999]
      [&_.invoice-meta]:[margin-bottom:12px]
      [&_.invoice-actions]:[display:flex]
      [&_.invoice-actions]:[gap:8px]
      [&_.invoice-actions_.action-btn]:[flex:1]
      [&_.invoice-actions_.action-btn]:[padding:8px_10px]
      [&_.invoice-actions_.action-btn]:[font-size:12px]
      [&_.invoice-actions_.action-btn]:[text-align:center]
      [&_.invoice-actions_.action-btn]:[border:1px_solid_#ddd]
      [&_.invoice-actions_.action-btn]:[background:#f9f9f9]
      [&_.invoice-actions_.action-btn]:[color:#333]
      [&_.invoice-actions_.action-btn]:[border-radius:4px]
      [&_.invoice-actions_.action-btn]:[cursor:pointer]
      [&_.invoice-actions_.action-btn]:[transition:all_0.2s_ease]
      [&_.invoice-actions_.action-btn:hover]:[background:#f0f0f0]
      [&_.invoice-actions_.action-btn:hover]:[border-color:#999]
      [&_.cost-breakdown]:[display:grid]
      [&_.cost-breakdown]:[grid-template-columns:repeat(auto-fit,_minmax(240px,_1fr))]
      [&_.cost-breakdown]:[gap:16px]
      [&_.cost-breakdown]:[background:white]
      [&_.cost-breakdown]:[border-radius:8px]
      [&_.cost-breakdown]:[padding:20px]
      [&_.cost-breakdown]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.breakdown-item]:[padding:16px]
      [&_.breakdown-item]:[border:1px_solid_#e0e0e0]
      [&_.breakdown-item]:[border-radius:6px]
      [&_.breakdown-item]:[transition:all_0.2s_ease]
      [&_.breakdown-item:hover]:[border-color:#667eea]
      [&_.breakdown-item:hover]:[box-shadow:0_2px_8px_rgba(102,_126,_234,_0.1)]
      [&_.item-info]:[display:flex]
      [&_.item-info]:[flex-direction:column]
      [&_.item-info]:[gap:8px]
      [&_.item-label]:[font-size:12px]
      [&_.item-label]:[color:#888]
      [&_.item-label]:[text-transform:uppercase]
      [&_.item-label]:[letter-spacing:0.3px]
      [&_.item-label]:[font-weight:500]
      [&_.item-value]:[font-size:18px]
      [&_.item-value]:[font-weight:700]
      [&_.item-value]:[color:#1a1a1a]
      [&_.billing-table_.row-paid]:[background:rgba(220,_252,_231,_0.3)]
      [&_.billing-table_.row-pending]:[background:rgba(254,_243,_199,_0.3)]
      [&_.billing-table_.row-overdue]:[background:rgba(254,_226,_226,_0.3)]
      max-[768px]:[&_.ba-header]:[flex-direction:column]
      max-[768px]:[&_.ba-header]:[gap:16px]
      max-[768px]:[&_.ba-overview]:[grid-template-columns:1fr]
      max-[768px]:[&_.section-header]:[flex-direction:column]
      max-[768px]:[&_.section-header]:[gap:12px]
      max-[768px]:[&_.section-header]:[align-items:flex-start]
      max-[768px]:[&_.section-header_.filter-select]:[width:100%]
      max-[768px]:[&_.billing-table]:[font-size:12px]
      max-[768px]:[&_.billing-table_th]:[padding:10px_8px]
      max-[768px]:[&_.billing-table_td]:[padding:10px_8px]
      max-[768px]:[&_.invoices-grid]:[grid-template-columns:1fr]
      max-[768px]:[&_.cost-breakdown]:[grid-template-columns:1fr]
      max-[768px]:[&_.actions]:[flex-direction:column]
      [.ain-app.theme-dark_&]:[color:#f3f4f6]
      [.ain-app.theme-dark_&]:[background:transparent]
      [.ain-app.theme-dark_&_.ba-header_h1]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.ba-section_h2]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.invoice-header_h3]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.invoice-amount_.value]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.item-value]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.billing-table_.user-name]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.billing-table_.api-calls]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.billing-table_.cost]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.ba-header_p]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.ba-period_h3]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.billing-table_td]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.billing-table_th]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.invoice-date]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.invoice-amount_.label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.invoice-meta]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.item-label]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.billing-table-container]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.billing-table-container]:[background:#1f2937]
      [.ain-app.theme-dark_&_.billing-table-container]:[border-color:#374151]
      [.ain-app.theme-dark_&_.invoice-card]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.invoice-card]:[background:#1f2937]
      [.ain-app.theme-dark_&_.invoice-card]:[border-color:#374151]
      [.ain-app.theme-dark_&_.cost-breakdown]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.cost-breakdown]:[background:#1f2937]
      [.ain-app.theme-dark_&_.cost-breakdown]:[border-color:#374151]
      [.ain-app.theme-dark_&_.billing-table]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.billing-table_thead]:[background:#273449]
      [.ain-app.theme-dark_&_.billing-table_thead]:[border-color:#374151]
      [.ain-app.theme-dark_&_.billing-table_td]:[border-color:#374151]
      [.ain-app.theme-dark_&_.billing-table_tbody_tr:hover]:[background:#273449]
      [.ain-app.theme-dark_&_.breakdown-item]:[border-color:#374151]
      [.ain-app.theme-dark_&_.action-btn]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.action-btn]:[background:#111827]
      [.ain-app.theme-dark_&_.action-btn]:[border-color:#374151]
      [.ain-app.theme-dark_&_.invoice-actions_.action-btn]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.invoice-actions_.action-btn]:[background:#111827]
      [.ain-app.theme-dark_&_.invoice-actions_.action-btn]:[border-color:#374151]
      [.ain-app.theme-dark_&_.filter-select]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.filter-select]:[background:#111827]
      [.ain-app.theme-dark_&_.filter-select]:[border-color:#374151]
      [.ain-app.theme-dark_&_.action-btn:hover]:[background:#273449]
      [.ain-app.theme-dark_&_.action-btn:hover]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.invoice-actions_.action-btn:hover]:[background:#273449]
      [.ain-app.theme-dark_&_.invoice-actions_.action-btn:hover]:[border-color:#4b5563]
      max-[768px]:[&_.invoice-actions]:[flex-direction:column]
      max-[768px]:[&_.invoice-actions_.action-btn]:[width:100%]`}>
      <div className="ba-header">
        <div>
          <h2 className="break-words !text-xl !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">
            Billing & Analytics
          </h2>
          <p className="mb-4  font-normal !text-slate-500 text-[15px]  sm:mb-5  !dark:text-slate-400">
            Revenue tracking and invoice management
          </p>
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
