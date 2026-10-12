import pandas as pd


def dynamic_reassessment_agent(state):
    """
    Dynamic reassessment of a water-network leak hypothesis
    using the latest available sensor information.
    """

    sensor_file = state.get(
        "sensor_data_path",
        "data/sensor_data.csv"
    )

    try:
        df = pd.read_csv(sensor_file)

        if df.empty:
            return {
                "workflow_status": "Reassessment completed - no sensor data"
            }

        # Get latest sensor reading
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        latest = df.sort_values("timestamp").iloc[-1]

        dma_id = latest["dma_id"]

        flow = float(latest["inlet_flow_m3h"])
        pressure = float(latest["pressure_bar"])
        consumption = float(
            latest["smart_meter_consumption_m3h"]
        )

        # Difference between supplied water and metered consumption
        flow_consumption_gap = flow - consumption
        
                # Estimated instantaneous unexplained water
        estimated_loss_m3h = max(flow_consumption_gap, 0)

        # Operator notification
        operator_notification = (
            f"Reassessment alert: {dma_id} requires operator review. "
            f"Estimated unexplained flow is "
            f"{estimated_loss_m3h:.2f} m3/h."
        )

        # Reassess leak confidence
        if pressure < 3.5 and flow_consumption_gap > 30:

            confidence = "High"

            hypothesis = (
                "Leak hypothesis strengthened by low pressure "
                "and elevated inlet-to-consumption flow difference."
            )

        elif pressure < 4.0 and flow_consumption_gap > 20:

            confidence = "Medium"

            hypothesis = (
                "Potential abnormal water loss detected; "
                "additional sensor verification is recommended."
            )

        else:

            confidence = "Low"

            hypothesis = (
                "Current sensor readings do not provide strong "
                "additional evidence of leakage."
            )
            
            
            reassessment = {
            "dma_id": str(dma_id),
            "timestamp": str(latest["timestamp"]),
            "flow_m3h": round(flow, 2),
            "pressure_bar": round(pressure, 2),
            "consumption_m3h": round(consumption, 2),
            "flow_consumption_gap_m3h": round(
                flow_consumption_gap,
                2
            ),
            "estimated_loss_m3h": round(
                estimated_loss_m3h,
                2
            ),
            "operator_notification": operator_notification,
            "confidence": confidence,
            "hypothesis": hypothesis,
            "status": "Reassessment Completed",
        }

        return {
            "reassessment": reassessment,
            "workflow_status": "Dynamic reassessment completed",
        }

    except Exception as e:

        return {
            "reassessment": {
                "status": "Reassessment Failed",
                "error": str(e),
            },
            "workflow_status": "Reassessment failed",
        }