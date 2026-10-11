from langgraph.graph import StateGraph, END

from app.agents.state import WaterNetworkState

from app.agents.monitoring_agent import monitoring_agent
from app.agents.forecasting_agent import forecasting_agent
from app.agents.anomaly_agent import anomaly_agent
from app.agents.leak_agent import leak_agent
from app.agents.water_balance_agent import water_balance_agent
from app.agents.maintenance_agent import run_maintenance_agent
from app.agents.operations_agent import run_operations_agent


def build_water_network_workflow():

    workflow = StateGraph(WaterNetworkState)

    # Add all seven agents
    workflow.add_node(
        "monitoring",
        monitoring_agent
    )

    workflow.add_node(
        "forecasting",
        forecasting_agent
    )

    workflow.add_node(
        "anomaly_detection",
        anomaly_agent
    )

    workflow.add_node(
        "leak_detection",
        leak_agent
    )

    workflow.add_node(
        "water_balance",
        water_balance_agent
    )

    workflow.add_node(
        "maintenance",
        run_maintenance_agent
    )

    workflow.add_node(
        "operations",
        run_operations_agent
    )

    # Starting point
    workflow.set_entry_point("monitoring")

    # Connect agents
    workflow.add_edge(
        "monitoring",
        "forecasting"
    )

    workflow.add_edge(
        "forecasting",
        "anomaly_detection"
    )

    workflow.add_edge(
        "anomaly_detection",
        "leak_detection"
    )

    workflow.add_edge(
        "leak_detection",
        "water_balance"
    )

    workflow.add_edge(
        "water_balance",
        "maintenance"
    )

    workflow.add_edge(
        "maintenance",
        "operations"
    )

    workflow.add_edge(
        "operations",
        END
    )

    return workflow.compile()


def run_water_network_workflow():

    app = build_water_network_workflow()

    initial_state = {
        "workflow_status": "Workflow started",
        "sensor_data_path": "backend/data/sensor_data.csv",
        "sensor_validation_status": "Pending",
        "human_approval_required": False
    }

    print("\n")
    print("=" * 60)
    print("BRIGHTCONE WATER AI - AGENTIC WORKFLOW")
    print("=" * 60)

    final_state = app.invoke(initial_state)

    print("\n")
    print("=" * 60)
    print("AGENTIC WORKFLOW COMPLETED")
    print("=" * 60)

    print(
        f"\nWorkflow Status: "
        f"{final_state.get('workflow_status')}"
    )

    print(
        f"Human Approval Required: "
        f"{final_state.get('human_approval_required')}"
    )

    print("\nAgent Status:")

    print(
        f"Monitoring: "
        f"{final_state.get('sensor_validation_status')}"
    )

    print(
        f"Forecasting: "
        f"{final_state.get('forecast_status')}"
    )

    print(
        f"Anomaly Detection: "
        f"{final_state.get('anomaly_status')}"
    )

    print(
        f"Leak Detection: "
        f"{final_state.get('leak_status')}"
    )

    print(
        f"Water Balance: "
        f"{final_state.get('water_balance_status')}"
    )

    print(
        f"Maintenance: "
        f"{final_state.get('maintenance_status')}"
    )

    print(
        f"Operations: "
        f"{final_state.get('operations_status')}"
    )

    print("\nFinal Recommendation:")

    print(
        final_state.get(
            "final_recommendation",
            "No recommendation generated."
        )
    )

    return final_state


if __name__ == "__main__":

    run_water_network_workflow()