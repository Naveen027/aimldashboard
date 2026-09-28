import React from "react";
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
import AdminLayout from "./AdminLayout";
import { useAuth } from "../context/AuthContext";



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
  const { authResponse } = useAuth();
  const adminUsername = authResponse?.username || "Admin";

  return (
    <AdminLayout>
        <div className="ain-topbar">
          <div className="ain-fade-in">
            <h3 className="ain-welcome mb-1">
              Welcome, {adminUsername}!
            </h3>
          </div>
          <span className="ain-alert-pill d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill" />
            System-wide notifications
          </span>
        </div>

        <div className="ain-summary-header ain-fade-in ain-delay-1">
          <h2 className="mb-0 ain-section-title">System-wide Summary</h2>
        </div>

        {/* Stat cards */}
        <div className="row g-3 ain-stat-grid ain-fade-in ain-delay-2">
          {statCards.map((card) => (
            <div className="col-12 col-sm-6 col-xl-3 d-flex" key={card.label}>
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
        <div className="row g-3 align-items-stretch ain-dashboard-panels ain-fade-in ain-delay-3">
          {/* User usage table */}
          <div className="col-12 col-xl-7 d-flex">
            <div className="ain-card ain-panel-card">
              <h5 className="ain-section-title ain-panel-title">User Usage Overview</h5>
              <div className="ain-card ain-table-card ain-panel-content">
                <div className="d-flex align-items-center justify-content-between ain-table-toolbar">
                  <span className="ain-table-title">All Activity</span>
                  <button className="ain-filter-btn d-flex align-items-center gap-2">
                    <i className="bi bi-funnel" />
                    Filters
                  </button>
                </div>

                <div className="table-responsive ain-table-responsive">
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
          <div className="col-12 col-xl-5 d-flex">
            <div className="ain-card ain-panel-card">
              <h5 className="ain-section-title ain-panel-title">Model Performance</h5>
              <div className="ain-card ain-chart-card ain-panel-content">
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
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--ain-chart-grid)"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--ain-text-muted)", fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--ain-text-muted)", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--ain-chart-cursor)" }}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid var(--ain-border)",
                          backgroundColor: "var(--ain-surface)",
                          color: "var(--ain-text)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: 12,
                          paddingTop: 8,
                          color: "var(--ain-text)",
                        }}
                      />
                      <Bar
                        dataKey="GPT-4"
                        fill="#5ec8d8"
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="DALL-E 3"
                        fill="#8b7cf6"
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                        animationBegin={120}
                      />
                      <Bar
                        dataKey="Whisper"
                        fill="#3fae6a"
                        radius={[4, 4, 0, 0]}
                        barSize={18}
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
    </AdminLayout>
  );
};

export default AdminDashboard;