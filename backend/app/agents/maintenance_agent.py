from app.services.maintenance_planning import create_maintenance_plan
from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MAINTENANCE_PLAN_PATH = (
    PROJECT_ROOT / "data" / "maintenance_plan.csv"
)


def run_maintenance_agent(state):

    print("\n======================================")
    print("Maintenance & Field Resource Planning Agent")
    print("======================================")

    # Check prerequisite agents
    if state.get("sensor_validation_status") != "Passed":
        state["maintenance_status"] = "Blocked"
        state["workflow_status"] = (
            "Maintenance planning blocked: sensor validation not passed"
        )
        return state

    if state.get("leak_status") != "Completed":
        state["maintenance_status"] = "Blocked"
        state["workflow_status"] = (
            "Maintenance planning blocked: leak detection not completed"
        )
        return state

    if state.get("water_balance_status") != "Completed":
        state["maintenance_status"] = "Blocked"
        state["workflow_status"] = (
            "Maintenance planning blocked: water balance not completed"
        )
        return state

    # Run maintenance planning service
    create_maintenance_plan()

    # Verify output file
    if not MAINTENANCE_PLAN_PATH.exists():
        state["maintenance_status"] = "Failed"
        state["workflow_status"] = (
            "Maintenance planning failed: output file not found"
        )
        return state

    maintenance = pd.read_csv(MAINTENANCE_PLAN_PATH)

    # Create summary
    priority_counts = (
        maintenance["priority"]
        .value_counts()
        .to_dict()
    )

    team_assignments = (
        maintenance.groupby("assigned_team")
        .size()
        .to_dict()
    )

    critical_count = int(
        (maintenance["priority"] == "Priority 1 - Critical").sum()
    )

    high_count = int(
        (maintenance["priority"] == "Priority 2 - High").sum()
    )

    state["maintenance_status"] = "Completed"

    state["maintenance_summary"] = {
        "total_maintenance_tasks": len(maintenance),
        "critical_tasks": critical_count,
        "high_priority_tasks": high_count,
        "priority_distribution": priority_counts,
        "field_team_assignments": team_assignments,
        "top_priority_dma": (
            maintenance.iloc[0]["dma_id"]
            if len(maintenance) > 0
            else None
        ),
        "top_priority_pipe": (
            maintenance.iloc[0]["pipe_section"]
            if len(maintenance) > 0
            else None
        ),
        "top_priority_score": (
            float(maintenance.iloc[0]["priority_score"])
            if len(maintenance) > 0
            else None
        ),
        "result_file": str(MAINTENANCE_PLAN_PATH),
        "human_approval_required": True,
        "status": "Maintenance plan generated and pending human approval"
    }

    state["human_approval_required"] = True

    state["workflow_status"] = (
        "Maintenance & field resource planning completed"
    )

    print("\nMaintenance Agent Summary")
    print("-------------------------")
    print(
        f"Total maintenance tasks: "
        f"{len(maintenance)}"
    )

    print(
        f"Critical tasks: "
        f"{critical_count}"
    )

    print(
        f"High priority tasks: "
        f"{high_count}"
    )

    if len(maintenance) > 0:

        top = maintenance.iloc[0]

        print(
            f"\nTop Priority:"
            f"\nDMA: {top['dma_id']}"
            f"\nPipe: {top['pipe_section']}"
            f"\nScore: {top['priority_score']}"
            f"\nPriority: {top['priority']}"
            f"\nAssigned Team: {top['assigned_team']}"
        )

    print("\nMaintenance Agent Status: Completed")

    return state


if __name__ == "__main__":

    state = {
        "sensor_validation_status": "Passed",
        "leak_status": "Completed",
        "water_balance_status": "Completed"
    }

    final_state = run_maintenance_agent(state)

    print("\nFinal Agent State:")
    print(final_state)