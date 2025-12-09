// frontend/src/pages/RegisterStaff.jsx
import React, { useEffect, useState } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegisterStaff() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // admin-only guard
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Access denied — admin only");
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.password || form.password.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);
      // API will attach Authorization header via interceptor
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role || "staff",
      };
      const res = await API.post("/auth/register-staff", payload);

      // The register endpoint may return a token; but for admin-creating-staff we only need success.
      toast.success(`Created user: ${res.data.user?.email || payload.email}`);
      // clear form (keep role as staff)
      setForm({ name: "", email: "", password: "", role: "staff" });
    } catch (err) {
      console.error("register error", err);
      const msg = err?.message || err?.response?.data?.error || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register Staff</h1>
      <p className="text-sm text-gray-600 mb-4">Only admins should use this page to create staff accounts.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md border">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose "Admin" only for trusted users.</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Creating..." : "Create user"}
          </button>
          <button type="button" onClick={() => navigate("/")} className="flex-1 bg-gray-100 py-2 rounded hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
