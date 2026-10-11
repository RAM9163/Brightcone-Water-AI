import pandas as pd
import numpy as np

np.random.seed(42)

# Generate 30 days of hourly sensor data
timestamps = pd.date_range(
    start="2026-09-01 00:00:00",
    end="2026-09-30 23:00:00",
    freq="h"
)

dmas = ["DMA-A", "DMA-B", "DMA-C"]

rows = []

for timestamp in timestamps:
    hour = timestamp.hour

    for dma in dmas:

        # Normal flow pattern
        if hour in [0, 1, 2, 3, 4, 5]:
            base_flow = {
                "DMA-A": 80,
                "DMA-B": 90,
                "DMA-C": 70
            }[dma]
        elif hour in [6, 7, 8, 9]:
            base_flow = {
                "DMA-A": 150,
                "DMA-B": 170,
                "DMA-C": 130
            }[dma]
        elif hour in [18, 19, 20, 21]:
            base_flow = {
                "DMA-A": 160,
                "DMA-B": 180,
                "DMA-C": 140
            }[dma]
        else:
            base_flow = {
                "DMA-A": 110,
                "DMA-B": 120,
                "DMA-C": 100
            }[dma]

        flow = base_flow + np.random.normal(0, 5)

        # Normal pressure
        pressure = {
            "DMA-A": 4.1,
            "DMA-B": 4.0,
            "DMA-C": 4.2
        }[dma] + np.random.normal(0, 0.08)

        # Smart meter consumption
        consumption = flow * np.random.uniform(0.70, 0.85)

        # Introduce abnormal leak event in DMA-B
        if (
            dma == "DMA-B"
            and timestamp >= pd.Timestamp("2026-09-20 02:00:00")
            and timestamp <= pd.Timestamp("2026-09-20 06:00:00")
        ):
            flow += 60 + np.random.normal(0, 5)
            pressure -= 1.2
            consumption = flow * np.random.uniform(0.55, 0.65)

        # Introduce another abnormal event in DMA-C
        if (
            dma == "DMA-C"
            and timestamp >= pd.Timestamp("2026-09-25 01:00:00")
            and timestamp <= pd.Timestamp("2026-09-25 05:00:00")
        ):
            flow += 45 + np.random.normal(0, 4)
            pressure -= 0.9

        rows.append({
            "timestamp": timestamp,
            "dma_id": dma,
            "inlet_flow_m3h": round(flow, 2),
            "pressure_bar": round(pressure, 2),
            "smart_meter_consumption_m3h": round(consumption, 2)
        })


df = pd.DataFrame(rows)

# Save dataset
output_file = "data/sensor_data.csv"
df.to_csv(output_file, index=False)

print("Sensor dataset created successfully!")
print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")
print("\nFirst 5 rows:")
print(df.head())