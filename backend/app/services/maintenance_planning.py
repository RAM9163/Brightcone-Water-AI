import pandas as pd
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]

LEAK_DATA_PATH = (
    PROJECT_ROOT / "backend" / "data" / "leak_detection_results.csv"
)

WATER_BALANCE_PATH = (
    PROJECT_ROOT / "backend" / "data" / "water_balance_results.csv"
)

OUTPUT_PATH = (
    PROJECT_ROOT / "backend" / "data" / "maintenance_plan.csv"
)


def create_maintenance_plan():

    leak_data = pd.read_csv(LEAK_DATA_PATH)
    water_balance = pd.read_csv(WATER_BALANCE_PATH)

    # Get strongest leak evidence for each DMA
    leak_summary = (
        leak_data.groupby(
            ["dma_id", "pipe_section", "criticality"],
            as_index=False
        )
        .agg(
            max_leak_score=("leak_score", "max"),
            high_confidence_events=(
                "confidence",
                lambda x: (x == "High").sum()
            )
        )
    )

    # Merge with water balance information
    maintenance = leak_summary.merge(
        water_balance[
            [
                "dma_id",
                "water_loss_percentage",
                "average_hourly_loss_m3",
                "loss_severity"
            ]
        ],
        on="dma_id",
        how="left"
    )

    # Convert infrastructure criticality into points
    criticality_points = {
        "High": 20,
        "Medium": 10,
        "Low": 5
    }

    maintenance["criticality_score"] = (
        maintenance["criticality"]
        .map(criticality_points)
        .fillna(5)
    )

    # Water loss contribution
    maintenance["water_loss_score"] = (
        maintenance["water_loss_percentage"]
        .clip(upper=30)
        / 30
        * 30
    )

    # Leak evidence contribution
    maintenance["leak_evidence_score"] = (
        maintenance["max_leak_score"]
        / 100
        * 30
    )

    # Repeated high-confidence events
    maintenance["duration_score"] = (
        maintenance["high_confidence_events"]
        .clip(upper=5)
        / 5
        * 20
    )

    # Final priority score
    maintenance["priority_score"] = (
        maintenance["leak_evidence_score"]
        + maintenance["water_loss_score"]
        + maintenance["criticality_score"]
        + maintenance["duration_score"]
    )

    maintenance["priority_score"] = (
        maintenance["priority_score"]
        .clip(upper=100)
        .round(2)
    )

    # Priority classification
    def classify_priority(score):

        if score >= 75:
            return "Priority 1 - Critical"

        elif score >= 55:
            return "Priority 2 - High"

        elif score >= 35:
            return "Priority 3 - Medium"

        else:
            return "Priority 4 - Low"

    maintenance["priority"] = (
        maintenance["priority_score"]
        .apply(classify_priority)
    )

    # Assign field teams
    field_teams = [
        "Field Team Alpha",
        "Field Team Beta",
        "Field Team Gamma"
    ]

    # Highest priority gets Alpha, next Beta, etc.
    maintenance = maintenance.sort_values(
        by="priority_score",
        ascending=False
    ).reset_index(drop=True)

    maintenance["assigned_team"] = [
        field_teams[i % len(field_teams)]
        for i in range(len(maintenance))
    ]

    # Inspection recommendation
    def generate_recommendation(row):

        if row["max_leak_score"] >= 100:

            return (
                f"Urgent field inspection of "
                f"{row['pipe_section']} in {row['dma_id']}. "
                f"Verify pressure and flow sensors, inspect "
                f"the suspected pipeline section, and check "
                f"for leakage or burst conditions."
            )

        elif row["water_loss_percentage"] >= 20:

            return (
                f"Inspect {row['pipe_section']} in "
                f"{row['dma_id']} and validate meter readings "
                f"and network conditions."
            )

        else:

            return (
                f"Monitor {row['dma_id']} and schedule "
                f"routine inspection of {row['pipe_section']}."
            )

    maintenance["inspection_recommendation"] = (
        maintenance.apply(
            generate_recommendation,
            axis=1
        )
    )

    # Initial status
    maintenance["status"] = "Pending Human Approval"

    # Display results
    print()
    print("Maintenance & Field Resource Planning")
    print("---------------------------------------")

    print("\nMaintenance priorities:")

    print(
        maintenance[
            [
                "dma_id",
                "pipe_section",
                "criticality",
                "max_leak_score",
                "water_loss_percentage",
                "high_confidence_events",
                "priority_score",
                "priority",
                "assigned_team",
                "status"
            ]
        ].to_string(index=False)
    )

    print("\nInspection recommendations:")

    for _, row in maintenance.iterrows():

        print(
            f"\n{row['priority']}"
            f"\nDMA: {row['dma_id']}"
            f"\nPipe: {row['pipe_section']}"
            f"\nTeam: {row['assigned_team']}"
            f"\nRecommendation: "
            f"{row['inspection_recommendation']}"
        )

    # Save results
    maintenance.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print()
    print("Maintenance plan saved to:")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    create_maintenance_plan()