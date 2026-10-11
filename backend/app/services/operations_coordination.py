import pandas as pd
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MAINTENANCE_PATH = (
    PROJECT_ROOT / "backend" / "data" / "maintenance_plan.csv"
)

OUTPUT_PATH = (
    PROJECT_ROOT / "backend" / "data" / "operations_recommendations.csv"
)


def coordinate_operations():

    maintenance = pd.read_csv(MAINTENANCE_PATH)

    # Sort by highest maintenance priority
    maintenance = maintenance.sort_values(
        by="priority_score",
        ascending=False
    ).reset_index(drop=True)

    # Generate operational action
    def generate_action(row):

        if row["priority_score"] >= 75:
            return (
                "Immediate investigation recommended. "
                "Verify sensor readings, inspect the suspected "
                "pipeline section, and assess possible leakage "
                "or burst conditions."
            )

        elif row["priority_score"] >= 55:
            return (
                "High-priority field inspection recommended. "
                "Validate network conditions and investigate "
                "the suspected section."
            )

        elif row["priority_score"] >= 35:
            return (
                "Schedule field inspection and continue "
                "monitoring flow, pressure, and water loss."
            )

        else:
            return (
                "Continue monitoring and schedule routine "
                "network inspection."
            )

    maintenance["operational_action"] = (
        maintenance.apply(
            generate_action,
            axis=1
        )
    )

    # Human approval is mandatory
    maintenance["approval_required"] = True

    maintenance["approval_status"] = (
        "Pending Human Approval"
    )

    # Generate evidence summary
    def generate_evidence(row):

        return (
            f"Leak score: {row['max_leak_score']}/100; "
            f"Water loss: {row['water_loss_percentage']:.2f}%; "
            f"High-confidence events: "
            f"{int(row['high_confidence_events'])}; "
            f"Infrastructure criticality: "
            f"{row['criticality']}."
        )

    maintenance["evidence_summary"] = (
        maintenance.apply(
            generate_evidence,
            axis=1
        )
    )

    # Generate final operational recommendation
    def generate_final_recommendation(row):

        return (
            f"{row['operational_action']} "
            f"Recommended team: {row['assigned_team']}. "
            f"Target: {row['pipe_section']} in {row['dma_id']}. "
            f"Final action requires human approval."
        )

    maintenance["final_recommendation"] = (
        maintenance.apply(
            generate_final_recommendation,
            axis=1
        )
    )

    # Initial workflow state
    maintenance["workflow_state"] = (
        "Recommendation Generated"
    )

    # Display results
    print()
    print("Water Operations Coordination")
    print("--------------------------------")

    print("\nOperational recommendations:")

    print(
        maintenance[
            [
                "dma_id",
                "pipe_section",
                "priority",
                "priority_score",
                "assigned_team",
                "approval_status",
                "workflow_state"
            ]
        ].to_string(index=False)
    )

    print("\nEvidence and recommendations:")

    for _, row in maintenance.iterrows():

        print()
        print("=" * 60)

        print(
            f"DMA: {row['dma_id']}"
        )

        print(
            f"Pipe Section: {row['pipe_section']}"
        )

        print(
            f"Priority: {row['priority']}"
        )

        print(
            f"Priority Score: {row['priority_score']}"
        )

        print(
            f"Assigned Team: {row['assigned_team']}"
        )

        print(
            f"Evidence: {row['evidence_summary']}"
        )

        print(
            f"Action: {row['operational_action']}"
        )

        print(
            f"Approval: {row['approval_status']}"
        )

        print(
            f"Final Recommendation: "
            f"{row['final_recommendation']}"
        )

    # Save results
    maintenance.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print()
    print("Operations recommendations saved to:")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    coordinate_operations()