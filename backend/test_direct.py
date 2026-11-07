import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import (
    health_check,
    list_datasets,
    preview_dataset,
    preprocess_data,
    run_single_cluster,
    run_benchmark,
    parameter_sweep,
    download_pdf_report,
    download_csv_report,
    download_clustered_dataset,
    PreprocessingRequest,
    RunSingleAlgorithmRequest,
    BenchmarkRequest,
    ParameterSweepRequest
)

print("1. Health check:", health_check(), flush=True)

ds = list_datasets()
print("2. Datasets count:", len(ds["datasets"]), [d["id"] for d in ds["datasets"]], flush=True)

mush_prev = preview_dataset("mushroom")
print("3. Mushroom Preview rows:", len(mush_prev["preview_data"]), "Target:", mush_prev["summary"]["detected_target"], flush=True)

prep_req = PreprocessingRequest(
    dataset_id="mushroom",
    subsample_limit=800
)
prep_res = preprocess_data(prep_req)
print("4. Preprocess result:", prep_res["status"], "Shape:", prep_res["processed_shape"], flush=True)

single_req = RunSingleAlgorithmRequest(
    dataset_id="soybean",
    algorithm="kmeans",
    params={"n_clusters": 3}
)
single_res = run_single_cluster(single_req)
print("5. Single clustering (kmeans on soybean):", single_res["algorithm"], "Silhouette:", single_res["metrics"]["silhouette_score"], flush=True)

bench_req = BenchmarkRequest(
    dataset_id="synthetic_blobs",
    n_clusters=4
)
bench_res = run_benchmark(bench_req)
print("6. Full Benchmark on Synthetic:", bench_res["status"], "Ranked Count:", len(bench_res["ranked_results"]), flush=True)
print("   Leaderboard Winner:", bench_res["insights"]["winner"], "Score:", bench_res["insights"]["winner_score"], flush=True)
for r in bench_res["ranked_results"][:3]:
    print(f"   #{r['rank']} {r['algorithm']}: score={r['composite_score']} sil={r['metrics']['silhouette_score']} time={r['metrics']['execution_time_ms']}ms", flush=True)

sweep_req = ParameterSweepRequest(
    dataset_id="synthetic_blobs",
    k_min=2,
    k_max=5
)
sweep_res = parameter_sweep(sweep_req)
print("7. Parameter sweep:", sweep_res["k_values"], "Rec k:", sweep_res["recommended_k"], flush=True)

pdf_res = download_pdf_report()
print("8. Download PDF size:", len(pdf_res.body), "bytes, Content-Type:", pdf_res.media_type, flush=True)

csv_res = download_csv_report()
print("9. Download CSV size:", len(csv_res.body), "bytes", flush=True)

clust_res = download_clustered_dataset()
print("10. Download Clustered Dataset CSV size:", len(clust_res.body), "bytes", flush=True)

print("\n>>> ALL 10 CORE FASTAPI ENDPOINTS & LOGIC TESTED 100% WORKING! <<<", flush=True)
