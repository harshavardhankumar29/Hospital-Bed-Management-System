// frontend/src/pages/Dashboard.jsx
// Dashboard page (matches user's screenshot layout)
// Reference image: /mnt/data/Screenshot 2025-11-24 at 11.39.28 AM.png

import React, { useEffect, useState, useRef } from "react";
import { API } from "../api/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Beds() {
  const [beds, setBeds] = useState([]); // all beds (populated with patient)
  const [loading, setLoading] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [statusFilter, setStatusFilter] = useState({
    Available: true,
    Occupied: true,
    Maintenance: false,
    "Out of Service": false,
  });
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [wards, setWards] = useState([]); // derived ward list
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // calculate summary counts
  const totals = {
    total: beds.length,
    available: beds.filter(b => b.status === "Available").length,
    occupied: beds.filter(b => b.status === "Occupied").length,
    maintenance: beds.filter(b => b.status === "Maintenance").length,
  };

  const backendBase = (import.meta.env.VITE_API_BASE || "http://localhost:5001/api").replace("/api", "");
  useEffect(() => {
    // connect socket
    if (!socketRef.current) {
      socketRef.current = io(backendBase);
    }
    const s = socketRef.current;
    s.on("beds:refresh", payload => {
      if (Array.isArray(payload)) {
        setBeds(payload);
      } else {
        loadBeds();
      }
    });
    s.on("patients:admitted", () => loadBeds());
    s.on("patients:discharged", () => loadBeds());
    s.on("patients:transferred", () => loadBeds());

    // initial load
    loadBeds();

    // cleanup
    return () => {
      s.off("beds:refresh");
      s.off("patients:admitted");
      s.off("patients:discharged");
      s.off("patients:transferred");
      // keep socket connected across pages (optional) so don't disconnect
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBeds() {
    try {
      setLoading(true);
      const res = await API.get("/beds");
      // ensure patient is populated (backend should do this). Fallback: map to object.
      const list = res.data || [];
      setBeds(list);
      // derive wards in order of occurrence
      const w = Array.from(new Set(list.map(b => b.ward || "General")));
      setWards(["All Wards", ...w]);
      // if selected bed id is stale, clear selection
      if (selectedBed) {
        const exists = list.find(b => (b._id === selectedBed._id));
        if (!exists) setSelectedBed(null);
      }
    } catch (err) {
      console.error("loadBeds error", err);
      toast.error("Failed to load beds");
    } finally {
      setLoading(false);
    }
  }

  // UI helpers
  const statusColors = {
    Available: "bg-green-100 text-green-800",
    Occupied: "bg-blue-50 text-blue-700",
    Maintenance: "bg-yellow-100 text-yellow-800",
    "Out of Service": "bg-red-100 text-red-800",
    Cleaning: "bg-yellow-100 text-yellow-800",
  };

  // filtering logic for displayed beds
  const groupedByWard = () => {
    const filtered = beds.filter(b => {
      if (!statusFilter[b.status]) return false;
      if (wardFilter && wardFilter !== "All Wards") {
        return (b.ward === wardFilter);
      }
      return true;
    });

    const groups = {};
    filtered.forEach(b => {
      const w = b.ward || "General";
      if (!groups[w]) groups[w] = [];
      groups[w].push(b);
    });

    // sort each group's beds by bedNumber for consistent UI
    Object.keys(groups).forEach(g => {
      groups[g].sort((a,b) => (a.bedNumber || "").localeCompare(b.bedNumber || ""));
    });

    return groups;
  };

  const handleSelectBed = (bed) => {
    setSelectedBed(bed);
  };

  const toggleStatusFilter = (name) => {
    setStatusFilter(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAddBedClick = () => {
    // admin-only route exists at /add-bed
    navigate("/add-bed");
  };

  const handleDischarge = async () => {
    if (!selectedBed || !selectedBed.patientId) return toast.error("No patient to discharge");
    if (!confirm(`Are you sure you want to discharge ${selectedBed.patientId.name || selectedBed.patientId}?`)) return;
    try {
      await API.delete(`/patients/discharge/${typeof selectedBed.patientId === "object" ? selectedBed.patientId._id : selectedBed.patientId}`);
      toast.success("Patient discharged");
      // backend emits beds:refresh; UI will update
    } catch (err) {
      console.error("discharge error", err);
      toast.error(err?.message || "Failed to discharge");
    }
  };

  const viewPatient = () => {
    if (!selectedBed || !selectedBed.patientId) return toast.error("No patient selected");
    const pid = typeof selectedBed.patientId === "object" ? selectedBed.patientId._id : selectedBed.patientId;
    navigate(`/patients/${pid}`); // ensure route exists or adjust
  };

  // small utility to render a status dot + label
  const StatusLabel = ({ status }) => {
    const cls = statusColors[status] || "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
        <span className="w-2 h-2 rounded-full mr-2" style={{
          background: status === "Available" ? "#34D399" : status === "Occupied" ? "#3B82F6" : status === "Maintenance" ? "#FBBF24" : "#F87171"
        }} />
        {status}
      </span>
    );
  };

  const groups = groupedByWard();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 text-white w-10 h-10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z"></path></svg>
            </div>
            <div>
              <div className="font-semibold">BedManager</div>
              <div className="text-xs text-gray-400">St. Jude's Hospital</div>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li className="bg-blue-50 rounded-lg">
              <Link to="/" className="flex items-center gap-3 p-3 text-sm text-blue-700 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M3 7h18M3 12h18M3 17h18"/></svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/wards" className="flex items-center gap-3 p-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M3 7h18M3 12h18M3 17h18"/></svg>
                Wards
              </Link>
            </li>
            <li>
              <Link to="/patients" className="flex items-center gap-3 p-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z"/></svg>
                Patients
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <img src="https://placehold.co/40x40" alt="user" className="w-10 h-10 rounded-full" />
            <div>
              <div className="text-sm font-medium">Dr. Emily Carter</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 p-6">
        {/* Header: Title & metrics */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500">Total Beds</div>
              <div className="text-3xl font-bold mt-2">{totals.total}</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Available</div>
              <div className="text-3xl font-bold mt-2">{totals.available}</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Occupied</div>
              <div className="text-3xl font-bold mt-2">{totals.occupied}</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Maintenance</div>
              <div className="text-3xl font-bold mt-2">{totals.maintenance}</div>
            </div>
          </div>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: bed lists (big column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bed Status Overview</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {wards.map(w => (
                    <button
                      key={w}
                      onClick={() => setWardFilter(w)}
                      className={`px-3 py-1 rounded-full text-sm ${wardFilter===w ? "bg-blue-600 text-white" : "bg-white border"}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>

                <button onClick={handleAddBedClick} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Bed</button>
              </div>
            </div>

            {/* Ward groups */}
            {loading && <div className="text-sm text-gray-500">Loading beds...</div>}

            {Object.keys(groups).length === 0 && !loading && (
              <div className="bg-white p-6 rounded-lg border text-gray-500">No beds found for the selected filters.</div>
            )}

            {Object.entries(groups).map(([wardName, bedsInWard]) => (
              <div key={wardName} className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">{wardName}</h3>

                <div className="space-y-3">
                  {bedsInWard.map(b => {
                    const isSelected = selectedBed && selectedBed._id === b._id;
                    // patient display
                    const patientObj = b.patientId;
                    const patientName = patientObj ? (typeof patientObj === "object" ? patientObj.name : patientObj) : null;

                    return (
                      <div
                        key={b._id}
                        onClick={() => handleSelectBed(b)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border ${isSelected ? "ring-2 ring-blue-300 bg-blue-50" : "bg-white hover:bg-gray-50"}`}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">{b.bedNumber}</div>
                            <div className="text-xs text-gray-500">
                              <StatusLabel status={b.status} />
                            </div>
                          </div>
                          {patientName && <div className="text-xs text-gray-600 mt-1">{patientName} <span className="text-gray-400 text-[11px]">ID: {patientObj && patientObj._id ? (patientObj._id).slice(0,8) : ""}</span></div>}
                        </div>

                        <div className="text-sm text-gray-500">{/* placeholder for actions or icons */}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right: filters and selected bed */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3">Filter by Status</h4>
              <div className="space-y-2">
                {Object.keys(statusFilter).map(key => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={statusFilter[key]} onChange={() => toggleStatusFilter(key)} />
                    <span className="ml-1">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3">Selected Bed: {selectedBed ? selectedBed.bedNumber : "—"}</h4>

              {selectedBed ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">Ward: <span className="font-medium"> {selectedBed.ward}</span></div>
                  <div className="text-sm text-gray-500">Status: <span className="font-medium"> {selectedBed.status}</span></div>
                  <div className="text-sm text-gray-500">Patient: <span className="font-medium">{selectedBed.patientId ? (typeof selectedBed.patientId === "object" ? selectedBed.patientId.name : selectedBed.patientId) : "—"}</span></div>
                  <div className="text-sm text-gray-500">Patient ID: <span className="font-medium">{selectedBed.patientId ? (typeof selectedBed.patientId === "object" ? selectedBed.patientId._id : selectedBed.patientId) : "—"}</span></div>

                  <div className="flex flex-col gap-2 mt-3">
                    <button onClick={viewPatient} className="w-full bg-blue-600 text-white py-2 rounded">View Patient Details</button>
                    <button onClick={handleDischarge} className="w-full bg-white border text-red-600 py-2 rounded">Discharge Patient</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Select a bed to see details and actions.</div>
              )}
            </div>

            {/* small help / stats card */}
            <div className="bg-white p-4 rounded-lg border text-sm text-gray-600">
              <div className="font-semibold mb-2">Quick Stats</div>
              <div>Total: {totals.total}</div>
              <div>Available: {totals.available}</div>
              <div>Occupied: {totals.occupied}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
