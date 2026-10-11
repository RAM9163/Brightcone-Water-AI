from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
import joblib

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

    return {
        "total_tasks": len(df),
        "critical_tasks": int(
            (df["priority"] == "Priority 1 - Critical").sum()
        ),
        "data": df.to_dict(orient="records")
    }


@router.get("/operations")
def get_operations():

    df = read_csv("operations_recommendations.csv")

    return {
        "total_recommendations": len(df),
        "approval_required": bool(
            df["approval_required"].all()
        ),
        "data": df.to_dict(orient="records")
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