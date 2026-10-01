import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./admin/AdminDashboard.tsx";
import Usermanagement from "./admin/Usermanagement";
import Modelcontrol from "./admin/Modelcontrol";
import Adminbilling from "./admin/Adminbilling";
import Globalsettings from "./admin/Globalsettings";
import Systemlogs from "./admin/Systemlogs";
import ApiKeys from "./pages/ApiKeys";
import Support from "./pages/Support";
import Billing from "./pages/Billing";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  useDashboardTheme,
} from "./user/ThemeToggle";

function App() {
  const { isDarkMode } = useDashboardTheme();

  return (
    <div className={isDarkMode ? "theme-dark" : "theme-light"}>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />


          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/my-profile" element={<UserDashboard />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/support" element={<Support />} />
            <Route path="/billing" element={<Billing />} />
          </Route>



          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/user-management" element={<Usermanagement />} />
            <Route path="/admin/model-control" element={<Modelcontrol />} />
            <Route path="/admin/billing" element={<Adminbilling />} />
            <Route path="/admin/global-settings" element={<Globalsettings />} />
            <Route path="/admin/system-logs" element={<Systemlogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>


      </BrowserRouter>
    </div>
  );
}

export default App;