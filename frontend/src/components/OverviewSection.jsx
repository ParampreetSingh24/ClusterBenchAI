import React from 'react';
import { BookOpen, Cpu, Sigma, CheckCircle2, Award, Zap, Layers } from 'lucide-react';

export default function OverviewSection() {
  const algorithmsTaxonomy = [
    {
      name: "K-Means",
      paradigm: "Partitional / Centroid",
      formula: "J = \\sum_{i=1}^{k} \\sum_{x \\in S_i} \\|x - \\mu_i\\|^2",
      textFormula: "J = Σ Σ ||x - μ_i||²",
      timeComp: "O(n · k · d · i)",
      spaceComp: "O((n + k) · d)",
      description: "Iteratively assigns samples to nearest centroid and recalculates mean coordinates. Optimal for convex, isotropic clusters."
    },
    {
      name: "K-Medoids (PAM)",
      paradigm: "Partitional / Exemplar",
      formula: "J = \\sum_{i=1}^{k} \\sum_{x \\in C_i} d(x, m_i), \\quad m_i \\in X",
      textFormula: "J = Σ Σ d(x, m_i) where m_i ∈ X",
      timeComp: "O(k · (n - k)²)",
      spaceComp: "O(n² + n · d)",
      description: "Restricts cluster representatives to empirical dataset samples (medoids), providing superior resilience against extreme outliers."
    },
    {
      name: "DBSCAN",
      paradigm: "Density-Based",
      formula: "N_\\epsilon(p) = \\{q \\in D \\mid \\text{dist}(p, q) \\le \\epsilon\\}, \\quad |N_\\epsilon(p)| \\ge \\text{MinPts}",
      textFormula: "N_ε(p) = {q ∈ D | dist(p, q) ≤ ε}, |N_ε(p)| ≥ MinPts",
      timeComp: "O(n · \\log n) \\text{ to } O(n^2)",
      timeCompText: "O(n · log n) to O(n²)",
      spaceComp: "O(n · d)",
      description: "Identifies density-connected components across arbitrary geometries while segregating anomalous noise (-1)."
    },
    {
      name: "Hierarchical Clustering",
      paradigm: "Agglomerative / Tree-Based",
      formula: "d(u, v) = \\sqrt{\\frac{|u||v|}{|u| + |v|}} \\|\\mu_u - \\mu_v\\|_2 \\quad (\\text{Ward Linkage})",
      textFormula: "d(u,v) = sqrt( (|u||v|)/(|u|+|v|) ) ||μ_u - μ_v||₂",
      timeComp: "O(n^2 · \\log n)",
      timeCompText: "O(n² · log n)",
      spaceComp: "O(n²)",
      description: "Recursively fuses clusters bottom-up to build an interpretable dendrogram tree capturing multi-scale taxonomies."
    },
    {
      name: "Agglomerative Clustering",
      paradigm: "Linkage Agglomeration",
      formula: "D(A, B) = \\min / \\max / \\text{avg} \\{d(a, b) : a \\in A, b \\in B\\}",
      textFormula: "D(A, B) = min / max / avg { d(a,b) : a ∈ A, b ∈ B }",
      timeComp: "O(n^2 \\log n)",
      timeCompText: "O(n² log n)",
      spaceComp: "O(n²)",
      description: "Pairwise agglomerative clustering supporting Ward's variance minimization, Complete, Average, and Single linkage criteria."
    },
    {
      name: "Spectral Clustering",
      paradigm: "Graph Cut / Laplacian",
      formula: "L = D - W, \\quad L_{sym} = D^{-1/2} L D^{-1/2}",
      textFormula: "L = D - W, L_sym = D^(-1/2) L D^(-1/2)",
      timeComp: "O(n^3)",
      timeCompText: "O(n³)",
      spaceComp: "O(n²)",
      description: "Projects high-dimensional points into the eigenspace of a normalized affinity graph Laplacian to unroll non-linear manifolds."
    },
    {
      name: "Mean Shift",
      paradigm: "Density Gradient / Mode-Seeking",
      formula: "m(x) = \\frac{\\sum_{i} K(x_i - x) x_i}{\\sum_{i} K(x_i - x)} - x",
      textFormula: "m(x) = [ Σ K(x_i - x) x_i / Σ K(x_i - x) ] - x",
      timeComp: "O(n^2 · i)",
      timeCompText: "O(n² · i)",
      spaceComp: "O(n · d)",
      description: "Non-parametric kernel density mode-seeking algorithm that identifies cluster centers automatically without fixing k."
    },
    {
      name: "Gaussian Mixture Models (GMM)",
      paradigm: "Distribution-Based / Probabilistic",
      formula: "p(x) = \\sum_{k=1}^K \\pi_k \\mathcal{N}(x \\mid \\mu_k, \\Sigma_k)",
      textFormula: "p(x) = Σ π_k N(x | μ_k, Σ_k)",
      timeComp: "O(n · d^3 · i)",
      timeCompText: "O(n · d³ · i)",
      spaceComp: "O(k · d² + n · k)",
      description: "Soft probabilistic expectation-maximization clustering supporting anisotropic ellipsoidal covariances."
    },
    {
      name: "Fuzzy C-Means (FCM)",
      paradigm: "Fuzzy / Overlapping",
      formula: "J_m = \\sum_{i=1}^N \\sum_{j=1}^C u_{ij}^m \\|x_i - c_j\\|^2, \\quad \\sum_{j=1}^C u_{ij} = 1",
      textFormula: "J_m = Σ Σ (u_ij)^m ||x_i - c_j||², Σ u_ij = 1",
      timeComp: "O(n · c · d · i)",
      spaceComp: "O(n · c + c · d)",
      description: "Assigns continuous membership degrees u_ij ∈ [0, 1] per sample, effectively handling boundary ambiguity."
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Platform Title Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              CLUSTERBENCH PLATFORM
            </span>
            <span className="text-xs text-slate-300">Comprehensive Clustering Benchmark</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-sky-200">
            <span>9 Clustering Paradigms</span>
            <span>•</span>
            <span>7 Validation Metrics</span>
            <span>•</span>
            <span>UCI Mushroom & Soybean</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          ClusterBenchAI: An Empirical Multi-Paradigm Clustering Benchmark
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          A rigorous comparative framework evaluating partitional, hierarchical, density-based, graph-theoretic, and probabilistic clustering algorithms on canonical UCI Machine Learning datasets. Incorporates automated Multi-Criteria Decision Making (MCDM), topological diagnosis, and downloadable analysis reports.
        </p>
      </div>

      {/* Research Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            I. Preprocessing Pipeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Standardized data transformations including Mode/Mean imputation, One-Hot & Label Encoding, Standard/MinMax scaling, Isolation Forest outlier mitigation, and ANOVA feature selection.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            II. Execution & Profiling
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All 9 algorithms execute within isolated sandboxed execution loops measuring wall-clock latency (ms) and peak memory allocation (KB) via Python's <code className="text-sky-500">tracemalloc</code>.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            III. MCDM Leaderboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multi-Criteria Decision Making (TOPSIS/Weighted Method) balances Silhouette separation (30%), Davies-Bouldin compactness (20%), Calinski-Harabasz (15%), Purity (20%), and CPU speed (15%).
          </p>
        </div>
      </div>

      {/* Algorithmic Taxonomy & Formulations Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sigma className="w-4 h-4 text-sky-500" />
              Taxonomy of 9 Clustering Paradigms & Mathematical Formulations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theoretical formulations and asymptotic computational complexities for all implemented algorithms.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Big-O Taxonomy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {algorithmsTaxonomy.map((alg) => (
            <div
              key={alg.name}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alg.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium">
                    {alg.paradigm}
                  </span>
                </div>
                
                {/* Mathematical formulation box */}
                <div className="my-2.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-sky-600 dark:text-sky-400 overflow-x-auto">
                  {alg.textFormula}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {alg.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Time: <strong className="text-slate-700 dark:text-slate-200">{alg.timeCompText || alg.timeComp}</strong></span>
                <span>Space: <strong className="text-slate-700 dark:text-slate-200">{alg.spaceComp}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Metrics Formulations */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Clustering Performance Metrics Formal Definitions
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Internal and external criteria used to evaluate cluster cohesion, separation, and ground truth purity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Silhouette Score</div>
            <div className="font-mono text-[10px] text-sky-500 mb-1">s(i) = [b(i) - a(i)] / max(a(i), b(i))</div>
            <p className="text-slate-500 dark:text-slate-400">Ranges [-1, 1]. Measures intra-cluster cohesion versus nearest-cluster separation. Higher is better.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Davies-Bouldin Index</div>
            <div className="font-mono text-[10px] text-sky-500 mb-1">{"DB = (1/k) Σ max_{j≠i} (s_i + s_j) / d(c_i, c_j)"}</div>
            <p className="text-slate-500 dark:text-slate-400">Similarity ratio of cluster dispersion to inter-centroid separation. Lower is better (0 is optimal).</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Calinski-Harabasz</div>
            <div className="font-mono text-[10px] text-sky-500 mb-1">CH = [SS_B / (k-1)] / [SS_W / (N-k)]</div>
            <p className="text-slate-500 dark:text-slate-400">Variance ratio criterion measuring between-cluster dispersion over within-cluster dispersion. Higher is better.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Cluster Purity</div>
            <div className="font-mono text-[10px] text-sky-500 mb-1">Purity = (1/N) Σ_k max_j |C_k ∩ L_j|</div>
            <p className="text-slate-500 dark:text-slate-400">External evaluation comparing unsupervised cluster assignments directly against ground-truth labels [0, 1].</p>
          </div>
        </div>
      </div>
    </div>
  );
}
