import pandas as pd
from pathlib import Path

from app.agents.state import WaterNetworkState
from app.services.water_balance import calculate_water_balance


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = PROJECT_ROOT / "data" / "sensor_data.csv"
LEAK_PATH = PROJECT_ROOT / "data" / "leak_detection_results.csv"
BALANCE_PATH = PROJECT_ROOT / "data" / "water_balance_results.csv"


def water_balance_agent(state: WaterNetworkState) -> WaterNetworkState:

    print()
    print("🤖 Water Balance & Loss Analysis Agent")
    print("----------------------------------------")

    try:

        if state.get("leak_status") != "Completed":

            state["water_balance_status"] = "Skipped"

            state["water_balance_summary"] = {
                "reason": "Leak detection did not complete successfully"
            }

            state["workflow_status"] = "Water balance analysis skipped"

            print(
                "Water balance analysis skipped because "
                "leak detection did not complete successfully."
            )

            return state

        # Verify input files
        if not DATA_PATH.exists():
            raise FileNotFoundError(
                f"Sensor data not found: {DATA_PATH}"
            )

        if not LEAK_PATH.exists():
            raise FileNotFoundError(
                f"Leak detection results not found: {LEAK_PATH}"
            )

        print("Required inputs verified.")

        # Run existing water balance service
        calculate_water_balance()

        # Verify output
        if not BALANCE_PATH.exists():
            raise FileNotFoundError(
                f"Water balance result file not found: {BALANCE_PATH}"
            )

        balance_df = pd.read_csv(BALANCE_PATH)

        print()
        print("Water Balance Analysis: COMPLETED")
        print(f"DMAs analyzed: {len(balance_df)}")

        dma_summary = {}

        for _, row in balance_df.iterrows():

            dma = str(row["dma_id"])

            supplied = float(row["total_water_supplied_m3"])
            consumption = float(
                row["total_metered_consumption_m3"]
            )
            unexplained = float(
                row["unexplained_water_m3"]
            )
            loss_percentage = float(
                row["water_loss_percentage"]
            )
            hourly_loss = float(
                row["average_hourly_loss_m3"]
            )
            high_confidence = int(
                row["high_confidence_leak_events"]
            )
            severity = str(
                row["loss_severity"]
            )

            dma_summary[dma] = {
                "supplied_water_m3": supplied,
                "metered_consumption_m3": consumption,
                "unexplained_water_m3": unexplained,
                "water_loss_percentage": loss_percentage,
                "average_hourly_loss_m3": hourly_loss,
                "high_confidence_leak_events": high_confidence,
                "loss_severity": severity
            }

            print()
            print(f"{dma}:")
            print(f"  Supplied water: {supplied:.2f} m³")
            print(f"  Metered consumption: {consumption:.2f} m³")
            print(f"  Unexplained water: {unexplained:.2f} m³")
            print(f"  Water loss: {loss_percentage:.2f}%")
            print(f"  Average hourly loss: {hourly_loss:.2f} m³/h")
            print(
                f"  High-confidence leak events: "
                f"{high_confidence}"
            )
            print(f"  Severity: {severity}")

        # Identify highest-loss DMA
        highest_loss_dma = None
        highest_loss_percentage = 0.0

        if not balance_df.empty:

            highest_row = balance_df.loc[
                balance_df["water_loss_percentage"].idxmax()
            ]

            highest_loss_dma = str(
                highest_row["dma_id"]
            )

            highest_loss_percentage = float(
                highest_row["water_loss_percentage"]
            )

        state["water_balance_status"] = "Completed"

        state["water_balance_summary"] = {
            "dma_count": len(balance_df),
            "highest_loss_dma": highest_loss_dma,
            "highest_loss_percentage": highest_loss_percentage,
            "dma_summary": dma_summary,
            "result_file": str(BALANCE_PATH),
            "status": "Water balance and loss analysis completed"
        }

        state["workflow_status"] = (
            "Water balance and loss analysis completed"
        )

        print()
        print(
            f"Highest-loss DMA: "
            f"{highest_loss_dma} "
            f"({highest_loss_percentage:.2f}%)"
        )

        print()
        print(f"Results saved to: {BALANCE_PATH}")

        return state

    except Exception as e:

        state["water_balance_status"] = "Failed"

        state["workflow_status"] = (
            "Water balance agent failed"
        )

        state["water_balance_summary"] = {
            "error": str(e)
        }

        print(f"Water Balance Agent Error: {e}")

        return state


if __name__ == "__main__":

    initial_state: WaterNetworkState = {
        "sensor_validation_status": "Passed",
        "anomaly_status": "Completed",
        "leak_status": "Completed"
    }

    result = water_balance_agent(initial_state)

    print()
    print("Agent result:")
    print(result)