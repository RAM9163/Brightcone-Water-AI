import pandas as pd
from pathlib import Path

from app.agents.state import WaterNetworkState


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT / "data" / "sensor_data.csv"
)


def monitoring_agent(
    state: WaterNetworkState
) -> WaterNetworkState:

    print()
    print("🤖 Water Network Data Monitoring Agent")
    print("----------------------------------------")

    try:
        df = pd.read_csv(DATA_PATH)

        # Convert timestamp
        df["timestamp"] = pd.to_datetime(
            df["timestamp"],
            errors="coerce"
        )

        # Required columns
        required_columns = [
            "timestamp",
            "dma_id",
            "inlet_flow_m3h",
            "pressure_bar",
            "smart_meter_consumption_m3h"
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:

            state["sensor_validation_status"] = "Failed"

            state["sensor_summary"] = {
                "missing_columns": missing_columns
            }

            state["workflow_status"] = (
                "Sensor validation failed"
            )

            return state

        # Check missing values
        missing_values = (
            df[required_columns]
            .isnull()
            .sum()
            .sum()
        )

        # Check duplicate records
        duplicate_records = (
            df.duplicated().sum()
        )

        # Check invalid numeric values
        invalid_flow = (
            df["inlet_flow_m3h"] < 0
        ).sum()

        invalid_pressure = (
            df["pressure_bar"] < 0
        ).sum()

        invalid_consumption = (
            df["smart_meter_consumption_m3h"] < 0
        ).sum()

        # Validation result
        validation_passed = (
            missing_values == 0
            and duplicate_records == 0
            and invalid_flow == 0
            and invalid_pressure == 0
            and invalid_consumption == 0
            and df["timestamp"].notna().all()
        )

        # DMA information
        dma_count = df["dma_id"].nunique()

        # Sensor summary
        summary = {
            "total_records": len(df),
            "dma_count": int(dma_count),
            "start_time": str(df["timestamp"].min()),
            "end_time": str(df["timestamp"].max()),
            "missing_values": int(missing_values),
            "duplicate_records": int(duplicate_records),
            "invalid_flow_values": int(invalid_flow),
            "invalid_pressure_values": int(invalid_pressure),
            "invalid_consumption_values": int(
                invalid_consumption
            ),
            "validation_passed": bool(validation_passed)
        }

        if validation_passed:

            state["sensor_validation_status"] = "Passed"

            state["workflow_status"] = (
                "Sensor data validated successfully"
            )

            print("Validation: PASSED")

        else:

            state["sensor_validation_status"] = "Warning"

            state["workflow_status"] = (
                "Sensor data contains validation issues"
            )

            print("Validation: WARNING")

        state["sensor_data_path"] = str(DATA_PATH)

        state["sensor_summary"] = summary

        print(
            f"Total records: {len(df)}"
        )

        print(
            f"DMAs detected: {dma_count}"
        )

        print(
            f"Time range: "
            f"{df['timestamp'].min()} → "
            f"{df['timestamp'].max()}"
        )

        print(
            f"Missing values: {missing_values}"
        )

        print(
            f"Duplicate records: {duplicate_records}"
        )

        print(
            f"Invalid flow values: {invalid_flow}"
        )

        print(
            f"Invalid pressure values: {invalid_pressure}"
        )

        print(
            f"Invalid consumption values: "
            f"{invalid_consumption}"
        )

        print(
            f"Sensor validation status: "
            f"{state['sensor_validation_status']}"
        )

        return state

    except Exception as e:

        state["sensor_validation_status"] = "Failed"

        state["workflow_status"] = (
            "Monitoring agent failed"
        )

        state["sensor_summary"] = {
            "error": str(e)
        }

        print(
            f"Monitoring Agent Error: {e}"
        )

        return state


if __name__ == "__main__":

    initial_state: WaterNetworkState = {}

    result = monitoring_agent(
        initial_state
    )

    print()
    print("Agent result:")
    print(result)