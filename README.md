# Brightcone Water Distribution AI

## Agentic AI Water Distribution Leak Detection & Resource Optimization System

An AI-powered decision-support system for monitoring urban water distribution networks, detecting abnormal flow and pressure conditions, identifying suspected leakage zones, estimating water losses, prioritizing maintenance, and generating explainable operational recommendations.

> **Important:** This system is designed for decision support. It does not autonomously control pumps, valves, treatment systems, or other physical infrastructure. Final operational actions require human approval.

## Project Overview

**Agentic AI Water Distribution Leak Detection & Resource Optimization System** is an AI-powered decision-support platform for monitoring urban water distribution networks, detecting abnormal flow and pressure conditions, identifying suspected leaks, estimating water losses, and prioritizing field maintenance.

The system combines IoT sensor data, machine learning, statistical anomaly detection, network topology, multi-agent orchestration, and human-in-the-loop decision making.

## Multi-Agent Architecture

The system consists of 9 specialized agents:

1. Monitoring Agent
2. Demand Forecasting Agent
3. Anomaly Detection Agent
4. Leak Detection Agent
5. Water Balance Agent
6. Maintenance Agent
7. Operations Agent
8. Dynamic Reassessment Agent
9. Post-Repair Validation Agent

Critical operational recommendations require human approval before execution. The prototype does not autonomously control pumps, valves, or other physical infrastructure.

## Key Technologies

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI
- **Machine Learning:** Scikit-learn, Random Forest Regressor
- **Agent Orchestration:** LangGraph
- **Data Processing:** Pandas, NumPy, SciPy
- **Network Analysis:** NetworkX
- **Visualization:** Recharts
- **API Communication:** Axios
- **Testing:** Pytest
- **Deployment:** Vercel / Render

## Testing

The project includes automated API, agent, workflow, scenario, repair-validation, and PDF-report tests.

**Final test result: 22/22 tests passed.**

---

## 1. Problem Statement

Urban water distribution networks experience significant water losses due to:

- Pipeline leakage
- Pipe bursts
- Damaged valves
- Aging infrastructure
- Abnormal consumption
- Sensor and meter inaccuracies
- Operational changes

Traditional monitoring methods may depend on manual inspection, customer complaints, periodic meter readings, or fixed threshold alarms.

This project uses an **Agentic AI / Multi-Agent architecture** to continuously analyze water network data and provide explainable recommendations for leak investigation and maintenance planning.

---

## 2. Project Objectives

The system aims to:

- Monitor water flow and pressure sensors
- Validate incoming IoT/sensor data
- Forecast water demand
- Detect abnormal flow and pressure behavior
- Analyze nighttime water consumption
- Correlate flow and pressure anomalies
- Identify suspected leakage zones
- Estimate unexplained water losses
- Calculate water balance
- Prioritize maintenance activities
- Assign field inspection teams
- Generate explainable recommendations
- Support human approval before operational action
- Monitor the network after maintenance

---

## 3. System Architecture

````text
                    IoT / Sensor Data
                          |
                          v
              +-----------------------+
              | Data Monitoring Agent |
              | Validation & Quality  |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Demand Forecast Agent |
              | Random Forest Model   |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Flow & Pressure       |
              | Anomaly Agent         |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Leak Detection &      |
              | Localization Agent    |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Water Balance &       |
              | Loss Analysis Agent   |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Maintenance & Field   |
              | Resource Agent        |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Operations            |
              | Coordination Agent    |
              +-----------+-----------+
                          |
                          v
                 Human Approval
                          |
                          v
                Field Investigation
                          |
                          v
                 Post-Repair Review
---

## 4. AI Agents

The system contains seven specialized agents coordinated through a LangGraph workflow.

### 4.1 Data Monitoring Agent
- Validates incoming sensor data.
- Checks required fields, missing values, duplicate records, negative readings, and timestamps.
- Reports overall network data quality.

### 4.2 Demand Forecasting Agent
- Forecasts expected water demand using a Random Forest Regression model.
- Uses temporal and historical consumption features.
- Compares expected demand with observed consumption.

**Model:** Random Forest Regressor

### 4.3 Anomaly Detection Agent
- Detects abnormal flow and pressure conditions.
- Uses statistical z-score analysis.
- Performs nighttime flow analysis.
- Generates anomaly records for further investigation.

### 4.4 Leak Detection & Localization Agent
- Correlates flow, pressure, and nighttime evidence.
- Calculates a leak-risk score.
- Assigns confidence levels such as Low, Medium, and High.
- Identifies the suspected DMA and associated pipe section.

The system provides suspected zones rather than claiming an exact underground leak location when the available evidence is insufficient.

### 4.5 Water Balance Agent
Calculates:

- Total water supplied
- Total metered consumption
- Unexplained water
- Water-loss percentage
- Average hourly loss
- High-confidence leak events

### 4.6 Maintenance & Field Resource Planning Agent
Prioritizes maintenance using:

- Leak evidence
- Water loss
- Infrastructure criticality
- Event duration
- Repeated high-confidence events

The agent assigns field teams and generates maintenance priorities.

### 4.7 Operations Coordination Agent
Converts analytical results into operational recommendations.

All recommendations remain under human control.

---

## 5. Agentic Workflow

The agents operate through the following workflow:

```text
Sensor Data
    |
    v
Monitoring Agent
    |
    v
Demand Forecasting Agent
    |
    v
Anomaly Detection Agent
    |
    v
Leak Detection Agent
    |
    v
Water Balance Agent
    |
    v
Maintenance Agent
    |
    v
Operations Agent
    |
    v
Human Approval
    |
    v
Field Investigation / Repair
    |
    v
Post-Repair Validation


---

## 6. Machine Learning

### Demand Forecasting

The project uses a Random Forest Regression model for demand forecasting.

**Input features include:**

- Hour
- Day of week
- Day of month
- Previous-hour consumption
- Previous-day consumption
- Rolling six-hour consumption

**Target:**

`smart_meter_consumption_m3h`

### Model Performance

| Metric | Result |
|---|---:|
| MAE | 6.83 |
| RMSE | 8.46 |
| Training records | 1,670 |
| Test records | 418 |

The trained model is stored in:

```text
models/demand_forecasting_model.pkl

---

## 7. Dataset

The project uses simulated water-network sensor data representing three District Metered Areas (DMAs):

```text
DMA-A
DMA-B
DMA-C

8. Network Topology
The project represents the network using a topology dataset:
Reservoir-1
   |
   +---- Pipe-A1 ---- DMA-A
   |
   +---- Pipe-B1 ---- DMA-B
   |
   +---- Pipe-C1 ---- DMA-C

The topology information is used to associate detected anomalies and leak assessments with suspected pipe sections and DMAs.


---

## 9. Human-in-the-Loop Safety

The AI system is designed as a **decision-support system**.

The AI does not directly control:

- Pumps
- Valves
- Treatment systems
- Other physical infrastructure

Operational recommendations require human approval.

The workflow supports:

```text
AI Recommendation
       |
       v
Human Approval
       |
       +---- Reject
       |
       +---- Approve
                |
                v
          Field Repair
                |
                v
       Post-Repair Validation

       10. Repair Validation
After a repair is marked as completed, the system compares pre-repair and baseline network conditions.
The validation evaluates:
- Flow reduction
- Pressure change
- Leak-risk reduction
Possible results include:
Improvement Detected
Further Investigation Required

The system does not automatically declare a repair successful when the sensor evidence does not support improvement.

---

## 11. Frontend Dashboard

The frontend is built using:

- React
- TypeScript
- Vite
- Axios
- Recharts
- Lucide React

The dashboard provides pages for:

- Dashboard
- Network Monitoring
- Demand Forecasting
- Anomaly Detection
- Leak Detection
- Water Balance
- Maintenance
- Operations
- Reports
- Live Network Map

The Operations page provides visibility into:

- Agent execution status
- Maintenance recommendations
- Human approval
- Repair execution
- Post-repair validation

---

## 12. Backend

The backend is implemented using:

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- NetworkX
- LangGraph
- ReportLab

Backend API:

```text
http://127.0.0.1:8000

Swagger API documentation:
http://127.0.0.1:8000/docs

Health endpoint:
GET /health

---

## 13. API Endpoints

Important API endpoints include:

```text
GET  /api/dashboard
GET  /api/sensors
GET  /api/anomalies
GET  /api/leaks
GET  /api/water-balance
GET  /api/maintenance
GET  /api/operations
GET  /api/forecast
GET  /api/agent-status
GET  /api/network
GET  /api/report/pdf

POST /api/operations/{dma_id}/approval
POST /api/operations/{dma_id}/repair

GET  /api/operations/{dma_id}/repair-validation

Brightcone_Water_AI/
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── data/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Forecasting.tsx
│   │   └── main.tsx
│   └── package.json
│
├── data/
├── models/
├── tests/
├── README.md
└── .venv/

---

## 15. Installation and Setup

### Backend

Open PowerShell:

```powershell
cd C:\Users\talla\OneDrive\Desktop\Brightcone_Water_AI\backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload

http://127.0.0.1:8000

Frontend
Open another terminal:
cd C:\Users\talla\OneDrive\Desktop\Brightcone_Water_AI\frontend
npm run dev

The Vite development server will provide the frontend URL.
16. Testing
The project contains automated tests covering the required water-network scenarios and API functionality.
The final test suite currently reports:
22 passed

The tested scenarios include:
- Normal flow and pressure
- Sudden flow increase
- Pressure drop
- Flow increase + pressure drop
- Nighttime high flow
- Impossible pressure sensor verification
- Dynamic reassessment
- Repair completion and pre/post comparison
Additional API tests cover:
- Backend health
- Sensor data
- Anomaly detection
- Leak detection
- Water balance
- Maintenance priority
- Human approval
- Demand forecasting
- Agent status
- Network topology
- Operation approval
- Repair completion
- Repair validation
- PDF report generation
Run the complete test suite from the backend directory:
cd C:\Users\talla\OneDrive\Desktop\Brightcone_Water_AI\backend
..\.venv\Scripts\python.exe -m pytest ..\tests -v

Expected result:
22 passed


---

## 17. Reports

The system generates a PDF operational report through:

```text
GET /api/report/pdf

Next! 🔥
Paste this after Section 16:
---

## 17. Reports

The system generates a PDF operational report through:

```text
GET /api/report/pdf

The report can be used to communicate:
- Network status
- Detected anomalies
- Leak assessments
- Water losses
- Maintenance priorities
- Operational recommendations
18. Current System Limitations
The current prototype has several limitations:
- Sensor data is simulated rather than collected from a live municipal IoT deployment.
- Geographic visualization is represented using network topology rather than a production GIS platform.
- Human approval and repair states are maintained during the backend session.
- Exact underground leak coordinates cannot be guaranteed from the available sensor evidence.
- The system is intended for decision support and does not directly operate physical infrastructure.
- Production cloud deployment and authentication require additional configuration.
19. Future Enhancements
Future versions can include:
- Live IoT sensor integration
- MQTT or other event-stream ingestion
- Production database integration
- Real GIS integration
- Real-time map visualization
- More advanced anomaly detection models
- Graph-based leak localization
- Persistent workflow state
- Role-based authentication
- Field-team mobile application
- Production cloud deployment
- Automated sensor-health monitoring
- Additional reviewer/critic agents
- Historical model retraining and drift monitoring
20. Safety and Explainability
Every operational recommendation is intended to be explainable using evidence such as:
- Flow anomaly
- Pressure anomaly
- Nighttime behavior
- Water loss
- Leak confidence
- Infrastructure criticality
- Event duration
The system separates AI analysis from physical execution.
AI recommends. Human operators decide.
21. Project Status
Current implementation includes:
- Seven-agent architecture
- LangGraph workflow
- Demand forecasting
- Flow and pressure anomaly detection
- Leak-risk assessment
- Water balance
- Maintenance prioritization
- Field resource assignment
- Human approval workflow
- Repair validation
- Network topology visualization
- React dashboard
- FastAPI backend
- PDF reporting
- Automated testing
Current automated test result: 22 tests passed.
22. Conclusion
Brightcone Water Distribution AI demonstrates how Agentic AI can support water-network monitoring and maintenance by combining sensor analytics, machine learning, anomaly detection, leak assessment, water-loss analysis, maintenance prioritization, and human-reviewed operations.
The architecture is designed to keep humans in control of physical infrastructure while using AI to continuously analyze evidence and produce explainable recommendations.

````
