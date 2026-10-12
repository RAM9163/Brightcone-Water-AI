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

# Brightcone Water Distribution AI

## Agentic AI Water Distribution Leak Detection & Resource Optimization System

An AI-powered decision-support system for monitoring urban water distribution networks, detecting abnormal flow and pressure conditions, identifying suspected leakage zones, estimating water losses, prioritizing maintenance, and generating explainable operational recommendations.

> **Important:** This system is designed for decision support. It does not autonomously control pumps, valves, treatment systems, or other physical infrastructure. Final operational actions require human approval.

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

```text
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
```
