import requests

BASE_URL = "http://127.0.0.1:8000"


def test_01_backend_health():
    response = requests.get(f"{BASE_URL}/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_02_sensor_data_available():
    response = requests.get(f"{BASE_URL}/api/sensors")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) > 0


def test_03_anomaly_detection():
    response = requests.get(f"{BASE_URL}/api/anomalies")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) > 0


def test_04_leak_detection():
    response = requests.get(f"{BASE_URL}/api/leaks")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) > 0

    for item in data:
        assert "confidence" in item
        assert "leak_score" in item


def test_05_water_balance():
    response = requests.get(f"{BASE_URL}/api/water-balance")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) > 0

    for item in data:
        assert "water_loss_percentage" in item
        assert "unexplained_water_m3" in item


def test_06_maintenance_priority():
    response = requests.get(f"{BASE_URL}/api/maintenance")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) > 0

    for item in data:
        assert "priority" in item
        assert "priority_score" in item
        assert "assigned_team" in item


def test_07_human_approval():
    response = requests.get(f"{BASE_URL}/api/operations")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) > 0

    for item in data:
        assert "approval_status" in item


def test_08_forecasting():
    response = requests.get(f"{BASE_URL}/api/forecast")

    assert response.status_code == 200

    result = response.json()

    assert result["model"] == "Random Forest Regressor"
    assert result["target"] == "smart_meter_consumption_m3h"
    assert "mae" in result
    assert "rmse" in result
    assert "records" in result
    assert len(result["records"]) > 0
    
def test_09_agent_status():
    response = requests.get(f"{BASE_URL}/api/agent-status")

    assert response.status_code == 200

    result = response.json()

    assert result["workflow_status"] == "Completed"
    assert result["human_approval_required"] is True
    assert len(result["agents"]) == 7

    agent_names = [agent["name"] for agent in result["agents"]]

    assert "Monitoring Agent" in agent_names
    assert "Demand Forecasting Agent" in agent_names
    assert "Anomaly Detection Agent" in agent_names
    assert "Leak Detection Agent" in agent_names
    assert "Water Balance Agent" in agent_names
    assert "Maintenance Agent" in agent_names
    assert "Operations Agent" in agent_names


def test_10_network_topology():
    response = requests.get(f"{BASE_URL}/api/network")

    assert response.status_code == 200

    data = response.json()["data"]

    assert len(data) >= 3

    dma_ids = [item["dma_id"] for item in data]

    assert "DMA-A" in dma_ids
    assert "DMA-B" in dma_ids
    assert "DMA-C" in dma_ids


def test_11_operation_approval():
    response = requests.post(
        f"{BASE_URL}/api/operations/DMA-B/approval",
        json={
            "action": "approve",
            "approved_by": "Network Operator",
            "observation": "Test approval"
        }
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == "success"
    assert result["dma_id"] == "DMA-B"
    assert result["approval_status"] == "Approved"


def test_12_repair_completion():
    response = requests.post(
        f"{BASE_URL}/api/operations/DMA-B/repair",
        json={
            "repair_status": "completed",
            "completed_by": "Field Team",
            "observation": "Test repair completion"
        }
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == "success"
    assert result["dma_id"] == "DMA-B"
    assert result["repair_status"] == "Repair Completed"


def test_13_repair_validation():
    response = requests.get(
        f"{BASE_URL}/api/operations/DMA-B/repair-validation"
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == "success"
    assert result["dma_id"] == "DMA-B"
    assert "before_repair" in result
    assert "after_repair" in result
    assert "improvement" in result
    assert "validation_result" in result
    assert "leak_risk" in result
    
def test_14_pdf_report():
    response = requests.get(
        f"{BASE_URL}/api/report/pdf"
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert len(response.content) > 1000