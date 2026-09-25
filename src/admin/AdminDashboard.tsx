import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
    const { authResponse, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "32px",
                background: "#f5f7fb",
                color: "#1a2940",
            }}
        >
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    marginBottom: "32px",
                }}
            >
                <div>
                    <p style={{ color: "#1ba098", marginBottom: "8px" }}>
                        Karnataka Ai
                    </p>
                    <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
                    <p>
                        Welcome, {authResponse?.username ?? "Admin"}.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>
            <section className="row g-4">
                <div className="col-md-4">
                    <article className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h2 className="h5">Active Users</h2>
                            <strong className="fs-2">1,245</strong>
                            <p className="text-secondary mb-0">
                                Users currently using the platform
                            </p>
                        </div>
                    </article>
                </div>
                <div className="col-md-4">
                    <article className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h2 className="h5">API Requests</h2>
                            <strong className="fs-2">24.8K</strong>
                            <p className="text-secondary mb-0">
                                Requests processed today
                            </p>
                        </div>
                    </article>
                </div>
                <div className="col-md-4">
                    <article className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h2 className="h5">System Health</h2>
                            <strong className="fs-2 text-success">99.8%</strong>
                            <p className="text-secondary mb-0">
                                All services operating normally
                            </p>
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}

export default AdminDashboard;