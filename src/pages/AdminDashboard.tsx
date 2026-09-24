import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
    const { logout } = useAuth();

    return (
        <main>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin dashboard.</p>
            <button type="button" onClick={logout}>
                Log out
            </button>
        </main>
    );
}

export default AdminDashboard;
