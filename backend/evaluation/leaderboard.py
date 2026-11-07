import numpy as np
from typing import Dict, Any, List

class LeaderboardEngine:
    @staticmethod
    def rank_algorithms(
        benchmark_results: List[Dict[str, Any]],
        weights: Dict[str, float] = None
    ) -> List[Dict[str, Any]]:
        """
        Ranks benchmarked algorithms using Multi-Criteria Decision Making (MCDM).
        Computes normalized composite scores (0 to 100) and assigns badges.
        """
        if not benchmark_results:
            return []

        # Default weights
        default_weights = {
            "silhouette": 0.30,
            "davies_bouldin": 0.20,
            "calinski_harabasz": 0.15,
            "purity": 0.20,
            "time_efficiency": 0.15
        }
        w = weights or default_weights

        # Extract metric arrays
        sil_vals = [r.get("metrics", {}).get("silhouette_score") for r in benchmark_results]
        db_vals = [r.get("metrics", {}).get("davies_bouldin_index") for r in benchmark_results]
        ch_vals = [r.get("metrics", {}).get("calinski_harabasz_score") for r in benchmark_results]
        pur_vals = [r.get("metrics", {}).get("purity") for r in benchmark_results]
        time_vals = [r.get("metrics", {}).get("execution_time_ms") for r in benchmark_results]

        def normalize_benefit(vals):
            valid = [v for v in vals if v is not None]
            if not valid or max(valid) == min(valid):
                return [0.5 if v is not None else 0.0 for v in vals]
            v_min, v_max = min(valid), max(valid)
            return [(v - v_min) / (v_max - v_min) if v is not None else 0.0 for v in vals]

        def normalize_cost(vals):
            valid = [v for v in vals if v is not None]
            if not valid or max(valid) == min(valid):
                return [0.5 if v is not None else 0.0 for v in vals]
            v_min, v_max = min(valid), max(valid)
            # Inverted: lower is better
            return [(v_max - v) / (v_max - v_min) if v is not None else 0.0 for v in vals]

        norm_sil = normalize_benefit(sil_vals)
        norm_db = normalize_cost(db_vals)
        norm_ch = normalize_benefit(ch_vals)
        norm_pur = normalize_benefit(pur_vals)
        norm_time = normalize_cost(time_vals)

        ranked = []
        for i, res in enumerate(benchmark_results):
            score = (
                norm_sil[i] * w["silhouette"] +
                norm_db[i] * w["davies_bouldin"] +
                norm_ch[i] * w["calinski_harabasz"] +
                norm_pur[i] * w["purity"] +
                norm_time[i] * w["time_efficiency"]
            ) * 100.0

            item = dict(res)
            item["composite_score"] = round(float(score), 2)
            ranked.append(item)

        # Sort descending by composite score
        ranked.sort(key=lambda x: x["composite_score"], reverse=True)

        # Assign ranks and badges
        for rank_idx, item in enumerate(ranked):
            item["rank"] = rank_idx + 1
            badges = []
            if rank_idx == 0:
                badges.append("Overall Champion 🏆")
            elif rank_idx == 1:
                badges.append("Runner Up 🥈")
            elif rank_idx == 2:
                badges.append("Third Place 🥉")

            # Check specific metric superlatives
            if item.get("metrics", {}).get("execution_time_ms") == min([r.get("metrics", {}).get("execution_time_ms", 999999) for r in ranked if r.get("metrics", {}).get("execution_time_ms") is not None]):
                badges.append("Speed Demon ⚡")
            
            sil = item.get("metrics", {}).get("silhouette_score")
            max_sil = max([r.get("metrics", {}).get("silhouette_score", -1) for r in ranked if r.get("metrics", {}).get("silhouette_score") is not None] or [-1])
            if sil is not None and sil == max_sil and sil > 0:
                badges.append("Max Separation 📐")

            pur = item.get("metrics", {}).get("purity")
            max_pur = max([r.get("metrics", {}).get("purity", 0) for r in ranked if r.get("metrics", {}).get("purity") is not None] or [0])
            if pur is not None and pur == max_pur and pur > 0.5:
                badges.append("High Purity 🎯")

            item["badges"] = badges

        return ranked
