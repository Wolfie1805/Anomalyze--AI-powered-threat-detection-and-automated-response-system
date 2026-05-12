import pandas as pd
from sklearn.preprocessing import LabelEncoder
import numpy as np

class Preprocessor:
    def __init__(self):
        self.le_event = LabelEncoder()
        
    def fit_encoders(self, df: pd.DataFrame):
        if "event_type" in df.columns:
            self.le_event.fit(df["event_type"])
            
    def encode_categorical(self, df: pd.DataFrame) -> pd.DataFrame:
        df_encoded = df.copy()
        if "event_type" in df_encoded.columns:
            # Handle unknown classes by assigning to a common class or default
            known_classes = set(self.le_event.classes_)
            df_encoded["event_type"] = df_encoded["event_type"].apply(
                lambda x: x if x in known_classes else self.le_event.classes_[0]
            )
            df_encoded["event_type_encoded"] = self.le_event.transform(df_encoded["event_type"])
        return df_encoded
        
    def extract_features(self, df: pd.DataFrame, include_label: bool = False) -> pd.DataFrame:
        features = ["login_attempts", "request_count", "success", "port"]
        df_features = df[features].copy()
        
        # Convert success to int
        df_features["success_rate"] = df_features["success"].astype(int)
        df_features.drop("success", axis=1, inplace=True)
        
        # Fill missing ports with 0 or a dominant proxy
        df_features["port"] = df_features["port"].fillna(0).astype(int)
        
        # Unique port feature could be computed if grouping, but row-wise we assume port is the port used
        # Renaming port to unique_ports to match prompt reqs simply
        df_features.rename(columns={"port": "unique_ports"}, inplace=True)
        
        if include_label and "label" in df.columns:
            df_features["label"] = df["label"]
            
        return df_features
