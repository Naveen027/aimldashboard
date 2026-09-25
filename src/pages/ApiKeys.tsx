import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../user/UserSidebar";
import UserHeader from "../user/UserHeader";
import { useDashboardTheme } from "../user/ThemeToggle";
import "../css/ApiKeys.css";

function ApiKeys() {
    const { authResponse, logout } = useAuth();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [revoked, setRevoked] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const apiKey = "ak_live_7f3c9d2a1b84";
    const userName = authResponse?.username ?? "User";
    const { isDarkMode } = useDashboardTheme();

    const handleCopy = async () => {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className={`dashboard-container api-page ${isDarkMode ? "theme-dark" : "theme-light"}`}>
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
                <div className="api-content container-fluid">
                    <div className="api-heading d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <p className="api-eyebrow">Developer settings</p>
                            <h2 className="mb-1">API Keys</h2>
                            <p className="text-secondary mb-0">
                                Manage credentials used to connect your applications to Karnataka Ai.
                            </p>
                        </div>
                        <button className="btn btn-primary" type="button">
                            <span aria-hidden="true">+</span> Create new key
                        </button>
                    </div>

                    <div className="row g-4 mt-2">
                        <div className="col-12 col-xl-8">
                            <section className="api-card card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div>
                                            <h5 className="card-title">Production key</h5>
                                            <p className="text-secondary small mb-0">
                                                Created for your primary application
                                            </p>
                                        </div>
                                        <span className={`badge ${revoked ? "text-bg-secondary" : "text-bg-success"}`}>
                                            {revoked ? "Revoked" : "Active"}
                                        </span>
                                    </div>
                                    <div className="api-key-value input-group mt-4">
                                        <input
                                            className="form-control"
                                            value={revoked ? "This key has been revoked" : apiKey}
                                            readOnly
                                            aria-label="API key"
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={handleCopy}
                                            disabled={revoked}
                                        >
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <small className="text-secondary">Last used today</small>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            type="button"
                                            onClick={() => setRevoked(true)}
                                            disabled={revoked}
                                        >
                                            Revoke key
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="col-12 col-xl-4">
                            <section className="api-card api-security-card card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h5 className="card-title">Keep your keys secure</h5>
                                    <p className="text-secondary small">
                                        Never expose an API key in browser code or commit it to source control.
                                    </p>
                                    <ul className="small text-secondary ps-3 mb-0">
                                        <li>Store keys in environment variables.</li>
                                        <li>Rotate keys regularly.</li>
                                        <li>Revoke compromised keys immediately.</li>
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ApiKeys;
