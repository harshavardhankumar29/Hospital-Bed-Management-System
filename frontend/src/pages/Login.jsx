// src/pages/Login.jsx
import React, { useState } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      alert(err?.message || err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Staff Login</h1>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input required name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" onChange={handleChange} />
        <input required name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" onChange={handleChange} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
}
