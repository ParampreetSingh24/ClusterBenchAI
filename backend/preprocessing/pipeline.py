import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional, List
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif, mutual_info_classif
from sklearn.decomposition import PCA
import scipy.stats as stats

class PreprocessingPipeline:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.feature_names = []
        self.ground_truth = None
        self.ground_truth_name = None
        self.stats_summary = {}

    def analyze_dataset(self, df: pd.DataFrame, target_col: Optional[str] = None) -> Dict[str, Any]:
        """
        Produce a comprehensive statistical profile of the raw dataset.
        """
        num_rows, num_cols = df.shape
        missing_counts = df.isnull().sum().to_dict()
        missing_percentages = (df.isnull().sum() / num_rows * 100).round(2).to_dict()
        
        column_types = {}
        unique_counts = {}
        sample_values = {}
        
        for col in df.columns:
            dtype_str = str(df[col].dtype)
            is_numeric = pd.api.types.is_numeric_dtype(df[col])
            column_types[col] = "numeric" if is_numeric else "categorical"
            unique_counts[col] = int(df[col].nunique())
            sample_values[col] = df[col].dropna().head(3).tolist()

        detected_target = target_col
        if not detected_target:
            candidates = ['class', 'Class', 'label', 'Label', 'target', 'Target', 'diagnosis']
            for c in candidates:
                if c in df.columns:
                    detected_target = c
                    break

        summary = {
            "num_rows": num_rows,
            "num_cols": num_cols,
            "columns": list(df.columns),
            "column_types": column_types,
            "missing_counts": missing_counts,
            "missing_percentages": missing_percentages,
            "total_missing_cells": int(df.isnull().sum().sum()),
            "unique_counts": unique_counts,
            "sample_values": sample_values,
            "detected_target": detected_target
        }
        return summary

    def process(self, df_raw: pd.DataFrame, target_col: Optional[str] = None) -> Tuple[np.ndarray, Optional[np.ndarray], List[str], Dict[str, Any]]:
        """
        Execute data preprocessing according to self.config.
        Returns:
            X: np.ndarray (features matrix ready for clustering)
            y: Optional[np.ndarray] (ground truth labels if available)
            feature_names: List[str]
            report: Dict[str, Any] (step-by-step transformation metrics)
        """
        df = df_raw.copy()
        report = {
            "initial_shape": list(df.shape),
            "steps_applied": []
        }

        # 1. Separate ground truth column if present
        y = None
        target_name = target_col or self.config.get("target_col")
        if not target_name:
            candidates = ['class', 'Class', 'label', 'Label', 'target', 'Target', 'diagnosis']
            for c in candidates:
                if c in df.columns:
                    target_name = c
                    break

        if target_name and target_name in df.columns:
            raw_y = df[target_name].values
            df = df.drop(columns=[target_name])
            self.ground_truth_name = target_name
            # Encode ground truth to integers
            le = LabelEncoder()
            # Handle NaN in ground truth if any
            valid_mask = pd.notna(raw_y)
            y = np.full(len(raw_y), -1, dtype=int)
            y[valid_mask] = le.fit_transform(raw_y[valid_mask].astype(str))
            report["ground_truth"] = {
                "column": target_name,
                "classes": [str(c) for c in le.classes_],
                "num_classes": len(le.classes_)
            }

        # 2. Handle Missing Values
        missing_strategy = self.config.get("missing_strategy", "most_frequent")
        initial_rows = len(df)
        
        if missing_strategy == "drop_rows":
            has_null = df.isnull().any(axis=1)
            df = df[~has_null]
            if y is not None:
                y = y[~has_null]
            report["steps_applied"].append(f"Dropped {int(has_null.sum())} rows containing missing values")
        else:
            for col in df.columns:
                if df[col].isnull().any():
                    if pd.api.types.is_numeric_dtype(df[col]):
                        if missing_strategy == "mean":
                            val = df[col].mean()
                        elif missing_strategy == "median":
                            val = df[col].median()
                        elif missing_strategy == "constant":
                            val = 0
                        else:
                            val = df[col].mode().iloc[0] if not df[col].mode().empty else 0
                        df[col] = df[col].fillna(val)
                    else:
                        # Categorical column
                        val = df[col].mode().iloc[0] if not df[col].mode().empty else "missing"
                        df[col] = df[col].fillna(val)
            report["steps_applied"].append(f"Imputed missing values using strategy: {missing_strategy}")

        # 3. Categorical Encoding
        encoding_strategy = self.config.get("encoding_strategy", "one_hot") # 'one_hot' or 'label'
        categorical_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]
        
        if categorical_cols:
            if encoding_strategy == "one_hot":
                # Guard against too many one-hot columns (cap at 100 max columns if cardinality too high)
                df = pd.get_dummies(df, columns=categorical_cols, drop_first=False, dtype=float)
                report["steps_applied"].append(f"One-Hot encoded {len(categorical_cols)} categorical attributes (new dim: {df.shape[1]})")
            else: # label encoding
                for c in categorical_cols:
                    le = LabelEncoder()
                    df[c] = le.fit_transform(df[c].astype(str))
                report["steps_applied"].append(f"Label encoded {len(categorical_cols)} categorical attributes")

        # Convert all to float numpy array
        X = df.values.astype(float)
        feature_names = list(df.columns)

        # 4. Outlier Detection and Removal
        outlier_method = self.config.get("outlier_method", "none") # 'none', 'isolation_forest', 'lof', 'zscore'
        contamination = float(self.config.get("contamination", 0.05))
        
        if outlier_method != "none" and len(X) > 20:
            outlier_mask = np.ones(len(X), dtype=bool)
            if outlier_method == "isolation_forest":
                iso = IsolationForest(contamination=contamination, random_state=42)
                preds = iso.fit_predict(X)
                outlier_mask = (preds == 1)
            elif outlier_method == "lof":
                lof = LocalOutlierFactor(contamination=contamination)
                preds = lof.fit_predict(X)
                outlier_mask = (preds == 1)
            elif outlier_method == "zscore":
                z_scores = np.abs(stats.zscore(X, nan_policy='omit'))
                max_z = np.nanmax(z_scores, axis=1)
                outlier_mask = (max_z < 3.5)
            
            num_outliers = int((~outlier_mask).sum())
            if num_outliers > 0 and outlier_mask.sum() > 10:
                X = X[outlier_mask]
                if y is not None:
                    y = y[outlier_mask]
                report["steps_applied"].append(f"Detected & removed {num_outliers} outliers using {outlier_method}")

        # 5. Feature Scaling
        scaling_method = self.config.get("scaling_method", "standard") # 'standard', 'minmax', 'robust', 'none'
        if scaling_method == "standard":
            scaler = StandardScaler()
            X = scaler.fit_transform(X)
            report["steps_applied"].append("Applied StandardScaler (zero mean, unit variance)")
        elif scaling_method == "minmax":
            scaler = MinMaxScaler()
            X = scaler.fit_transform(X)
            report["steps_applied"].append("Applied MinMaxScaler (range [0, 1])")
        elif scaling_method == "robust":
            scaler = RobustScaler()
            X = scaler.fit_transform(X)
            report["steps_applied"].append("Applied RobustScaler (median and interquartile range)")
        else:
            report["steps_applied"].append("No scaling applied")

        # 6. Feature Selection / Dimensionality Reduction
        selection_method = self.config.get("feature_selection", "none") # 'none', 'variance', 'kbest', 'pca'
        n_features = X.shape[1]
        
        if selection_method == "variance":
            threshold = float(self.config.get("variance_threshold", 0.01))
            selector = VarianceThreshold(threshold=threshold)
            try:
                X_new = selector.fit_transform(X)
                if X_new.shape[1] > 1:
                    mask = selector.get_support()
                    feature_names = [feature_names[i] for i, m in enumerate(mask) if m]
                    X = X_new
                    report["steps_applied"].append(f"Variance Threshold filtered features from {n_features} down to {X.shape[1]}")
            except Exception:
                pass
        elif selection_method == "pca":
            k_pca = int(self.config.get("pca_components", min(10, n_features)))
            if k_pca < n_features:
                pca = PCA(n_components=k_pca, random_state=42)
                X = pca.fit_transform(X)
                feature_names = [f"PCA_Dim_{i+1}" for i in range(k_pca)]
                explained_var = float(pca.explained_variance_ratio_.sum() * 100)
                report["steps_applied"].append(f"PCA reduced dimensions from {n_features} to {k_pca} ({explained_var:.1f}% variance preserved)")
        elif selection_method == "kbest" and y is not None:
            k_best = int(self.config.get("k_best", min(10, n_features)))
            if k_best < n_features:
                selector = SelectKBest(score_func=f_classif, k=k_best)
                try:
                    X_new = selector.fit_transform(X, y)
                    mask = selector.get_support()
                    feature_names = [feature_names[i] for i, m in enumerate(mask) if m]
                    X = X_new
                    report["steps_applied"].append(f"SelectKBest (ANOVA) selected top {X.shape[1]} features")
                except Exception:
                    pass

        report["final_shape"] = list(X.shape)
        report["feature_count"] = X.shape[1]
        report["instance_count"] = X.shape[0]

        return X, y, feature_names, report
