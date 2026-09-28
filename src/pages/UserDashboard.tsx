import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/UserDashboard.css";
import AiModelCard, {
    aiModels,
} from "../user/AiModelCard";
import ProfileCard from "../user/ProfileCard";
import UserHeader from "../user/UserHeader";
import UserSidebar from "../user/UserSidebar";
import AIModelsDashboard from "../user/AIModelsDashboard";
import { useDashboardTheme } from "../user/ThemeToggle";

function UserDashboard() {
    const { authResponse, logout } = useAuth();
    const { isDarkMode } = useDashboardTheme();
    const { pathname } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const showAIModelsDashboard = pathname === "/my-profile";
    const userName = authResponse?.username ?? "Alex Johnson";
    const firstName = userName.split(" ")[0];
    const availableModels = aiModels;
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredModels = normalizedSearchQuery
        ? availableModels.filter((model) =>
              [
                  model.name,
                  model.category,
                  model.description,
              ].some((field) =>
                  field.toLowerCase().includes(normalizedSearchQuery)
              )
          )
        : availableModels;

    return (
        <div
            className={`dashboard-container ${
                isDarkMode ? "theme-dark" : "theme-light"
            }`}
        >
            <UserSidebar
                userName={userName}
                onLogout={logout}
            />
            <main className="main-content">
                <UserHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className="content-wrapper">
                    {showAIModelsDashboard ? (
                        <AIModelsDashboard />
                    ) : (
                    <>
                    <section className="welcome-section mb-5">
                        <h2 className="welcome-title">
                            Welcome Back, {firstName}!
                        </h2>
                    </section>
                    <section className="my-details-section mb-5">
                        <h3 className="section-title">
                            My Details
                        </h3>

                        <div className="row">
                            <ProfileCard
                                label="account status"
                                value="Active"
                            />
                            <ProfileCard
                                label="joined"
                                value="October 2023"
                            />
                            <ProfileCard
                                label="last activity"
                                value="5 mins ago"
                            />
                        </div>
                    </section>
                    <section className="models-section">
                        <h2 className="section-title">
                            Karnataka AI Models
                        </h2>
                        <div className="row">
                            {filteredModels.map((model) => (
                                <AiModelCard
                                    key={model.category}
                                    model={model}
                                />
                            ))}
                        </div>
                    </section>
                    </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default UserDashboard;
