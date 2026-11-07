import numpy as np
import time
import tracemalloc
from typing import Dict, Any, Tuple, Optional
from sklearn.cluster import (
    KMeans,
    DBSCAN,
    AgglomerativeClustering,
    SpectralClustering,
    MeanShift,
    estimate_bandwidth
)
from sklearn.mixture import GaussianMixture
from sklearn.metrics import pairwise_distances
from scipy.cluster.hierarchy import linkage, fcluster, dendrogram

class FastKMedoids:
    """
    Partitioning Around Medoids (PAM) algorithm.
    Guarantees cluster centers are actual dataset instances (medoids),
    making it robust to outliers and highly interpretable.
    """
    def __init__(self, n_clusters: int = 3, max_iter: int = 100, random_state: int = 42, metric: str = 'euclidean'):
        self.n_clusters = n_clusters
        self.max_iter = max_iter
        self.random_state = random_state
        self.metric = metric
        self.medoid_indices_ = None
        self.cluster_centers_ = None
        self.labels_ = None
        self.inertia_ = 0.0

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        n_samples = X.shape[0]
        k = min(self.n_clusters, n_samples)
        rng = np.random.RandomState(self.random_state)
        
        # Precompute pairwise distance matrix
        D = pairwise_distances(X, metric=self.metric)
        
        # Initialize medoids randomly or greedy
        medoids = rng.choice(n_samples, size=k, replace=False)
        
        for iteration in range(self.max_iter):
            # Assign each point to closest medoid
            dist_to_medoids = D[:, medoids]
            labels = np.argmin(dist_to_medoids, axis=1)
            
            new_medoids = np.copy(medoids)
            # Update medoid for each cluster
            for c in range(k):
                members = np.where(labels == c)[0]
                if len(members) == 0:
                    continue
                # Submatrix of distances among members
                sub_D = D[np.ix_(members, members)]
                # Point with minimum sum of distances to other members
                costs = sub_D.sum(axis=1)
                best_member_idx = members[np.argmin(costs)]
                new_medoids[c] = best_member_idx
                
            if np.array_equal(np.sort(medoids), np.sort(new_medoids)):
                break
            medoids = new_medoids

        # Final assignments
        dist_to_medoids = D[:, medoids]
        self.labels_ = np.argmin(dist_to_medoids, axis=1)
        self.medoid_indices_ = medoids
        self.cluster_centers_ = X[medoids]
        self.inertia_ = float(np.sum(np.min(dist_to_medoids, axis=1)**2))
        return self.labels_


class FastFuzzyCMeans:
    """
    Fuzzy C-Means (FCM) soft-clustering algorithm.
    Each sample has a membership degree across all clusters summing to 1.
    """
    def __init__(self, n_clusters: int = 3, m: float = 2.0, max_iter: int = 150, tol: float = 1e-4, random_state: int = 42):
        self.n_clusters = n_clusters
        self.m = m # Fuzziness parameter (m > 1)
        self.max_iter = max_iter
        self.tol = tol
        self.random_state = random_state
        self.cluster_centers_ = None
        self.u_ = None # Membership matrix (n_samples, n_clusters)
        self.labels_ = None

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        n_samples, n_features = X.shape
        c = min(self.n_clusters, n_samples)
        rng = np.random.RandomState(self.random_state)
        
        # Initialize random membership matrix
        U = rng.rand(n_samples, c)
        U = U / np.sum(U, axis=1, keepdims=True)
        
        for iteration in range(self.max_iter):
            # Compute cluster centers
            Um = U ** self.m
            centers = np.dot(Um.T, X) / (np.sum(Um, axis=0)[:, np.newaxis] + 1e-9)
            
            # Compute Euclidean distances from all points to all centers
            # shape: (n_samples, c)
            dists = np.zeros((n_samples, c))
            for k in range(c):
                dists[:, k] = np.linalg.norm(X - centers[k], axis=1)
            
            # Avoid division by zero
            dists = np.fmax(dists, 1e-9)
            
            # Update membership matrix
            inv_dists = dists ** (-2.0 / (self.m - 1.0))
            U_new = inv_dists / np.sum(inv_dists, axis=1, keepdims=True)
            
            if np.linalg.norm(U_new - U) < self.tol:
                U = U_new
                break
            U = U_new

        self.cluster_centers_ = centers
        self.u_ = U
        self.labels_ = np.argmax(U, axis=1)
        return self.labels_


class ClusteringEngine:
    """
    Orchestrates execution of all 9 clustering algorithms with hyperparameter handling,
    execution timing, and peak memory profiling.
    """
    ALGORITHMS = [
        "kmeans",
        "kmedoids",
        "dbscan",
        "hierarchical",
        "agglomerative",
        "spectral",
        "meanshift",
        "gmm",
        "fuzzy_cmeans"
    ]

    @staticmethod
    def run_algorithm(
        name: str,
        X: np.ndarray,
        params: Optional[Dict[str, Any]] = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Runs the specified algorithm on feature matrix X.
        Returns:
            labels: 1D np.ndarray
            meta: Dict containing centers, execution_time_ms, memory_kb, params, extra
        """
        params = params or {}
        n_samples = X.shape[0]
        name = name.lower()

        # Profiling start
        tracemalloc.start()
        start_time = time.perf_counter()

        cluster_centers = None
        extra = {}

        if name == "kmeans":
            n_clusters = int(params.get("n_clusters", 3))
            init = params.get("init", "k-means++")
            max_iter = int(params.get("max_iter", 300))
            model = KMeans(n_clusters=n_clusters, init=init, max_iter=max_iter, random_state=42, n_init='auto')
            labels = model.fit_predict(X)
            cluster_centers = model.cluster_centers_
            extra["inertia"] = float(model.inertia_)

        elif name == "kmedoids":
            n_clusters = int(params.get("n_clusters", 3))
            metric = params.get("metric", "euclidean")
            model = FastKMedoids(n_clusters=n_clusters, metric=metric, random_state=42)
            labels = model.fit_predict(X)
            cluster_centers = model.cluster_centers_
            extra["medoid_indices"] = model.medoid_indices_.tolist()
            extra["inertia"] = model.inertia_

        elif name == "dbscan":
            eps = float(params.get("eps", 0.5))
            min_samples = int(params.get("min_samples", 5))
            metric = params.get("metric", "euclidean")
            model = DBSCAN(eps=eps, min_samples=min_samples, metric=metric)
            labels = model.fit_predict(X)
            # Compute pseudo-centroids for clusters (excluding noise -1)
            unique_lbls = [l for l in np.unique(labels) if l != -1]
            if unique_lbls:
                cluster_centers = np.array([X[labels == l].mean(axis=0) for l in unique_lbls])
            extra["noise_samples"] = int(np.sum(labels == -1))

        elif name == "hierarchical":
            n_clusters = int(params.get("n_clusters", 3))
            linkage_method = params.get("linkage", "ward")
            # If feature space isn't Euclidean, ward cannot be used
            Z = linkage(X, method=linkage_method)
            labels = fcluster(Z, t=n_clusters, criterion='maxclust') - 1 # 0-indexed
            # Compute centers
            unique_lbls = np.unique(labels)
            cluster_centers = np.array([X[labels == l].mean(axis=0) for l in unique_lbls])
            # Sample linkage for dendrogram visualization (last 30 merges)
            extra["dendrogram_leaves"] = min(30, n_samples)

        elif name == "agglomerative":
            n_clusters = int(params.get("n_clusters", 3))
            linkage_method = params.get("linkage", "ward") # ward, complete, average, single
            model = AgglomerativeClustering(n_clusters=n_clusters, linkage=linkage_method)
            labels = model.fit_predict(X)
            unique_lbls = np.unique(labels)
            cluster_centers = np.array([X[labels == l].mean(axis=0) for l in unique_lbls])

        elif name == "spectral":
            n_clusters = int(params.get("n_clusters", 3))
            affinity = params.get("affinity", "nearest_neighbors")
            n_neighbors = min(10, max(2, n_samples - 1))
            try:
                model = SpectralClustering(
                    n_clusters=n_clusters,
                    affinity=affinity,
                    n_neighbors=n_neighbors,
                    random_state=42,
                    assign_labels='kmeans'
                )
                labels = model.fit_predict(X)
            except Exception:
                # Fallback to rbf if nearest_neighbors encounters disconnected components
                model = SpectralClustering(
                    n_clusters=n_clusters,
                    affinity='rbf',
                    gamma=0.1,
                    random_state=42,
                    assign_labels='kmeans'
                )
                labels = model.fit_predict(X)
            unique_lbls = np.unique(labels)
            cluster_centers = np.array([X[labels == l].mean(axis=0) for l in unique_lbls])

        elif name == "meanshift":
            bandwidth = params.get("bandwidth", None)
            if bandwidth is not None and float(bandwidth) > 0:
                bw = float(bandwidth)
            else:
                try:
                    bw = estimate_bandwidth(X, quantile=0.2, n_samples=min(500, n_samples), random_state=42)
                    if bw is None or bw <= 0:
                        bw = 1.0
                except Exception:
                    bw = 1.0
            model = MeanShift(bandwidth=bw, bin_seeding=True)
            labels = model.fit_predict(X)
            cluster_centers = model.cluster_centers_
            extra["bandwidth"] = float(bw)

        elif name == "gmm":
            n_components = int(params.get("n_clusters", params.get("n_components", 3)))
            cov_type = params.get("covariance_type", "full") # full, tied, diag, spherical
            model = GaussianMixture(n_components=n_components, covariance_type=cov_type, random_state=42)
            labels = model.fit_predict(X)
            cluster_centers = model.means_
            extra["bic"] = float(model.bic(X))
            extra["aic"] = float(model.aic(X))

        elif name == "fuzzy_cmeans":
            n_clusters = int(params.get("n_clusters", 3))
            m = float(params.get("fuzziness", 2.0))
            model = FastFuzzyCMeans(n_clusters=n_clusters, m=m, random_state=42)
            labels = model.fit_predict(X)
            cluster_centers = model.cluster_centers_

        else:
            raise ValueError(f"Unknown clustering algorithm: {name}")

        # Profiling end
        end_time = time.perf_counter()
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        execution_time_ms = round((end_time - start_time) * 1000.0, 2)
        memory_kb = round(peak / 1024.0, 2)

        meta = {
            "algorithm": name,
            "params": params,
            "execution_time_ms": execution_time_ms,
            "memory_kb": memory_kb,
            "n_clusters": int(len(np.unique(labels[labels != -1]))),
            "cluster_centers": cluster_centers.tolist() if cluster_centers is not None else None,
            "extra": extra
        }

        return labels, meta
