import pandas as pd
from pathlib import Path

from app.agents.state import WaterNetworkState
from app.services.demand_forecasting import train_model, load_data


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "data" / "sensor_data.csv"
MODEL_PATH = PROJECT_ROOT.parent / "models" / "demand_forecasting_model.pkl"


def forecasting_agent(state: WaterNetworkState) -> WaterNetworkState:
    print()
    print("🤖 Water Demand Forecasting Agent")
    print("-----------------------------------")

    try:
        # Check sensor validation
        if state.get("sensor_validation_status") != "Passed":
            state["forecast_status"] = "Skipped"
            state["forecast_summary"] = {
                "reason": "Sensor data validation did not pass"
            }
            state["workflow_status"] = "Forecasting skipped"

            print("Forecasting skipped because sensor validation did not pass.")
            return state

        # Load prepared forecasting data
        df = load_data()

        print(f"Forecasting records available: {len(df)}")

        # Run the existing numerical forecasting model
        train_model()

        state["forecast_status"] = "Completed"

        state["forecast_summary"] = {
            "model": "Random Forest Regressor",
            "target": "smart_meter_consumption_m3h",
            "features": [
                "hour",
                "day_of_week",
                "day_of_month",
                "lag_1",
                "lag_24",
                "rolling_6h"
            ],
            "records_used": len(df),
            "model_path": str(MODEL_PATH),
            "status": "Numerical forecasting model trained successfully"
        }

        state["workflow_status"] = "Demand forecasting completed"

        print()
        print("Forecasting: COMPLETED")
        print("Model: Random Forest Regressor")
        print("Target: smart_meter_consumption_m3h")
        print(f"Model saved: {MODEL_PATH}")

        return state

    except Exception as e:
        state["forecast_status"] = "Failed"
        state["workflow_status"] = "Forecasting agent failed"
        state["forecast_summary"] = {
            "error": str(e)
        }

        print(f"Forecasting Agent Error: {e}")

        return state


if __name__ == "__main__":

    initial_state: WaterNetworkState = {
        "sensor_validation_status": "Passed"
    }

    result = forecasting_agent(initial_state)

    print()
    print("Agent result:")
    print(result)