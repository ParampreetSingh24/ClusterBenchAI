import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing imports...", flush=True)
from main import ACTIVE_DATASETS, get_processed_data, ClusteringEngine, EvaluationMetrics, LeaderboardEngine

print("Active datasets:", list(ACTIVE_DATASETS.keys()), flush=True)

processed = get_processed_data("soybean")
X = processed["X"]
y = processed["y"]
print(f"Soybean preprocessed matrix shape: {X.shape}", flush=True)

subset_X = X[:80]
subset_y = y[:80] if y is not None else None

for alg in ClusteringEngine.ALGORITHMS:
    print(f"Running {alg}...", flush=True)
    params = {"n_clusters": 3}
    if alg == "dbscan":
        params = {"eps": 1.5, "min_samples": 3}
    elif alg == "gmm":
        params = {"n_components": 3, "covariance_type": "diag"}
        
    labels, meta = ClusteringEngine.run_algorithm(alg, subset_X, params)
    print(f"Done {alg} in {meta['execution_time_ms']} ms", flush=True)

print("ALL FINISHED SUCCESS!", flush=True)
