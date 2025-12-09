// src/components/TransferModal.jsx
import React, { useEffect, useState } from "react";
import { API } from "../api/api";

export default function TransferModal({ patientId, onClose, onSuccess }) {
  const [targetWard, setTargetWard] = useState("");
  const [targetType, setTargetType] = useState("");
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableBeds = async () => {
    try {
      const res = await API.get("/beds");
      const available = res.data.filter(b => b.status === "Available");
      setAvailableBeds(available);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAvailableBeds();
  }, []);

  const handleTransfer = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const body = {};
      if (targetWard) body.targetWard = targetWard;
      if (targetType) body.targetType = targetType;

      const res = await API.put(`/patients/transfer/${patientId}`, body);
      alert("Transferred to bed " + (res.data.newBed?.bedNumber || ""));
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error("transfer error", err);
      alert(err.message || err?.response?.data?.error || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold mb-3">Transfer Patient</h3>
        <p className="text-sm text-gray-600 mb-4">Patient ID: <span className="font-medium">{patientId}</span></p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Target Ward (optional)</label>
            <input value={targetWard} onChange={(e)=>setTargetWard(e.target.value)} placeholder="ICU or General" className="w-full border p-2 rounded-md" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Target Type (optional)</label>
            <input value={targetType} onChange={(e)=>setTargetType(e.target.value)} placeholder="ICU or General" className="w-full border p-2 rounded-md" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Or pick an available bed</label>
            <select className="w-full border p-2 rounded-md" onChange={(e) => {
              const v = e.target.value;
              if (!v) { setTargetWard(""); setTargetType(""); }
              else {
                const [ward, type] = v.split("||");
                setTargetWard(ward); setTargetType(type);
              }
            }}>
              <option value="">— select bed —</option>
              {availableBeds.map(b => (
                <option key={b._id} value={`${b.ward}||${b.type}`}>
                  {b.bedNumber} — {b.ward} • {b.type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={handleTransfer} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            {loading ? "Transferring..." : "Transfer"}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200">Cancel</button>
        </div>
      </div>
    </div>
  );
}
