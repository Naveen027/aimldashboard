import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AiModelCard from "./AiModelCard";
import { aiModelCatalog } from "../data/aiModels";
import ProfileCard from "./ProfileCard";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import AIModelsDashboard from "./AIModelsDashboard";
import { useDashboardTheme } from "./ThemeToggle";

function UserDashboard() {
    const { authResponse, logout } = useAuth();
    const { isDarkMode } = useDashboardTheme();
    const { pathname } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const showAIModelsDashboard = pathname === "/my-profile";
    const userName = authResponse?.username ?? "Alex Johnson";
    const firstName = userName.split(" ")[0];
    const availableModels = aiModelCatalog;
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
            className={`relative isolate flex min-h-screen transition-[background-color,color] duration-[700ms] ${
                isDarkMode
                    ? "theme-dark bg-[#111827] text-[#f3f4f6]"
                    : "theme-light bg-[#f5f6fa] text-[#2c3e50]"
            }`}
        >
            <UserSidebar
                userName={userName}
                onLogout={logout}
            />
            <main className="relative z-[2] min-h-screen min-w-0 flex-1 bg-transparent ml-[260px] max-[991px]:ml-[240px] max-[767px]:ml-0">
                <UserHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <div className={`relative z-[2] p-[15px] text-inherit max-[992px]:p-6 max-[768px]:p-4 max-[576px]:p-3 ${isDarkMode ? "bg-[#111827]" : "bg-[#f5f6fa]"}`}>
                    {showAIModelsDashboard ? (
                        <AIModelsDashboard />
                    ) : (
                    <>
                    <section className="mb-2.5">
                        <h2 className="mb-0 text-[15px] font-semibold uppercase text-[#1ba098]">
                            Welcome Back, {firstName}!
                        </h2>
                    </section>
                    <section className="mb-2.5 hidden">
                        <h3 className={`mb-[13px] mt-5 text-[25px] font-bold max-[768px]:text-base max-[576px]:mb-3 max-[576px]:text-sm ${isDarkMode ? "text-[#f3f4f6]" : "text-[#2c3e50]"}`}>
                            My Details
                        </h3>

                        <div className="flex flex-wrap -mx-3">
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
                    <section>
                        <h2 className={`mb-[13px] mt-5 text-[25px] font-bold max-[768px]:text-xl max-[576px]:mb-3 max-[576px]:text-lg ${isDarkMode ? "text-[#f3f4f6]" : "text-[#1c2033]"}`}>
                            Karnataka AI Models
                        </h2>
                        <div className="flex flex-wrap -mx-3">
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
