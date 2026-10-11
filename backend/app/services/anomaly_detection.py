import pandas as pd
import numpy as np


# Path to sensor dataset
DATA_PATH = "data/sensor_data.csv"


def detect_anomalies():

    # ---------------------------------------------------------
    # 1. Load sensor data
    # ---------------------------------------------------------
    df = pd.read_csv(DATA_PATH)

    # Convert timestamp to datetime
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # ---------------------------------------------------------
    # 2. Calculate Flow Statistics for Each DMA
    # ---------------------------------------------------------
    flow_mean = (
        df.groupby("dma_id")["inlet_flow_m3h"]
        .transform("mean")
    )

    flow_std = (
        df.groupby("dma_id")["inlet_flow_m3h"]
        .transform("std")
    )

    # ---------------------------------------------------------
    # 3. Calculate Pressure Statistics for Each DMA
    # ---------------------------------------------------------
    pressure_mean = (
        df.groupby("dma_id")["pressure_bar"]
        .transform("mean")
    )

    pressure_std = (
        df.groupby("dma_id")["pressure_bar"]
        .transform("std")
    )

    # ---------------------------------------------------------
    # 4. Calculate Z-Scores
    # ---------------------------------------------------------
    df["flow_z_score"] = (
        (df["inlet_flow_m3h"] - flow_mean)
        / flow_std
    )

    df["pressure_z_score"] = (
        (df["pressure_bar"] - pressure_mean)
        / pressure_std
    )

    # ---------------------------------------------------------
    # 5. Detect Flow Anomalies
    # ---------------------------------------------------------
    df["flow_anomaly"] = (
        df["flow_z_score"].abs() > 3
    )

    # ---------------------------------------------------------
    # 6. Detect Pressure Anomalies
    # ---------------------------------------------------------
    df["pressure_anomaly"] = (
        df["pressure_z_score"].abs() > 3
    )

    # ---------------------------------------------------------
    # 7. Identify Nighttime Hours
    # ---------------------------------------------------------
    df["is_night"] = df["timestamp"].dt.hour.isin(
        [0, 1, 2, 3, 4, 5]
    )

    # ---------------------------------------------------------
    # 8. Calculate Average Nighttime Flow for Each DMA
    # ---------------------------------------------------------
    nighttime_mean_by_dma = (
        df[df["is_night"]]
        .groupby("dma_id")["inlet_flow_m3h"]
        .mean()
    )

    # Map the DMA nighttime average to every row
    df["nighttime_mean"] = (
        df["dma_id"].map(nighttime_mean_by_dma)
    )

    # ---------------------------------------------------------
    # 9. Detect High Nighttime Flow
    # ---------------------------------------------------------
    df["nighttime_flow_anomaly"] = (
        df["is_night"]
        & (
            df["inlet_flow_m3h"]
            > df["nighttime_mean"] * 1.5
        )
    )

    # ---------------------------------------------------------
    # 10. Combine All Anomaly Conditions
    # ---------------------------------------------------------
    df["combined_anomaly"] = (
        df["flow_anomaly"]
        | df["pressure_anomaly"]
        | df["nighttime_flow_anomaly"]
    )

    # ---------------------------------------------------------
    # 11. Extract Anomalous Records
    # ---------------------------------------------------------
    anomalies = df[
        df["combined_anomaly"]
    ].copy()

    # ---------------------------------------------------------
    # 12. Display Results
    # ---------------------------------------------------------
    print("\nFlow & Pressure Anomaly Detection")
    print("----------------------------------")

    print(
        f"Total sensor records: {len(df)}"
    )

    print(
        f"Anomalous records: {len(anomalies)}"
    )

    print("\nAnomalies by DMA:")

    print(
        anomalies["dma_id"].value_counts()
    )

    print("\nSample anomalies:")

    print(
        anomalies[
            [
                "timestamp",
                "dma_id",
                "inlet_flow_m3h",
                "pressure_bar",
                "flow_z_score",
                "pressure_z_score",
                "nighttime_flow_anomaly"
            ]
        ].head(15)
    )

    # ---------------------------------------------------------
    # 13. Save Anomaly Results
    # ---------------------------------------------------------
    anomalies.to_csv(
        "data/anomaly_results.csv",
        index=False
    )

    print(
        "\nAnomaly results saved to:"
    )

    print(
        "data/anomaly_results.csv"
    )


# -------------------------------------------------------------
# Run the program
# -------------------------------------------------------------
if __name__ == "__main__":
    detect_anomalies()