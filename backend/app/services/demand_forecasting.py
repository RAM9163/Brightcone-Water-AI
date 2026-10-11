import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib


from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATA_PATH = PROJECT_ROOT / "backend" / "data" / "sensor_data.csv"
MODEL_PATH = PROJECT_ROOT / "models" / "demand_forecasting_model.pkl"


def load_data():
    df = pd.read_csv(DATA_PATH)

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    df = df.sort_values(["dma_id", "timestamp"])

    # Time-based features
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["day_of_month"] = df["timestamp"].dt.day

    # Previous consumption values
    df["lag_1"] = (
        df.groupby("dma_id")["smart_meter_consumption_m3h"]
        .shift(1)
    )

    df["lag_24"] = (
        df.groupby("dma_id")["smart_meter_consumption_m3h"]
        .shift(24)
    )

    # Rolling average
    df["rolling_6h"] = (
        df.groupby("dma_id")["smart_meter_consumption_m3h"]
        .transform(lambda x: x.rolling(6).mean())
    )

    # Remove rows with missing lag/rolling values
    df = df.dropna()

    return df


def train_model():

    df = load_data()

    features = [
        "hour",
        "day_of_week",
        "day_of_month",
        "lag_1",
        "lag_24",
        "rolling_6h"
    ]

    target = "smart_meter_consumption_m3h"

    X = df[features]
    y = df[target]

    # Time-based split
    split_index = int(len(df) * 0.8)

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))

    print("Demand Forecasting Model")
    print("-------------------------")
    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

    # Save model
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"\nModel saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train_model()