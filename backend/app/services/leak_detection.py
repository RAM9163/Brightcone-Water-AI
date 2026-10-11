import pandas as pd
from pathlib import Path


# ---------------------------------------------------------
# File Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

ANOMALY_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "anomaly_results.csv"
)

TOPOLOGY_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "network_topology.csv"
)

OUTPUT_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "leak_detection_results.csv"
)


# ---------------------------------------------------------
# Leak Detection
# ---------------------------------------------------------

def detect_leaks():

    # -----------------------------------------------------
    # 1. Load anomaly results
    # -----------------------------------------------------

    anomalies = pd.read_csv(ANOMALY_PATH)

    anomalies["timestamp"] = pd.to_datetime(
        anomalies["timestamp"]
    )

    # -----------------------------------------------------
    # 2. Load network topology
    # -----------------------------------------------------

    topology = pd.read_csv(TOPOLOGY_PATH)

    # -----------------------------------------------------
    # 3. Merge anomaly data with topology
    # -----------------------------------------------------

    df = anomalies.merge(
        topology,
        on="dma_id",
        how="left"
    )

    # -----------------------------------------------------
    # 4. Flow elevation analysis
    # -----------------------------------------------------

    # Calculate flow ratio against nighttime baseline
    df["flow_ratio"] = (
        df["inlet_flow_m3h"]
        / df["nighttime_mean"]
    )

    # Detect significantly elevated flow
    df["elevated_flow"] = (
        df["flow_ratio"] >= 1.30
    )

    # -----------------------------------------------------
    # 5. Evidence indicators
    # -----------------------------------------------------

    # Flow evidence:
    # Either statistical flow anomaly OR significantly
    # elevated flow compared with nighttime baseline.
    df["flow_evidence"] = (
        df["flow_anomaly"]
        | df["elevated_flow"]
    )

    # Pressure evidence
    df["pressure_evidence"] = (
        df["pressure_anomaly"]
    )

    # Nighttime evidence
    df["nighttime_evidence"] = (
        df["nighttime_flow_anomaly"]
    )

    # Convert Boolean values to integers
    df["flow_evidence"] = (
        df["flow_evidence"].astype(int)
    )

    df["pressure_evidence"] = (
        df["pressure_evidence"].astype(int)
    )

    df["nighttime_evidence"] = (
        df["nighttime_evidence"].astype(int)
    )

    # -----------------------------------------------------
    # 6. Leak suspicion score
    # -----------------------------------------------------

    df["leak_score"] = (
        df["flow_evidence"] * 30
        + df["pressure_evidence"] * 40
        + df["nighttime_evidence"] * 30
    )

    df["leak_score"] = df["leak_score"].clip(
        upper=100
    )

    # -----------------------------------------------------
    # 7. Confidence level
    # -----------------------------------------------------

    def calculate_confidence(row):

        flow = row["flow_evidence"]
        pressure = row["pressure_evidence"]
        night = row["nighttime_evidence"]

        # Strong multi-sensor evidence
        if flow and pressure and night:
            return "High"

        # Two strong indicators
        elif pressure and (flow or night):
            return "Medium"

        # Single indicator
        else:
            return "Low"

    df["confidence"] = (
        df.apply(
            calculate_confidence,
            axis=1
        )
    )

    # -----------------------------------------------------
    # 8. Generate leak hypothesis
    # -----------------------------------------------------

    def generate_hypothesis(row):

        flow = row["flow_evidence"]
        pressure = row["pressure_evidence"]
        night = row["nighttime_evidence"]

        if flow and pressure and night:

            return (
                "Potential pipeline leakage or burst "
                "indicated by elevated flow, pressure "
                "drop, and high nighttime flow."
            )

        elif flow and pressure:

            return (
                "Potential pipeline leakage indicated "
                "by elevated flow and pressure anomaly."
            )

        elif pressure and night:

            return (
                "Potential network leakage or pressure "
                "issue indicated by pressure drop and "
                "abnormal nighttime flow."
            )

        elif flow:

            return (
                "Elevated flow detected; possible leakage, "
                "demand variation, or sensor issue."
            )

        elif pressure:

            return (
                "Pressure anomaly detected; possible "
                "network or sensor issue."
            )

        else:

            return (
                "Abnormal network behavior detected; "
                "further investigation required."
            )

    df["leak_hypothesis"] = (
        df.apply(
            generate_hypothesis,
            axis=1
        )
    )

    # -----------------------------------------------------
    # 9. Recommended investigation
    # -----------------------------------------------------

    df["recommendation"] = (
        "Investigate "
        + df["pipe_section"].fillna("unknown section")
        + " in "
        + df["dma_id"]
        + ". Validate sensor health, check upstream/"
          "downstream readings, and inspect the suspected "
          "network section."
    )

    # -----------------------------------------------------
    # 10. Final status
    # -----------------------------------------------------

    df["status"] = (
        "Investigation Required"
    )

    # -----------------------------------------------------
    # 11. Display results
    # -----------------------------------------------------

    print()
    print("Leak Detection & Localization")
    print("--------------------------------")

    print(
        f"Anomalous records analyzed: {len(df)}"
    )

    print("\nLeak suspicion by DMA:")

    print(
        df.groupby("dma_id")["leak_score"]
        .max()
        .sort_values(ascending=False)
    )

    print("\nConfidence by DMA:")

    print(
        df.groupby(
            ["dma_id", "confidence"]
        ).size()
    )

    print("\nHigh-confidence events:")

    high_confidence = df[
        df["confidence"] == "High"
    ]

    if len(high_confidence) > 0:

        print(
            high_confidence[
                [
                    "timestamp",
                    "dma_id",
                    "pipe_section",
                    "flow_ratio",
                    "leak_score",
                    "confidence",
                    "status"
                ]
            ].to_string(index=False)
        )

    else:

        print(
            "No high-confidence events found."
        )

    print("\nSample leak investigations:")

    print(
        df[
            [
                "timestamp",
                "dma_id",
                "pipe_section",
                "flow_ratio",
                "leak_score",
                "confidence",
                "leak_hypothesis",
                "recommendation"
            ]
        ]
        .head(10)
        .to_string(index=False)
    )

    # -----------------------------------------------------
    # 12. Save results
    # -----------------------------------------------------

    df.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print()
    print(
        "Leak detection results saved to:"
    )

    print(
        OUTPUT_PATH
    )


# ---------------------------------------------------------
# Run
# ---------------------------------------------------------

if __name__ == "__main__":
    detect_leaks()