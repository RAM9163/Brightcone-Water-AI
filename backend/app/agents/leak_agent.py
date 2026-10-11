import pandas as pd
from pathlib import Path

from app.agents.state import WaterNetworkState
from app.services.leak_detection import detect_leaks


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = PROJECT_ROOT / "data" / "sensor_data.csv"
ANOMALY_PATH = PROJECT_ROOT / "data" / "anomaly_results.csv"
TOPOLOGY_PATH = PROJECT_ROOT / "data" / "network_topology.csv"
LEAK_PATH = PROJECT_ROOT / "data" / "leak_detection_results.csv"


def leak_agent(state: WaterNetworkState) -> WaterNetworkState:
    print()
    print("🤖 Leak Detection & Localization Agent")
    print("----------------------------------------")

    try:
        # Check anomaly detection status
        if state.get("anomaly_status") != "Completed":
            state["leak_status"] = "Skipped"
            state["leak_summary"] = {
                "reason": "Anomaly detection did not complete successfully"
            }
            state["workflow_status"] = "Leak detection skipped"

            print(
                "Leak detection skipped because anomaly detection "
                "did not complete successfully."
            )

            return state

        # Check required input files
        required_files = [
            DATA_PATH,
            ANOMALY_PATH,
            TOPOLOGY_PATH
        ]

        for file_path in required_files:
            if not file_path.exists():
                raise FileNotFoundError(
                    f"Required file not found: {file_path}"
                )

        print("Required inputs verified.")

        # Run existing leak detection service
        detect_leaks()

        # Verify output
        if not LEAK_PATH.exists():
            raise FileNotFoundError(
                f"Leak detection result file not found: {LEAK_PATH}"
            )

        leak_df = pd.read_csv(LEAK_PATH)

        total_records = len(leak_df)

        # High-confidence events
        high_confidence_count = 0

        if "confidence" in leak_df.columns:
            high_confidence_count = int(
                (leak_df["confidence"] == "High").sum()
            )

        # DMA summary
        dma_summary = {}

        if "dma_id" in leak_df.columns:
            dma_summary = (
                leak_df["dma_id"]
                .value_counts()
                .to_dict()
            )

        # Maximum leak score
        max_score = 0

        if "leak_score" in leak_df.columns and not leak_df.empty:
            max_score = float(leak_df["leak_score"].max())

        state["leak_status"] = "Completed"

        state["leak_summary"] = {
            "total_leak_assessments": int(total_records),
            "high_confidence_events": high_confidence_count,
            "maximum_leak_score": max_score,
            "dma_assessments": {
                str(k): int(v)
                for k, v in dma_summary.items()
            },
            "result_file": str(LEAK_PATH),
            "localization_level": "Suspected DMA / pipe section",
            "exact_underground_location_claimed": False,
            "status": "Investigation required"
        }

        state["workflow_status"] = (
            "Leak detection and localization completed"
        )

        print()
        print("Leak Detection: COMPLETED")
        print(f"Total leak assessments: {total_records}")
        print(f"High-confidence events: {high_confidence_count}")
        print(f"Maximum leak score: {max_score:.2f}")

        if dma_summary:
            print("Assessments by DMA:")

            for dma, count in dma_summary.items():
                print(f"  {dma}: {count}")

        print()
        print("Localization level: Suspected DMA / pipe section")
        print("Exact underground location claimed: NO")
        print("Status: Investigation required")
        print(f"Results saved to: {LEAK_PATH}")

        return state

    except Exception as e:
        state["leak_status"] = "Failed"
        state["workflow_status"] = "Leak detection agent failed"
        state["leak_summary"] = {
            "error": str(e)
        }

        print(f"Leak Detection Agent Error: {e}")

        return state


if __name__ == "__main__":

    initial_state: WaterNetworkState = {
        "sensor_validation_status": "Passed",
        "anomaly_status": "Completed"
    }

    result = leak_agent(initial_state)

    print()
    print("Agent result:")
    print(result)