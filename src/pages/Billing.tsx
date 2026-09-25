import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../user/UserSidebar";
import UserHeader from "../user/UserHeader";
import { useDashboardTheme } from "../user/ThemeToggle";
import "../css/Billing.css";

const invoices = [
    { date: "Sep 01, 2026", number: "INV-2026-09", amount: "$49.00", status: "Paid" },
    { date: "Aug 01, 2026", number: "INV-2026-08", amount: "$49.00", status: "Paid" },
    { date: "Jul 01, 2026", number: "INV-2026-07", amount: "$49.00", status: "Paid" },
];

function Billing() {
    const { authResponse, logout } = useAuth();
    const navigate = useNavigate();
    const userName = authResponse?.username ?? "User";
    const [searchQuery, setSearchQuery] = useState("");
    const { isDarkMode } = useDashboardTheme();

    const downloadPdf = (
        title: string,
        lines: string[],
        fileName: string
    ) => {
        const pdf = new jsPDF();
        pdf.setFontSize(22);
        pdf.setTextColor(26, 41, 64);
        pdf.text("Karnataka Ai", 20, 24);
        pdf.setFontSize(16);
        pdf.text(title, 20, 38);
        pdf.setDrawColor(27, 160, 152);
        pdf.line(20, 44, 190, 44);
        pdf.setFontSize(11);
        pdf.setTextColor(52, 64, 84);
        lines.forEach((line, index) => {
            pdf.text(line, 20, 58 + index * 10);
        });
        pdf.setFontSize(9);
        pdf.setTextColor(102, 112, 133);
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);
        pdf.save(fileName);
    };

    const downloadStatement = () => {
        downloadPdf(
            "Billing statement",
            [
                `Account: ${userName}`,
                "Plan: Professional",
                "Billing period: September 2026",
                "Monthly subscription: $49.00",
                "Usage: 72 / 100 requests",
                "Amount paid: $49.00",
                "Status: Paid",
            ],
            "ai-nexus-billing-statement.pdf"
        );
    };

    const downloadInvoice = (invoice: (typeof invoices)[number]) => {
        downloadPdf(
            `Invoice ${invoice.number}`,
            [
                `Billed to: ${userName}`,
                `Invoice date: ${invoice.date}`,
                "Plan: Professional",
                `Amount: ${invoice.amount}`,
                `Payment status: ${invoice.status}`,
            ],
            `${invoice.number.toLowerCase()}.pdf`
        );
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className={`dashboard-container billing-page ${isDarkMode ? "theme-dark" : "theme-light"}`}>
            <UserSidebar
                userName={userName}
                onLogout={handleLogout}
                onProfileClick={() => navigate("/user-dashboard")}
                onDashboardClick={() => navigate("/user-dashboard")}
            />
            <main className="main-content">
                <UserHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className="billing-content container-fluid">
                    <div className="billing-heading d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <p className="billing-eyebrow">Account management</p>
                            <h2 className="mb-1">Billing</h2>
                            <p className="text-secondary mb-0">
                                Manage your subscription, usage, payment method, and invoices.
                            </p>
                        </div>
                        <button
                            className="btn btn-outline-primary"
                            type="button"
                            onClick={downloadStatement}
                        >
                            Download statement
                        </button>
                    </div>

                    <div className="row g-4 mt-2">
                        <div className="col-12 col-xl-8">
                            <section className="billing-card card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div>
                                            <span className="badge text-bg-primary mb-3">Current plan</span>
                                            <h4 className="mb-1">Professional</h4>
                                            <p className="text-secondary mb-0">
                                                Flexible tools for growing AI projects.
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <strong className="billing-price">$49</strong>
                                            <span className="text-secondary"> / month</span>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between small mb-2">
                                        <span>Monthly model usage</span>
                                        <strong>72 / 100 requests</strong>
                                    </div>
                                    <div className="progress" role="progressbar" aria-label="Monthly model usage" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                                        <div className="progress-bar bg-success" style={{ width: "72%" }} />
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <small className="text-secondary">Renews on October 1, 2026</small>
                                        <button className="btn btn-sm btn-outline-danger" type="button">
                                            Cancel plan
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="col-12 col-xl-4">
                            <section className="billing-card payment-card card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title mb-0">Payment method</h5>
                                        <span className="payment-brand">VISA</span>
                                    </div>
                                    <p className="mb-1">•••• •••• •••• 4242</p>
                                    <p className="small text-secondary mb-4">Expires 08/28</p>
                                    <button className="btn btn-sm btn-outline-secondary" type="button">
                                        Update payment method
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>

                    <section className="billing-card card border-0 shadow-sm mt-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Invoice history</h5>
                                <span className="small text-secondary">Last 3 months</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col">Date</th>
                                            <th scope="col">Invoice</th>
                                            <th scope="col">Amount</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.number}>
                                                <td>{invoice.date}</td>
                                                <td>{invoice.number}</td>
                                                <td>{invoice.amount}</td>
                                                <td><span className="badge text-bg-success">{invoice.status}</span></td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-link"
                                                        type="button"
                                                        onClick={() => downloadInvoice(invoice)}
                                                    >
                                                        Download PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Billing;
