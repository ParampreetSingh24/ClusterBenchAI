import io
import pandas as pd
from typing import Dict, Any, List

class CSVReportGenerator:
    @staticmethod
    def generate_benchmark_csv(ranked_results: List[Dict[str, Any]]) -> str:
        """
        Exports the benchmark metrics table into a standardized CSV string.
        """
        rows = []
        for r in ranked_results:
            m = r.get("metrics", {})
            rows.append({
                "Rank": r.get("rank"),
                "Algorithm": r.get("algorithm"),
                "Composite_Score": r.get("composite_score"),
                "Clusters_Found": m.get("n_clusters"),
                "Silhouette_Score": m.get("silhouette_score"),
                "Davies_Bouldin_Index": m.get("davies_bouldin_index"),
                "Calinski_Harabasz_Score": m.get("calinski_harabasz_score"),
                "Inertia_WCSS": m.get("inertia"),
                "Cluster_Purity": m.get("purity"),
                "Adjusted_Rand_Index": m.get("adjusted_rand_index"),
                "Normalized_Mutual_Info": m.get("normalized_mutual_info"),
                "Execution_Time_ms": m.get("execution_time_ms"),
                "Memory_KB": m.get("memory_kb"),
                "Noise_Points": m.get("n_noise_points", 0)
            })
        df = pd.DataFrame(rows)
        return df.to_csv(index=False)

    @staticmethod
    def generate_clustered_dataset_csv(
        df_raw: pd.DataFrame,
        labels: List[int],
        pca_x: List[float] = None,
        pca_y: List[float] = None
    ) -> str:
        """
        Exports the original dataset merged with assigned cluster labels and coordinates.
        """
        df = df_raw.copy()
        if len(labels) == len(df):
            df["ClusterBench_Assigned_Cluster"] = labels
        if pca_x and pca_y and len(pca_x) == len(df):
            df["ClusterBench_PCA_Dim1"] = pca_x
            df["ClusterBench_PCA_Dim2"] = pca_y
        return df.to_csv(index=False)
