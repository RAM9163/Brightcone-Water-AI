import pandas as pd


def post_repair_validation_agent(state):
    """
    Compares water-network conditions before and after a repair.
    """

    sensor_file = state.get(
        "sensor_data_path",
        "data/sensor_data.csv"
    )

    try:
        df = pd.read_csv(sensor_file)

        if df.empty:
            return {
                "post_repair_validation": {
                    "status": "Validation Failed",
                    "message": "No sensor data available."
                }
            }

        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        # Use the latest two observations as a simulated
        # before-repair and after-repair comparison.
        before = df.iloc[-2]
        after = df.iloc[-1]

        before_flow = float(before["inlet_flow_m3h"])
        after_flow = float(after["inlet_flow_m3h"])

        before_pressure = float(before["pressure_bar"])
        after_pressure = float(after["pressure_bar"])

        flow_change = after_flow - before_flow
        pressure_change = after_pressure - before_pressure

        # Improvement logic
        flow_improved = after_flow <= before_flow
        pressure_improved = after_pressure >= before_pressure

        if flow_improved and pressure_improved:
            validation_result = "Improved"
        elif flow_improved or pressure_improved:
            validation_result = "Partially Improved"
        else:
            validation_result = "No Improvement"

        verification_required = True

        verification_message = (
            "Final verification by authorized personnel is required "
            "before the repair can be marked as successfully validated."
        )

        result = {
            "dma_id": str(after["dma_id"]),
            "before_timestamp": str(before["timestamp"]),
            "after_timestamp": str(after["timestamp"]),
            "before_flow_m3h": round(before_flow, 2),
            "after_flow_m3h": round(after_flow, 2),
            "before_pressure_bar": round(before_pressure, 2),
            "after_pressure_bar": round(after_pressure, 2),
            "flow_change_m3h": round(flow_change, 2),
            "pressure_change_bar": round(pressure_change, 2),
            "validation_result": validation_result,
            "verification_required": verification_required,
            "verification_message": verification_message,
            "status": "Post-Repair Validation Completed",
        }

        return {
            "post_repair_validation": result,
            "workflow_status": "Post-repair validation completed",
        }

    except Exception as e:
        return {
            "post_repair_validation": {
                "status": "Validation Failed",
                "error": str(e),
            },
            "workflow_status": "Post-repair validation failed",
        }