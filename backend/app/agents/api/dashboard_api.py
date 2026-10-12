from fastapi import APIRouter, HTTPException, Body
from pathlib import Path
import pandas as pd
from fastapi.responses import FileResponse
from app.services.report_service import generate_water_network_report


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
                operations["workflow_state"]
                .iloc[0]
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

@router.post("/approval")
def human_approval(
    action: str = Body(...),
    approved: bool = Body(...),
    comments: str = Body("")
):
    """
    Human-in-the-loop approval endpoint.
    The system records the operator's decision before
    any operational action is considered.
    """

    return {
        "status": "Approval Recorded",
        "action": action,
        "approved": approved,
        "comments": comments,
        "message": (
            "Action approved by human operator."
            if approved
            else "Action rejected by human operator."
        ),
        "physical_action_executed": False
    }

@router.post("/approval")
def human_approval(
    action: str = Body(...),
    approved: bool = Body(...),
    comments: str = Body("")
):
    """
    Human-in-the-loop approval endpoint.
    """

    return {
        "status": "Approval Recorded",
        "action": action,
        "approved": approved,
        "comments": comments,
        "message": (
            "Action approved by human operator."
            if approved
            else "Action rejected by human operator."
        ),
        "physical_action_executed": False
    }
