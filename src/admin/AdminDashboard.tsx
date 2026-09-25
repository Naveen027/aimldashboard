import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../admin/admincss/AdminDashboard.css";
import UserHeader from "../user/UserHeader";

/**
 * AI Nexus — Admin Dashboard
 * Requires Bootstrap 5 CSS + JS to be loaded globally in your app
 * (e.g. import "bootstrap/dist/css/bootstrap.min.css" in your entry file),
 * and `recharts` to be installed (npm i recharts).
 */

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface UsageRow {
  id: number;
  name: string;
  initials: string;
  color: string;
  model: string;
  lastActivity: string;
  usage: string;
  usagePct: number;
}

const navItems: NavItem[] = [
  { label: "System Overview", icon: "bi-grid-1x2-fill", active: true },
  { label: "User Management", icon: "bi-person" },
  { label: "Model Control", icon: "bi-gear" },
  { label: "Billing Admin", icon: "bi-receipt" },
  { label: "Global Settings", icon: "bi-sliders" },
  { label: "System Logs", icon: "bi-file-earmark-text" },
];

const usageRows: UsageRow[] = [
  {
    id: 1,
    name: "Alex Johnson",
    initials: "AJ",
    color: "#f6c453",
    model: "GPT-4 (Text Generation)",
    lastActivity: "5 mins ago",
    usage: "270K",
    usagePct: 78,
  },
  {
    id: 2,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: "DALL-E 3",
    lastActivity: "3 minuts ago",
    usage: "1.51K",
    usagePct: 35,
  },
  {
    id: 3,
    name: "Mana Tuung",
    initials: "MT",
    color: "#8fd3c7",
    model: "DALL-E 3",
    lastActivity: "3 minuts ago",
    usage: "421K",
    usagePct: 55,
  },
  {
    id: 4,
    name: "Alex Johnson",
    initials: "AJ",
    color: "#f6c453",
    model: "GPT-4 (Text Generation)",
    lastActivity: "10 rours ago",
    usage: "270K",
    usagePct: 78,
  },
  {
    id: 5,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: "DALL-E 3",
    lastActivity: "5 monts ago",
    usage: "2.1M",
    usagePct: 95,
  },
  {
    id: 6,
    name: "Mia Wong",
    initials: "MW",
    color: "#f28fb0",
    model: "GPT-4 (Text Generation)",
    lastActivity: "14 minutes ago",
    usage: "470K",
    usagePct: 62,
  },
];

const chartData = [
  { name: "GPT-4", "GPT-4": 82, "DALL-E 3": 65, Whisper: 58 },
  { name: "DALL-E 3", "GPT-4": 45, "DALL-E 3": 88, Whisper: 70 },
  { name: "Whisper", "GPT-4": 60, "DALL-E 3": 78, Whisper: 92 },
];

const statCards = [
  {
    label: "Total Active Users",
    value: "14,235",
    icon: "bi-people-fill",
  },
  {
    label: "API Calls Today",
    value: "2.1M",
    icon: "bi-lightning-charge-fill",
  },
  {
    label: "Active Model Nodes",
    value: "42",
    icon: "bi-gear-fill",
  },
  {
    label: "System Health",
    value: "99.8%",
    icon: "bi-check-circle-fill",
    healthy: true,
  },
];

const AdminDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="ain-app d-flex">
      {/* Sidebar */}
      <aside className="ain-sidebar d-flex flex-column flex-shrink-0">
        <div className="ain-brand d-flex align-items-center gap-2">
          <span className="ain-brand-icon">
            <i className="bi bi-shield-fill-check" />
          </span>
          <span className="ain-brand-text">AI Nexus</span>
        </div>

        <nav className="ain-nav flex-grow-1">
          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li className="nav-item" key={item.label}>
                <a
                  href="#!"
                  className={`nav-link ain-nav-link d-flex align-items-center gap-2 ${
                    item.active ? "active" : ""
                  }`}
                >
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ain-sidebar-footer">
          <div className="d-flex align-items-center gap-2 ain-user-chip">
            <span className="ain-avatar-sm">AJ</span>
            <span className="ain-user-name">Sarah Chen (Admin)</span>
          </div>
          <a href="#!" className="ain-logout d-flex align-items-center gap-2">
            <span>Logout</span>
            <i className="bi bi-box-arrow-right" />
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="ain-main flex-grow-1">
        <UserHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="ain-topbar">
          <div className="ain-fade-in">
            <h3 className="ain-welcome mb-1">Welcome Admin, Sarah!</h3>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 ain-summary-header ain-fade-in ain-delay-1">
          <h5 className="mb-0 ain-section-title">System-wide Summary</h5>
          <span className="ain-alert-pill d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill" />
            System-wide notifications
          </span>
        </div>

        {/* Stat cards */}
        <div className="row g-3 ain-fade-in ain-delay-2">
          {statCards.map((card) => (
            <div className="col-12 col-sm-6 col-xl-3" key={card.label}>
              <div className="ain-card ain-stat-card">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="ain-stat-label">{card.label}</span>
                  <span
                    className={`ain-stat-icon ${
                      card.healthy ? "ain-stat-icon-success" : ""
                    }`}
                  >
                    <i className={`bi ${card.icon}`} />
                  </span>
                </div>
                <div className="ain-stat-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row: table + chart */}
        <div className="row g-3 ain-fade-in ain-delay-3">
          {/* User usage table */}
          <div className="col-12 col-xl-7">
            <div className="ain-card h-100">
              <h5 className="ain-section-title mb-3">User Usage Overview</h5>
              <div className="ain-card ain-table-card">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="ain-table-title">All Activity</span>
                  <button className="ain-filter-btn d-flex align-items-center gap-2">
                    <i className="bi bi-funnel" />
                    Filters
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table ain-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Current Model</th>
                        <th>Last Activity</th>
                        <th>API Usage</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {usageRows.map((row, idx) => (
                        <tr
                          key={row.id}
                          className="ain-row-in"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="ain-avatar-sm"
                                style={{ background: row.color }}
                              >
                                {row.initials}
                              </span>
                              <span className="ain-row-name">{row.name}</span>
                            </div>
                          </td>
                          <td className="ain-row-muted">{row.model}</td>
                          <td className="ain-row-muted">{row.lastActivity}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="ain-row-usage">{row.usage}</span>
                              <div className="ain-progress">
                                <div
                                  className="ain-progress-fill"
                                  style={{ width: `${row.usagePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <i className="bi bi-chevron-right ain-chevron" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Model performance chart */}
          <div className="col-12 col-xl-5">
            <div className="ain-card h-100">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <h5 className="ain-section-title mb-0">Model Performance</h5>
              </div>
              <div className="ain-card ain-chart-card h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="ain-table-title">Real-time metrics chart</span>
                  <i className="bi bi-three-dots ain-dots" />
                </div>

                <div className="row text-center mb-3 g-2">
                  <div className="col-4">
                    <div className="ain-metric-label">GPT-4</div>
                    <div className="ain-metric-value">48.3K</div>
                  </div>
                  <div className="col-4">
                    <div className="ain-metric-label">DALL-E 3</div>
                    <div className="ain-metric-value">2.1M</div>
                  </div>
                  <div className="col-4">
                    <div className="ain-metric-label">Whisper</div>
                    <div className="ain-metric-value">99.8%</div>
                  </div>
                </div>

                <div className="ain-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barGap={6}>
                      <CartesianGrid vertical={false} stroke="#eef0f4" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8a90a2", fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8a90a2", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #eef0f4",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      />
                      <Bar
                        dataKey="GPT-4"
                        fill="#5ec8d8"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="DALL-E 3"
                        fill="#8b7cf6"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                        animationBegin={120}
                      />
                      <Bar
                        dataKey="Whisper"
                        fill="#3fae6a"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                        animationBegin={240}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;