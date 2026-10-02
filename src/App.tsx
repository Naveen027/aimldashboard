import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import {
  useDashboardTheme,
} from "./user/ThemeToggle";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const Usermanagement = lazy(() => import("./admin/Usermanagement"));
const Modelcontrol = lazy(() => import("./admin/Modelcontrol"));
const Adminbilling = lazy(() => import("./admin/Adminbilling"));
const Globalsettings = lazy(() => import("./admin/Globalsettings"));
const Systemlogs = lazy(() => import("./admin/Systemlogs"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const Support = lazy(() => import("./pages/Support"));
const Billing = lazy(() => import("./pages/Billing"));

function App() {
  const { isDarkMode } = useDashboardTheme();

  return (
    <div className={isDarkMode ? "theme-dark" : "theme-light"}>
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-300">
            Loading...
          </div>
        }
      >
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
      </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;