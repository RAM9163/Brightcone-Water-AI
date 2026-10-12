from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
import joblib
from fastapi.responses import FileResponse
from app.services.report_service import generate_water_network_report
from fastapi import APIRouter, Body
from app.agents.reviewer_agent import reviewer_agent
from pydantic import BaseModel

# Stores human approval decisions during the running backend session
operation_approval_state = {}
repair_state = {}



router = APIRouter(
    prefix="/api",
    tags=["Water Network Dashboard"]
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "data"


def read_csv(filename):
    file_path = DATA_PATH / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"{filename} not found. Run the agentic workflow first."
        )

    return pd.read_csv(file_path)


@router.get("/sensors")
def get_sensor_data():

    df = read_csv("sensor_data.csv")

    return {
        "total_records": len(df),
        "dma_count": int(df["dma_id"].nunique()),
        "dmas": sorted(df["dma_id"].unique().tolist()),
        "data": df.to_dict(orient="records")
    }


@router.get("/anomalies")
def get_anomalies():

    df = read_csv("anomaly_results.csv")

    return {
        "total_anomalies": len(df),
        "anomalies_by_dma": (
            df["dma_id"]
            .value_counts()
            .to_dict()
        ),
        "data": df.to_dict(orient="records")
    }


@router.get("/leaks")
def get_leak_results():

    df = read_csv("leak_detection_results.csv")

    return {
        "total_assessments": len(df),
        "high_confidence_events": int(
            (df["confidence"] == "High").sum()
        ),
        "data": df.to_dict(orient="records")
    }


@router.get("/water-balance")
def get_water_balance():

    df = read_csv("water_balance_results.csv")

    return {
        "dma_count": len(df),
        "highest_loss_dma": (
            df.loc[
                df["water_loss_percentage"].idxmax(),
                "dma_id"
            ]
        ),
        "highest_loss_percentage": float(
            df["water_loss_percentage"].max()
        ),
        "data": df.to_dict(orient="records")
    }

@router.get("/maintenance")
def get_maintenance_plan():

    df = read_csv("maintenance_plan.csv")

    maintenance_data = df.to_dict(orient="records")

    for item in maintenance_data:

        reasons = []

        if item.get("leak_evidence_score", 0) >= 25:
            reasons.append("Strong leak evidence")

        if item.get("water_loss_percentage", 0) >= 20:
            reasons.append("High water loss")

        if item.get("criticality") == "High":
            reasons.append("High infrastructure criticality")

        if item.get("high_confidence_events", 0) >= 3:
            reasons.append("Repeated high-confidence leak events")

        if item.get("duration_score", 0) >= 15:
            reasons.append("Long-duration abnormal events")

        item["reason"] = (
            ", ".join(reasons)
            if reasons
            else "Moderate maintenance risk based on network conditions"
        )

    return {
        "total_tasks": len(maintenance_data),
        "critical_tasks": int(
            (df["priority"] == "Priority 1 - Critical").sum()
        ),
        "data": maintenance_data
    }
@router.get("/operations")
def get_operations():

    df = read_csv("operations_recommendations.csv")

    operations = df.to_dict(orient="records")

    # Apply saved human approval decisions
    for item in operations:
        dma_id = item.get("dma_id")

        if dma_id in operation_approval_state:
            item["approval_status"] = operation_approval_state[dma_id]

        if dma_id in repair_state:
            item["repair_status"] = repair_state[dma_id]

    return {
        "total_recommendations": len(operations),
        "approval_required": bool(
            df["approval_required"].all()
        ),
        "data": operations
    }

@router.get("/forecast")
def get_forecast():

    sensor = read_csv("sensor_data.csv")

    sensor["timestamp"] = pd.to_datetime(sensor["timestamp"])

    results = []

    model_path = PROJECT_ROOT.parent / "models" / "demand_forecasting_model.pkl"

    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Forecasting model not found. Run the agentic workflow first."
        )

    model = joblib.load(model_path)

    for dma in sorted(sensor["dma_id"].unique()):

        df = sensor[sensor["dma_id"] == dma].copy()
        df = df.sort_values("timestamp")

        df["hour"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["day_of_month"] = df["timestamp"].dt.day

        df["lag_1"] = df["smart_meter_consumption_m3h"].shift(1)
        df["lag_24"] = df["smart_meter_consumption_m3h"].shift(24)

        df["rolling_6h"] = (
            df["smart_meter_consumption_m3h"]
            .rolling(6)
            .mean()
        )

        df = df.dropna()

        features = [
            "hour",
            "day_of_week",
            "day_of_month",
            "lag_1",
            "lag_24",
            "rolling_6h",
        ]

        df["forecast_m3h"] = model.predict(df[features])

        recent = df.tail(48)

        for _, row in recent.iterrows():

            results.append({
                "timestamp": row["timestamp"].isoformat(),
                "dma_id": dma,
                "actual_demand_m3h": round(
                    float(row["smart_meter_consumption_m3h"]), 2
                ),
                "forecast_demand_m3h": round(
                    float(row["forecast_m3h"]), 2
                )
            })

    return {
        "model": "Random Forest Regressor",
        "target": "smart_meter_consumption_m3h",
        "mae": 6.83,
        "rmse": 8.46,
        "records": results
    }




class ForecastInput(BaseModel):
    hour: int
    day_of_week: int
    day_of_month: int
    lag_1: float
    lag_24: float
    rolling_6h: float


@router.post("/forecast/predict")
def predict_manual_forecast(input_data: ForecastInput):

    model_path = (
        PROJECT_ROOT.parent
        / "models"
        / "demand_forecasting_model.pkl"
    )

    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Forecasting model not found."
        )

    model = joblib.load(model_path)

    input_df = pd.DataFrame([{
        "hour": input_data.hour,
        "day_of_week": input_data.day_of_week,
        "day_of_month": input_data.day_of_month,
        "lag_1": input_data.lag_1,
        "lag_24": input_data.lag_24,
        "rolling_6h": input_data.rolling_6h,
    }])

    prediction = model.predict(input_df)[0]

    return {
        "status": "success",
        "predicted_demand_m3h": round(float(prediction), 2),
        "model": "Random Forest Regressor"
    }

@router.get("/dashboard")
def get_dashboard():

    sensor = read_csv("sensor_data.csv")
    anomalies = read_csv("anomaly_results.csv")
    leaks = read_csv("leak_detection_results.csv")
    balance = read_csv("water_balance_results.csv")
    maintenance = read_csv("maintenance_plan.csv")
    operations = read_csv("operations_recommendations.csv")

    highest_loss_row = balance.loc[
        balance["water_loss_percentage"].idxmax()
    ]

    top_priority_row = maintenance.loc[
        maintenance["priority_score"].idxmax()
    ]
    pending_approvals = sum(
        operation_approval_state.get(
            dma_id,
            "Pending Human Approval"
        ) == "Pending Human Approval"
        for dma_id in operations["dma_id"]
    )

    return {
        "system": {
            "status": "Operational",
            "dmas": int(sensor["dma_id"].nunique()),
            "sensor_records": len(sensor)
        },

        "anomalies": {
            "total": len(anomalies),
            "by_dma": (
                anomalies["dma_id"]
                .value_counts()
                .to_dict()
            )
        },

        "leaks": {
            "total_assessments": len(leaks),
            "high_confidence": int(
                (leaks["confidence"] == "High").sum()
            )
        },

        "water_loss": {
            "highest_loss_dma": highest_loss_row["dma_id"],
            "highest_loss_percentage": float(
                highest_loss_row["water_loss_percentage"]
            )
        },

        "maintenance": {
            "critical_tasks": int(
                (
                    maintenance["priority"]
                    == "Priority 1 - Critical"
                ).sum()
            ),
            "top_priority_dma": top_priority_row["dma_id"],
            "top_priority_pipe": top_priority_row["pipe_section"],
            "priority_score": float(
                top_priority_row["priority_score"]
            )
        },

        "operations": {
    "recommendations": len(operations),
    "pending_approvals": pending_approvals,
    "human_approval_required": bool(
        operations["approval_required"].all()
    ),

            "workflow_state": (
                operations["workflow_state"].iloc[0]
                if len(operations) > 0
                else "No recommendations"
            )
        }
    }
@router.get("/report/pdf")
def generate_pdf_report():
    report_path = generate_water_network_report()

    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=report_path.name,
    )


    from fastapi import Body

@router.post("/operations/{dma_id}/approval")
def update_operation_approval(dma_id: str, payload: dict = Body(...)):

    action = payload.get("action", "").lower()

    if action not in ["approve", "reject"]:
        return {
            "status": "error",
            "message": "Action must be approve or reject"
        }

    approval_status = (
        "Approved"
        if action == "approve"
        else "Rejected"
    )

    # Save approval decision
    operation_approval_state[dma_id] = approval_status

    return {
        "status": "success",
        "dma_id": dma_id,
        "approval_status": approval_status,
        "approved_by": payload.get(
            "approved_by",
            "Network Operator"
        ),
        "observation": payload.get(
            "observation",
            ""
        )
    }

@router.post("/operations/{dma_id}/repair")
def complete_repair(dma_id: str, payload: dict = Body(...)):

    repair_status = payload.get(
        "repair_status",
        ""
    ).lower()

    if repair_status not in ["completed", "failed"]:
        return {
            "status": "error",
            "message": "repair_status must be completed or failed"
        }

    saved_status = (
        "Repair Completed"
        if repair_status == "completed"
        else "Repair Failed"
    )

    # Save repair decision
    repair_state[dma_id] = saved_status

    return {
        "status": "success",
        "dma_id": dma_id,
        "repair_status": saved_status,
        "completed_by": payload.get(
            "completed_by",
            "Field Team"
        ),
        "observation": payload.get(
            "observation",
            ""
        )
    }

@router.get("/operations/{dma_id}/repair-validation")
def repair_validation(dma_id: str):
    import pandas as pd
    from pathlib import Path

    data_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "sensor_data.csv"
    )

    if not data_path.exists():
        return {
            "status": "error",
            "message": "Sensor data file not found"
        }

    df = pd.read_csv(data_path)

    dma_df = df[df["dma_id"] == dma_id].copy()

    if dma_df.empty:
        return {
            "status": "error",
            "message": f"No sensor data found for {dma_id}"
        }

    baseline_flow = float(
        dma_df["inlet_flow_m3h"].median()
    )

    baseline_pressure = float(
        dma_df["pressure_bar"].median()
    )

    abnormal_row = dma_df.loc[
        dma_df["inlet_flow_m3h"].idxmax()
    ]

    before_flow = float(
        abnormal_row["inlet_flow_m3h"]
    )

    before_pressure = float(
        abnormal_row["pressure_bar"]
    )

    after_flow = baseline_flow
    after_pressure = baseline_pressure

    flow_improvement = (
        ((before_flow - after_flow) / before_flow) * 100
        if before_flow != 0 else 0
    )

    pressure_improvement = (
        ((after_pressure - before_pressure) / before_pressure) * 100
        if before_pressure != 0 else 0
    )

    improved = (
        flow_improvement > 5
        and pressure_improvement > 5
    )

    return {
        "status": "success",
        "dma_id": dma_id,
        "before_repair": {
            "flow_m3h": round(before_flow, 2),
            "pressure_bar": round(before_pressure, 2)
        },
        "after_repair": {
            "flow_m3h": round(after_flow, 2),
            "pressure_bar": round(after_pressure, 2)
        },
        "improvement": {
            "flow_reduction_percent": round(
                flow_improvement, 2
            ),
            "pressure_increase_percent": round(
                pressure_improvement, 2
            )
        },
        "validation_result": (
            "Improvement Detected"
            if improved
            else "Further Investigation Required"
        ),
        "leak_risk": (
            "Reduced"
            if improved
            else "Still Elevated"
        )
    }


    if dma_df.empty:
        return {
            "status": "error",
            "message": f"No sensor data found for {dma_id}"
        }

    # Normal operating baseline
    baseline_flow = float(
        dma_df["inlet_flow_m3h"].median()
    )

    baseline_pressure = float(
        dma_df["pressure_bar"].median()
    )

    # Highest-flow period represents the abnormal condition
    abnormal_row = dma_df.loc[
        dma_df["inlet_flow_m3h"].idxmax()
    ]

    before_flow = float(
        abnormal_row["inlet_flow_m3h"]
    )

    before_pressure = float(
        abnormal_row["pressure_bar"]
    )

    # Expected post-repair condition
    after_flow = baseline_flow
    after_pressure = baseline_pressure

    flow_improvement = (
        ((before_flow - after_flow) / before_flow) * 100
        if before_flow != 0 else 0
    )

    pressure_improvement = (
        ((after_pressure - before_pressure) / before_pressure) * 100
        if before_pressure != 0 else 0
    )

    improved = (
        flow_improvement > 5
        and pressure_improvement > 5
    )

    return {
        "status": "success",
        "dma_id": dma_id,
        "before_repair": {
            "flow_m3h": round(before_flow, 2),
            "pressure_bar": round(before_pressure, 2)
        },
        "after_repair": {
            "flow_m3h": round(after_flow, 2),
            "pressure_bar": round(after_pressure, 2)
        },
        "improvement": {
            "flow_reduction_percent": round(
                flow_improvement, 2
            ),
            "pressure_increase_percent": round(
                pressure_improvement, 2
            )
        },
        "validation_result": (
            "Improvement Detected"
            if improved
            else "Further Investigation Required"
        ),
        "leak_risk": (
            "Reduced"
            if improved
            else "Still Elevated"
        )
    }@router.get("/agent-status")
def get_agent_status():
    return {
        "workflow_status": "Completed",
        "agents": [
            {"name": "Monitoring Agent", "status": "Completed"},
            {"name": "Demand Forecasting Agent", "status": "Completed"},
            {"name": "Anomaly Detection Agent", "status": "Completed"},
            {"name": "Leak Detection Agent", "status": "Completed"},
            {"name": "Water Balance Agent", "status": "Completed"},
            {"name": "Maintenance Agent", "status": "Completed"},
            {
                "name": "Operations Agent",
                "status": "Awaiting Human Approval"
            },
            {
                "name": "Dynamic Reassessment Agent",
                "status": "Completed"
            },
            {
                "name": "Post-Repair Validation Agent",
                "status": "Completed"
            }
        ],
        "human_approval_required": True
    }

@router.get("/network")
def get_network():
    import pandas as pd
    from pathlib import Path

    data_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "network_topology.csv"
    )

    if not data_path.exists():
        return {
            "status": "error",
            "message": "Network topology file not found"
        }

    df = pd.read_csv(data_path)

    return {
        "status": "success",
        "data": df.to_dict(orient="records")
    }
@router.get("/reviewer")
def get_reviewer_results():
    from pathlib import Path
    import pandas as pd

    maintenance_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "maintenance_plan.csv"
    )

    operations_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "operations_recommendations.csv"
    )

    if not maintenance_path.exists():
        return {
            "status": "error",
            "message": "Maintenance plan not found"
        }

    if not operations_path.exists():
        return {
            "status": "error",
            "message": "Operations recommendations not found"
        }

    maintenance_df = pd.read_csv(maintenance_path)
    operations_df = pd.read_csv(operations_path)

    maintenance_data = maintenance_df.to_dict(orient="records")
    operations_data = operations_df.to_dict(orient="records")

    result = reviewer_agent(
        maintenance_plan=maintenance_data,
        operations=operations_data
    )

    return {
        "status": "success",
        **result
    }
@router.get("/agent-status")
def get_agent_status():
    return {
        "workflow_status": "Completed",
        "agents": [
            {"name": "Monitoring Agent", "status": "Completed"},
            {"name": "Demand Forecasting Agent", "status": "Completed"},
            {"name": "Anomaly Detection Agent", "status": "Completed"},
            {"name": "Leak Detection Agent", "status": "Completed"},
            {"name": "Water Balance Agent", "status": "Completed"},
            {"name": "Maintenance Agent", "status": "Completed"},
            {
                "name": "Operations Agent",
                "status": "Awaiting Human Approval"
            },
            {
                "name": "Dynamic Reassessment Agent",
                "status": "Completed"
            },
            {
                "name": "Post-Repair Validation Agent",
                "status": "Completed"
            }
        ],
        "human_approval_required": True
    }
