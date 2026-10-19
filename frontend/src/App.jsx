
import { useEffect, useState } from "react";
import api from "./api";
import Login from "./SignIn.jsx";
import Materials from "./Materials.jsx";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Box,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Factory,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  X,
} from "lucide-react";
import "./index.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Factories", icon: Building2 },
  { label: "Materials", icon: Package },
  { label: "Inspections", icon: ClipboardCheck },
  { label: "Production", icon: Activity },
  { label: "Dispatch", icon: Truck },
];

const inspections = [
  { id: "INS-0248", material: "Aluminium Housing", batch: "BTH-2026-081", inspector: "Rahul Sharma", date: "18 Oct 2026", status: "Pending review" },
  { id: "INS-0247", material: "Steel Fasteners", batch: "BTH-2026-080", inspector: "Priya Nair", date: "18 Oct 2026", status: "Passed" },
  { id: "INS-0246", material: "Copper Tubing", batch: "BTH-2026-079", inspector: "Amit Patil", date: "17 Oct 2026", status: "Failed" },
  { id: "INS-0245", material: "Bearing Assembly", batch: "BTH-2026-078", inspector: "Neha Shah", date: "17 Oct 2026", status: "Approved" },
];

const activities = [
  { icon: CheckCircle2, color: "green", title: "Inspection approved", detail: "Bearing Assembly · INS-0245", time: "10 min ago" },
  { icon: Package, color: "blue", title: "Material registered", detail: "Aluminium Housing · BTH-2026-081", time: "32 min ago" },
  { icon: ShieldCheck, color: "amber", title: "Review required", detail: "Aluminium Housing · INS-0248", time: "48 min ago" },
];

function StatusBadge({ status }) {
  const styles = {
    "Pending review": "pending",
    Passed: "passed",
    Failed: "failed",
    Approved: "approved",
  };

  return <span className={`status-badge ${styles[status] || "pending"}`}>{status}</span>;
}

function App() {
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageDescriptions = {
    Overview: "Here's what's happening across your operations today.",
    Factories: "Manage factory locations and departments.",
    Materials: "Track incoming materials, suppliers and batch verification.",
    Inspections: "Monitor quality checks, measurements and review decisions.",
    Production: "Keep track of production activity and quality checkpoints.",
    Dispatch: "Review dispatch readiness and clearance status.",
  };

  const [loggedIn, setLoggedIn] = useState(
  () => Boolean(localStorage.getItem("access"))
);
const [liveInspections, setLiveInspections] = useState(null);

useEffect(() => {
  if (!loggedIn) return;

  api.get("/api/inspection-records/")
    .then((response) => {
      const records = Array.isArray(response.data)
        ? response.data
        : response.data.results ?? [];

      const statusLabels = {
        PENDING_REVIEW: "Pending review",
        PASSED: "Passed",
        FAILED: "Failed",
        APPROVED: "Approved",
        REJECTED: "Rejected",
        QUARANTINED: "Quarantined",
        IN_PROGRESS: "In progress",
      };

      setLiveInspections(
        records.map((record) => ({
          id: `INS-${String(record.id).padStart(4, "0")}`,
          material: record.material_code,
          batch: record.template_name,
          inspector: record.inspector_username,
          date: new Date(record.created_at).toLocaleDateString("en-IN"),
          status: statusLabels[record.status] ?? record.status,
        }))
      );
    })
    .catch((error) => {
      console.error("Could not load inspections:", error);
    });
}, [loggedIn]);

 const visibleInspections = liveInspections ?? inspections;
  const filteredInspections = visibleInspections.filter((item) =>
  `${item.id} ${item.material} ${item.batch} ${item.inspector} ${item.status}`
    .toLowerCase()
    .includes(search.toLowerCase())
  );

if (!loggedIn) {
  return <Login onLogin={() => setLoggedIn(true)} />;
}

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Factory size={23} strokeWidth={2.2} /></div>
          <div>
            <div className="brand-name">FactoryOS</div>
            <div className="brand-caption">OPERATIONS PLATFORM</div>
          </div>
          <button className="icon-button close-menu" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={19} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switcher">
          <div className="workspace-icon"><Building2 size={17} /></div>
          <div className="workspace-copy">
            <strong>Primary Factory</strong>
            <span>Factory workspace</span>
          </div>
          <ChevronDown size={16} className="muted-icon" />
        </div>

        <div className="nav-label">MENU</div>
        <nav className="nav-list">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => { setActive(label); setMobileOpen(false); }}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Inspections" && <span className="nav-count">8</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><ShieldCheck size={19} /></div>
            <strong>Quality first.</strong>
            <p>Keep every batch traceable, every inspection accountable.</p>
          </div>
          <button className={`nav-item ${active === "Settings" ? "active" : ""}`} onClick={() => setActive("Settings")}>
            <Settings size={19} strokeWidth={1.8} /><span>Settings</span>
          </button>
          <div className="profile">
            <div className="avatar">SG</div>
            <div className="profile-copy">
              <strong>Shashikala Gupta</strong>
              <span>Administrator</span>
            </div>
            <ChevronDown size={16} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>{active}</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inspections..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <div className="top-avatar">SG</div>
          </div>
        </header>

        <div className="page-content">
          {active === "Materials" ? (
            <Materials />
          ) : (
            <>
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="live-dot" /> OPERATIONS OVERVIEW</div>
              <h1>{active === "Overview" ? "Good morning, Shashikala" : active}</h1>
              <p>{pageDescriptions[active] || "Manage your FactoryOS workspace and preferences."}</p>
            </div>
            <div className="heading-actions">
              <button className="button button-secondary" onClick={() => window.print()}><FileText size={16} /> Export report</button>
              <button className="button button-primary" onClick={() => setActive("Inspections")}><ClipboardCheck size={17} /> View inspections</button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon indigo"><Building2 size={19} /></span><span className="stat-period">All locations</span></div>
              <div className="stat-label">Active factories</div>
              <div className="stat-value">04 <span className="stat-unit">locations</span></div>
              <div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={14} /> 1 active today</span><span>Across workspace</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon blue"><Package size={19} /></span><span className="stat-period">This month</span></div>
              <div className="stat-label">Material batches</div>
              <div className="stat-value">128</div>
              <div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={14} /> +12.8%</span><span>vs. last month</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon amber"><Clock3 size={19} /></span><span className="stat-period">Needs attention</span></div>
              <div className="stat-label">Pending inspections</div>
              <div className="stat-value">08 <span className="stat-unit">reviews</span></div>
              <div className="stat-foot"><span className="trend-warning"><Clock3 size={14} /> 3 high priority</span><span>Awaiting action</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon green"><ShieldCheck size={19} /></span><span className="stat-period">This month</span></div>
              <div className="stat-label">Quality pass rate</div>
              <div className="stat-value">96.8<span className="percent">%</span></div>
              <div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={14} /> +2.4%</span><span>vs. last month</span></div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel quality-panel">
              <div className="panel-heading">
                <div><h2>Quality performance</h2><p>Inspection outcomes over the last 7 days</p></div>
                <button className="select-button">Last 7 days <ChevronDown size={15} /></button>
              </div>
              <div className="chart-summary">
                <div><span className="chart-big-number">96.8%</span><span className="chart-subtitle"><span className="trend-positive"><ArrowUpRight size={14} /> 2.4%</span> from previous period</span></div>
                <div className="chart-legend"><span><i className="legend-dot pass-dot" /> Passed</span><span><i className="legend-dot fail-dot" /> Failed</span></div>
              </div>
              <div className="chart">
                <div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
                <div className="chart-plot">
                  {[["Mon",84,12],["Tue",91,8],["Wed",76,18],["Thu",95,5],["Fri",88,9],["Sat",97,3],["Sun",92,6]].map(([day, pass, fail]) => (
                    <div className="bar-group" key={day}>
                      <div className="bar-stack">
                        <div className="bar-pass" style={{ height: `${pass}%` }} title={`Passed: ${pass}%`} />
                        <div className="bar-fail" style={{ height: `${fail}%` }} title={`Failed: ${fail}%`} />
                      </div>
                      <span className="bar-label">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-footer"><span><span className="footer-dot" /> Data shown is illustrative</span><button className="text-link" onClick={() => setActive("Inspections")}>View all reports <ArrowRight size={15} /></button></div>
            </article>

            <article className="panel attention-panel">
              <div className="panel-heading">
                <div><h2>Needs attention</h2><p>Items requiring your review</p></div>
                <span className="attention-count">3</span>
              </div>
              <div className="attention-list">
                <div className="attention-item">
                  <div className="attention-icon red"><ClipboardCheck size={18} /></div>
                  <div className="attention-copy"><strong>Failed inspection</strong><span>Copper Tubing · INS-0246</span><small>Requires disposition</small></div>
                  <ArrowDownRight size={17} className="attention-arrow" />
                </div>
                <div className="attention-item">
                  <div className="attention-icon amber"><Clock3 size={18} /></div>
                  <div className="attention-copy"><strong>Pending review</strong><span>Aluminium Housing · INS-0248</span><small>Awaiting supervisor</small></div>
                  <ArrowRight size={17} className="attention-arrow" />
                </div>
                <div className="attention-item">
                  <div className="attention-icon blue"><Package size={18} /></div>
                  <div className="attention-copy"><strong>Material verification</strong><span>Batch · BTH-2026-081</span><small>MTC check required</small></div>
                  <ArrowRight size={17} className="attention-arrow" />
                </div>
              </div>
              <button className="attention-link" onClick={() => setActive("Inspections")}>Review outstanding items <ArrowRight size={15} /></button>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel table-panel">
              <div className="panel-heading table-heading">
                <div><h2>Recent inspections</h2><p>Latest quality checks across your workspace</p></div>
                <button className="text-link" onClick={() => setActive("Inspections")}>View all <ArrowRight size={15} /></button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>INSPECTION</th><th>MATERIAL / BATCH</th><th>INSPECTOR</th><th>DATE</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {filteredInspections.map((item) => (
                      <tr key={item.id}>
                        <td><span className="record-id">{item.id}</span></td>
                        <td><div className="material-name">{item.material}</div><div className="batch-id">{item.batch}</div></td>
                        <td><div className="inspector-cell"><span className="mini-avatar">{item.inspector.split(" ").map((n) => n[0]).join("")}</span>{item.inspector}</div></td>
                        <td className="date-cell">{item.date}</td>
                        <td><StatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                    {filteredInspections.length === 0 && <tr><td colSpan="5" className="empty-state">No inspections match your search.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer"><span>Showing {filteredInspections.length} of 24 records · Sample data</span><button className="text-link" onClick={() => setActive("Inspections")}>Open inspections <ArrowRight size={14} /></button></div>
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest workspace updates</p></div><button className="icon-button subtle-button" aria-label="Activity options"><Activity size={17} /></button></div>
              <div className="activity-list">
                {activities.map(({ icon: Icon, color, title, detail, time }) => (
                  <div className="activity-item" key={title}>
                    <div className={`activity-icon ${color}`}><Icon size={17} /></div>
                    <div className="activity-copy"><strong>{title}</strong><span>{detail}</span><small>{time}</small></div>
                  </div>
                ))}
              </div>
              <button className="activity-link" onClick={() => setActive("Inspections")}>View activity log <ArrowRight size={15} /></button>
            </article>
          </section>

          <footer className="page-footer"><span><span className="footer-dot green-dot" /> All systems operational</span><span>FactoryOS <b>·</b> Quality & Operations Management</span></footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
