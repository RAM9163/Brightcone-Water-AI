import pandas as pd
from pathlib import Path


# ---------------------------------------------------------
# File Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

SENSOR_DATA_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "sensor_data.csv"
)

LEAK_DATA_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "leak_detection_results.csv"
)

OUTPUT_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "water_balance_results.csv"
)


# ---------------------------------------------------------
# Water Balance Analysis
# ---------------------------------------------------------

def calculate_water_balance():

    # -----------------------------------------------------
    # 1. Load sensor data
    # -----------------------------------------------------

    df = pd.read_csv(SENSOR_DATA_PATH)

    df["timestamp"] = pd.to_datetime(
        df["timestamp"]
    )

    # -----------------------------------------------------
    # 2. Calculate supplied water
    # -----------------------------------------------------

    water_balance = (
        df.groupby("dma_id")
        .agg(
            total_water_supplied_m3=(
                "inlet_flow_m3h",
                "sum"
            ),
            total_metered_consumption_m3=(
                "smart_meter_consumption_m3h",
                "sum"
            ),
            average_pressure_bar=(
                "pressure_bar",
                "mean"
            )
        )
        .reset_index()
    )

    # -----------------------------------------------------
    # 3. Calculate unexplained water difference
    # -----------------------------------------------------

    water_balance["unexplained_water_m3"] = (
        water_balance["total_water_supplied_m3"]
        - water_balance["total_metered_consumption_m3"]
    )

    # -----------------------------------------------------
    # 4. Calculate water loss percentage
    # -----------------------------------------------------

    water_balance["water_loss_percentage"] = (
        water_balance["unexplained_water_m3"]
        / water_balance["total_water_supplied_m3"]
        * 100
    )

    # -----------------------------------------------------
    # 5. Calculate average hourly loss
    # -----------------------------------------------------

    total_hours = (
        df.groupby("dma_id")
        .size()
        .reset_index(name="hours")
    )

    water_balance = water_balance.merge(
        total_hours,
        on="dma_id",
        how="left"
    )

    water_balance["average_hourly_loss_m3"] = (
        water_balance["unexplained_water_m3"]
        / water_balance["hours"]
    )

    # -----------------------------------------------------
    # 6. Load leak detection results
    # -----------------------------------------------------

    leak_data = pd.read_csv(
        LEAK_DATA_PATH
    )

    # -----------------------------------------------------
    # 7. Count high-confidence leak events
    # -----------------------------------------------------

    high_confidence_events = (
        leak_data[
            leak_data["confidence"] == "High"
        ]
        .groupby("dma_id")
        .size()
        .reset_index(
            name="high_confidence_leak_events"
        )
    )

    water_balance = water_balance.merge(
        high_confidence_events,
        on="dma_id",
        how="left"
    )

    water_balance[
        "high_confidence_leak_events"
    ] = (
        water_balance[
            "high_confidence_leak_events"
        ]
        .fillna(0)
        .astype(int)
    )

    # -----------------------------------------------------
    # 8. Determine loss severity
    # -----------------------------------------------------

    def classify_loss(loss_percentage):

        if loss_percentage >= 30:
            return "Critical"

        elif loss_percentage >= 20:
            return "High"

        elif loss_percentage >= 10:
            return "Medium"

        else:
            return "Low"

    water_balance["loss_severity"] = (
        water_balance["water_loss_percentage"]
        .apply(classify_loss)
    )

    # -----------------------------------------------------
    # 9. Generate recommendation
    # -----------------------------------------------------

    def generate_recommendation(row):

        if row["high_confidence_leak_events"] > 0:

            return (
                "Prioritize field inspection because "
                "high-confidence leak evidence is present."
            )

        elif row["water_loss_percentage"] >= 20:

            return (
                "Investigate high unexplained water loss "
                "and validate meters and network conditions."
            )

        elif row["water_loss_percentage"] >= 10:

            return (
                "Monitor water loss and investigate "
                "persistent abnormal consumption patterns."
            )

        else:

            return (
                "Water balance is within the expected "
                "prototype range; continue monitoring."
            )

    water_balance["recommendation"] = (
        water_balance.apply(
            generate_recommendation,
            axis=1
        )
    )

    # -----------------------------------------------------
    # 10. Display results
    # -----------------------------------------------------

    print()
    print("Water Balance & Loss Analysis")
    print("--------------------------------")

    print(
        f"Total DMAs analyzed: "
        f"{len(water_balance)}"
    )

    print("\nWater balance by DMA:")

    print(
        water_balance[
            [
                "dma_id",
                "total_water_supplied_m3",
                "total_metered_consumption_m3",
                "unexplained_water_m3",
                "water_loss_percentage",
                "average_hourly_loss_m3",
                "high_confidence_leak_events",
                "loss_severity"
            ]
        ].to_string(index=False)
    )

    # -----------------------------------------------------
    # 11. Highest loss DMA
    # -----------------------------------------------------

    highest_loss = water_balance.loc[
        water_balance[
            "water_loss_percentage"
        ].idxmax()
    ]

    print()
    print("Highest water-loss DMA:")

    print(
        f"{highest_loss['dma_id']} "
        f"({highest_loss['water_loss_percentage']:.2f}%)"
    )

    # -----------------------------------------------------
    # 12. Recommendations
    # -----------------------------------------------------

    print()
    print("Recommendations:")

    for _, row in water_balance.iterrows():

        print(
            f"{row['dma_id']}: "
            f"{row['recommendation']}"
        )

    # -----------------------------------------------------
    # 13. Save results
    # -----------------------------------------------------

    water_balance.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print()
    print(
        "Water balance results saved to:"
    )

    print(
        OUTPUT_PATH
    )


# ---------------------------------------------------------
# Run
# ---------------------------------------------------------

if __name__ == "__main__":
    calculate_water_balance()