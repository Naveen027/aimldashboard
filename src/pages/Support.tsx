import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../user/UserSidebar";
import UserHeader from "../user/UserHeader";
import { useDashboardTheme } from "../user/ThemeToggle";
import "../css/Support.css";

function Support() {
    const { authResponse, logout } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const userName = authResponse?.username ?? "User";
    const { isDarkMode } = useDashboardTheme();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className={`dashboard-container support-page ${isDarkMode ? "theme-dark" : "theme-light"}`}>
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
                <div className="support-content container-fluid">
                    <div className="support-heading d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <p className="support-eyebrow">We are here to help</p>
                            <h2 className="mb-1">Support center</h2>
                            <p className="text-secondary mb-0">
                                Find answers or send our team a message.
                            </p>
                        </div>
                    </div>
                    <div className="row g-4 mt-2">
                        <div className="col-12 col-lg-5">
                            <div className="support-options row g-3">
                                <div className="col-12 col-sm-6 col-lg-12">
                                    <div className="support-option card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <span className="support-icon">?</span>
                                            <h5>Help center</h5>
                                            <p className="small text-secondary mb-0">
                                                Browse setup guides and common answers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-lg-12">
                                    <div className="support-option card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <span className="support-icon">@</span>
                                            <h5>Contact support</h5>
                                            <p className="small text-secondary mb-0">
                                                Our team usually responds within one business day.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-7">
                            <form className="support-form card border-0 shadow-sm" onSubmit={handleSubmit}>
                                <div className="card-body p-4">
                                    <h5 className="card-title">Send us a message</h5>
                                    {submitted && (
                                        <div className="alert alert-success" role="status">
                                            Thanks! Your support request has been received.
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="support-subject">Subject</label>
                                        <input id="support-subject" className="form-control" required placeholder="How can we help?" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="support-message">Message</label>
                                        <textarea id="support-message" className="form-control" rows={5} required placeholder="Describe your question or issue" />
                                    </div>
                                    <button className="btn btn-primary" type="submit">Send request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Support;
