import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { authResponse, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {authResponse?.username}</h1>

      <h2>User Details</h2>

      <p>Username: {authResponse?.username}</p>
      <p>Email: {authResponse?.gmail ?? "Not provided"}</p>
      <p>Phone: {authResponse?.phone ?? "Not provided"}</p>

      <h2>AI Usage</h2>

      <p>Models Used: {authResponse?.modelsUsed ?? 0}</p>
      <p>Total Usage: {authResponse?.totalUsage ?? 0}</p>

      <button type="button" onClick={logout}>
        Log out
      </button>
    </div>
  );
}

export default UserDashboard;