// src/App.jsx
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Beds from "./pages/Beds";
import AdmitPatient from "./pages/AdmitPatient";
import AddBed from "./pages/AddBed";
import ManageBeds from "./pages/ManageBeds";
import Login from "./pages/Login";
import RegisterStaff from "./pages/RegisterStaff";

export default function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 flex gap-6 border-b items-center">
        <Link className="font-semibold hover:text-blue-600" to="/">
          Dashboard
        </Link>
        <Link className="font-semibold hover:text-blue-600" to="/admit">
          Admit Patient
        </Link>

        {/* admin-only links */}
        {user && user.role === "admin" && (
          <>
            <Link className="font-semibold hover:text-blue-600" to="/add-bed">
              Add Bed
            </Link>
            <Link
              className="font-semibold hover:text-blue-600"
              to="/manage-beds"
            >
              Manage Beds
            </Link>
            <Link
              className="font-semibold hover:text-blue-600"
              to="/register-staff"
            >
              Register Staff
            </Link>
          </>
        )}

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-gray-600">
                Hi, <span className="font-medium">{user.name}</span>{" "}
                <span className="text-xs text-gray-400">({user.role})</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="font-semibold" to="/login">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="py-6">
        <Routes>
          <Route path="/" element={<Beds />} />
          <Route path="/admit" element={<AdmitPatient />} />
          <Route path="/add-bed" element={<AddBed />} />
          <Route path="/manage-beds" element={<ManageBeds />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-staff" element={<RegisterStaff />} />
        </Routes>
      </main>
    </div>
  );
}
