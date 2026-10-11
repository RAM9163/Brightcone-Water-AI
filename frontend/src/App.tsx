import Forecasting from "./Forecasting";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Activity,
  AlertTriangle,
  Droplets,
  Gauge,
  MapPin,
  ShieldCheck,
  Wrench,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "./App.css";

const API = "http://127.0.0.1:8000";

type Page =
  | "Dashboard"
  | "Network Monitoring"
  | "Demand Forecasting"
  | "Anomalies"
  | "Leak Detection"
  | "Water Balance"
  | "Maintenance"
  | "Operations"
  | "Reports";

interface DashboardData {
  system: {
    status: string;
    dmas: number;
    sensor_records: number;
  };
  anomalies: {
    total: number;
    by_dma: Record<string, number>;
  };
  leaks: {
    total_assessments: number;
    high_confidence: number;
  };
  water_loss: {
    highest_loss_dma: string;
    highest_loss_percentage: number;
  };
  maintenance: {
    critical_tasks: number;
    top_priority_dma: string;
    top_priority_pipe: string;
    priority_score: number;
  };
  operations: {
    recommendations: number;
    human_approval_required: boolean;
    workflow_state: string;
  };
}

interface SensorRecord {
  timestamp: string;
  dma_id: string;
  inlet_flow_m3h: number;
  pressure_bar: number;
  smart_meter_consumption_m3h: number;
}

interface Anomaly {
  timestamp: string;
  dma_id: string;
  anomaly_type: string;
  inlet_flow_m3h: number;
  pressure_bar: number;
  flow_z_score: number;
  pressure_z_score: number;
  nighttime_flow_anomaly: boolean;
}

interface Leak {
  timestamp: string;
  dma_id: string;
  pipe_section: string;
  confidence: string;
  leak_score: number;
  hypothesis: string;
  recommendation: string;
  exact_underground_location: boolean;
}

interface WaterBalance {
  dma_id: string;
  total_water_supplied_m3: number;
  total_metered_consumption_m3: number;
  unexplained_water_m3: number;
  water_loss_percentage: number;
  average_hourly_loss_m3: number;
  high_confidence_leak_events: number;
  loss_severity: string;
}

interface Maintenance {
  dma_id: string;
  pipe_section: string;
  priority: string;
  priority_score: number;
  field_team: string;
  status: string;
  reason: string;
}

interface Operation {
  dma_id: string;
  pipe_section: string;
  priority: string;
  recommended_action: string;
  approval_required: boolean;
  approval_status: string;
  workflow_state: string;
  evidence_summary: string;
}

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/dashboard`);
      setDashboard(response.data);
      setError("");
    } catch {
      setError(
        "Unable to connect to backend. Make sure FastAPI is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Loading Water Network AI...</h2>
        <p>Connecting to monitoring system</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="error-screen">
        <AlertTriangle size={50} />
        <h2>Backend Connection Error</h2>
        <p>{error}</p>
        <button onClick={loadDashboard} className="retry-btn">
          <RefreshCw size={16} />
          Retry Connection
        </button>
      </div>
    );
  }

  const menuItems: {
    name: Page;
    icon: React.ReactNode;
  }[] = [
    { name: "Dashboard", icon: <Activity size={19} /> },
    { name: "Network Monitoring", icon: <Gauge size={19} /> },
    { name: "Demand Forecasting", icon: <TrendingUp size={19} /> },
    { name: "Anomalies", icon: <AlertTriangle size={19} /> },
    { name: "Leak Detection", icon: <MapPin size={19} /> },
    { name: "Water Balance", icon: <Droplets size={19} /> },
    { name: "Maintenance", icon: <Wrench size={19} /> },
    { name: "Operations", icon: <ShieldCheck size={19} /> },
    { name: "Reports", icon: <BarChart3 size={19} /> },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <Droplets size={32} />
          <div>
            <h2>Brightcone</h2>
            <span>Water AI</span>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                page === item.name ? "nav-button active" : "nav-button"
              }
              onClick={() => setPage(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="online-dot"></div>
          <div>
            <strong>System Online</strong>
            <small>AI agents active</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{page}</h1>
            <p>
              Agentic AI water distribution monitoring, leak detection &
              resource optimization
            </p>
          </div>

          <div className="top-actions">
            <button className="refresh-button" onClick={loadDashboard}>
              <RefreshCw size={15} />
              Refresh
            </button>

            <div className="status-pill">
              <span></span>
              Operational
            </div>
          </div>
        </header>

        {page === "Dashboard" && (
          <DashboardPage dashboard={dashboard} setPage={setPage} />
        )}

        {page === "Network Monitoring" && <MonitoringPage />}

        {page === "Demand Forecasting" && <Forecasting />}

        {page === "Anomalies" && <AnomaliesPage />}

        {page === "Leak Detection" && <LeaksPage />}

        {page === "Water Balance" && <WaterBalancePage />}

        {page === "Maintenance" && <MaintenancePage />}

        {page === "Operations" && <OperationsPage />}

        {page === "Reports" && <ReportsPage />}

        <footer>
          <span>Brightcone Water Distribution AI</span>
          <span>
            {dashboard.system.sensor_records.toLocaleString()} sensor records
            processed
          </span>
        </footer>
      </main>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function DashboardPage({
  dashboard,
  setPage,
}: {
  dashboard: DashboardData;
  setPage: (page: Page) => void;
}) {
  return (
    <>
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Gauge />
          </div>
          <div>
            <span>DMAs Monitored</span>
            <strong>{dashboard.system.dmas}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <AlertTriangle />
          </div>
          <div>
            <span>Detected Anomalies</span>
            <strong>{dashboard.anomalies.total}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <Droplets />
          </div>
          <div>
            <span>High Confidence Events</span>
            <strong>{dashboard.leaks.high_confidence}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <Wrench />
          </div>
          <div>
            <span>Critical Tasks</span>
            <strong>{dashboard.maintenance.critical_tasks}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel large">
          <div className="panel-header">
            <div>
              <h2>Network Overview</h2>
              <p>Current water distribution intelligence</p>
            </div>

            <span className="live-badge">
              <span></span>
              LIVE
            </span>
          </div>

          <div className="network-map">
            <div className="map-title">
              <MapPin size={18} />
              DMA Network Topology
            </div>

            <div className="network-line"></div>

            <div className="network-nodes">
              <div className="network-node">
                <div className="node reservoir">R</div>
                <strong>Reservoir-1</strong>
                <small>Source</small>
              </div>

              <div className="network-node">
                <div className="node normal">A</div>
                <strong>DMA-A</strong>
                <small>22.54% loss</small>
              </div>

              <div className="network-node danger">
                <div className="node critical">B</div>
                <strong>DMA-B</strong>
                <small>22.73% loss</small>
              </div>

              <div className="network-node danger">
                <div className="node critical">C</div>
                <strong>DMA-C</strong>
                <small>22.94% loss</small>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Water Loss</h2>
              <p>Highest loss DMA</p>
            </div>
            <Droplets size={22} />
          </div>

          <div className="loss-value">
            {dashboard.water_loss.highest_loss_percentage.toFixed(2)}%
          </div>

          <div className="loss-dma">
            <span>Critical zone</span>
            <strong>{dashboard.water_loss.highest_loss_dma}</strong>
          </div>

          <div className="progress">
            <div
              style={{
                width: `${Math.min(
                  dashboard.water_loss.highest_loss_percentage * 3,
                  100,
                )}%`,
              }}
            />
          </div>

          <p className="muted">
            Highest unexplained water loss detected in{" "}
            {dashboard.water_loss.highest_loss_dma}.
          </p>

          <button
            className="view-button"
            onClick={() => setPage("Water Balance")}
          >
            View Water Balance →
          </button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Anomaly Distribution</h2>
              <p>Events by DMA</p>
            </div>
            <AlertTriangle size={22} />
          </div>

          <div className="dma-list">
            {Object.entries(dashboard.anomalies.by_dma).map(([dma, count]) => (
              <div className="dma-row" key={dma}>
                <div className="dma-name">
                  <span
                    className={
                      dma === "DMA-A" ? "dot normal-dot" : "dot danger-dot"
                    }
                  ></span>
                  {dma}
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>

          <button className="view-button" onClick={() => setPage("Anomalies")}>
            View All Anomalies →
          </button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Maintenance Priority</h2>
              <p>Highest priority recommendation</p>
            </div>
            <Wrench size={22} />
          </div>

          <div className="priority-box">
            <span>PRIORITY 1</span>
            <strong>{dashboard.maintenance.top_priority_dma}</strong>
            <p>{dashboard.maintenance.top_priority_pipe}</p>
          </div>

          <div className="score-row">
            <span>Priority Score</span>
            <strong>{dashboard.maintenance.priority_score}</strong>
          </div>

          <button
            className="view-button"
            onClick={() => setPage("Maintenance")}
          >
            Open Maintenance Plan →
          </button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Operations Coordination</h2>
              <p>Human approval workflow</p>
            </div>
            <ShieldCheck size={22} />
          </div>

          <div className="approval-box">
            <div className="approval-icon">
              <ShieldCheck size={25} />
            </div>

            <div>
              <strong>Human Approval Required</strong>
              <p>AI recommendations are waiting for operator validation.</p>
            </div>
          </div>

          <div className="workflow-state">
            <span>Workflow State</span>
            <strong>{dashboard.operations.workflow_state}</strong>
          </div>

          <button className="view-button" onClick={() => setPage("Operations")}>
            Review Recommendations →
          </button>
        </div>
      </section>

      <section className="panel agent-panel">
        <div className="panel-header">
          <div>
            <h2>Agentic AI Workflow</h2>
            <p>Seven-agent decision-support pipeline</p>
          </div>
        </div>

        <div className="agent-flow">
          {[
            "Data Monitoring",
            "Demand Forecasting",
            "Anomaly Detection",
            "Leak Localization",
            "Water Balance",
            "Maintenance Planning",
            "Operations Coordination",
          ].map((agent, index) => (
            <div className="agent-step" key={agent}>
              <div className="agent-number">{index + 1}</div>
              <span>{agent}</span>
              {index < 6 && <div className="arrow">→</div>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= MONITORING ================= */

function MonitoringPage() {
  const [data, setData] = useState<SensorRecord[]>([]);
  const [dma, setDma] = useState("DMA-B");
  const [leaks, setLeaks] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/sensors`)
      .then((res) => setData(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/leaks`)
      .then((res) => setLeaks(res.data.data))
      .catch(() => {});
  }, []);

  const filtered = data.filter((row) => row.dma_id === dma).slice(-48);
  const latestReading = filtered[filtered.length - 1];

  const getDMAStatus = (dmaId: string) => {
    const dmaLeaks = leaks.filter((item) => item.dma_id === dmaId);

    if (dmaLeaks.some((item) => item.confidence === "High")) {
      return "Leak Suspected";
    }

    if (dmaLeaks.some((item) => item.confidence === "Medium")) {
      return "Warning";
    }

    return "Normal";
  };

  return (
    <>
      <section className="page-header">
        <div>
          <h2>Real-Time Network Monitoring</h2>
          <p>Flow, pressure and smart-meter sensor intelligence</p>
        </div>

        <select value={dma} onChange={(e) => setDma(e.target.value)}>
          <option>DMA-A</option>
          <option>DMA-B</option>
          <option>DMA-C</option>
        </select>
        <div className="last-updated">
          Last updated:{" "}
          {latestReading
            ? new Date(latestReading.timestamp).toLocaleString("en-IN")
            : "Loading..."}
        </div>
      </section>
      <section className="stats-grid monitoring-stats">
        <div className="stat-card">
          <Activity size={22} />
          <div>
            <span>Current Flow</span>
            <strong>
              {latestReading?.inlet_flow_m3h?.toFixed(1) ?? "--"} m³/h
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <Gauge size={22} />
          <div>
            <span>Current Pressure</span>
            <strong>
              {latestReading?.pressure_bar?.toFixed(2) ?? "--"} bar
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <Droplets size={22} />
          <div>
            <span>Smart Meter</span>
            <strong>
              {latestReading?.smart_meter_consumption_m3h?.toFixed(1) ?? "--"}{" "}
              m³/h
            </strong>
          </div>
        </div>
      </section>

      {/* NETWORK TOPOLOGY */}
      <section className="panel topology-panel">
        <div className="panel-header">
          <div>
            <h3>Water Network Topology</h3>
            <p>Reservoir, pipelines and DMA monitoring zones</p>
          </div>

          <MapPin size={24} />
        </div>

        <div className="network-topology">
          <div className="network-node reservoir-node">
            <div className="node-icon">💧</div>
            <strong>Reservoir-1</strong>
            <span>Water Source</span>
          </div>

          <div className="network-branches">
            <div className="network-branch">
              <div className="pipe-line">
                <span>Pipe-A1</span>
              </div>

              <div
                className={`network-node dma-node ${getDMAStatus("DMA-A")
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                <strong>DMA-A</strong>
                <span>Pipe-A1</span>
                <small>Medium Criticality</small>
                <b>{getDMAStatus("DMA-A")}</b>
                <span className="sensor-value">
                  Flow:{" "}
                  {data
                    .find((r) => r.dma_id === "DMA-A")
                    ?.inlet_flow_m3h?.toFixed(1)}{" "}
                  m³/h
                </span>
                <span className="sensor-value">
                  Pressure:{" "}
                  {data
                    .find((r) => r.dma_id === "DMA-A")
                    ?.pressure_bar?.toFixed(2)}{" "}
                  bar
                </span>
              </div>
            </div>

            <div className="network-branch">
              <div className="pipe-line">
                <span>Pipe-B1</span>
              </div>

              <div
                className={`network-node dma-node ${getDMAStatus("DMA-B")
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                <strong>DMA-B</strong>
                <span>Pipe-B1</span>
                <small>High Criticality</small>
                <b>{getDMAStatus("DMA-B")}</b>
                <span className="sensor-value">
                  Flow:{" "}
                  {data
                    .find((r) => r.dma_id === "DMA-B")
                    ?.inlet_flow_m3h?.toFixed(1)}{" "}
                  m³/h
                </span>
                <span className="sensor-value">
                  Pressure:{" "}
                  {data
                    .find((r) => r.dma_id === "DMA-B")
                    ?.pressure_bar?.toFixed(2)}{" "}
                  bar
                </span>
              </div>
            </div>

            <div className="network-branch">
              <div className="pipe-line">
                <span>Pipe-C1</span>
              </div>

              <div
                className={`network-node dma-node ${getDMAStatus("DMA-C")
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                <strong>DMA-C</strong>
                <span>Pipe-C1</span>
                <small>High Criticality</small>
                <b>{getDMAStatus("DMA-C")}</b>
                <span className="sensor-value">
                  Flow:{" "}
                  {data
                    .find((r) => r.dma_id === "DMA-C")
                    ?.inlet_flow_m3h?.toFixed(1)}{" "}
                  m³/h
                </span>
                <span className="sensor-value">
                  Pressure:{" "}
                  {data
                    .find((r) => r.dma_id === "DMA-C")
                    ?.pressure_bar?.toFixed(2)}{" "}
                  bar
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="monitor-chart panel">
        <h3>{dma} — Sensor Trends</h3>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => value.slice(11, 16)}
            />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="inlet_flow_m3h"
              name="Inlet Flow (m³/h)"
              stroke="#168ac8"
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="pressure_bar"
              name="Pressure (bar)"
              stroke="#e89518"
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="smart_meter_consumption_m3h"
              name="Consumption (m³/h)"
              stroke="#27a858"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Recent Sensor Records</h2>
            <p>Latest 48 readings for {dma}</p>
          </div>
          <Activity size={22} />
        </div>

        <DataTable
          columns={[
            "timestamp",
            "dma_id",
            "inlet_flow_m3h",
            "pressure_bar",
            "smart_meter_consumption_m3h",
          ]}
          rows={filtered}
        />
      </div>
    </>
  );
}

/* ================= ANOMALIES ================= */
function AnomaliesPage() {
  const [data, setData] = useState<Anomaly[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/anomalies`)
      .then((res) => setData(res.data.data))
      .catch(() => {});
  }, []);

  const highSeverity = data.filter(
    (x) =>
      Math.abs(Number(x.flow_z_score)) >= 3 ||
      Math.abs(Number(x.pressure_z_score)) >= 3,
  ).length;

  const getSeverity = (x: Anomaly) => {
    const flow = Math.abs(Number(x.flow_z_score));
    const pressure = Math.abs(Number(x.pressure_z_score));

    if (flow >= 3 && pressure >= 3) return "HIGH";

    if (flow >= 3 || pressure >= 3 || x.nighttime_flow_anomaly) {
      return "MEDIUM";
    }

    return "LOW";
  };

  const getEvidence = (x: Anomaly) => {
    const evidence: string[] = [];

    if (Math.abs(Number(x.flow_z_score)) >= 3) {
      evidence.push("Flow anomaly");
    }

    if (Math.abs(Number(x.pressure_z_score)) >= 3) {
      evidence.push("Pressure anomaly");
    }

    if (x.nighttime_flow_anomaly) {
      evidence.push("Nighttime high flow");
    }

    return evidence.length > 0 ? evidence.join(" + ") : "Pattern deviation";
  };

  const displayRows = data.map((x) => ({
    timestamp: x.timestamp,
    dma_id: x.dma_id,
    anomaly_type:
      Math.abs(Number(x.flow_z_score)) >= 2 &&
      Math.abs(Number(x.pressure_z_score)) >= 3
        ? "Flow + Pressure"
        : Math.abs(Number(x.flow_z_score)) >= 2
          ? "Flow anomaly"
          : Math.abs(Number(x.pressure_z_score)) >= 3
            ? "Pressure anomaly"
            : x.nighttime_flow_anomaly
              ? "Nighttime high flow"
              : "Pattern deviation",
    inlet_flow_m3h: x.inlet_flow_m3h,
    pressure_bar: x.pressure_bar,
    flow_z_score: x.flow_z_score,
    pressure_z_score: x.pressure_z_score,
    nighttime_flow_anomaly: x.nighttime_flow_anomaly ? "Yes" : "No",
    severity: getSeverity(x),
    evidence: getEvidence(x),
    action:
      getSeverity(x) === "HIGH"
        ? "Immediate investigation"
        : getSeverity(x) === "MEDIUM"
          ? "Monitor and investigate"
          : "Continue monitoring",
  }));

  return (
    <>
      <PageTitle
        title="Anomaly Detection"
        subtitle="Flow, pressure and nighttime anomaly events"
        icon={<AlertTriangle />}
      />

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="mini-card">
          <span>Total Anomalies</span>
          <strong>{data.length}</strong>
        </div>

        <div className="mini-card">
          <span>DMAs Affected</span>
          <strong>{new Set(data.map((x) => x.dma_id)).size}</strong>
        </div>

        <div className="mini-card">
          <span>Nighttime Events</span>
          <strong>{data.filter((x) => x.nighttime_flow_anomaly).length}</strong>
        </div>

        <div className="mini-card">
          <span>High Severity</span>
          <strong>{highSeverity}</strong>
        </div>
      </div>

      {/* Explanation Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>AI Anomaly Assessment</h2>
            <p>
              Abnormal flow, pressure and nighttime patterns identified from
              sensor data.
            </p>
          </div>

          <AlertTriangle size={22} />
        </div>

        <div className="summary-cards">
          <div className="mini-card">
            <span>Flow Analysis</span>
            <strong>
              {data.filter((x) => Math.abs(Number(x.flow_z_score)) >= 2).length}
            </strong>
            <small>Flow anomalies</small>
          </div>

          <div className="mini-card">
            <span>Pressure Analysis</span>
            <strong>
              {
                data.filter((x) => Math.abs(Number(x.pressure_z_score)) >= 3)
                  .length
              }
            </strong>
            <small>Pressure anomalies</small>
          </div>

          <div className="mini-card">
            <span>Nighttime Analysis</span>
            <strong>
              {data.filter((x) => x.nighttime_flow_anomaly).length}
            </strong>
            <small>00:00–05:00 events</small>
          </div>
        </div>
      </div>

      {/* Anomaly Records */}
      <div className="panel">
        Flow Analysis
        <div className="panel-header">
          <div>
            <h2>Anomaly Events</h2>
            <p>Sensor abnormalities requiring further investigation</p>
          </div>

          <Activity size={22} />
        </div>
        <DataTable
          columns={[
            "timestamp",
            "dma_id",
            "anomaly_type",
            "inlet_flow_m3h",
            "pressure_bar",
            "flow_z_score",
            "pressure_z_score",
            "nighttime_flow_anomaly",
            "severity",
            "evidence",
            "action",
          ]}
          rows={displayRows}
        />
      </div>
    </>
  );
}

/* ================= LEAKS ================= */

function LeaksPage() {
  const [data, setData] = useState<Leak[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/leaks`)
      .then((res) => setData(res.data.data))
      .catch(() => {});
  }, []);

  const highConfidence = data.filter((x) => x.confidence === "High").length;

  const mediumConfidence = data.filter((x) => x.confidence === "Medium").length;
  const getEvidence = (x: Leak) => {
    const evidence: string[] = [];

    if ((x as any).flow_evidence) {
      evidence.push("Flow anomaly");
    }

    if ((x as any).pressure_evidence) {
      evidence.push("Pressure anomaly");
    }

    if ((x as any).nighttime_evidence) {
      evidence.push("Nighttime high flow");
    }

    return evidence.length > 0 ? evidence.join(" + ") : "Pattern deviation";
  };

  const displayRows = data.map((x) => ({
    ...x,
    evidence: getEvidence(x),
    hypothesis: String(
      (x as any).leak_hypothesis ??
        "Potential pipeline leakage indicated by abnormal flow and pressure patterns.",
    ),
    status: "Investigation Required",
  }));
  return (
    <>
      <PageTitle
        title="Leak Detection & Localization"
        subtitle="Evidence-based suspected leak zones"
        icon={<MapPin />}
      />

      {/* Summary */}
      <div className="summary-cards">
        <div className="mini-card">
          <span>Total Assessments</span>
          <strong>{data.length}</strong>
        </div>

        <div className="mini-card danger-card">
          <span>High Confidence</span>
          <strong>{highConfidence}</strong>
        </div>

        <div className="mini-card">
          <span>Medium Confidence</span>
          <strong>{mediumConfidence}</strong>
        </div>

        <div className="mini-card">
          <span>Exact Underground Locations</span>
          <strong>0</strong>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>AI Leak Assessment</h2>
            <p>
              Leak hypotheses are generated by correlating flow, pressure and
              nighttime patterns.
            </p>
          </div>

          <AlertTriangle size={22} />
        </div>

        <div className="info-banner">
          <AlertTriangle size={18} />

          <span>
            The AI identifies suspected DMA or pipeline sections. It does not
            claim an exact underground leak location. Field verification is
            required before confirming a leak.
          </span>
        </div>
      </div>

      {/* Leak Evidence */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Leak Evidence Analysis</h2>
            <p>
              Multiple sensor signals are correlated before assigning leak
              confidence.
            </p>
          </div>

          <Activity size={22} />
        </div>

        <div className="summary-cards">
          <div className="mini-card">
            <span>Flow Evidence</span>
            <strong>
              {data.filter((x) => (x as any).flow_evidence).length}
            </strong>
            <small>Abnormal flow detected</small>
          </div>

          <div className="mini-card">
            <span>Pressure Evidence</span>
            <strong>
              {data.filter((x) => (x as any).pressure_evidence).length}
            </strong>
            <small>Pressure abnormality</small>
          </div>

          <div className="mini-card">
            <span>Nighttime Evidence</span>
            <strong>
              {data.filter((x) => (x as any).nighttime_evidence).length}
            </strong>
            <small>High nighttime flow</small>
          </div>
        </div>
      </div>

      {/* Leak Assessments */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Suspected Leak Zones</h2>
            <p>DMA and pipeline sections requiring investigation</p>
          </div>

          <MapPin size={22} />
        </div>

        <DataTable
          columns={[
            "timestamp",
            "dma_id",
            "pipe_section",
            "confidence",
            "leak_score",
            "evidence",
            "hypothesis",
            "recommendation",
            "status",
          ]}
          rows={displayRows}
        />
      </div>
    </>
  );
}
/* ================= WATER BALANCE ================= */

function WaterBalancePage() {
  const [data, setData] = useState<WaterBalance[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/water-balance`)
      .then((res) => setData(res.data.data))
      .catch(() => {});
  }, []);

  const totalSupplied = data.reduce(
    (sum, x) => sum + Number(x.total_water_supplied_m3),
    0,
  );

  const totalConsumption = data.reduce(
    (sum, x) => sum + Number(x.total_metered_consumption_m3),
    0,
  );

  const totalLoss = data.reduce(
    (sum, x) => sum + Number(x.unexplained_water_m3),
    0,
  );

  const highestLoss = data.reduce(
    (max, x) =>
      Number(x.water_loss_percentage) > Number(max?.water_loss_percentage ?? 0)
        ? x
        : max,
    data[0],
  );

  return (
    <>
      <PageTitle
        title="Water Balance & Loss Analysis"
        subtitle="Supplied water versus estimated consumption"
        icon={<Droplets />}
      />

      {/* Overall Water Balance */}
      <div className="summary-cards">
        <div className="mini-card">
          <span>Total Water Supplied</span>
          <strong>{totalSupplied.toFixed(0)} m³</strong>
          <small>Network input</small>
        </div>

        <div className="mini-card">
          <span>Total Consumption</span>
          <strong>{totalConsumption.toFixed(0)} m³</strong>
          <small>Metered consumption</small>
        </div>

        <div className="mini-card danger-card">
          <span>Unexplained Water</span>
          <strong>{totalLoss.toFixed(0)} m³</strong>
          <small>Potential loss indicator</small>
        </div>

        <div className="mini-card">
          <span>Highest Loss DMA</span>
          <strong>{highestLoss ? highestLoss.dma_id : "-"}</strong>
          <small>
            {highestLoss
              ? `${Number(highestLoss.water_loss_percentage).toFixed(2)}% loss`
              : "No data"}
          </small>
        </div>
      </div>

      {/* Explanation */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Water Balance Assessment</h2>
            <p>
              Comparison of supplied water against estimated metered consumption
              to identify unexplained losses.
            </p>
          </div>

          <Droplets size={22} />
        </div>

        <div className="info-banner">
          <AlertTriangle size={18} />

          <span>
            Unexplained water does not automatically mean leakage. It can also
            result from measurement errors, abnormal consumption, operational
            conditions or other network uncertainties. Further investigation is
            required.
          </span>
        </div>
      </div>

      {/* DMA Loss Cards */}
      <div className="summary-cards">
        {data.map((row) => (
          <div className="mini-card" key={row.dma_id}>
            <span>{row.dma_id} Water Loss</span>

            <strong>{Number(row.water_loss_percentage).toFixed(2)}%</strong>

            <small>
              {Number(row.unexplained_water_m3).toFixed(0)} m³ unexplained
            </small>

            <small>Severity: {row.loss_severity}</small>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>DMA Water Balance</h2>
            <p>Detailed supply, consumption and loss analysis</p>
          </div>

          <Activity size={22} />
        </div>

        <DataTable
          columns={[
            "dma_id",
            "total_water_supplied_m3",
            "total_metered_consumption_m3",
            "unexplained_water_m3",
            "water_loss_percentage",
            "average_hourly_loss_m3",
            "high_confidence_leak_events",
            "loss_severity",
          ]}
          rows={data}
        />
      </div>
    </>
  );
}
/* ================= MAINTENANCE ================= */
function MaintenancePage() {
  const [data, setData] = useState<Maintenance[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/maintenance`)
      .then((res) => setData(res.data.data))
      .catch(() => {});
  }, []);

  const criticalTasks = data.filter((x) =>
    x.priority.includes("Critical"),
  ).length;

  const highTasks = data.filter((x) => x.priority.includes("High")).length;

  const mediumTasks = data.filter((x) => x.priority.includes("Medium")).length;

  const topPriority = data.reduce(
    (max, x) =>
      Number(x.priority_score) > Number(max?.priority_score ?? 0) ? x : max,
    data[0],
  );

  return (
    <>
      <PageTitle
        title="Maintenance & Field Resource Planning"
        subtitle="Prioritized field inspection recommendations"
        icon={<Wrench />}
      />

      {/* Summary */}
      <div className="summary-cards">
        <div className="mini-card danger-card">
          <span>Critical Tasks</span>
          <strong>{criticalTasks}</strong>
          <small>P1 priority</small>
        </div>

        <div className="mini-card">
          <span>High Tasks</span>
          <strong>{highTasks}</strong>
          <small>P2 priority</small>
        </div>

        <div className="mini-card">
          <span>Medium Tasks</span>
          <strong>{mediumTasks}</strong>
          <small>P3 priority</small>
        </div>

        <div className="mini-card">
          <span>Pending Approval</span>
          <strong>
            {
              data.filter((x) => x.status.toLowerCase().includes("pending"))
                .length
            }
          </strong>
          <small>Human review required</small>
        </div>
      </div>

      {/* Top Priority */}
      {topPriority && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Top Priority Inspection</h2>
              <p>
                Highest-priority maintenance recommendation generated by the AI
                system.
              </p>
            </div>

            <Wrench size={22} />
          </div>

          <div className="info-banner">
            <AlertTriangle size={18} />

            <span>
              <strong>{topPriority.dma_id}</strong>
              {" — "}
              <strong>{topPriority.pipe_section}</strong>
              {" | "}
              Priority: <strong>{topPriority.priority}</strong>
              {" | "}
              Score:{" "}
              <strong>{Number(topPriority.priority_score).toFixed(2)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Maintenance Planning */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Field Inspection Plan</h2>
            <p>
              Maintenance tasks prioritized using loss, leak evidence,
              criticality and event duration.
            </p>
          </div>

          <Wrench size={22} />
        </div>

        <DataTable
          columns={[
            "dma_id",
            "pipe_section",
            "priority",
            "priority_score",
            "field_team",
            "status",
            "reason",
          ]}
          rows={data}
        />
      </div>

      {/* Human Approval Notice */}
      <div className="panel">
        <div className="info-banner">
          <AlertTriangle size={18} />

          <span>
            These are AI-generated recommendations only. Field actions require
            human approval before execution. The system does not directly
            operate pumps, valves or other physical infrastructure.
          </span>
        </div>
      </div>
    </>
  );
}

/* ================= OPERATIONS ================= */

function OperationsPage() {
  const [data, setData] = useState<Operation[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/operations`)
      .then((res) => setData(res.data.data))
      .catch(() => {});
  }, []);

  const critical = data.filter((x) => x.priority.includes("Critical")).length;

  const pending = data.filter((x) =>
    x.approval_status.toLowerCase().includes("pending"),
  ).length;

  return (
    <>
      <PageTitle
        title="Operations Coordination"
        subtitle="AI recommendations with human approval"
        icon={<ShieldCheck />}
      />

      {/* Workflow Summary */}
      <div className="summary-cards">
        <div className="mini-card danger-card">
          <span>Critical Recommendations</span>
          <strong>{critical}</strong>
        </div>

        <div className="mini-card">
          <span>Total Recommendations</span>
          <strong>{data.length}</strong>
        </div>

        <div className="mini-card">
          <span>Pending Human Approval</span>
          <strong>{pending}</strong>
        </div>

        <div className="mini-card">
          <span>Execution Mode</span>
          <strong>Manual</strong>
          <small>Human controlled</small>
        </div>
      </div>

      {/* Human Approval Banner */}
      <div className="approval-banner">
        <ShieldCheck size={28} />

        <div>
          <strong>Human Approval Required</strong>

          <p>
            The AI system provides decision support only. Operators must
            validate recommendations before any field action is performed.
          </p>
        </div>
      </div>

      {/* Agent Workflow */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>AI Operations Workflow</h2>
            <p>
              Evidence flows from detection agents to human-reviewed operational
              recommendations.
            </p>
          </div>

          <Activity size={22} />
        </div>

        <div className="workflow-steps">
          <div className="workflow-step">
            <strong>1</strong>
            <span>Sensor Monitoring</span>
          </div>

          <div className="workflow-step">
            <strong>2</strong>
            <span>Anomaly Detection</span>
          </div>

          <div className="workflow-step">
            <strong>3</strong>
            <span>Leak Assessment</span>
          </div>

          <div className="workflow-step">
            <strong>4</strong>
            <span>Water Balance</span>
          </div>

          <div className="workflow-step">
            <strong>5</strong>
            <span>Maintenance Priority</span>
          </div>

          <div className="workflow-step">
            <strong>6</strong>
            <span>Human Approval</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="operations-grid">
        {data.map((item, index) => (
          <div className="operation-card" key={index}>
            <div className="operation-top">
              <span className="priority-tag">{item.priority}</span>

              <Clock3 size={18} />
            </div>

            <h3>
              {item.dma_id} — {item.pipe_section}
            </h3>

            <p className="action">{item.recommended_action}</p>

            <div className="evidence">
              <strong>Evidence</strong>
              <p>{item.evidence_summary}</p>
            </div>

            <div className="operation-status">
              <ShieldCheck size={16} />
              {item.approval_status}
            </div>
          </div>
        ))}
      </div>

      {/* Safety / Decision Support Notice */}
      <div className="panel">
        <div className="info-banner">
          <AlertTriangle size={18} />

          <span>
            No automatic physical control is performed by the AI system. Pumps,
            valves and other infrastructure remain under operator control.
          </span>
        </div>
      </div>
    </>
  );
}

/* ================= REPORTS ================= */

function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async () => {
    setDownloading(true);

    try {
      const response = await axios.get(`${API}/api/report/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "water_network_report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report download failed:", error);
      alert(
        "Unable to generate the PDF report. Please make sure the backend is running.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Water Network Reports"
        subtitle="Generate and download the latest AI network assessment report"
        icon={<BarChart3 />}
      />

      <div className="panel">
        <div style={{ padding: "30px" }}>
          <div className="page-title-icon">
            <BarChart3 size={32} />
          </div>

          <h2>Water Network PDF Report</h2>

          <p>
            Generate a comprehensive report containing network monitoring,
            demand forecasting, anomaly detection, leak assessment, water
            balance, maintenance priorities, and operational recommendations.
          </p>

          <br />

          <button
            className="refresh-button"
            onClick={downloadReport}
            disabled={downloading}
          >
            <BarChart3 size={17} />

            {downloading ? "Generating Report..." : "Download PDF Report"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ================= HELPERS ================= */

function PageTitle({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="page-title">
      <div className="page-title-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Record<string, any>[];
}) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <Activity size={30} />
        <p>No data available.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column.replaceAll("_", " ")}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>
                  {typeof row[column] === "number"
                    ? row[column].toFixed(2)
                    : String(row[column] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
