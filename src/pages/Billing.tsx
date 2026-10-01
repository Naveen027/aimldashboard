import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../user/UserSidebar";
import UserHeader from "../user/UserHeader";
import { useDashboardTheme } from "../user/ThemeToggle";
const invoices = [
    { date: "Sep 01, 2026", number: "INV-2026-09", amount: "₹4,690", status: "Paid" },
    { date: "Aug 01, 2026", number: "INV-2026-08", amount: "₹4,690", status: "Paid" },
    { date: "Jul 01, 2026", number: "INV-2026-07", amount: "₹4,690", status: "Paid" },
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
        pdf.text(`Generated on ₹{new Date().toLocaleDateString()}`, 20, 280);
        pdf.save(fileName);
    };

    const downloadStatement = () => {
        downloadPdf(
            "Billing statement",
            [
                `Account: ₹{userName}`,
                "Plan: Professional",
                "Billing period: September 2026",
                "Monthly subscription: ₹49.00",
                "Usage: 72 / 100 requests",
                "Amount paid: ₹4,690",
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
        <div className={`dashboard-container billing-page min-h-screen [--page-bg:#f5f7fb] ${isDarkMode ? "theme-dark bg-[#111827] text-[#f3f4f6] [&_.top-header]:!bg-[#1f2937] [&_.top-header]:!border-b-[#374151] [&_.top-header_.btn-notification]:!text-[#f3f4f6] [&_.top-header_.search-icon]:!text-[#c1c8d3] [&_.top-header_.search-input]:!border-[#374151] [&_.top-header_.search-input]:!bg-[#111827] [&_.top-header_.search-input]:!text-[#f3f4f6] [&_.top-header_.search-input::placeholder]:!text-[#c1c8d3] [&_.top-header_.theme-toggle]:!border-[#374151] [&_.top-header_.theme-toggle]:!bg-transparent [&_.top-header_.theme-toggle]:!text-[#f3f4f6] [&_.top-header_.theme-toggle:hover]:!bg-[#374151] [&_.top-header_.theme-toggle:focus]:!bg-[#374151]" : "theme-light [&_.top-header]:!bg-white [&_.top-header]:!border-b-[#e0e6ed] [&_.top-header_.btn-notification]:!text-[#2c3e50] [&_.top-header_.search-icon]:!text-[#5f6b7a] [&_.top-header_.search-input]:!border-[#e0e6ed] [&_.top-header_.search-input]:!bg-[#f5f6fa] [&_.top-header_.search-input]:!text-[#2c3e50] [&_.top-header_.search-input::placeholder]:!text-[#5f6b7a] [&_.top-header_.theme-toggle]:!border-[#e0e6ed] [&_.top-header_.theme-toggle]:!bg-transparent [&_.top-header_.theme-toggle]:!text-[#2c3e50] [&_.top-header_.theme-toggle:hover]:!bg-[#f5f6fa] [&_.top-header_.theme-toggle:focus]:!bg-[#f5f6fa]"}`}>
            <UserSidebar
                userName={userName}
                onLogout={handleLogout}
            />
            <main className="main-content min-h-screen min-w-0 flex-1 bg-transparent ml-[260px] max-[991px]:ml-[240px] max-[767px]:ml-0">
                <UserHeader  
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className={`billing-content container-fluid min-h-screen bg-transparent p-[15px] ${isDarkMode ? "[--page-bg:#111827]" : ""}`}>
                    <div className="billing-heading d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <p className="billing-eyebrow mb-2 text-[15px] font-semibold uppercase text-[#1ba098]">Account management</p>
                            <h2 className={`mb-1 text-[25px] font-bold ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>Billing</h2>
                            <p className={`text-secondary mb-0 ${isDarkMode ? "!text-[#c1c8d3]" : ""}`}>
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
                            <section className={`billing-card card h-100 rounded-[18px] border-0 shadow-sm ${isDarkMode ? "!bg-[#1f2937] !text-[#f3f4f6]" : ""}`}>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div>
                                            <span className="badge text-bg-primary mb-3">Current plan</span>
                                            <h4 className="mb-1">Professional</h4>
                                            <p className={`text-secondary mb-0 ${isDarkMode ? "!text-[#c1c8d3]" : ""}`}>
                                                Flexible tools for growing AI projects.
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <strong className={`billing-price text-[2rem] ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>₹4,690</strong>
                                            <span className={`text-secondary ${isDarkMode ? "!text-[#c1c8d3]" : ""}`}> / month</span>
                                        </div>
                                    </div>
                                    <hr className={isDarkMode ? "border-[#4b5563] opacity-100" : ""} />
                                    <div className="d-flex justify-content-between small mb-2">
                                        <span>Monthly model usage</span>
                                        <strong>72 / 100 requests</strong>
                                    </div>
                                    <div className={`progress ${isDarkMode ? "[--bs-progress-bg:#374151]" : ""}`} role="progressbar" aria-label="Monthly model usage" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}>
                                        <div className="progress-bar bg-success" style={{ width: "72%" }} />
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <small className={`text-secondary ${isDarkMode ? "!text-[#c1c8d3]" : ""}`}>Renews on October 1, 2026</small>
                                        <button className="btn btn-sm btn-outline-danger" type="button">
                                            Cancel plan
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="col-12 col-xl-4">
                            <section className={`billing-card payment-card card h-100 rounded-[18px] border-0 shadow-sm ${isDarkMode ? "!bg-[#1f2937] !text-[#f3f4f6]" : ""}`}>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className={`card-title mb-0 ${isDarkMode ? "text-[#f3f4f6]" : ""}`}>Payment method</h5>
                                        <span className={`payment-brand text-xs font-extrabold italic ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>VISA</span>
                                    </div>
                                    <p className="mb-1">•••• •••• •••• 4242</p>
                                    <p className={`small text-secondary mb-4 ${isDarkMode ? "!text-[#c1c8d3]" : ""}`}>Expires 08/28</p>
                                    <button className="btn btn-sm btn-outline-secondary" type="button">
                                        Update payment method
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>

                    <section className={`billing-card card mt-4 rounded-[18px] border-0 shadow-sm ${isDarkMode ? "!bg-[#1f2937] !text-[#f3f4f6]" : ""}`}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className={`card-title mb-0 ${isDarkMode ? "text-[#f3f4f6]" : ""}`}>Invoice history</h5>
                                <span className={`small text-secondary ${isDarkMode ? "!text-[#c1c8d3]" : ""}`}>Last 3 months</span>
                            </div>
                            <div className="table-responsive">
                                <table className={`table align-middle mb-0 ${isDarkMode ? "[--bs-table-bg:transparent] [--bs-table-color:#e5e7eb] [--bs-table-border-color:#374151] !bg-transparent !text-[#e5e7eb]" : ""}`}>
                                    <thead>
                                        <tr>
                                            <th className={isDarkMode ? "!text-[#c1c8d3] !bg-transparent !border-b-[#374151]" : "text-[0.78rem] font-semibold uppercase text-[#667085]"} scope="col">Date</th>
                                            <th className={isDarkMode ? "!text-[#c1c8d3] !bg-transparent !border-b-[#374151]" : "text-[0.78rem] font-semibold uppercase text-[#667085]"} scope="col">Invoice</th>
                                            <th className={isDarkMode ? "!text-[#c1c8d3] !bg-transparent !border-b-[#374151]" : "text-[0.78rem] font-semibold uppercase text-[#667085]"} scope="col">Amount</th>
                                            <th className={isDarkMode ? "!text-[#c1c8d3] !bg-transparent !border-b-[#374151]" : "text-[0.78rem] font-semibold uppercase text-[#667085]"} scope="col">Status</th>
                                            <th scope="col" className="text-end">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.number}>
                                                <td className={isDarkMode ? "!text-[#e5e7eb] !bg-transparent !border-b-[#374151]" : "text-[#344054]"}>{invoice.date}</td>
                                                <td className={isDarkMode ? "!text-[#e5e7eb] !bg-transparent !border-b-[#374151]" : "text-[#344054]"}>{invoice.number}</td>
                                                <td className={isDarkMode ? "!text-[#e5e7eb] !bg-transparent !border-b-[#374151]" : "text-[#344054]"}>{invoice.amount}</td>
                                                <td className={isDarkMode ? "!text-[#e5e7eb] !bg-transparent !border-b-[#374151]" : "text-[#344054]"}><span className="badge text-bg-success">{invoice.status}</span></td>
                                                <td className={`text-end ${isDarkMode ? "!text-[#e5e7eb] !bg-transparent !border-b-[#374151]" : "text-[#344054]"}`}>
                                                    <button
                                                        className={`btn btn-sm btn-link ${isDarkMode ? "!text-[#67e8f9]" : ""}`}
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
