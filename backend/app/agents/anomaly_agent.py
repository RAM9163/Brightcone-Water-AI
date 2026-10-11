import pandas as pd
from pathlib import Path

from app.agents.state import WaterNetworkState
from app.services.anomaly_detection import detect_anomalies


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "data" / "sensor_data.csv"
ANOMALY_PATH = PROJECT_ROOT / "data" / "anomaly_results.csv"


def anomaly_agent(state: WaterNetworkState) -> WaterNetworkState:
    print()
    print("🤖 Flow & Pressure Anomaly Detection Agent")
    print("-------------------------------------------")

    try:
        # Check sensor validation
        if state.get("sensor_validation_status") != "Passed":
            state["anomaly_status"] = "Skipped"
            state["anomaly_summary"] = {
                "reason": "Sensor data validation did not pass"
            }
            state["workflow_status"] = "Anomaly detection skipped"

            print("Anomaly detection skipped because sensor validation did not pass.")
            return state

        # Load sensor data
        df = pd.read_csv(DATA_PATH)

        print(f"Sensor records loaded: {len(df)}")

        # Run existing anomaly detection service
        detect_anomalies()

        # Check generated result file
        if not ANOMALY_PATH.exists():
            raise FileNotFoundError(
                f"Anomaly result file not found: {ANOMALY_PATH}"
            )

        anomaly_df = pd.read_csv(ANOMALY_PATH)

        anomaly_count = len(anomaly_df)

        # Count anomalies by DMA if dma_id exists
        dma_summary = {}

        if "dma_id" in anomaly_df.columns:
            dma_summary = (
                anomaly_df["dma_id"]
                .value_counts()
                .to_dict()
            )

        state["anomaly_status"] = "Completed"

        state["anomaly_summary"] = {
            "total_anomalies": int(anomaly_count),
            "dma_anomaly_counts": {
                str(k): int(v)
                for k, v in dma_summary.items()
            },
            "result_file": str(ANOMALY_PATH),
            "method": "Flow and pressure z-score + nighttime flow analysis"
        }

        state["workflow_status"] = "Flow and pressure anomaly detection completed"

        print()
        print("Anomaly Detection: COMPLETED")
        print(f"Total anomalies: {anomaly_count}")

        if dma_summary:
            print("Anomalies by DMA:")

            for dma, count in dma_summary.items():
                print(f"  {dma}: {count}")

        print(f"Results saved to: {ANOMALY_PATH}")

        return state

    except Exception as e:
        state["anomaly_status"] = "Failed"
        state["workflow_status"] = "Anomaly detection agent failed"
        state["anomaly_summary"] = {
            "error": str(e)
        }

        print(f"Anomaly Agent Error: {e}")

        return state


if __name__ == "__main__":

    initial_state: WaterNetworkState = {
        "sensor_validation_status": "Passed"
    }

    result = anomaly_agent(initial_state)

    print()
    print("Agent result:")
    print(result)