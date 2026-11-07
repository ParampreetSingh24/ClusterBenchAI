from typing import Dict, Any, List

class AIInsightsEngine:
    @staticmethod
    def get_algorithm_complexity_matrix() -> List[Dict[str, Any]]:
        """
        Returns theoretical computational complexity and characteristics for all 9 algorithms.
        """
        return [
            {
                "algorithm": "K-Means",
                "paradigm": "Partitional / Centroid-Based",
                "time_complexity": "O(n · k · d · i)",
                "space_complexity": "O((n + k) · d)",
                "scalability": "Excellent (Linear with n)",
                "shape_assumption": "Spherical / Convex",
                "handles_noise": "Poor (Pulls centroids)",
                "hyperparameters": "n_clusters (k)"
            },
            {
                "algorithm": "K-Medoids (PAM)",
                "paradigm": "Partitional / Exemplar-Based",
                "time_complexity": "O(k · (n - k)² · i)",
                "space_complexity": "O(n² + n · d)",
                "scalability": "Moderate (Quadratic distance matrix)",
                "shape_assumption": "Spherical / Arbitrary metrics",
                "handles_noise": "Very High (Medoids are robust)",
                "hyperparameters": "n_clusters (k), metric"
            },
            {
                "algorithm": "DBSCAN",
                "paradigm": "Density-Based",
                "time_complexity": "O(n · log n) to O(n²)",
                "space_complexity": "O(n · d)",
                "scalability": "High with spatial indexing",
                "shape_assumption": "Arbitrary non-convex shapes",
                "handles_noise": "Superior (Explicit -1 noise label)",
                "hyperparameters": "eps, min_samples"
            },
            {
                "algorithm": "Hierarchical Clustering",
                "paradigm": "Agglomerative / Tree-Based",
                "time_complexity": "O(n² · log n) to O(n³)",
                "space_complexity": "O(n²)",
                "scalability": "Low to Moderate (Memory bounded)",
                "shape_assumption": "Flexible via Linkage (Ward/Complete)",
                "handles_noise": "Moderate (Single noise creates lone branches)",
                "hyperparameters": "linkage, distance_threshold"
            },
            {
                "algorithm": "Agglomerative Clustering",
                "paradigm": "Hierarchical Agglomeration",
                "time_complexity": "O(n² · log n)",
                "space_complexity": "O(n²)",
                "scalability": "Moderate (Pairwise distance matrix)",
                "shape_assumption": "Linkage dependent",
                "handles_noise": "Moderate",
                "hyperparameters": "n_clusters, linkage"
            },
            {
                "algorithm": "Spectral Clustering",
                "paradigm": "Graph-Theoretic / Laplacian Cut",
                "time_complexity": "O(n³)",
                "space_complexity": "O(n²)",
                "scalability": "Low (Eigendecomposition bottleneck)",
                "shape_assumption": "Complex manifolds / Non-linear",
                "handles_noise": "Moderate",
                "hyperparameters": "n_clusters, affinity, gamma"
            },
            {
                "algorithm": "Mean Shift",
                "paradigm": "Non-Parametric / Density Gradient",
                "time_complexity": "O(n² · i)",
                "space_complexity": "O(n · d)",
                "scalability": "Moderate (Kernel window evaluations)",
                "shape_assumption": "Arbitrary multimodal modes",
                "handles_noise": "High (Outliers isolated into small modes)",
                "hyperparameters": "bandwidth"
            },
            {
                "algorithm": "Gaussian Mixture Models (GMM)",
                "paradigm": "Distribution-Based / Probabilistic",
                "time_complexity": "O(n · d³ · i)",
                "space_complexity": "O(k · d² + n · k)",
                "scalability": "High with diagonal covariance",
                "shape_assumption": "Ellipsoidal (Full covariance matrix)",
                "handles_noise": "Moderate (Captured via covariance spread)",
                "hyperparameters": "n_components, covariance_type"
            },
            {
                "algorithm": "Fuzzy C-Means (FCM)",
                "paradigm": "Soft / Fuzzy Partitioning",
                "time_complexity": "O(n · c · d · i)",
                "space_complexity": "O(n · c + c · d)",
                "scalability": "High (Linear with n)",
                "shape_assumption": "Spherical / Hyper-elliptical",
                "handles_noise": "High (Boundary points get fractional weights)",
                "hyperparameters": "n_clusters (c), fuzziness (m)"
            }
        ]

    @staticmethod
    def generate_comprehensive_insights(
        dataset_name: str,
        dataset_summary: Dict[str, Any],
        ranked_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Produces detailed automated academic insights explaining:
        - The winning algorithm and mathematical justification
        - Strengths and weaknesses across all 9 algorithms
        - Why the winner triumphed over alternatives
        - Dataset topology diagnosis
        - Comprehensive benchmark summary sections
        """
        if not ranked_results:
            return {"error": "No benchmark results available to generate insights."}

        winner = ranked_results[0]
        winner_name = winner.get("algorithm", "Unknown").upper()
        winner_metrics = winner.get("metrics", {})
        winner_score = winner.get("composite_score", 0.0)

        num_rows = dataset_summary.get("num_rows", 0)
        num_cols = dataset_summary.get("num_cols", 0)
        has_gt = dataset_summary.get("detected_target") is not None

        # Topology diagnosis
        topology_notes = []
        if num_cols > 20:
            topology_notes.append(f"High-dimensional feature space ({num_cols} dimensions) introduces the curse of dimensionality, where Euclidean distances concentrate.")
        else:
            topology_notes.append(f"Compact dimensional representation ({num_cols} features) enables sharp spatial separation.")

        if "mushroom" in dataset_name.lower():
            topology_notes.append("The Mushroom dataset exhibits discrete categorical topology representing morphological spore, stalk, and cap traits with clean latent bi-modal partitioning (edible vs. poisonous).")
        elif "soybean" in dataset_name.lower():
            topology_notes.append("The Soybean dataset possesses severe sparsity with 19 distinct pathology classes, requiring algorithms capable of capturing fine-grained multi-class sub-clusters.")
        else:
            topology_notes.append(f"Custom dataset comprising {num_rows} instances across {num_cols} attributes.")

        # Why the winner won
        winner_key = winner.get("algorithm", "").lower()
        if "kmeans" in winner_key or "kmedoids" in winner_key:
            why_winner = (
                f"{winner_name} achieved the top rank (composite score: {winner_score:.1f}/100) because "
                f"the encoded geometric space forms well-defined hyper-spherical clusters. By minimizing within-cluster "
                f"variance (inertia: {winner_metrics.get('inertia', 'N/A')}), it achieved an optimal balance between high silhouette separation "
                f"({winner_metrics.get('silhouette_score', 'N/A')}) and minimal execution overhead ({winner_metrics.get('execution_time_ms', 'N/A')} ms)."
            )
        elif "gmm" in winner_key:
            why_winner = (
                f"{winner_name} outperformed other models due to its flexible covariance modeling (EM algorithm). "
                f"Rather than enforcing rigid spherical boundaries, GMM captured unequal variances and feature correlations "
                f"across dimensions, obtaining a Davies-Bouldin index of {winner_metrics.get('davies_bouldin_index', 'N/A')}."
            )
        elif "dbscan" in winner_key:
            why_winner = (
                f"{winner_name} proved superior due to its density-connected paradigm, effectively isolating boundary noise "
                f"({winner_metrics.get('n_noise_points', 0)} samples flagged as noise) without imposing artificial cluster counts."
            )
        elif "hierarchical" in winner_key or "agglomerative" in winner_key:
            why_winner = (
                f"{winner_name} attained the highest benchmark rating by iteratively fusing sub-clusters via minimum-variance "
                f"linkage, preventing premature convergence to local minima that occasionally afflicts iterative partitional algorithms."
            )
        elif "fuzzy" in winner_key:
            why_winner = (
                f"{winner_name} excelled by allowing continuous soft membership degrees, resolving boundary ambiguity between "
                f"transitional samples and achieving superior cluster purity of {winner_metrics.get('purity', 'N/A')}."
            )
        else: # Spectral / Mean Shift
            why_winner = (
                f"{winner_name} triumphed through non-linear manifold transformation, projecting complex topological manifolds "
                f"into a lower-dimensional eigenspace where separation became linearly separable."
            )

        # Per-algorithm strengths & weaknesses tailored to this benchmark
        algorithm_evaluations = []
        for item in ranked_results:
            alg = item.get("algorithm", "").lower()
            m = item.get("metrics", {})
            sil = m.get("silhouette_score")
            db = m.get("davies_bouldin_index")
            t = m.get("execution_time_ms", 0)

            strengths = []
            weaknesses = []

            if "kmeans" in alg:
                strengths.append(f"Blazing computational throughput ({t} ms).")
                strengths.append("Deterministic convergence to local minima.")
                if sil and sil > 0.4:
                    strengths.append(f"High geometric compactness (Silhouette: {sil}).")
                weaknesses.append("Constrained to isotropic spherical clusters.")
                weaknesses.append("Susceptible to outlier distortion.")

            elif "kmedoids" in alg:
                strengths.append("Centers are verified empirical instances (medoids), maximizing domain interpretability.")
                strengths.append("High resilience against outlier influence.")
                weaknesses.append(f"Higher computational time ({t} ms) due to pairwise distance search.")

            elif "dbscan" in alg:
                strengths.append("Requires no a priori cluster count specification.")
                strengths.append(f"Explicitly detects noise ({m.get('n_noise_points', 0)} outliers identified).")
                weaknesses.append("Sensitive to hyperparameter choice (eps, min_samples).")
                if sil is None or (sil and sil < 0.2):
                    weaknesses.append("Struggles with variable density regimes.")

            elif "hierarchical" in alg or "agglomerative" in alg:
                strengths.append("Produces full hierarchical dendrogram for multiscale taxonomy.")
                strengths.append("Deterministic clustering without stochastic seed dependency.")
                weaknesses.append(f"Higher memory footprint ({m.get('memory_kb', 0)} KB) scaling quadratically.")

            elif "spectral" in alg:
                strengths.append("Unfolds complex non-convex geometric geometries via graph Laplacian.")
                weaknesses.append(f"Computationally demanding runtime ({t} ms) due to O(n³) eigensolver.")

            elif "meanshift" in alg:
                strengths.append("Automatically discovers arbitrary number of natural cluster modes.")
                weaknesses.append("High sensitivity to kernel bandwidth parameter estimation.")

            elif "gmm" in alg:
                strengths.append("Full probabilistic membership representation.")
                strengths.append("Accommodates ellipsoidal clusters with varying orientations.")
                weaknesses.append("Vulnerable to singular covariance collapse on high-dimensional sparse subsets.")

            elif "fuzzy" in alg:
                strengths.append("Quantifies classification uncertainty for overlapping boundary instances.")
                weaknesses.append("Requires fuzziness parameter m calibration and metric initialization.")

            algorithm_evaluations.append({
                "algorithm": item.get("algorithm"),
                "rank": item.get("rank"),
                "composite_score": item.get("composite_score"),
                "strengths": strengths,
                "weaknesses": weaknesses,
                "metrics_summary": m
            })

        # Project Documentation & Summary Sections
        paper_sections = {
            "title": f"Benchmarking Clustering Paradigms on {dataset_name}: A Comprehensive Comparative Evaluation",
            "abstract": (
                f"Unsupervised clustering is foundational in machine learning for discovering latent data structures. "
                f"In this project, we benchmark nine fundamental clustering algorithms—spanning partitional, hierarchical, density-based, "
                f"graph-theoretic, and probabilistic paradigms—on {dataset_name} ({num_rows} instances, {num_cols} features). "
                f"Using multi-criteria decision evaluation across Silhouette score, Davies-Bouldin index, Calinski-Harabasz metric, "
                f"cluster purity, and computational runtime, {winner_name} emerged as the top-performing algorithm (composite score: {winner_score:.1f}/100). "
                f"The results provide practical guidance for algorithm selection under varying data topologies."
            ),
            "methodology": (
                "Each algorithm was evaluated in an isolated execution harness measuring peak memory allocation via Python tracemalloc "
                "and precise CPU execution runtime. Dimensionality reduction (PCA and t-SNE) was utilized for topological verification. "
                "Validation scores were calculated using standard Euclidean distance metrics on preprocessed feature matrices."
            ),
            "experimental_results": (
                f"Across all 9 evaluated models, Silhouette scores ranged from "
                f"{min([r.get('metrics', {}).get('silhouette_score', 0) for r in ranked_results if r.get('metrics', {}).get('silhouette_score') is not None] or [0]):.3f} to "
                f"{max([r.get('metrics', {}).get('silhouette_score', 0) for r in ranked_results if r.get('metrics', {}).get('silhouette_score') is not None] or [0]):.3f}. "
                f"{winner_name} established highest overall efficacy. Detailed rankings and individual trade-offs are documented in the comparative leaderboard."
            ),
            "comparative_analysis": (
                "Partitional algorithms (K-Means, K-Medoids) demonstrated superior execution speed, making them ideal for high-throughput deployments. "
                "Hierarchical approaches provided deterministic dendrogram trees at the expense of quadratic space complexity. "
                "Density and probabilistic models (DBSCAN, GMM) excelled in capturing non-spherical variations and boundary fuzziness."
            ),
            "conclusion": (
                f"For the {dataset_name} benchmark, {winner_name} is the strongly recommended algorithm due to its optimal balance of "
                "cluster cohesion, separation, and computational efficiency. Future work will investigate streaming online extensions and automated hyperparameter meta-learning."
            )
        }

        return {
            "winner": winner_name,
            "winner_score": winner_score,
            "why_winner": why_winner,
            "topology_notes": topology_notes,
            "algorithm_evaluations": algorithm_evaluations,
            "complexity_matrix": AIInsightsEngine.get_algorithm_complexity_matrix(),
            "paper_sections": paper_sections
        }
