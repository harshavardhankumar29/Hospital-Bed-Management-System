// frontend/src/pages/AddBed.jsx
import React, { useState, useEffect } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddBed() {
  const [form, setForm] = useState({
    bedNumber: "",
    ward: "",
    type: "General", // default
    status: "Available", // default
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // simple auth guard: only admins should reach this
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return navigate("/login");
    if (user.role !== "admin") {
      toast.error("Only admins can add beds");
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    if (!form.bedNumber.trim()) return toast.error("Bed number is required");
    if (!form.ward.trim()) return toast.error("Ward is required");

    try {
      setLoading(true);
      const payload = {
        bedNumber: form.bedNumber.trim(),
        ward: form.ward.trim(),
        type: form.type,
        status: form.status
      };

      const res = await API.post("/beds", payload);
      toast.success(`Bed ${res.data.bedNumber || res.data.bedNumber} created`);
      navigate("/");
    } catch (err) {
      console.error("AddBed error:", err);
      const msg = err?.message || err?.response?.data?.error || "Failed to add bed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Bed</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md border">
        <div>
          <label className="block text-sm font-medium mb-1">Bed Number</label>
          <input
            name="bedNumber"
            value={form.bedNumber}
            onChange={handleChange}
            placeholder="e.g., B101"
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ward</label>
          <input
            name="ward"
            value={form.ward}
            onChange={handleChange}
            placeholder="e.g., ICU, General, Emergency"
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded-lg">
            <option value="General">General</option>
            <option value="ICU">ICU</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded-lg">
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60">
            {loading ? "Creating..." : "Create Bed"}
          </button>

          <button type="button" onClick={() => navigate("/")} className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
