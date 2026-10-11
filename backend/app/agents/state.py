from typing import TypedDict, Any


class WaterNetworkState(TypedDict, total=False):

    # Workflow status
    workflow_status: str

    # Sensor monitoring
    sensor_data_path: str
    sensor_validation_status: str
    sensor_summary: Any

    # Demand forecasting
    forecast_status: str
    forecast_metrics: Any
    forecast_summary: Any

    # Anomaly detection
    anomaly_status: str
    anomaly_summary: Any

    # Leak detection
    leak_status: str
    leak_summary: Any

    # Water balance
    water_balance_status: str
    water_balance_summary: Any

    # Maintenance planning
    maintenance_status: str
    maintenance_summary: Any

    # Operations coordination
    operations_status: str
    operations_summary: Any

    # Final decision
    human_approval_required: bool
    final_recommendation: str