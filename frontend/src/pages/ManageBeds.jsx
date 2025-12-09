// frontend/src/pages/ManageBeds.jsx
import React, { useEffect, useState } from "react";
import { API } from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Admin Beds Management page
 * - List beds
 * - Edit bed (modal)
 * - Delete bed (confirm)
 */
export default function ManageBeds() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  // edit modal state
  const [editing, setEditing] = useState(null); // bed object being edited
  const [editForm, setEditForm] = useState({ bedNumber: "", ward: "", type: "General", status: "Available" });

  // delete confirmation state
  const [deleting, setDeleting] = useState(null); // bed id being deleted
  const navigate = useNavigate();

  // auth guard: admin only
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return navigate("/login");
    if (user.role !== "admin") {
      toast.error("Access denied — admin only");
      navigate("/");
    }
  }, [navigate]);

  const loadBeds = async () => {
    try {
      setLoading(true);
      const res = await API.get("/beds");
      setBeds(res.data || []);
    } catch (err) {
      console.error("loadBeds error", err);
      toast.error(err?.message || "Failed to load beds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeds();
  }, []);

  // Open edit modal and populate form
  const openEdit = (bed) => {
    setEditing(bed);
    setEditForm({
      bedNumber: bed.bedNumber || "",
      ward: bed.ward || "",
      type: bed.type || "General",
      status: bed.status || "Available",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm({ bedNumber: "", ward: "", type: "General", status: "Available" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        bedNumber: editForm.bedNumber.trim(),
        ward: editForm.ward.trim(),
        type: editForm.type,
        status: editForm.status,
      };
      // update bed endpoint: PUT /api/beds/:id (we used updateBedStatus earlier; here we call same endpoint)
      // If your backend update endpoint only accepts {status}, you can add a new route for full edits.
      await API.put(`/beds/${editing._id}`, payload);
      toast.success("Bed updated");
      closeEdit();
      await loadBeds();
    } catch (err) {
      console.error("update error", err);
      toast.error(err?.message || err?.response?.data?.error || "Failed to update bed");
    }
  };

  // delete bed
  const confirmDelete = (bed) => {
    setDeleting(bed);
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await API.delete(`/beds/${deleting._id}`);
      toast.success("Bed deleted");
      setDeleting(null);
      await loadBeds();
    } catch (err) {
      console.error("delete error", err);
      toast.error(err?.message || "Failed to delete bed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Beds (Admin)</h1>
        <div className="text-sm text-gray-600">Total beds: {beds.length}</div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {beds.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No beds found</td>
              </tr>
            )}
            {beds.map((b) => (
              <tr key={b._id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{b.bedNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{b.ward}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{b.type}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${b.status === "Available" ? "bg-green-100 text-green-800" : ""}
                    ${b.status === "Occupied" ? "bg-red-100 text-red-800" : ""}
                    ${b.status === "Maintenance" ? "bg-yellow-100 text-yellow-800" : ""}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(b)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                    <button onClick={() => confirmDelete(b)} className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={closeEdit}></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Bed {editing.bedNumber}</h2>

            <form onSubmit={submitEdit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Bed Number</label>
                <input name="bedNumber" value={editForm.bedNumber} onChange={handleEditChange} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Ward</label>
                <input name="ward" value={editForm.ward} onChange={handleEditChange} className="w-full border p-2 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Type</label>
                  <select name="type" value={editForm.type} onChange={handleEditChange} className="w-full border p-2 rounded">
                    <option>General</option>
                    <option>ICU</option>
                    <option>Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border p-2 rounded">
                    <option>Available</option>
                    <option>Occupied</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setDeleting(null)}></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Delete bed</h3>
            <p className="text-sm text-gray-700">Are you sure you want to delete bed <strong>{deleting.bedNumber}</strong>? This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button onClick={doDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
