import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import { useAuth } from "./context/AuthContext";

function App() {
  const { authResponse, isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/user-dashboard"
          element={
            isAuthenticated &&
            authResponse?.role === "user" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated &&
            authResponse?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;