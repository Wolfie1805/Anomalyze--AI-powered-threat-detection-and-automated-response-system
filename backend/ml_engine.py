import os
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import classification_report
from preprocessor import Preprocessor
from sqlalchemy.orm import Session
import models

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
IF_MODEL_PATH = os.path.join(MODELS_DIR, "isolation_forest.pkl")
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest.pkl")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")

class MLEngine:
    def __init__(self):
        self.if_model = None
        self.rf_model = None
        self.preprocessor = Preprocessor()
        
    def load_or_train(self, db: Session):
        os.makedirs(MODELS_DIR, exist_ok=True)
        
        if os.path.exists(IF_MODEL_PATH) and os.path.exists(RF_MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
            print("Loading existing ML models...")
            self.if_model = joblib.load(IF_MODEL_PATH)
            self.rf_model = joblib.load(RF_MODEL_PATH)
            self.preprocessor = joblib.load(PREPROCESSOR_PATH)
        else:
            print("Training ML models from scratch...")
            self.train(db)
            
    def train(self, db: Session):
        # Fetch training data
        entries = db.query(models.LogEntry).all()
        if not entries:
            print("No data to train on!")
            return
            
        # Convert to DataFrame
        data = []
        for entry in entries:
            data.append({
                "ip_address": entry.ip_address,
                "login_attempts": entry.login_attempts,
                "request_count": entry.request_count,
                "success": entry.success,
                "port": entry.port,
                "event_type": entry.event_type,
                "label": entry.label or "normal"
            })
            
        df = pd.DataFrame(data)
        
        # Preprocessing
        self.preprocessor.fit_encoders(df)
        df = self.preprocessor.encode_categorical(df)
        
        # Features for Isolation Forest
        if_features = self.preprocessor.extract_features(df)
        
        # Model A: Isolation Forest
        self.if_model = IsolationForest(contamination=0.1, random_state=42)
        self.if_model.fit(if_features)
        
        # Features for Random Forest include event_type_encoded
        rf_features = if_features.copy()
        rf_features["event_type_encoded"] = df["event_type_encoded"]
        
        # Model B: Random Forest
        self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        y = df["label"]
        self.rf_model.fit(rf_features, y)
        
        # Report
        y_pred = self.rf_model.predict(rf_features)
        print("ML Training complete. Classification Report:")
        print(classification_report(y, y_pred))
        
        # Save
        joblib.dump(self.if_model, IF_MODEL_PATH)
        joblib.dump(self.rf_model, RF_MODEL_PATH)
        joblib.dump(self.preprocessor, PREPROCESSOR_PATH)
        print("Models saved.")
        
    def evaluate(self, entry_dict: dict):
        """
        Evaluate single entry through Ensemble Logic.
        Returns: (is_anomaly, attack_type, confidence, detection_method)
        """
        if not self.if_model or not self.rf_model:
            return False, None, 0.0, None
            
        df = pd.DataFrame([entry_dict])
        df = self.preprocessor.encode_categorical(df)
        
        if_features = self.preprocessor.extract_features(df)
        rf_features = if_features.copy()
        rf_features["event_type_encoded"] = df.get("event_type_encoded", 0)
        
        # IF prediction
        if_score = self.if_model.decision_function(if_features)[0]
        if_pred = self.if_model.predict(if_features)[0] # -1 is anomaly, 1 is normal
        is_if_anomaly = if_pred == -1
        
        # RF prediction
        rf_probs = self.rf_model.predict_proba(rf_features)[0]
        rf_pred_idx = rf_probs.argmax()
        rf_confidence = rf_probs[rf_pred_idx]
        rf_label = self.rf_model.classes_[rf_pred_idx]
        
        # Ensemble Logic
        if rf_confidence >= 0.80 and rf_label != "normal":
            return True, rf_label, rf_confidence, "AI-RF"
            
        if is_if_anomaly and rf_confidence < 0.80:
            return True, "UNKNOWN_ANOMALY", float(-if_score), "AI-IF" # return relative score as faux confidence
            
        return False, "normal", rf_confidence, None
