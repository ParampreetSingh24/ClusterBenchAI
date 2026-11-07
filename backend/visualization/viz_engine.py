import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_samples, silhouette_score
from sklearn.cluster import KMeans
from scipy.cluster.hierarchy import linkage, dendrogram

class VisualizationEngine:
    @staticmethod
    def compute_projections(
        X: np.ndarray,
        labels: np.ndarray,
        y_true: Optional[np.ndarray] = None,
        max_samples: int = 1500
    ) -> Dict[str, Any]:
        """
        Computes 2D and 3D dimensionality reduction projections:
        - PCA (2D & 3D)
        - t-SNE (2D)
        - UMAP / Manifold approximation (2D)
        """
        n_samples, n_features = X.shape
        
        # Subsample if dataset is large to maintain fast UI responsiveness
        if n_samples > max_samples:
            indices = np.random.RandomState(42).choice(n_samples, size=max_samples, replace=False)
            X_sub = X[indices]
            labels_sub = labels[indices]
            y_sub = y_true[indices] if y_true is not None else None
        else:
            X_sub = X
            labels_sub = labels
            y_sub = y_true

        projections = {
            "sample_count": len(X_sub),
            "labels": labels_sub.tolist(),
            "ground_truth": y_sub.tolist() if y_sub is not None else None
        }

        # 1. PCA 2D and 3D
        try:
            n_components = min(3, n_features, len(X_sub))
            pca = PCA(n_components=n_components, random_state=42)
            pca_coords = pca.fit_transform(X_sub)
            
            projections["pca_2d"] = {
                "x": np.round(pca_coords[:, 0], 3).tolist(),
                "y": np.round(pca_coords[:, 1], 3).tolist(),
                "variance_ratio": [round(float(v) * 100, 1) for v in pca.explained_variance_ratio_[:2]]
            }
            if n_components >= 3:
                projections["pca_3d"] = {
                    "x": np.round(pca_coords[:, 0], 3).tolist(),
                    "y": np.round(pca_coords[:, 1], 3).tolist(),
                    "z": np.round(pca_coords[:, 2], 3).tolist(),
                    "variance_ratio": [round(float(v) * 100, 1) for v in pca.explained_variance_ratio_[:3]]
                }
        except Exception as e:
            projections["pca_error"] = str(e)

        # 2. t-SNE 2D
        try:
            tsne_samples = min(800, len(X_sub))
            # Subsample further if needed for instant t-SNE
            sub_idx = np.arange(tsne_samples)
            tsne = TSNE(n_components=2, perplexity=min(30, max(5, tsne_samples // 10)), random_state=42, max_iter=800)
            tsne_coords = tsne.fit_transform(X_sub[sub_idx])
            projections["tsne_2d"] = {
                "x": np.round(tsne_coords[:, 0], 3).tolist(),
                "y": np.round(tsne_coords[:, 1], 3).tolist(),
                "labels": labels_sub[sub_idx].tolist()
            }
        except Exception as e:
            projections["tsne_error"] = str(e)

        # 3. Fast Manifold / UMAP proxy (Spectral / PCA non-linear embedding)
        try:
            # We use an optimized cosine-kernel PCA projection for robust manifold mapping
            from sklearn.decomposition import KernelPCA
            kpca = KernelPCA(n_components=2, kernel='cosine', random_state=42)
            kpca_coords = kpca.fit_transform(X_sub[:min(1000, len(X_sub))])
            projections["umap_proxy_2d"] = {
                "x": np.round(kpca_coords[:, 0], 3).tolist(),
                "y": np.round(kpca_coords[:, 1], 3).tolist(),
                "labels": labels_sub[:min(1000, len(X_sub))].tolist()
            }
        except Exception:
            pass

        return projections

    @staticmethod
    def compute_elbow_and_silhouette_sweep(X: np.ndarray, k_range: range = range(2, 10)) -> Dict[str, Any]:
        """
        Runs KMeans over k_range to compute:
        1. Elbow Curve (Inertia vs K)
        2. Silhouette Score vs K
        """
        n_samples = X.shape[0]
        # Subsample if necessary for fast interactive response
        if n_samples > 1500:
            indices = np.random.RandomState(42).choice(n_samples, size=1500, replace=False)
            X_eval = X[indices]
        else:
            X_eval = X

        k_values = []
        inertias = []
        silhouette_scores = []

        for k in k_range:
            if k >= len(X_eval):
                break
            kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
            lbls = kmeans.fit_predict(X_eval)
            k_values.append(k)
            inertias.append(round(float(kmeans.inertia_), 2))
            
            try:
                sil = silhouette_score(X_eval, lbls)
                silhouette_scores.append(round(float(sil), 4))
            except Exception:
                silhouette_scores.append(0.0)

        # Find suggested optimal k (knee or max silhouette)
        best_k_idx = int(np.argmax(silhouette_scores)) if silhouette_scores else 0
        recommended_k = k_values[best_k_idx] if k_values else 3

        return {
            "k_values": k_values,
            "inertias": inertias,
            "silhouette_scores": silhouette_scores,
            "recommended_k": recommended_k
        }

    @staticmethod
    def compute_silhouette_plot_data(X: np.ndarray, labels: np.ndarray) -> Dict[str, Any]:
        """
        Computes per-sample silhouette coefficients grouped by cluster,
        formatted for rendering the classical silhouette analysis graph.
        """
        valid_mask = labels != -1
        if valid_mask.sum() < 4 or len(np.unique(labels[valid_mask])) < 2:
            return {"error": "Need at least 2 clusters with valid points for silhouette plot"}

        X_valid = X[valid_mask]
        lbls_valid = labels[valid_mask]

        if len(X_valid) > 1500:
            sub = np.random.RandomState(42).choice(len(X_valid), size=1500, replace=False)
            X_valid = X_valid[sub]
            lbls_valid = lbls_valid[sub]

        sample_sil_values = silhouette_samples(X_valid, lbls_valid)
        avg_sil = float(np.mean(sample_sil_values))

        cluster_bars = []
        for c in sorted(np.unique(lbls_valid)):
            c_values = sample_sil_values[lbls_valid == c]
            c_values.sort()
            cluster_bars.append({
                "cluster": int(c),
                "count": len(c_values),
                "values": [round(float(v), 3) for v in c_values]
            })

        return {
            "average_silhouette": round(avg_sil, 4),
            "clusters": cluster_bars
        }

    @staticmethod
    def compute_heatmaps_and_correlations(
        X: np.ndarray,
        feature_names: List[str],
        labels: np.ndarray
    ) -> Dict[str, Any]:
        """
        Computes:
        1. Feature Correlation Matrix (for top 15 features)
        2. Cluster Feature Profile Heatmap (mean feature value per cluster)
        """
        top_n = min(15, X.shape[1])
        top_features = feature_names[:top_n]
        X_top = X[:, :top_n]

        # 1. Feature Correlation Matrix
        df_top = pd.DataFrame(X_top, columns=top_features)
        corr_matrix = df_top.corr().fillna(0).round(3).values.tolist()

        # 2. Cluster Centroid / Profile Heatmap
        unique_labels = sorted([l for l in np.unique(labels) if l != -1])
        cluster_profiles = []
        for c in unique_labels:
            mean_vals = X_top[labels == c].mean(axis=0)
            cluster_profiles.append([round(float(v), 3) for v in mean_vals])

        return {
            "feature_names": top_features,
            "correlation_matrix": corr_matrix,
            "cluster_ids": unique_labels,
            "cluster_profiles": cluster_profiles
        }

    @staticmethod
    def compute_cluster_distributions(labels: np.ndarray) -> Dict[str, Any]:
        """
        Computes cluster size counts, percentages, and noise statistics.
        """
        unique, counts = np.unique(labels, return_counts=True)
        total = len(labels)
        distribution = []
        for u, c in zip(unique, counts):
            distribution.append({
                "cluster": int(u),
                "name": f"Cluster {u}" if u != -1 else "Noise / Outlier",
                "count": int(c),
                "percentage": round(float(c / total * 100), 2)
            })
        return {
            "total_samples": total,
            "distribution": distribution
        }

    @staticmethod
    def compute_dendrogram(X: np.ndarray, max_samples: int = 40) -> Dict[str, Any]:
        """
        Computes hierarchical clustering dendrogram tree coordinates for visualization.
        """
        n_samples = min(len(X), max_samples)
        X_sub = X[:n_samples]
        try:
            Z = linkage(X_sub, method='ward')
            ddata = dendrogram(Z, no_plot=True)
            return {
                "icoord": ddata['icoord'],
                "dcoord": ddata['dcoord'],
                "ivl": ddata['ivl'],
                "leaves": ddata['leaves']
            }
        except Exception as e:
            return {"error": str(e)}
