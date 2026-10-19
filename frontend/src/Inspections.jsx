
import { useCallback, useEffect, useState } from "react";
import api from "./api";

const statusLabels = {
  IN_PROGRESS: "In progress",
  PENDING_REVIEW: "Pending review",
  PASSED: "Passed",
  FAILED: "Failed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  QUARANTINED: "Quarantined",
};

const styles = {
  page: { padding: 24, color: "var(--text-primary, #182230)" },
  panel: {
    background: "var(--panel, #fff)",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    minWidth: 150,
    maxWidth: "100%",
    background: "white",
    color: "#182230",
  },
  button: {
    padding: "10px 14px",
    border: 0,
    borderRadius: 7,
    background: "#3448c5",
    color: "white",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  cell: { padding: "12px 10px", borderBottom: "1px solid #e5e7eb" },
};

function getList(data) {
  return Array.isArray(data) ? data : data?.results ?? [];
}

export default function Inspections() {
  const [records, setRecords] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedRecord, setSelectedRecord] = useState("");
  const [parameterId, setParameterId] = useState("");
  const [measuredValue, setMeasuredValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordResponse, materialResponse, templateResponse] =
        await Promise.all([
          api.get("/api/inspection-records/"),
          api.get("/api/materials/"),
          api.get("/api/inspection-templates/"),
        ]);

      const nextRecords = getList(recordResponse.data);
      setRecords(nextRecords);
      setMaterials(getList(materialResponse.data));
      setTemplates(getList(templateResponse.data));

      setSelectedRecord((current) =>
        nextRecords.some((record) => String(record.id) === current)
          ? current
          : nextRecords.length
            ? String(nextRecords[0].id)
            : ""
      );
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Could not load inspection data. Check your login and API server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentRecord = records.find(
    (record) => String(record.id) === selectedRecord
  );

  const currentTemplate = templates.find(
    (template) =>
      String(template.id) === String(currentRecord?.template ?? templateId)
  );

  const parameters = currentTemplate?.parameters ?? [];

  useEffect(() => {
    setParameterId("");
    setMeasuredValue("");
    setRemarks("");
  }, [selectedRecord, templateId]);

  async function createInspection(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/api/inspection-records/", {
        material: Number(materialId),
        template: Number(templateId),
        notes,
      });

      setMessage(`Inspection INS-${String(response.data.id).padStart(4, "0")} created.`);
      setNotes("");
      await loadData();
      setSelectedRecord(String(response.data.id));
    } catch (err) {
      setError(JSON.stringify(err.response?.data ?? err.message));
    } finally {
      setBusy(false);
    }
  }

  async function submitMeasurement(event) {
    event.preventDefault();
    if (!selectedRecord || !parameterId) {
      setError("Select an inspection and a parameter first.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/api/inspection-measurements/", {
        record: Number(selectedRecord),
        parameter: Number(parameterId),
        measured_value: measuredValue,
        remarks,
      });

      setMessage(
        `Measurement saved. Result: ${response.data.is_pass ? "PASS" : "FAIL"}.`
      );
      setMeasuredValue("");
      setRemarks("");
      await loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data ?? err.message));
    } finally {
      setBusy(false);
    }
  }

  async function reviewInspection(decision) {
    if (!selectedRecord) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.post(
        `/api/inspection-records/${selectedRecord}/review/`,
        { decision, notes: reviewNotes }
      );
      setMessage(`Inspection ${decision}d successfully.`);
      setReviewNotes("");
      await loadData();
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data ??
            "Review failed. Check that you are signed in as a supervisor."
        )
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={styles.page}>Loading inspection data...</div>;
  }

  return (
    <div style={styles.page}>
      <h1>Inspections</h1>
      <p>Create quality checks, record measurements and track inspection status.</p>

      {message && (
        <p role="status" style={{ color: "#15803d" }}>{message}</p>
      )}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            overflowWrap: "anywhere",
          }}
        >
          {error}
          <button
            style={{ ...styles.button, marginLeft: 12 }}
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      <section style={styles.panel}>
        <h2>Create inspection</h2>
        <form
          onSubmit={createInspection}
          style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
        >
          <select
            required
            aria-label="Material"
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            style={styles.input}
          >
            <option value="">Select material</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.code} — {material.name}
              </option>
            ))}
          </select>

          <select
            required
            aria-label="Inspection template"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            style={styles.input}
          >
            <option value="">Select template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Inspection notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.input}
          />

          <button disabled={busy} type="submit" style={styles.button}>
            {busy ? "Saving..." : "Create inspection"}
          </button>
        </form>
      </section>

      <section style={styles.panel}>
        <h2>Record measurement</h2>
        <form
          onSubmit={submitMeasurement}
          style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
        >
          <select
            required
            aria-label="Inspection record"
            value={selectedRecord}
            onChange={(e) => setSelectedRecord(e.target.value)}
            style={styles.input}
          >
            <option value="">Select inspection</option>
            {records.map((record) => (
              <option key={record.id} value={record.id}>
                INS-{String(record.id).padStart(4, "0")} —{" "}
                {record.material_code} ({statusLabels[record.status] ?? record.status})
              </option>
            ))}
          </select>

          <select
            required
            aria-label="Parameter"
            value={parameterId}
            onChange={(e) => setParameterId(e.target.value)}
            style={styles.input}
          >
            <option value="">Select parameter</option>
            {parameters.map((parameter) => (
              <option key={parameter.id} value={parameter.id}>
                {parameter.name} ({parameter.unit}) — range{" "}
                {parameter.min_value ?? "—"} to {parameter.max_value ?? "—"}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            step="any"
            placeholder="Measured value"
            value={measuredValue}
            onChange={(e) => setMeasuredValue(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Measurement remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={styles.input}
          />

          <button disabled={busy} type="submit" style={styles.button}>
            Save measurement
          </button>
        </form>

        {currentRecord?.measurements?.length > 0 && (
          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <h3>Recorded measurements</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.cell}>Parameter ID</th>
                  <th style={styles.cell}>Value</th>
                  <th style={styles.cell}>Result</th>
                  <th style={styles.cell}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {currentRecord.measurements.map((measurement) => (
                  <tr key={measurement.id}>
                    <td style={styles.cell}>{measurement.parameter}</td>
                    <td style={styles.cell}>{measurement.measured_value}</td>
                    <td style={styles.cell}>
                      {measurement.is_pass ? "PASS" : "FAIL"}
                    </td>
                    <td style={styles.cell}>{measurement.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={styles.panel}>
        <h2>Inspection records</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.cell}>ID</th>
                <th style={styles.cell}>Material</th>
                <th style={styles.cell}>Template</th>
                <th style={styles.cell}>Inspector</th>
                <th style={styles.cell}>Status</th>
                <th style={styles.cell}>Measurements</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td style={styles.cell}>
                    INS-{String(record.id).padStart(4, "0")}
                  </td>
                  <td style={styles.cell}>{record.material_code}</td>
                  <td style={styles.cell}>{record.template_name}</td>
                  <td style={styles.cell}>{record.inspector_username}</td>
                  <td style={styles.cell}>
                    {statusLabels[record.status] ?? record.status}
                  </td>
                  <td style={styles.cell}>
                    {record.measurements?.length ?? 0}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td style={styles.cell} colSpan={6}>
                    No inspections yet. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={loadData}
          disabled={busy}
          style={{ ...styles.button, marginTop: 16 }}
        >
          Refresh records
        </button>
      </section>

      <section style={styles.panel}>
        <h2>Supervisor review</h2>
        <p>
          Select a pending or failed inspection above. Review actions require a
          supervisor account, and failed inspections cannot be approved.
        </p>
        <input
          placeholder="Review notes"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          <button
            disabled={busy || !selectedRecord || !["PENDING_REVIEW", "FAILED"].includes(currentRecord?.status)}
            onClick={() => reviewInspection("approve")}
            style={styles.button}
          >
            Approve
          </button>
          <button
            disabled={busy || !selectedRecord || !["PENDING_REVIEW", "FAILED"].includes(currentRecord?.status)}
            onClick={() => reviewInspection("reject")}
            style={{ ...styles.button, background: "#b91c1c" }}
          >
            Reject
          </button>
          <button
            disabled={busy || !selectedRecord || !["PENDING_REVIEW", "FAILED"].includes(currentRecord?.status)}
            onClick={() => reviewInspection("quarantine")}
            style={{ ...styles.button, background: "#92400e" }}
          >
            Quarantine
          </button>
        </div>
      </section>
    </div>
  );
}
