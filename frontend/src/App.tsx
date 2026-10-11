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
  Map,
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
  | "Network Configuration"
  | "Network Monitoring"
  | "Demand Forecasting"
  | "Anomalies"
  | "Alert Center"
  | "Leak Detection"
  | "Pressure & Flow Analytics"
  | "Water Balance"
  | "Maintenance"
  | "Field Operations"
  | "AI Operations Center"
  | "Operations"
  | "Reports"
  | "Live Network Map";

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
    pending_approvals: number;
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
  assigned_team: string;
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
    { name: "Live Network Map", icon: <Map size={19} /> },
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

        {page === "Network Configuration" && <NetworkConfigurationPage />}

        {page === "Network Monitoring" && <MonitoringPage />}

        {page === "Demand Forecasting" && <Forecasting />}

        {page === "Anomalies" && <AnomaliesPage />}

        {page === "Alert Center" && <AlertCenterPage />}

        {page === "Leak Detection" && <LeaksPage />}

        {page === "Pressure & Flow Analytics" && <PressureFlowAnalyticsPage />}

        {page === "Water Balance" && <WaterBalancePage />}

        {page === "Maintenance" && <MaintenancePage />}

        {page === "Field Operations" && <FieldOperationsPage />}

        {page === "AI Operations Center" && <AIOperationsCenterPage />}

        {page === "Operations" && <OperationsPage />}

        {page === "Reports" && <ReportsPage />}

        {page === "Live Network Map" && <LiveNetworkMapPage />}

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

/* ================= ALERT CENTER ================= */

function AlertCenterPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const [anomalyResponse, leakResponse] = await Promise.all([
          axios.get(`${API}/api/anomalies`),
          axios.get(`${API}/api/leaks`),
        ]);

        const anomalyData = anomalyResponse.data.data || [];
        const leakData = leakResponse.data.data || [];

        const anomalyAlerts = anomalyData.map((item: any) => ({
          dma_id: item.dma_id,
          timestamp: item.timestamp,
          type: "Anomaly Detected",
          severity:
            item.flow_z_score >= 3 || item.pressure_z_score >= 3
              ? "High"
              : "Medium",
          message: "Abnormal flow or pressure condition detected.",
          evidence: `Flow z-score: ${Number(item.flow_z_score || 0).toFixed(
            2,
          )}, Pressure z-score: ${Number(item.pressure_z_score || 0).toFixed(
            2,
          )}`,
        }));

        const leakAlerts = leakData
          .filter((item: any) => item.confidence === "High")
          .map((item: any) => ({
            dma_id: item.dma_id,
            timestamp: item.timestamp,
            type: "Suspected Leak",
            severity: "High",
            message:
              item.hypothesis ||
              "Multiple sensor indicators suggest a possible leak.",
            evidence:
              item.evidence ||
              "Flow, pressure and nighttime conditions correlated.",
          }));

        setAlerts([...anomalyAlerts, ...leakAlerts]);
      } catch (error) {
        console.error("Failed to load alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const highAlerts = alerts.filter((alert) => alert.severity === "High").length;

  const leakAlerts = alerts.filter(
    (alert) => alert.type === "Suspected Leak",
  ).length;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Alert Center</h1>
          <p>
            Centralized view of detected anomalies and suspected leak events
          </p>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon orange">
            <AlertTriangle />
          </div>
          <div>
            <span>Total Alerts</span>
            <strong>{alerts.length}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <AlertTriangle />
          </div>
          <div>
            <span>High Severity</span>
            <strong>{highAlerts}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Droplets />
          </div>
          <div>
            <span>Suspected Leaks</span>
            <strong>{leakAlerts}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Active AI Alerts</h2>
            <p>
              Alerts generated from flow, pressure and leak-detection analysis
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p>No active alerts detected.</p>
        ) : (
          <div className="alert-list">
            {alerts.map((alert, index) => (
              <div className="alert-card" key={`${alert.dma_id}-${index}`}>
                <div>
                  <strong>
                    {alert.type} — {alert.dma_id}
                  </strong>

                  <p>{alert.message}</p>

                  <small>
                    {alert.timestamp} · {alert.evidence}
                  </small>
                </div>

                <span
                  className={
                    alert.severity === "High"
                      ? "status-badge critical"
                      : "status-badge warning"
                  }
                >
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>AI Alert Interpretation</h2>
            <p>
              Alerts are decision-support signals and require operator
              validation before field action.
            </p>
          </div>
        </div>

        <div className="approval-box">
          <div className="approval-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <strong>Human Validation Required</strong>
            <p>
              AI-generated alerts do not directly control pumps, valves or other
              physical infrastructure.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= NETWORK CONFIGURATION ================= */

function NetworkConfigurationPage() {
  const [network, setNetwork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNetwork = async () => {
      try {
        const response = await axios.get(`${API}/api/network`);
        setNetwork(response.data.data || []);
      } catch (error) {
        console.error("Failed to load network configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNetwork();
  }, []);

  const totalDMAs = new Set(network.map((item) => item.dma_id)).size;
  const totalPipes = network.length;
  const highCriticality = network.filter(
    (item) => item.criticality === "High",
  ).length;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Network Configuration</h1>
          <p>
            Water-network assets, distribution zones and pipeline configuration
          </p>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Gauge />
          </div>
          <div>
            <span>Distribution Zones</span>
            <strong>{totalDMAs}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <MapPin />
          </div>
          <div>
            <span>Pipeline Sections</span>
            <strong>{totalPipes}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <AlertTriangle />
          </div>
          <div>
            <span>High Criticality Assets</span>
            <strong>{highCriticality}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <CheckCircle2 />
          </div>
          <div>
            <span>Network Status</span>
            <strong>Operational</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Configured Network Assets</h2>
            <p>
              Current reservoir, pipeline and DMA configuration used by the AI
              workflow
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading network configuration...</p>
        ) : network.length === 0 ? (
          <p>No network configuration available.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DMA</th>
                  <th>Reservoir</th>
                  <th>Pipeline</th>
                  <th>Criticality</th>
                  <th>Network Status</th>
                </tr>
              </thead>

              <tbody>
                {network.map((item, index) => (
                  <tr key={`${item.dma_id}-${index}`}>
                    <td>
                      <strong>{item.dma_id}</strong>
                    </td>

                    <td>{item.reservoir || "Reservoir-1"}</td>

                    <td>{item.pipe_id || item.pipeline || "N/A"}</td>

                    <td>
                      <span
                        className={
                          item.criticality === "High"
                            ? "status-badge critical"
                            : "status-badge warning"
                        }
                      >
                        {item.criticality || "Medium"}
                      </span>
                    </td>

                    <td>
                      <span className="status-badge">Operational</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Network Configuration Logic</h2>
            <p>
              These assets provide the topology context used by anomaly,
              leak-detection and maintenance agents.
            </p>
          </div>
        </div>

        <div className="approval-box">
          <div className="approval-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <strong>AI Decision-Support Configuration</strong>
            <p>
              Network configuration is used for analysis and recommendations.
              The system does not directly control physical pumps or valves.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= PRESSURE & FLOW ANALYTICS ================= */

function PressureFlowAnalyticsPage() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSensors = async () => {
      try {
        const response = await axios.get(`${API}/api/sensors`);
        setSensors(response.data.data || []);
      } catch (error) {
        console.error("Failed to load sensor analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSensors();
  }, []);

  const averageFlow =
    sensors.length > 0
      ? sensors.reduce(
          (sum, item) => sum + Number(item.inlet_flow_m3h || 0),
          0,
        ) / sensors.length
      : 0;

  const averagePressure =
    sensors.length > 0
      ? sensors.reduce((sum, item) => sum + Number(item.pressure_bar || 0), 0) /
        sensors.length
      : 0;

  const highestFlow =
    sensors.length > 0
      ? Math.max(...sensors.map((item) => Number(item.inlet_flow_m3h || 0)))
      : 0;

  const lowestPressure =
    sensors.length > 0
      ? Math.min(...sensors.map((item) => Number(item.pressure_bar || 0)))
      : 0;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Pressure & Flow Analytics</h1>
          <p>
            Analyze hydraulic flow and pressure patterns across monitored
            distribution zones
          </p>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Gauge />
          </div>
          <div>
            <span>Average Flow</span>
            <strong>{averageFlow.toFixed(2)} m³/h</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <Activity />
          </div>
          <div>
            <span>Average Pressure</span>
            <strong>{averagePressure.toFixed(2)} bar</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <TrendingUp />
          </div>
          <div>
            <span>Peak Flow</span>
            <strong>{highestFlow.toFixed(2)} m³/h</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <AlertTriangle />
          </div>
          <div>
            <span>Lowest Pressure</span>
            <strong>{lowestPressure.toFixed(2)} bar</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>DMA Hydraulic Summary</h2>
            <p>
              Current flow and pressure characteristics for each monitored
              distribution area
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading hydraulic data...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DMA</th>
                  <th>Average Flow (m³/h)</th>
                  <th>Average Pressure (bar)</th>
                  <th>Maximum Flow (m³/h)</th>
                  <th>Minimum Pressure (bar)</th>
                </tr>
              </thead>

              <tbody>
                {["DMA-A", "DMA-B", "DMA-C"].map((dma) => {
                  const rows = sensors.filter((item) => item.dma_id === dma);

                  const flows = rows.map((item) =>
                    Number(item.inlet_flow_m3h || 0),
                  );

                  const pressures = rows.map((item) =>
                    Number(item.pressure_bar || 0),
                  );

                  const dmaAvgFlow =
                    flows.length > 0
                      ? flows.reduce((a, b) => a + b, 0) / flows.length
                      : 0;

                  const dmaAvgPressure =
                    pressures.length > 0
                      ? pressures.reduce((a, b) => a + b, 0) / pressures.length
                      : 0;

                  return (
                    <tr key={dma}>
                      <td>
                        <strong>{dma}</strong>
                      </td>
                      <td>{dmaAvgFlow.toFixed(2)}</td>
                      <td>{dmaAvgPressure.toFixed(2)}</td>
                      <td>
                        {flows.length ? Math.max(...flows).toFixed(2) : "0.00"}
                      </td>
                      <td>
                        {pressures.length
                          ? Math.min(...pressures).toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Hydraulic Interpretation</h2>
            <p>
              Flow and pressure relationships support anomaly and leak
              investigation.
            </p>
          </div>
        </div>

        <div className="approval-box">
          <div className="approval-icon">
            <AlertTriangle size={25} />
          </div>

          <div>
            <strong>AI Analysis Signal</strong>
            <p>
              A simultaneous increase in flow and decrease in pressure can
              strengthen a suspected leak hypothesis when supported by
              additional evidence such as nighttime demand and topology.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= FIELD OPERATIONS ================= */

function FieldOperationsPage() {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFieldOperations = async () => {
      try {
        const [maintenanceResponse, operationsResponse] = await Promise.all([
          axios.get(`${API}/api/maintenance`),
          axios.get(`${API}/api/operations`),
        ]);

        setMaintenance(maintenanceResponse.data.data || []);
        setOperations(operationsResponse.data.data || []);
      } catch (error) {
        console.error("Failed to load field operations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFieldOperations();
  }, []);

  const activeTeams = new Set(
    maintenance.map((item) => item.assigned_team).filter(Boolean),
  ).size;

  const openActions = maintenance.filter(
    (item) =>
      !String(item.approval_status || "")
        .toLowerCase()
        .includes("completed"),
  ).length;

  const criticalActions = maintenance.filter(
    (item) => item.priority === "Priority 1 - Critical",
  ).length;

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Field Operations</h1>
          <p>Inspection teams, field actions and maintenance recommendations</p>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Activity />
          </div>
          <div>
            <span>Active Field Teams</span>
            <strong>{activeTeams}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <Wrench />
          </div>
          <div>
            <span>Open Actions</span>
            <strong>{openActions}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <AlertTriangle />
          </div>
          <div>
            <span>Critical Actions</span>
            <strong>{criticalActions}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <ShieldCheck />
          </div>
          <div>
            <span>AI Recommendations</span>
            <strong>{operations.length}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Field Maintenance Assignments</h2>
            <p>
              AI-prioritized field actions requiring inspection or maintenance
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading field operations...</p>
        ) : maintenance.length === 0 ? (
          <p>No field actions available.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DMA</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Assigned Team</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {maintenance.map((item, index) => (
                  <tr key={`${item.dma_id}-${index}`}>
                    <td>
                      <strong>{item.dma_id}</strong>
                    </td>

                    <td>{item.pipe_id || "N/A"}</td>

                    <td>
                      <span
                        className={
                          item.priority === "Priority 1 - Critical"
                            ? "status-badge critical"
                            : "status-badge warning"
                        }
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td>{item.assigned_team || "Unassigned"}</td>

                    <td>
                      <strong>
                        {Number(item.priority_score || 0).toFixed(2)}
                      </strong>
                    </td>

                    <td>{item.approval_status || "Pending Human Approval"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Field Action Plan</h2>
            <p>
              Recommended actions generated from leak evidence and network
              conditions
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          {maintenance.map((item, index) => (
            <div className="panel" key={`${item.dma_id}-action-${index}`}>
              <h3>
                {item.dma_id} — {item.pipe_id}
              </h3>

              <p>
                <strong>Team:</strong> {item.assigned_team || "Unassigned"}
              </p>

              <p>
                <strong>Priority:</strong> {item.priority}
              </p>

              <p>
                <strong>Reason:</strong>{" "}
                {item.reason || "Network risk requires field inspection."}
              </p>

              <p>
                <strong>Action:</strong>{" "}
                {item.recommended_action ||
                  "Inspect the suspected network section and verify field conditions."}
              </p>

              <div className="approval-box">
                <div className="approval-icon">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <strong>Human Approval Required</strong>
                  <p>
                    Field teams act only after an authorized operator approves
                    the recommendation.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= AI OPERATIONS CENTER ================= */

function AIOperationsCenterPage() {
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgentStatus = async () => {
      try {
        const [agentResponse, reviewerResponse] = await Promise.all([
          axios.get(`${API}/api/agent-status`),
          axios.get(`${API}/api/reviewer`),
        ]);

        setAgentStatus(agentResponse.data);
        setReviewer(reviewerResponse.data);
      } catch (error) {
        console.error("Failed to load agent workflow:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgentStatus();
  }, []);

  const agentDetails = [
    {
      name: "Monitoring Agent",
      purpose: "Validates incoming sensor data and network health.",
      output: "Sensor quality and network status",
    },
    {
      name: "Demand Forecasting Agent",
      purpose: "Predicts expected water demand using the trained ML model.",
      output: "Forecast demand",
    },
    {
      name: "Anomaly Detection Agent",
      purpose: "Identifies abnormal flow, pressure and nighttime conditions.",
      output: "Anomaly scores",
    },
    {
      name: "Leak Detection Agent",
      purpose: "Correlates flow, pressure and nighttime evidence.",
      output: "Leak hypothesis and confidence",
    },
    {
      name: "Water Balance Agent",
      purpose: "Compares supplied and metered water.",
      output: "Estimated water loss",
    },
    {
      name: "Maintenance Agent",
      purpose: "Prioritizes assets and assigns field resources.",
      output: "Maintenance recommendation",
    },
    {
      name: "Operations Agent",
      purpose: "Coordinates recommendations and requests human approval.",
      output: "Operational recommendation",
    },
  ];

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>AI Operations Center</h1>
          <p>
            Agent execution visibility, reasoning outputs and human approval
            workflow
          </p>
        </div>
      </section>

      {loading ? (
        <section className="panel">
          <p>Loading AI workflow...</p>
        </section>
      ) : (
        <>
          <section className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon blue">
                <Activity />
              </div>
              <div>
                <span>AI Agents</span>
                <strong>{agentStatus?.agents?.length || 7}</strong>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green">
                <CheckCircle2 />
              </div>
              <div>
                <span>Completed Agents</span>
                <strong>
                  {agentStatus?.agents?.filter(
                    (agent: any) => agent.status === "Completed",
                  ).length || 0}
                </strong>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon orange">
                <ShieldCheck />
              </div>
              <div>
                <span>Human Approval</span>
                <strong>
                  {agentStatus?.human_approval_required
                    ? "Required"
                    : "Not Required"}
                </strong>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon purple">
                <Wrench />
              </div>
              <div>
                <span>Workflow State</span>
                <strong>{agentStatus?.workflow_status || "Completed"}</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Agent Execution Pipeline</h2>
                <p>
                  Seven specialized agents working as a decision-support
                  workflow
                </p>
              </div>
            </div>
            <div className="agent-flow">
              {agentDetails.map((agent, index) => {
                const actualAgent = agentStatus?.agents?.find(
                  (item: any) => item.name === agent.name,
                );

                return (
                  <div className="agent-step" key={agent.name}>
                    <div className="agent-number">{index + 1}</div>

                    <div>
                      <strong>{agent.name}</strong>
                      <p>{agent.purpose}</p>

                      <small>Output: {agent.output}</small>

                      <div className="operation-status">
                        <CheckCircle2 size={16} />
                        {actualAgent?.status || "Completed"}
                      </div>
                    </div>

                    {index < agentDetails.length - 1 && (
                      <div className="arrow">→</div>
                    )}
                  </div>
                );
              })}
            </div>{" "}
          </section>

          {/* ================= REVIEWER / CRITIC ================= */}

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Reviewer / Critic Feedback</h2>
                <p>
                  Independent review of AI-generated maintenance recommendations
                </p>
              </div>
            </div>

            <div className="dashboard-grid">
              {reviewer?.data?.map((item: any) => (
                <div className="panel" key={item.dma_id}>
                  <h3>
                    {item.dma_id} — {item.review_status}
                  </h3>

                  <p>
                    <strong>Evidence:</strong>
                  </p>

                  <ul>
                    {item.evidence?.map((evidence: string) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>

                  <p>
                    <strong>Reviewer Recommendation:</strong>{" "}
                    {item.reviewer_recommendation}
                  </p>

                  <div className="operation-status">
                    <ShieldCheck size={16} />
                    Human approval required
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= AI DECISION EVIDENCE ================= */}

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>AI Decision Evidence</h2>
                  <p>Information used across the decision pipeline</p>
                </div>
              </div>

              <div className="approval-box">
                <div className="approval-icon">
                  <Activity size={24} />
                </div>

                <div>
                  <strong>Sensor & Forecast Evidence</strong>
                  <p>
                    Sensor validation, demand forecasting, flow anomalies and
                    pressure anomalies provide the initial evidence.
                  </p>
                </div>
              </div>

              <div className="approval-box">
                <div className="approval-icon">
                  <Droplets size={24} />
                </div>

                <div>
                  <strong>Leak & Water-Loss Evidence</strong>
                  <p>
                    The leak and water-balance agents combine sensor evidence,
                    nighttime behavior and network information.
                  </p>
                </div>
              </div>

              <div className="approval-box">
                <div className="approval-icon">
                  <Wrench size={24} />
                </div>

                <div>
                  <strong>Maintenance Evidence</strong>
                  <p>
                    Leak confidence, water loss, infrastructure criticality and
                    repeated events influence maintenance priority.
                  </p>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Human Decision</h2>
                  <p>Final operational action remains under human control</p>
                </div>
              </div>

              <div className="approval-box">
                <div className="approval-icon">
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <strong>Human Approval Required</strong>
                  <p>
                    The AI system produces recommendations only. An authorized
                    network operator must approve field operations before
                    execution.
                  </p>
                </div>
              </div>

              <div className="operation-status">
                <ShieldCheck size={16} />
                Workflow:{" "}
                {agentStatus?.workflow_status || "Awaiting Human Approval"}
              </div>
            </div>
          </section>
        </>
      )}
    </>
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
              <p>
                {dashboard.operations.pending_approvals} AI recommendation
                {dashboard.operations.pending_approvals === 1 ? "" : "s"}{" "}
                waiting for operator validation.
              </p>
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
            "assigned_team",
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
  const agentWorkflow = [
    {
      name: "Monitoring Agent",
      icon: "🔍",
      description: "Validates sensor data and network health",
    },
    {
      name: "Demand Forecasting Agent",
      icon: "📈",
      description: "Forecasts expected water demand",
    },
    {
      name: "Anomaly Detection Agent",
      icon: "⚠️",
      description: "Detects abnormal flow and pressure patterns",
    },
    {
      name: "Leak Detection Agent",
      icon: "💧",
      description: "Correlates evidence and assesses leak risk",
    },
    {
      name: "Water Balance Agent",
      icon: "📊",
      description: "Calculates water loss and unexplained consumption",
    },
    {
      name: "Maintenance Agent",
      icon: "🛠️",
      description: "Prioritizes maintenance and field resources",
    },
    {
      name: "Operations Agent",
      icon: "👷",
      description: "Prepares human-reviewed operational actions",
    },
  ];
  const [data, setData] = useState<Operation[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>(
    {},
  );
  const [approvalStatus, setApprovalStatus] = useState<Record<string, string>>(
    {},
  );
  const [repairValidation, setRepairValidation] = useState<Record<string, any>>(
    {},
  );

  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    // Load operations recommendations
    axios
      .get(`${API}/api/operations`)
      .then((res) => {
        console.log("OPERATIONS API:", res.data);

        if (Array.isArray(res.data)) {
          setData(res.data);
        } else if (Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          console.error("Unexpected operations response:", res.data);
          setData([]);
        }
      })
      .catch((error) => {
        console.error("Operations data fetch failed:", error);
      });

    // Load agent execution status
    axios
      .get(`${API}/api/agent-status`)
      .then((res) => {
        console.log("AGENT STATUS API:", res.data);

        const statuses: Record<string, string> = {};

        if (Array.isArray(res.data.agents)) {
          res.data.agents.forEach((agent: any) => {
            statuses[agent.name] = agent.status;
          });
        }

        setAgentStatuses(statuses);
      })
      .catch((error) => {
        console.error("Agent status fetch failed:", error);
      });
  }, []);

  const handleApproval = async (
    dmaId: string,
    action: "approve" | "reject",
  ) => {
    try {
      const response = await axios.post(
        `${API}/api/operations/${dmaId}/approval`,
        {
          action,
          approved_by: "Network Operator",
          observation:
            action === "approve"
              ? "Field inspection approved."
              : "Operation rejected for further review.",
        },
      );

      setApprovalStatus((prev) => ({
        ...prev,
        [dmaId]: response.data.approval_status,
      }));

      setApprovalMessage(`${dmaId}: ${response.data.approval_status}`);
    } catch (error) {
      console.error("Approval update failed:", error);
      setApprovalMessage(`${dmaId}: Approval request failed`);
    }
  };

  const handleRepair = async (dmaId: string) => {
    try {
      await axios.post(`${API}/api/operations/${dmaId}/repair`, {
        repair_status: "completed",
        completed_by: "Field Team",
        observation: "Field inspection and repair completed successfully.",
      });

      const validationResponse = await axios.get(
        `${API}/api/operations/${dmaId}/repair-validation`,
      );

      const validation = validationResponse.data;

      setRepairValidation((prev) => ({
        ...prev,
        [dmaId]: validation,
      }));

      setApprovalMessage(`${dmaId}: ${validation.validation_result}`);
    } catch (error) {
      console.error("Repair validation failed:", error);

      setApprovalMessage(`${dmaId}: Repair validation failed`);
    }
  };

  const critical = data.filter((x) => x.priority.includes("Critical")).length;

  const pending = data.filter((x) => {
    const status = approvalStatus[x.dma_id] || x.approval_status;
    return status.toLowerCase().includes("pending");
  }).length;

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

      <div
        style={{
          marginBottom: "24px",
          padding: "20px",
          borderRadius: "12px",
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>🤖 Agent Execution Workflow</h2>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "18px",
          }}
        >
          Evidence flows from detection agents to human-reviewed operational
          recommendations.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {agentWorkflow.map((agent, index) => (
            <div
              key={agent.name}
              style={{
                flex: "1 1 180px",
                minWidth: "180px",
                padding: "14px",
                borderRadius: "10px",
                background: "#172033",
                border: "1px solid #334155",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                {agent.icon}
              </div>

              <strong>{agent.name}</strong>

              <p
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  lineHeight: 1.4,
                }}
              >
                {agent.description}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "4px 8px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  background:
                    agentStatuses[agent.name] === "Awaiting Human Approval"
                      ? "#78350f"
                      : "#14532d",
                  color:
                    agentStatuses[agent.name] === "Awaiting Human Approval"
                      ? "#fbbf24"
                      : "#86efac",
                }}
              >
                {agentStatuses[agent.name] || "Loading..."}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="operations-grid">
        {data.map((item, index) => (
          <div className="operation-card" key={index}>
            <div className="operation-top">
              <span className="priority-tag">{item.priority}</span>

              <Clock3 size={18} />
              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "15px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <strong>Human Approval</strong>

                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {(
                    approvalStatus[item.dma_id] ||
                    item.approval_status ||
                    ""
                  ).toLowerCase() === "pending human approval" ? (
                    <>
                      <button
                        onClick={() => handleApproval(item.dma_id, "approve")}
                        style={{
                          padding: "9px 16px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          background: "#16a34a",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Approve
                      </button>

                      <button
                        onClick={() => handleApproval(item.dma_id, "reject")}
                        style={{
                          padding: "9px 16px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          background: "#dc2626",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <span
                      style={{
                        padding: "9px 16px",
                        borderRadius: "6px",
                        background: "#172033",
                        fontWeight: 600,
                      }}
                    >
                      ✓ {approvalStatus[item.dma_id] || item.approval_status}
                    </span>
                  )}

                  <button
                    onClick={() => handleRepair(item.dma_id)}
                    disabled={
                      (
                        approvalStatus[item.dma_id] ||
                        item.approval_status ||
                        ""
                      ).toLowerCase() !== "approved"
                    }
                    style={{
                      padding: "9px 16px",
                      borderRadius: "6px",
                      border: "none",
                      cursor:
                        (
                          approvalStatus[item.dma_id] ||
                          item.approval_status ||
                          ""
                        ).toLowerCase() === "approved"
                          ? "pointer"
                          : "not-allowed",
                      background:
                        (
                          approvalStatus[item.dma_id] ||
                          item.approval_status ||
                          ""
                        ).toLowerCase() === "approved"
                          ? "#2563eb"
                          : "#e5e7eb",
                      color:
                        (
                          approvalStatus[item.dma_id] ||
                          item.approval_status ||
                          ""
                        ).toLowerCase() === "approved"
                          ? "white"
                          : "#9ca3af",
                      fontWeight: 600,
                      opacity:
                        (
                          approvalStatus[item.dma_id] ||
                          item.approval_status ||
                          ""
                        ).toLowerCase() === "approved"
                          ? 1
                          : 0.6,
                    }}
                  >
                    🔧 Complete Repair
                  </button>
                </div>
                {repairValidation[item.dma_id] && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "#172033",
                      border: "1px solid #334155",
                      color: "white",
                    }}
                  >
                    <strong>Post-Repair Validation</strong>

                    <div style={{ marginTop: "8px" }}>
                      Status:{" "}
                      <strong>
                        {repairValidation[item.dma_id].validation_result}
                      </strong>
                    </div>

                    <div style={{ marginTop: "6px" }}>
                      Flow reduction:{" "}
                      <strong>
                        {
                          repairValidation[item.dma_id].improvement
                            .flow_reduction_percent
                        }
                        %
                      </strong>
                    </div>

                    <div style={{ marginTop: "6px" }}>
                      Pressure change:{" "}
                      <strong>
                        {
                          repairValidation[item.dma_id].improvement
                            .pressure_increase_percent
                        }
                        %
                      </strong>
                    </div>

                    <div style={{ marginTop: "6px" }}>
                      Leak risk:{" "}
                      <strong>{repairValidation[item.dma_id].leak_risk}</strong>
                    </div>
                  </div>
                )}

                {approvalStatus[item.dma_id] && (
                  <p style={{ marginTop: "10px" }}>
                    Validation Status:{" "}
                    <strong>{approvalStatus[item.dma_id]}</strong>
                  </p>
                )}
              </div>
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
              {repairValidation[item.dma_id]
                ? repairValidation[item.dma_id].validation_result
                : approvalStatus[item.dma_id] || item.approval_status}
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

/* ================= LIVE NETWORK MAP ================= */

function LiveNetworkMapPage() {
  const [network, setNetwork] = useState<any[]>([]);
  const [leaks, setLeaks] = useState<any[]>([]);
  const [waterBalance, setWaterBalance] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API}/api/network`)
      .then((res) => {
        setNetwork(res.data.data);
      })
      .catch((error) => {
        console.error("Network data fetch failed:", error);
      });

    axios
      .get(`${API}/api/leaks`)
      .then((res) => {
        setLeaks(res.data.data);
      })
      .catch((error) => {
        console.error("Leak data fetch failed:", error);
      });

    axios
      .get(`${API}/api/water-balance`)
      .then((res) => {
        setWaterBalance(res.data.data);
      })
      .catch((error) => {
        console.error("Water balance fetch failed:", error);
      });
  }, []);

  const getLatestLeak = (dmaId: string) => {
    const dmaLeaks = leaks.filter((item) => item.dma_id === dmaId);

    if (dmaLeaks.length === 0) {
      return null;
    }

    return dmaLeaks.reduce((highest, current) => {
      return Number(current.leak_score) > Number(highest.leak_score)
        ? current
        : highest;
    });
  };

  const getLoss = (dmaId: string) => {
    const item = waterBalance.find((record) => record.dma_id === dmaId);

    return item ? Number(item.water_loss_percentage).toFixed(2) : "0.00";
  };

  return (
    <>
      <PageTitle
        title="Live Network Map"
        subtitle="Water distribution topology, leak evidence and asset status"
        icon={<Map />}
      />

      <div className="panel">
        <div style={{ padding: "30px" }}>
          <h2>Water Distribution Network</h2>

          <p>
            Live topology view using leak detection and water-balance
            intelligence.
          </p>

          {/* Reservoir */}
          <div
            className="kpi-card"
            style={{
              marginTop: "30px",
              marginBottom: "25px",
            }}
          >
            <Gauge size={26} />

            <div>
              <strong>Reservoir-1</strong>
              <span>Network Source</span>
            </div>
          </div>

          {/* DMA cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {network.map((item) => {
              const leak = getLatestLeak(item.dma_id);

              const confidence = leak?.confidence || "Normal";

              const status =
                confidence === "High"
                  ? "Suspected Leak"
                  : confidence === "Medium"
                    ? "Investigation Required"
                    : "Normal";

              const statusClass =
                confidence === "High"
                  ? "danger"
                  : confidence === "Medium"
                    ? "warning"
                    : "success";

              return (
                <div className="operation-card" key={item.dma_id}>
                  <div className="operation-top">
                    <span className="priority-tag">
                      {item.criticality} Criticality
                    </span>

                    <Droplets size={20} />
                  </div>

                  <h3>
                    {item.pipe_section} → {item.dma_id}
                  </h3>

                  <p>
                    Reservoir-1 → {item.pipe_section} → {item.dma_id}
                  </p>

                  <div
                    style={{
                      marginTop: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong>Status</strong>

                    <span className={`status-badge ${statusClass}`}>
                      {status}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p>
                      <strong>Leak Score:</strong> {leak ? leak.leak_score : 0}
                    </p>

                    <p>
                      <strong>Confidence:</strong> {confidence}
                    </p>

                    <p>
                      <strong>Water Loss:</strong> {getLoss(item.dma_id)}%
                    </p>
                  </div>

                  {/* Evidence */}
                  {leak && (
                    <div
                      style={{
                        marginTop: "15px",
                        paddingTop: "15px",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <strong>Leak Evidence</strong>

                      <div
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <span>
                          {leak.flow_evidence ? "✓" : "✗"} Flow anomaly
                        </span>

                        <span>
                          {leak.pressure_evidence ? "✓" : "✗"} Pressure anomaly
                        </span>

                        <span>
                          {leak.nighttime_evidence ? "✓" : "✗"} Nighttime high
                          flow
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hypothesis */}
                  {leak?.leak_hypothesis && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <strong>AI Assessment</strong>

                      <p style={{ marginTop: "8px" }}>{leak.leak_hypothesis}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
