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
import ApiKeys from "./pages/ApiKeys";
import Support from "./pages/Support";
import Billing from "./pages/Billing";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  GlobalThemeToggle,
  useDashboardTheme,
} from "./user/ThemeToggle";

function App() {
  const { isDarkMode } = useDashboardTheme();

  return (
    <div className={isDarkMode ? "theme-dark" : "theme-light"}>
      <GlobalThemeToggle />
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


          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/support" element={<Support />} />
            <Route path="/billing" element={<Billing />} />
          </Route>



          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>


      </BrowserRouter>
    </div>
  );
}

export default App;