from app.services.operations_coordination import coordinate_operations
from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

OPERATIONS_PATH = (
    PROJECT_ROOT / "data" / "operations_recommendations.csv"
)


def run_operations_agent(state):

    print("\n======================================")
    print("Water Operations Coordination Agent")
    print("======================================")

    # Check prerequisite
    if state.get("maintenance_status") != "Completed":
        state["operations_status"] = "Blocked"
        state["workflow_status"] = (
            "Operations coordination blocked: "
            "maintenance planning not completed"
        )
        return state

    # Run operations coordination service
    coordinate_operations()

    # Verify output
    if not OPERATIONS_PATH.exists():
        state["operations_status"] = "Failed"
        state["workflow_status"] = (
            "Operations coordination failed: "
            "output file not found"
        )
        return state

    operations = pd.read_csv(OPERATIONS_PATH)

    # Count priorities
    critical_count = int(
        (operations["priority"] == "Priority 1 - Critical").sum()
    )

    high_count = int(
        (operations["priority"] == "Priority 2 - High").sum()
    )

    # Count approval-required recommendations
    approval_required_count = int(
        operations["approval_required"].sum()
    )

    # Top recommendation
    if len(operations) > 0:

        top = operations.iloc[0]

        top_recommendation = {
            "dma_id": top["dma_id"],
            "pipe_section": top["pipe_section"],
            "priority": top["priority"],
            "priority_score": float(top["priority_score"]),
            "assigned_team": top["assigned_team"],
            "approval_status": top["approval_status"],
            "operational_action": top["operational_action"],
            "final_recommendation": top["final_recommendation"]
        }

    else:
        top_recommendation = {}

    # Update shared state
    state["operations_status"] = "Completed"

    state["operations_summary"] = {
        "total_recommendations": len(operations),
        "critical_recommendations": critical_count,
        "high_priority_recommendations": high_count,
        "approval_required_count": approval_required_count,
        "top_recommendation": top_recommendation,
        "result_file": str(OPERATIONS_PATH),
        "workflow_state": "Recommendation Generated",
        "status": "Operational recommendations generated"
    }

    # Human approval is mandatory
    state["human_approval_required"] = True

    state["final_recommendation"] = (
        top_recommendation.get(
            "final_recommendation",
            "No operational recommendation available."
        )
    )

    state["workflow_status"] = (
        "Water operations coordination completed - "
        "awaiting human approval"
    )

    # Display summary
    print("\nOperations Agent Summary")
    print("------------------------")

    print(
        f"Total recommendations: "
        f"{len(operations)}"
    )

    print(
        f"Critical recommendations: "
        f"{critical_count}"
    )

    print(
        f"High-priority recommendations: "
        f"{high_count}"
    )

    print(
        f"Human approval required: "
        f"{state['human_approval_required']}"
    )

    if top_recommendation:

        print("\nTop Operational Recommendation")
        print("------------------------------")

        print(
            f"DMA: "
            f"{top_recommendation['dma_id']}"
        )

        print(
            f"Pipe: "
            f"{top_recommendation['pipe_section']}"
        )

        print(
            f"Priority: "
            f"{top_recommendation['priority']}"
        )

        print(
            f"Score: "
            f"{top_recommendation['priority_score']}"
        )

        print(
            f"Team: "
            f"{top_recommendation['assigned_team']}"
        )

        print(
            f"Approval: "
            f"{top_recommendation['approval_status']}"
        )

        print(
            f"Action: "
            f"{top_recommendation['operational_action']}"
        )

        print(
            f"\nFinal Recommendation:\n"
            f"{top_recommendation['final_recommendation']}"
        )

    print(
        "\nOperations Agent Status: Completed"
    )

    return state


if __name__ == "__main__":

    state = {
        "maintenance_status": "Completed"
    }

    final_state = run_operations_agent(state)

    print("\nFinal Agent State:")
    print(final_state)