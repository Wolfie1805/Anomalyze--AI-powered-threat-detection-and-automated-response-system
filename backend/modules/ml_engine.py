import os
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml_models", "isolation_forest.pkl")

class MLEngine:
    def __init__(self):
        self.model = None
        self.is_ready = False
        self.training_buffer = []
        self.last_retrain = None
        self._load_or_create_model()

    def _load_or_create_model(self):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.is_ready = True
                print("ML Engine: Loaded existing model.")
            except Exception as e:
                print(f"ML Engine: Failed to load model: {e}")
                self._create_initial_model()
        else:
            self._create_initial_model()

    def _create_initial_model(self):
        print("ML Engine: Creating initial model.")
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('iforest', IsolationForest(
                n_estimators=200,
                contamination=0.05,
                max_features=0.8,
                bootstrap=True,
                random_state=42
            ))
        ])
        # Baseline normal traffic (10 features each)
        baseline = []
        for _ in range(200):
            baseline.append([
                float(np.random.choice([200, 200, 200, 304, 301, 404])),
                float(np.random.randint(100, 2000)),
                float(np.random.randint(5, 50)),
                0.0,  # not failure
                1.0,  # success
                0.0,  # not suspicious
                float(np.random.randint(8, 20)),  # business hours
                float(np.random.choice([0, 1, 2])),
                0.0,
                1.0,
            ])
        self.train(baseline)

    def train(self, features_list: list):
        if not features_list or len(features_list) < 10:
            return
        X = np.array(features_list)
        self.model.fit(X)
        joblib.dump(self.model, MODEL_PATH)
        self.is_ready = True
        self.last_retrain = datetime.now()
        print(f"ML Engine: Retrained model with {len(features_list)} samples.")

    def add_to_buffer(self, features: list, is_known_attack: bool = False):
        """Add features to training buffer. Only add normal traffic."""
        if not is_known_attack:
            self.training_buffer.append(features)
        # Auto-retrain every 500 new samples
        if len(self.training_buffer) >= 500:
            print("ML Engine: Auto-retraining on new data...")
            self.train(self.training_buffer)
            self.training_buffer = []

    def predict(self, features: list) -> tuple:
        if not self.is_ready or not features:
            return False, 0.0
        X = np.array(features).reshape(1, -1)
        try:
            prediction = self.model.predict(X)[0]
            score = self.model.decision_function(X)[0]
            is_anomaly = (prediction == -1)
            # Map to 0-100 risk score
            risk_score = float(min(max((0.5 - score) * 100, 0), 100))
            return is_anomaly, risk_score
        except Exception as e:
            print(f"ML Engine Predict Error: {e}")
            return False, 0.0

    def get_status(self) -> dict:
        return {
            "is_ready": self.is_ready,
            "last_retrain": self.last_retrain.isoformat() if self.last_retrain else None,
            "buffer_size": len(self.training_buffer),
            "model_path": MODEL_PATH,
        }

ml_engine = MLEngine()