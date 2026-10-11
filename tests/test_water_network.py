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