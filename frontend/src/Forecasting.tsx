import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BrainCircuit,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface ForecastRecord {
  timestamp: string;
  dma_id: string;
  actual_demand_m3h: number;
  forecast_demand_m3h: number;
}

interface ForecastResponse {
  model: string;
  target: string;
  mae: number;
  rmse: number;
  records: ForecastRecord[];
}

export default function Forecasting() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [selectedDMA, setSelectedDMA] = useState("DMA-A");
  const [loading, setLoading] = useState(true);
  const [hour, setHour] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [lag1, setLag1] = useState("");
  const [lag24, setLag24] = useState("");
  const [rolling6h, setRolling6h] = useState("");

  const [prediction, setPrediction] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/forecast`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Forecast API error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const predictDemand = async () => {
    if (
      hour === "" ||
      dayOfWeek === "" ||
      dayOfMonth === "" ||
      lag1 === "" ||
      lag24 === "" ||
      rolling6h === ""
    ) {
      alert("Please enter all forecast values.");
      return;
    }

    try {
      setPredicting(true);

      const response = await axios.post(`${API_BASE}/api/forecast/predict`, {
        hour: Number(hour),
        day_of_week: Number(dayOfWeek),
        day_of_month: Number(dayOfMonth),
        lag_1: Number(lag1),
        lag_24: Number(lag24),
        rolling_6h: Number(rolling6h),
      });

      setPrediction(response.data.predicted_demand_m3h);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Unable to generate prediction.");
    } finally {
      setPredicting(false);
    }
  };

  const dmas = useMemo(() => {
    if (!data) return [];

    return Array.from(new Set(data.records.map((item) => item.dma_id)));
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.records
      .filter((item) => item.dma_id === selectedDMA)
      .map((item) => ({
        time: new Date(item.timestamp).toLocaleString("en-IN", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        actual: item.actual_demand_m3h,
        forecast: item.forecast_demand_m3h,
      }));
  }, [data, selectedDMA]);

  if (loading) {
    return (
      <div className="page-loading">
        <BrainCircuit size={36} />
        <h2>Loading Demand Forecasting...</h2>
        <p>AI model predictions are being loaded.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-loading">
        <h2>Forecast data unavailable</h2>
        <p>
          Make sure the FastAPI backend is running and /api/forecast is
          available.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Demand Forecasting</h1>
          <p>
            AI-powered water demand prediction using historical consumption
            patterns.
          </p>
        </div>

        <div className="forecast-model-badge">
          <BrainCircuit size={18} />
          Random Forest Regressor
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BrainCircuit size={22} />
          </div>
          <div>
            <span>Forecast Model</span>
            <strong>Random Forest</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={22} />
          </div>
          <div>
            <span>MAE</span>
            <strong>{data.mae.toFixed(2)} m³/h</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={22} />
          </div>
          <div>
            <span>RMSE</span>
            <strong>{data.rmse.toFixed(2)} m³/h</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={22} />
          </div>
          <div>
            <span>DMAs Forecasted</span>
            <strong>{dmas.length}</strong>
          </div>
        </div>
      </div>

      {/* MODEL INFORMATION */}
      <div className="forecast-info-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Forecasting Model</h3>
              <p>Machine-learning based demand prediction</p>
            </div>
            <BrainCircuit size={24} />
          </div>

          <div className="model-details">
            <div className="model-row">
              <span>Algorithm</span>
              <strong>Random Forest Regressor</strong>
            </div>

            <div className="model-row">
              <span>Prediction Target</span>
              <strong>Smart Meter Consumption</strong>
            </div>

            <div className="model-row">
              <span>Target Unit</span>
              <strong>m³/h</strong>
            </div>

            <div className="model-row">
              <span>MAE</span>
              <strong>{data.mae.toFixed(2)} m³/h</strong>
            </div>

            <div className="model-row">
              <span>RMSE</span>
              <strong>{data.rmse.toFixed(2)} m³/h</strong>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Forecast Features</h3>
              <p>Historical patterns used by the model</p>
            </div>
            <BarChart3 size={24} />
          </div>

          <div className="feature-list forecast-inputs">
            <label>
              <span>Hour of day</span>
              <input
                type="number"
                min="0"
                max="23"
                placeholder="14"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              />
            </label>

            <label>
              <span>Day of week</span>
              <input
                type="number"
                min="0"
                max="6"
                placeholder="1"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              />
            </label>

            <label>
              <span>Day of month</span>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="12"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              />
            </label>

            <label>
              <span>Previous-hour demand</span>
              <input
                type="number"
                step="0.1"
                placeholder="95.5"
                value={lag1}
                onChange={(e) => setLag1(e.target.value)}
              />
            </label>

            <label>
              <span>24-hour lag demand</span>
              <input
                type="number"
                step="0.1"
                placeholder="102.3"
                value={lag24}
                onChange={(e) => setLag24(e.target.value)}
              />
            </label>

            <label>
              <span>6-hour rolling demand</span>
              <input
                type="number"
                step="0.1"
                placeholder="98.7"
                value={rolling6h}
                onChange={(e) => setRolling6h(e.target.value)}
              />
            </label>
            <label>
              <span>6-hour rolling demand</span>
              <input
                type="number"
                step="0.1"
                placeholder="98.7"
                value={rolling6h}
                onChange={(e) => setRolling6h(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="predict-demand-btn"
              onClick={predictDemand}
              disabled={predicting}
            >
              {predicting ? "Predicting..." : "Predict Demand"}
            </button>

            {prediction !== null && (
              <div className="prediction-result">
                <span>Predicted Demand</span>
                <strong>{prediction.toFixed(2)} m³/h</strong>
                <small>Random Forest Regressor</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DMA SELECTOR */}
      <div className="panel forecast-chart-panel">
        <div className="panel-header">
          <div>
            <h3>Actual vs Forecast Demand</h3>
            <p>Comparison of observed consumption with AI-predicted demand.</p>
          </div>

          <select
            value={selectedDMA}
            onChange={(e) => setSelectedDMA(e.target.value)}
            className="dma-select"
          >
            {dmas.map((dma) => (
              <option key={dma} value={dma}>
                {dma}
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Demand"
              stroke="#168ac8"
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast Demand"
              stroke="#e89518"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* EXPLANATION */}
      <div className="forecast-explanation">
        <div className="explanation-icon">
          <BrainCircuit size={24} />
        </div>

        <div>
          <h3>How the AI Forecast Supports Leak Detection</h3>

          <p>
            The forecasting agent estimates expected water demand from
            historical consumption patterns. The system can compare expected
            demand with observed flow and consumption to identify unusual
            behavior. A difference between forecast and observed values is
            treated as an investigation signal rather than automatically
            classified as a leak.
          </p>
        </div>
      </div>
    </div>
  );
}
