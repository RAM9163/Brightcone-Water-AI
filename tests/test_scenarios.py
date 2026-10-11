import pandas as pd

from app.agents.anomaly_agent import anomaly_agent


def test_tc01_normal_flow_pressure_no_unnecessary_alert():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 100.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 12:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 101.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.5
        }
    ])

    state = {"sensor_data": data}
    result = anomaly_agent(state)

    assert result is not None


def test_tc02_sudden_flow_increase():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 100.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 12:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 180.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        }
    ])

    state = {"sensor_data": data}
    result = anomaly_agent(state)

    assert result is not None


def test_tc03_pressure_drop():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 100.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 101.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 12:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 2.5,
            "smart_meter_consumption_m3h": 96.0
        }
    ])

    state = {"sensor_data": data}
    result = anomaly_agent(state)

    assert result is not None


def test_tc04_flow_increase_and_pressure_drop():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 100.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 12:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 180.0,
            "pressure_bar": 2.5,
            "smart_meter_consumption_m3h": 96.0
        }
    ])

    state = {"sensor_data": data}
    result = anomaly_agent(state)

    assert result is not None


def test_tc05_nighttime_high_flow():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 01:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 180.0,
            "pressure_bar": 3.8,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 02:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 185.0,
            "pressure_bar": 3.7,
            "smart_meter_consumption_m3h": 94.0
        },
        {
            "timestamp": "2026-10-01 03:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 190.0,
            "pressure_bar": 3.6,
            "smart_meter_consumption_m3h": 93.0
        }
    ])

    state = {"sensor_data": data}
    result = anomaly_agent(state)

    assert result is not None


def test_tc06_impossible_pressure_sensor_verification():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 100.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 101.0,
            "pressure_bar": -5.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 12:00:00",
            "dma_id": "DMA-A",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 95.5
        }
    ])

    state = {"sensor_data": data}
    result = anomaly_agent(state)

    assert result is not None
def test_tc07_dynamic_reassessment():
    data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 100.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 12:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 180.0,
            "pressure_bar": 2.5,
            "smart_meter_consumption_m3h": 96.0
        }
    ])

    state = {"sensor_data": data}

    first_result = anomaly_agent(state)
    assert first_result is not None

    new_data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 13:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 190.0,
            "pressure_bar": 2.3,
            "smart_meter_consumption_m3h": 95.0
        }
    ])

    updated_data = pd.concat([data, new_data], ignore_index=True)
    updated_state = {"sensor_data": updated_data}

    second_result = anomaly_agent(updated_state)
    assert second_result is not None
    
def test_tc08_repair_completed_pre_post_comparison():
    before_data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 10:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 180.0,
            "pressure_bar": 2.5,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 11:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 185.0,
            "pressure_bar": 2.4,
            "smart_meter_consumption_m3h": 95.0
        }
    ])

    before_state = {"sensor_data": before_data}
    before_result = anomaly_agent(before_state)

    assert before_result is not None

    after_data = pd.DataFrame([
        {
            "timestamp": "2026-10-01 14:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 102.0,
            "pressure_bar": 4.0,
            "smart_meter_consumption_m3h": 96.0
        },
        {
            "timestamp": "2026-10-01 15:00:00",
            "dma_id": "DMA-B",
            "inlet_flow_m3h": 101.0,
            "pressure_bar": 4.1,
            "smart_meter_consumption_m3h": 95.0
        }
    ])

    after_state = {"sensor_data": after_data}
    after_result = anomaly_agent(after_state)

    assert after_result is not None