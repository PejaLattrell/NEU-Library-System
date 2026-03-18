import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SetupProfile from "./pages/SetupProfile";
import SelectReason from "./pages/SelectReason";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCRUD from "./pages/AdminCRUD";
import ProtectedRoute from "./components/ProtectedRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/setup-profile"
            element={<ProtectedRoute element={<SetupProfile />} />}
          />
          <Route
            path="/select-reason"
            element={<ProtectedRoute element={<SelectReason />} />}
          />
          <Route
            path="/welcome"
            element={<ProtectedRoute element={<Welcome />} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} requiredRole="user" />}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />}
          />
          <Route
            path="/admin/crud"
            element={<ProtectedRoute element={<AdminCRUD />} requiredRole="admin" />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
