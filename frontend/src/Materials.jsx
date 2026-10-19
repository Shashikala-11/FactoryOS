
import { useEffect, useState } from "react";
import { Package, Plus, RefreshCw } from "lucide-react";
import api from "./api";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    supplier_name: "",
    batch_number: "",
    mtc_reference: "",
    description: "",
  });

  async function loadMaterials() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/materials/");
      setMaterials(
        Array.isArray(response.data)
          ? response.data
          : response.data.results ?? []
      );
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired. Sign in again."
          : "Could not load materials. Check Django and the API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  async function createMaterial(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/api/materials/", form);
      setForm({
        code: "",
        name: "",
        supplier_name: "",
        batch_number: "",
        mtc_reference: "",
        description: "",
      });
      setShowForm(false);
      await loadMaterials();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "object"
          ? Object.entries(data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : JSON.stringify(value)}`)
              .join(" | ")
          : "Could not create material."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="materials-page">
      <div className="materials-heading">
        <div>
          <h2>Materials Management</h2>
          <p>Track incoming materials, supplier batches and MTC references.</p>
        </div>
        <div className="materials-actions">
          <button className="button" onClick={loadMaterials}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            className="button button-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} /> Add Material
          </button>
        </div>
      </div>

      {error && <p className="materials-error">{error}</p>}

      {showForm && (
        <form className="material-form" onSubmit={createMaterial}>
          <h3>Register Incoming Material</h3>
          <div className="material-form-grid">
            {[
              ["code", "Material Code"],
              ["name", "Material Name"],
              ["supplier_name", "Supplier Name"],
              ["batch_number", "Batch Number"],
              ["mtc_reference", "MTC Reference"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required={key !== "mtc_reference"}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <label>
              Description
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
          </div>
          <button className="button button-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Material"}
          </button>
        </form>
      )}

      <div className="materials-table-card">
        <div className="materials-table-title">
          <Package size={18} />
          <strong>Registered Materials</strong>
          <span>{materials.length} records</span>
        </div>
        {loading ? (
          <p className="materials-empty">Loading materials...</p>
        ) : materials.length === 0 ? (
          <p className="materials-empty">
            No materials registered yet. Use Add Material to create one.
          </p>
        ) : (
          <div className="materials-table-scroll">
            <table className="materials-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Material</th>
                  <th>Supplier</th>
                  <th>Batch</th>
                  <th>MTC Reference</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td>{m.code}</td>
                    <td>{m.name}</td>
                    <td>{m.supplier_name}</td>
                    <td>{m.batch_number}</td>
                    <td>{m.mtc_reference || "—"}</td>
                    <td>
                      <span className="material-status">
                        {m.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
