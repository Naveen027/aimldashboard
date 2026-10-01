import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../user/UserSidebar";
import UserHeader from "../user/UserHeader";
import { useDashboardTheme } from "../user/ThemeToggle";
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
        <div className={`dashboard-container support-page min-h-screen [--page-bg:#f5f7fb] ${isDarkMode ? "theme-dark [--page-bg:#111827]" : "theme-light"}`}>
            <UserSidebar
                userName={userName}
                onLogout={handleLogout}
            />
            <main className="main-content min-h-screen min-w-0 flex-1 bg-transparent ml-[260px] max-[991px]:ml-[240px] max-[767px]:ml-0">
                <UserHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className={`support-content container-fluid min-h-screen bg-transparent p-[15px] ${isDarkMode ? "[--page-bg:#111827]" : ""}`}>
                    <div className="support-heading d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <p className="support-eyebrow mb-2 text-[15px] font-semibold uppercase text-[#1ba098]">We are here to help</p>
                            <h2 className={`mb-1 text-[25px] font-bold ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>Support center</h2>
                            <p className="text-secondary mb-0">
                                Find answers or send our team a message.
                            </p>
                        </div>
                    </div>
                    <div className="row g-4 mt-2">
                        <div className="col-12 col-lg-5">
                            <div className="support-options row g-3">
                                <div className="col-12 col-sm-6 col-lg-12">
                                    <div className={`support-option card h-100 rounded-[18px] border-0 shadow-sm transition-[transform,box-shadow] duration-[250ms] ease-[ease] hover:-translate-y-[3px] ${isDarkMode ? "!bg-[#1f2937]" : ""}`}>
                                        <div className="card-body">
                                            <span className="support-icon mb-4 inline-flex size-[42px] items-center justify-center rounded-xl bg-[rgba(27,160,152,0.12)] text-xl font-bold text-[#1ba098]">?</span>
                                            <h5 className={`font-bold ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>Help center</h5>
                                            <p className="small text-secondary mb-0">
                                                Browse setup guides and common answers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-lg-12">
                                    <div className={`support-option card h-100 rounded-[18px] border-0 shadow-sm transition-[transform,box-shadow] duration-[250ms] ease-[ease] hover:-translate-y-[3px] ${isDarkMode ? "!bg-[#1f2937]" : ""}`}>
                                        <div className="card-body">
                                            <span className="support-icon mb-4 inline-flex size-[42px] items-center justify-center rounded-xl bg-[rgba(27,160,152,0.12)] text-xl font-bold text-[#1ba098]">@</span>
                                            <h5 className={`font-bold ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>Contact support</h5>
                                            <p className="small text-secondary mb-0">
                                                Our team usually responds within one business day.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-7">
                            <form className={`support-form card rounded-[18px] border-0 shadow-sm ${isDarkMode ? "!bg-[#1f2937]" : ""}`} onSubmit={handleSubmit}>
                                <div className="card-body p-4">
                                    <h5 className={`card-title font-bold ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1a2940]"}`}>Send us a message</h5>
                                    {submitted && (
                                        <div className="alert alert-success" role="status">
                                            Thanks! Your support request has been received.
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="support-subject">Subject</label>
                                        <input id="support-subject" className={`form-control ${isDarkMode ? "border-[#374151] bg-[#111827] text-[#f3f4f6] placeholder:text-[#9ca3af]" : ""}`} required placeholder="How can we help?" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="support-message">Message</label>
                                        <textarea id="support-message" className={`form-control ${isDarkMode ? "border-[#374151] bg-[#111827] text-[#f3f4f6] placeholder:text-[#9ca3af]" : ""}`} rows={5} required placeholder="Describe your question or issue" />
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
