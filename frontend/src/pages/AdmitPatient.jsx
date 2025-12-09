// frontend/src/pages/AdmitPatient.jsx
import React, { useState, useEffect } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdmitPatient() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    disease: "",
    preferredWard: "",
    preferredType: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.name.trim()) return setErrorMsg("Name is required");
    if (!form.age || Number(form.age) <= 0) return setErrorMsg("Enter a valid age");

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        disease: form.disease ? form.disease.trim() : undefined,
        preferredWard: form.preferredWard ? form.preferredWard.trim() : undefined,
        preferredType: form.preferredType ? form.preferredType.trim() : undefined
      };

      const res = await API.post("/patients/admit", payload);
      const bedNumber = res?.data?.bed?.bedNumber || "unknown";
      toast.success(`Admitted — Bed: ${bedNumber}`);
      setForm({ name: "", age: "", disease: "", preferredWard: "", preferredType: "" });
      navigate("/");
    } catch (err) {
      const msg = err?.message || err?.response?.data?.error || "Failed to admit patient";
      console.error("Admit error:", err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admit Patient</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md border">
        <div>
          <label className="block text-sm font-medium mb-1">Patient Name</label>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            required
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full border p-2 rounded-lg"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Disease / Notes</label>
          <input
            name="disease"
            value={form.disease}
            onChange={handleChange}
            placeholder="e.g., Fever"
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Ward (optional)</label>
          <input
            name="preferredWard"
            value={form.preferredWard}
            onChange={handleChange}
            placeholder="ICU or General"
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Type (optional)</label>
          <input
            name="preferredType"
            value={form.preferredType}
            onChange={handleChange}
            placeholder="ICU / General"
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Admitting..." : "Admit Patient"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
