import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SetupProfile from "./pages/SetupProfile";
import SelectReason from "./pages/SelectReason";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/setup-profile" element={<ProtectedRoute element={<SetupProfile />} />} />
        <Route path="/select-reason" element={<ProtectedRoute element={<SelectReason />} />} />
        <Route path="/welcome" element={<ProtectedRoute element={<Welcome />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requiredRole="user" />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
