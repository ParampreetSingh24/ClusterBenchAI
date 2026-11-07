import os
import sys
import io
import uuid
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from pydantic import BaseModel
from sklearn.decomposition import PCA

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.parse_data import parse_arff
from preprocessing.pipeline import PreprocessingPipeline
from algorithms.clustering import ClusteringEngine
from evaluation.metrics import EvaluationMetrics
from evaluation.leaderboard import LeaderboardEngine
from visualization.viz_engine import VisualizationEngine
from insights.ai_insights import AIInsightsEngine
from reports.pdf_generator import PDFReportGenerator
from reports.csv_generator import CSVReportGenerator
from database.db import save_benchmark_run, get_recent_benchmark_runs

app = FastAPI(
    title="ClusterBenchAI API",
    description="Research-Grade Clustering Evaluation and Benchmarking Platform",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploaded")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory storage for active datasets & preprocessed cache
ACTIVE_DATASETS: Dict[str, pd.DataFrame] = {}
PROCESSED_CACHE: Dict[str, Dict[str, Any]] = {}
LATEST_BENCHMARK: Dict[str, Any] = {}

def load_built_in_datasets():
    # 1. Mushroom
    mush_csv = os.path.join(DATA_DIR, "mushroom.csv")
    if os.path.exists(mush_csv):
        ACTIVE_DATASETS["mushroom"] = pd.read_csv(mush_csv)
    
    # 2. Soybean
    soy_csv = os.path.join(DATA_DIR, "soybean.csv")
    if os.path.exists(soy_csv):
        ACTIVE_DATASETS["soybean"] = pd.read_csv(soy_csv)

    # 3. Synthetic Blobs
    synth_csv = os.path.join(DATA_DIR, "synthetic_blobs.csv")
    if os.path.exists(synth_csv):
        ACTIVE_DATASETS["synthetic_blobs"] = pd.read_csv(synth_csv)

load_built_in_datasets()

# Pydantic Schemas
class PreprocessingRequest(BaseModel):
    dataset_id: str
    target_col: Optional[str] = None
    missing_strategy: str = "most_frequent"
    encoding_strategy: str = "one_hot"
    scaling_method: str = "standard"
    outlier_method: str = "none"
    contamination: float = 0.05
    feature_selection: str = "none"
    pca_components: int = 10
    k_best: int = 10
    subsample_limit: Optional[int] = 2500

class RunSingleAlgorithmRequest(BaseModel):
    dataset_id: str
    cache_key: Optional[str] = None
    algorithm: str
    params: Dict[str, Any] = {}

class BenchmarkRequest(BaseModel):
    dataset_id: str
    cache_key: Optional[str] = None
    n_clusters: int = 3
    metric_weights: Optional[Dict[str, float]] = None

class ParameterSweepRequest(BaseModel):
    dataset_id: str
    cache_key: Optional[str] = None
    k_min: int = 2
    k_max: int = 10

# API Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ClusterBenchAI API", "version": "1.0.0"}

@app.get("/api/datasets")
def list_datasets():
    datasets = [
        {
            "id": "mushroom",
            "name": "Mushroom Classification Database (UCI)",
            "description": "8,124 instances of gilled mushrooms described by 22 morphological categorical attributes. Ground truth denotes edible (e) vs. poisonous (p).",
            "num_rows": len(ACTIVE_DATASETS["mushroom"]) if "mushroom" in ACTIVE_DATASETS else 8124,
            "num_cols": len(ACTIVE_DATASETS["mushroom"].columns) if "mushroom" in ACTIVE_DATASETS else 23,
            "is_builtin": True,
            "domain": "Biological / Ecology",
            "default_k": 2
        },
        {
            "id": "soybean",
            "name": "Large Soybean Disease Database (UCI)",
            "description": "683 instances of soybean pathologies described by 35 environmental and physiological characteristics across 19 diagnosis classes.",
            "num_rows": len(ACTIVE_DATASETS["soybean"]) if "soybean" in ACTIVE_DATASETS else 683,
            "num_cols": len(ACTIVE_DATASETS["soybean"].columns) if "soybean" in ACTIVE_DATASETS else 36,
            "is_builtin": True,
            "domain": "Agronomy / Plant Pathology",
            "default_k": 19
        },
        {
            "id": "synthetic_blobs",
            "name": "Synthetic Multi-Gaussian Cluster Benchmark",
            "description": "500 samples across 6 continuous features with 4 distinct Gaussian clusters, calibrated for instant high-speed verification.",
            "num_rows": len(ACTIVE_DATASETS.get("synthetic_blobs", [])) if "synthetic_blobs" in ACTIVE_DATASETS else 500,
            "num_cols": len(ACTIVE_DATASETS.get("synthetic_blobs", pd.DataFrame()).columns) if "synthetic_blobs" in ACTIVE_DATASETS else 7,
            "is_builtin": True,
            "domain": "Synthetic Simulation",
            "default_k": 4
        }
    ]

    # Add custom uploaded datasets
    for k, df in ACTIVE_DATASETS.items():
        if k not in ["mushroom", "soybean", "synthetic_blobs"]:
            datasets.append({
                "id": k,
                "name": k.replace("_", " ").title(),
                "description": f"Custom uploaded dataset with {len(df)} rows and {len(df.columns)} columns.",
                "num_rows": len(df),
                "num_cols": len(df.columns),
                "is_builtin": False,
                "domain": "User Uploaded",
                "default_k": 3
            })

    return {"datasets": datasets}

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    dataset_id = f"custom_{uuid.uuid4().hex[:8]}"
    save_path = os.path.join(UPLOAD_DIR, f"{dataset_id}{ext}")
    
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    try:
        if ext == ".csv":
            df = pd.read_csv(save_path)
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(save_path)
        elif ext == ".arff":
            df = parse_arff(save_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Please upload CSV, Excel, or ARFF.")

        ACTIVE_DATASETS[dataset_id] = df
        return {
            "status": "success",
            "dataset_id": dataset_id,
            "name": filename,
            "num_rows": len(df),
            "num_cols": len(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

@app.get("/api/datasets/{dataset_id}/preview")
def preview_dataset(dataset_id: str):
    if dataset_id not in ACTIVE_DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = ACTIVE_DATASETS[dataset_id]
    pipeline = PreprocessingPipeline()
    summary = pipeline.analyze_dataset(df)
    
    # First 50 rows for preview
    preview_df = df.head(50).fillna("NaN")
    
    return {
        "dataset_id": dataset_id,
        "summary": summary,
        "preview_data": preview_df.to_dict(orient="records"),
        "columns": list(df.columns)
    }

@app.post("/api/preprocess")
def preprocess_data(req: PreprocessingRequest):
    if req.dataset_id not in ACTIVE_DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = ACTIVE_DATASETS[req.dataset_id]
    
    # Subsample if user requested limit for very large datasets
    if req.subsample_limit and len(df) > req.subsample_limit:
        df_to_process = df.sample(n=req.subsample_limit, random_state=42)
    else:
        df_to_process = df

    config = req.dict()
    pipeline = PreprocessingPipeline(config=config)
    
    X, y, feature_names, report = pipeline.process(df_to_process, target_col=req.target_col)
    
    cache_key = f"{req.dataset_id}_{uuid.uuid4().hex[:6]}"
    PROCESSED_CACHE[cache_key] = {
        "X": X,
        "y": y,
        "feature_names": feature_names,
        "dataset_id": req.dataset_id,
        "config": config,
        "report": report
    }

    return {
        "status": "success",
        "cache_key": cache_key,
        "report": report,
        "processed_shape": list(X.shape),
        "has_ground_truth": y is not None
    }

def get_processed_data(dataset_id: str, cache_key: Optional[str] = None):
    if cache_key and cache_key in PROCESSED_CACHE:
        return PROCESSED_CACHE[cache_key]
    
    # Default preprocess if not explicitly preprocessed
    if dataset_id not in ACTIVE_DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = ACTIVE_DATASETS[dataset_id]
    # For Mushroom, default limit to 2500 for lightning responsiveness
    if len(df) > 2500:
        df = df.sample(n=2500, random_state=42)
    
    pipeline = PreprocessingPipeline({
        "missing_strategy": "most_frequent",
        "encoding_strategy": "one_hot",
        "scaling_method": "standard"
    })
    X, y, feature_names, report = pipeline.process(df)
    key = f"{dataset_id}_default"
    PROCESSED_CACHE[key] = {
        "X": X,
        "y": y,
        "feature_names": feature_names,
        "dataset_id": dataset_id,
        "config": {},
        "report": report
    }
    return PROCESSED_CACHE[key]

@app.post("/api/cluster/single")
def run_single_cluster(req: RunSingleAlgorithmRequest):
    cached = get_processed_data(req.dataset_id, req.cache_key)
    X = cached["X"]
    y = cached["y"]
    feature_names = cached["feature_names"]

    labels, meta = ClusteringEngine.run_algorithm(req.algorithm, X, req.params)
    
    metrics = EvaluationMetrics.compute_all_metrics(
        X=X,
        labels=labels,
        y_true=y,
        cluster_centers=np.array(meta["cluster_centers"]) if meta.get("cluster_centers") else None,
        exec_time_ms=meta["execution_time_ms"],
        memory_kb=meta["memory_kb"]
    )

    projections = VisualizationEngine.compute_projections(X, labels, y)
    cluster_dist = VisualizationEngine.compute_cluster_distributions(labels)

    return {
        "algorithm": req.algorithm,
        "labels": labels.tolist(),
        "metrics": metrics,
        "meta": meta,
        "projections": projections,
        "distribution": cluster_dist
    }

@app.post("/api/cluster/benchmark")
def run_benchmark(req: BenchmarkRequest):
    cached = get_processed_data(req.dataset_id, req.cache_key)
    X = cached["X"]
    y = cached["y"]
    feature_names = cached["feature_names"]
    dataset_id = cached["dataset_id"]

    results = []
    algorithms = ClusteringEngine.ALGORITHMS

    # Subsample for benchmark if huge to guarantee sub-5s execution across all 9 algorithms
    if len(X) > 1500:
        idx = np.random.RandomState(42).choice(len(X), size=1500, replace=False)
        X_bench = X[idx]
        y_bench = y[idx] if y is not None else None
    else:
        X_bench = X
        y_bench = y

    for alg in algorithms:
        params = {"n_clusters": req.n_clusters}
        if alg == "dbscan":
            params = {"eps": 1.2, "min_samples": 5}
        elif alg == "gmm":
            params = {"n_components": req.n_clusters, "covariance_type": "diag"}

        try:
            labels, meta = ClusteringEngine.run_algorithm(alg, X_bench, params)
            metrics = EvaluationMetrics.compute_all_metrics(
                X=X_bench,
                labels=labels,
                y_true=y_bench,
                exec_time_ms=meta["execution_time_ms"],
                memory_kb=meta["memory_kb"]
            )
            results.append({
                "algorithm": alg.upper(),
                "algorithm_id": alg,
                "metrics": metrics,
                "meta": meta
            })
        except Exception as e:
            results.append({
                "algorithm": alg.upper(),
                "algorithm_id": alg,
                "error": str(e),
                "metrics": {
                    "silhouette_score": None,
                    "davies_bouldin_index": None,
                    "calinski_harabasz_score": None,
                    "inertia": None,
                    "purity": None,
                    "execution_time_ms": 0,
                    "memory_kb": 0
                }
            })

    ranked = LeaderboardEngine.rank_algorithms(results, req.metric_weights)
    
    # Generate Automated Academic Insights
    pipeline = PreprocessingPipeline()
    raw_df = ACTIVE_DATASETS.get(dataset_id, pd.DataFrame(X_bench))
    summary = pipeline.analyze_dataset(raw_df)
    insights = AIInsightsEngine.generate_comprehensive_insights(dataset_id.title(), summary, ranked)

    # Cache latest benchmark for export
    LATEST_BENCHMARK["data"] = {
        "dataset_name": dataset_id.title(),
        "dataset_summary": summary,
        "ranked_results": ranked,
        "insights": insights,
        "raw_df": raw_df,
        "X": X_bench,
        "feature_names": feature_names
    }

    # Save to SQLite database
    best_alg = ranked[0]["algorithm"] if ranked else "None"
    save_benchmark_run(
        run_id=f"run_{uuid.uuid4().hex[:8]}",
        dataset_id=dataset_id,
        preprocessing_config=cached.get("config", {}),
        best_algorithm=best_alg,
        results_summary={"winner": best_alg, "winner_score": ranked[0].get("composite_score", 0)}
    )

    return {
        "status": "success",
        "dataset_id": dataset_id,
        "ranked_results": ranked,
        "insights": insights,
        "sample_count": len(X_bench),
        "feature_count": X_bench.shape[1]
    }

@app.post("/api/cluster/parameter-sweep")
def parameter_sweep(req: ParameterSweepRequest):
    cached = get_processed_data(req.dataset_id, req.cache_key)
    X = cached["X"]
    sweep_data = VisualizationEngine.compute_elbow_and_silhouette_sweep(
        X, k_range=range(req.k_min, req.k_max + 1)
    )
    return sweep_data

@app.post("/api/cluster/visualizations")
def get_visualizations(req: RunSingleAlgorithmRequest):
    cached = get_processed_data(req.dataset_id, req.cache_key)
    X = cached["X"]
    y = cached["y"]
    feature_names = cached["feature_names"]

    labels, meta = ClusteringEngine.run_algorithm(req.algorithm, X, req.params)
    projections = VisualizationEngine.compute_projections(X, labels, y)
    silhouette_plot = VisualizationEngine.compute_silhouette_plot_data(X, labels)
    heatmaps = VisualizationEngine.compute_heatmaps_and_correlations(X, feature_names, labels)
    dendrogram_data = VisualizationEngine.compute_dendrogram(X)

    return {
        "algorithm": req.algorithm,
        "projections": projections,
        "silhouette_plot": silhouette_plot,
        "heatmaps": heatmaps,
        "dendrogram": dendrogram_data
    }

@app.get("/api/reports/pdf")
def download_pdf_report():
    if "data" not in LATEST_BENCHMARK:
        raise HTTPException(status_code=400, detail="No benchmark run found. Please run benchmark first.")
    
    b_data = LATEST_BENCHMARK["data"]
    pdf_bytes = PDFReportGenerator.generate_research_pdf(
        dataset_name=b_data["dataset_name"],
        dataset_summary=b_data["dataset_summary"],
        ranked_results=b_data["ranked_results"],
        insights=b_data["insights"]
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ClusterBenchAI_{b_data['dataset_name']}_Report.pdf"}
    )

@app.get("/api/reports/csv")
def download_csv_report():
    if "data" not in LATEST_BENCHMARK:
        raise HTTPException(status_code=400, detail="No benchmark run found. Please run benchmark first.")
    
    b_data = LATEST_BENCHMARK["data"]
    csv_str = CSVReportGenerator.generate_benchmark_csv(b_data["ranked_results"])
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ClusterBenchAI_{b_data['dataset_name']}_Benchmark.csv"}
    )

@app.get("/api/reports/export-clusters")
def download_clustered_dataset():
    if "data" not in LATEST_BENCHMARK:
        raise HTTPException(status_code=400, detail="No benchmark run found. Please run benchmark first.")
    
    b_data = LATEST_BENCHMARK["data"]
    raw_df = b_data["raw_df"]
    # Run the winning algorithm to obtain assigned labels
    winner_id = b_data["ranked_results"][0]["algorithm_id"]
    labels, _ = ClusteringEngine.run_algorithm(winner_id, b_data["X"])
    
    # Compute PCA 2D for convenient export
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(b_data["X"])
    
    csv_str = CSVReportGenerator.generate_clustered_dataset_csv(
        df_raw=raw_df.iloc[:len(labels)],
        labels=labels.tolist(),
        pca_x=coords[:, 0].tolist(),
        pca_y=coords[:, 1].tolist()
    )
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ClusterBenchAI_{b_data['dataset_name']}_Clustered.csv"}
    )

# Serve frontend static assets if built
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "ClusterBenchAI API is active."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
