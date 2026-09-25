import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/UserDashboard.css";
import AiModelCard, {
    aiModels,
    type AiModel,
} from "../user/AiModelCard";
import ProfileCard from "../user/ProfileCard";
import UserHeader from "../user/UserHeader";
import UserSidebar from "../user/UserSidebar";
import AIModelsDashboard from "../user/AIModelsDashboard";
import { useDashboardTheme } from "../user/ThemeToggle";

// Neural network node type
interface NetworkNode {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

// Generate neural network nodes
const generateNetworkNodes = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];
    for (let i = 0; i < 28; i++) {
        nodes.push({
            id: i,
            x: Math.random() * 1200,
            y: Math.random() * 800,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
        });
    }
    return nodes;
};

// Neural Network Background Component
function NeuralNetworkBackground({ isDarkMode }: { isDarkMode: boolean }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const nodesRef = useRef<NetworkNode[]>(generateNetworkNodes());
    const animationRef = useRef<number | undefined>(
        undefined
    );

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const animate = () => {
            const nodes = nodesRef.current;
            const width = 1200;
            const height = 800;

            // Update node positions
            nodes.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off walls
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                // Keep in bounds
                node.x = Math.max(0, Math.min(width, node.x));
                node.y = Math.max(0, Math.min(height, node.y));
            });

            // Clear SVG
            svg.innerHTML = "";

            // Define gradients
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            const gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
            gradient.setAttribute("id", "nodeGradient");
            gradient.innerHTML = isDarkMode
                ? '<stop offset="0%" style="stop-color:#64b5f6;stop-opacity:0.8" /><stop offset="100%" style="stop-color:#1ba098;stop-opacity:0.3" />'
                : '<stop offset="0%" style="stop-color:#1ba098;stop-opacity:0.7" /><stop offset="100%" style="stop-color:#1ba098;stop-opacity:0.2" />';
            defs.appendChild(gradient);
            svg.appendChild(defs);

            // Draw connections
            nodes.forEach((node, i) => {
                nodes.slice(i + 1).forEach((otherNode) => {
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 320) {
                        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        line.setAttribute("x1", String(node.x));
                        line.setAttribute("y1", String(node.y));
                        line.setAttribute("x2", String(otherNode.x));
                        line.setAttribute("y2", String(otherNode.y));
                        line.setAttribute(
                            "stroke",
                            isDarkMode ? "#67e8f9" : "#0f766e"
                        );
                        line.setAttribute("stroke-width", "2.4");
                        line.setAttribute(
                            "opacity",
                            String(0.8 * (1 - distance / 320))
                        );
                        svg.appendChild(line);
                    }
                });
            });

            // Draw nodes
            nodes.forEach((node) => {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", String(node.x));
                circle.setAttribute("cy", String(node.y));
                circle.setAttribute("r", "9");
                circle.setAttribute("fill", "url(#nodeGradient)");
                circle.setAttribute("opacity", "1");
                svg.appendChild(circle);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isDarkMode]);

    return (
        <svg
            ref={svgRef}
            className="neural-network-bg"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
        />
    );
}

function UserDashboard() {
    const { authResponse, logout } = useAuth();
    const { isDarkMode } = useDashboardTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [showAIModelsDashboard, setShowAIModelsDashboard] =
        useState(false);
    const userName = authResponse?.username ?? "Alex Johnson";
    const firstName = userName.split(" ")[0];
    const modelsUsed = Math.min(
        authResponse?.modelsUsed ?? 0,
        aiModels.length
    );
    const availableModels = (
        modelsUsed > 0
            ? aiModels.slice(0, modelsUsed)
            : aiModels
    ) as AiModel[];
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
            <NeuralNetworkBackground isDarkMode={isDarkMode} />
            <UserSidebar
                userName={userName}
                onLogout={logout}
                onProfileClick={() =>
                    setShowAIModelsDashboard(true)
                }
                onDashboardClick={() =>
                    setShowAIModelsDashboard(false)
                }
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
                                label="Account Status"
                                value="Active"
                            />
                            <ProfileCard
                                label="Joined"
                                value="October 2023"
                            />
                            <ProfileCard
                                label="Last Activity"
                                value="5 mins ago"
                            />
                        </div>
                        
                    </section>
                    <section className="models-section">
                        <h3 className="section-title">
                            Available AI Models
                        </h3>
                        <div className="row">
                            {filteredModels.map((model) => (
                                <AiModelCard
                                    key={model.name}
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
