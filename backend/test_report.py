import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from reports.pdf_generator import PDFReportGenerator
from reports.csv_generator import CSVReportGenerator
from insights.ai_insights import AIInsightsEngine
from evaluation.leaderboard import LeaderboardEngine
from preprocessing.pipeline import PreprocessingPipeline
import pandas as pd

summary = {
    "num_rows": 683,
    "num_cols": 35,
    "total_missing_cells": 12,
    "detected_target": "class"
}

dummy_results = [
    {
        "algorithm": "K-MEANS",
        "algorithm_id": "kmeans",
        "composite_score": 88.5,
        "rank": 1,
        "metrics": {
            "silhouette_score": 0.452,
            "davies_bouldin_index": 0.821,
            "calinski_harabasz_score": 1420.5,
            "purity": 0.912,
            "execution_time_ms": 42.1,
            "memory_kb": 128.0,
            "n_noise_points": 0
        }
    },
    {
        "algorithm": "GMM",
        "algorithm_id": "gmm",
        "composite_score": 84.1,
        "rank": 2,
        "metrics": {
            "silhouette_score": 0.410,
            "davies_bouldin_index": 0.932,
            "calinski_harabasz_score": 1105.0,
            "purity": 0.884,
            "execution_time_ms": 68.3,
            "memory_kb": 256.0,
            "n_noise_points": 0
        }
    }
]

insights = AIInsightsEngine.generate_comprehensive_insights("Soybean Disease", summary, dummy_results)
pdf_bytes = PDFReportGenerator.generate_research_pdf("Soybean Disease", summary, dummy_results, insights)
csv_str = CSVReportGenerator.generate_benchmark_csv(dummy_results)

print(f"Generated PDF successfully, size: {len(pdf_bytes)} bytes")
print("Generated CSV successfully:\n", csv_str[:200])
