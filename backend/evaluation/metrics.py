import numpy as np
from typing import Dict, Any, Optional
from sklearn.metrics import (
    silhouette_score,
    davies_bouldin_score,
    calinski_harabasz_score,
    adjusted_rand_score,
    normalized_mutual_info_score
)

class EvaluationMetrics:
    @staticmethod
    def compute_all_metrics(
        X: np.ndarray,
        labels: np.ndarray,
        y_true: Optional[np.ndarray] = None,
        cluster_centers: Optional[np.ndarray] = None,
        exec_time_ms: float = 0.0,
        memory_kb: float = 0.0
    ) -> Dict[str, Any]:
        """
        Computes all clustering validation metrics.
        Returns a dictionary of raw metrics and formatted score values.
        """
        # Filter out noise points (-1) if any (e.g. from DBSCAN)
        valid_mask = labels != -1
        n_valid = int(valid_mask.sum())
        valid_labels = labels[valid_mask]
        unique_labels = np.unique(valid_labels)
        n_clusters = len(unique_labels)

        metrics = {
            "n_clusters": n_clusters,
            "n_noise_points": int((~valid_mask).sum()),
            "execution_time_ms": exec_time_ms,
            "memory_kb": memory_kb,
            "silhouette_score": None,
            "davies_bouldin_index": None,
            "calinski_harabasz_score": None,
            "inertia": None,
            "purity": None,
            "adjusted_rand_index": None,
            "normalized_mutual_info": None
        }

        # Check if internal validation metrics can be computed (need at least 2 clusters and < N samples)
        if 2 <= n_clusters < n_valid:
            X_valid = X[valid_mask]
            
            # 1. Silhouette Score [-1, 1] (higher is better)
            try:
                # Subsample if dataset is very large (> 2000) for fast metric calculation
                if n_valid > 2500:
                    sil = silhouette_score(X_valid, valid_labels, sample_size=2000, random_state=42)
                else:
                    sil = silhouette_score(X_valid, valid_labels)
                metrics["silhouette_score"] = round(float(sil), 4)
            except Exception:
                metrics["silhouette_score"] = None

            # 2. Davies-Bouldin Index [0, inf) (lower is better)
            try:
                db = davies_bouldin_score(X_valid, valid_labels)
                metrics["davies_bouldin_index"] = round(float(db), 4)
            except Exception:
                metrics["davies_bouldin_index"] = None

            # 3. Calinski-Harabasz Score [0, inf) (higher is better)
            try:
                ch = calinski_harabasz_score(X_valid, valid_labels)
                metrics["calinski_harabasz_score"] = round(float(ch), 2)
            except Exception:
                metrics["calinski_harabasz_score"] = None

            # 4. Inertia / WCSS (Within-Cluster Sum of Squares)
            try:
                total_wcss = 0.0
                for c in unique_labels:
                    members = X_valid[valid_labels == c]
                    center = members.mean(axis=0) if cluster_centers is None else cluster_centers[c]
                    dists_sq = np.sum((members - center) ** 2)
                    total_wcss += dists_sq
                metrics["inertia"] = round(float(total_wcss), 2)
            except Exception:
                metrics["inertia"] = None

        # 5. Ground Truth Metrics (if ground truth labels are provided)
        if y_true is not None and len(y_true) == len(labels):
            valid_gt_mask = (y_true != -1) & valid_mask
            if valid_gt_mask.sum() > 0:
                y_eval = y_true[valid_gt_mask]
                lbls_eval = labels[valid_gt_mask]

                # Cluster Purity
                # For each cluster, find count of majority class
                purity_sum = 0
                for c in np.unique(lbls_eval):
                    cluster_gt = y_eval[lbls_eval == c]
                    if len(cluster_gt) > 0:
                        # find mode count
                        counts = np.bincount(cluster_gt.astype(int))
                        purity_sum += np.max(counts)
                metrics["purity"] = round(float(purity_sum / len(y_eval)), 4)

                # Adjusted Rand Index (ARI) [-1, 1]
                try:
                    ari = adjusted_rand_score(y_eval, lbls_eval)
                    metrics["adjusted_rand_index"] = round(float(ari), 4)
                except Exception:
                    metrics["adjusted_rand_index"] = None

                # Normalized Mutual Information (NMI) [0, 1]
                try:
                    nmi = normalized_mutual_info_score(y_eval, lbls_eval)
                    metrics["normalized_mutual_info"] = round(float(nmi), 4)
                except Exception:
                    metrics["normalized_mutual_info"] = None

        return metrics
