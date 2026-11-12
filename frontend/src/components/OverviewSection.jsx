import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Sigma,
  Zap,
  CheckCircle2,
  Sliders,
  Filter,
  Info,
  ArrowRight,
  Sparkles,
  Flame,
  Gauge,
  Atom,
  Binary
} from 'lucide-react';
import Tooltip from './Tooltip';

export default function OverviewSection() {
  const [selectedParadigm, setSelectedParadigm] = useState('All');

  const algorithms = [
    {
      name: 'K-Means',
      category: 'Partitional',
      categoryColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      shortFormula: 'J = Σ Σ ||x - μ||²',
      timeComp: 'O(n · k · d · i)',
      spaceComp: 'O((n + k) · d)',
      shape: 'Spherical (Voronoi)',
      noise: 'Pulls centroids',
      intuition: 'Minimizes intra-cluster variance by iteratively updating centroids to the arithmetic mean of assigned points.',
      bestFor: 'High-speed partitioning on balanced, isotropic, convex datasets.'
    },
    {
      name: 'K-Medoids (PAM)',
      category: 'Partitional',
      categoryColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      shortFormula: 'J = Σ Σ d(x, m_i), m_i ∈ X',
      timeComp: 'O(k · (n - k)²)',
      spaceComp: 'O(n² + n · d)',
      shape: 'Robust exemplar',
      noise: 'Resistant',
      intuition: 'Forces cluster centers to be actual data points (medoids), drastically reducing distortion from extreme outliers.',
      bestFor: 'Datasets with noise or non-Euclidean distance matrices where interpretability is crucial.'
    },
    {
      name: 'DBSCAN',
      category: 'Density-Based',
      categoryColor: 'from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30',
      shortFormula: '|N_ε(p)| ≥ MinPts',
      timeComp: 'O(n · log n) to O(n²)',
      spaceComp: 'O(n · d)',
      shape: 'Arbitrary Non-Convex',
      noise: 'Explicit Label (-1)',
      intuition: 'Connects core samples within an epsilon-radius threshold and naturally isolates anomalies as noise points.',
      bestFor: 'Non-linear manifolds, spatial structures, and data with unknown cluster counts.'
    },
    {
      name: 'Hierarchical Clustering',
      category: 'Hierarchical',
      categoryColor: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
      shortFormula: 'd_Ward = √((|u||v|)/(|u|+|v|)) ||μ_u - μ_v||',
      timeComp: 'O(n² · log n)',
      spaceComp: 'O(n²)',
      shape: 'Multiscale tree',
      noise: 'Creates outlier leaves',
      intuition: 'Recursively merges clusters bottom-up, generating an interpretable dendrogram tree for multiscale analysis.',
      bestFor: 'Biological taxonomy, genealogy, or scenarios where multi-level hierarchy matters.'
    },
    {
      name: 'Agglomerative Clustering',
      category: 'Hierarchical',
      categoryColor: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
      shortFormula: 'D(A,B) = min/max/avg {d(a,b)}',
      timeComp: 'O(n² · log n)',
      spaceComp: 'O(n²)',
      shape: 'Linkage dependent',
      noise: 'Moderate',
      intuition: 'Pairwise agglomeration supporting Ward (variance minimization), Complete (max), or Average linkage.',
      bestFor: 'Compact groups with deterministic reproducible groupings without random seeds.'
    },
    {
      name: 'Spectral Clustering',
      category: 'Graph-Theoretic',
      categoryColor: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400 border-fuchsia-500/30',
      shortFormula: 'L_sym = I - D^(-1/2) W D^(-1/2)',
      timeComp: 'O(n³)',
      spaceComp: 'O(n²)',
      shape: 'Non-linear manifold',
      noise: 'Graph cut dependent',
      intuition: 'Projects samples into the eigenspace of a normalized graph Laplacian to unroll non-linear manifolds.',
      bestFor: 'Complex geometric manifolds that are not linearly separable in Euclidean space.'
    },
    {
      name: 'Mean Shift',
      category: 'Mode-Seeking',
      categoryColor: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      shortFormula: 'm(x) = [Σ K(x_i-x) x_i / Σ K] - x',
      timeComp: 'O(n² · i)',
      spaceComp: 'O(n · d)',
      shape: 'Arbitrary modes',
      noise: 'Isolates into modes',
      intuition: 'Non-parametric gradient ascent shifting candidate centroids toward density maxima without requiring a fixed k.',
      bestFor: 'Spatial distribution analysis where cluster count should emerge naturally from data.'
    },
    {
      name: 'Gaussian Mixture Models (GMM)',
      category: 'Probabilistic',
      categoryColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      shortFormula: 'p(x) = Σ π_k N(x | μ_k, Σ_k)',
      timeComp: 'O(n · d³ · i)',
      spaceComp: 'O(k · d² + n · k)',
      shape: 'Ellipsoidal (anisotropic)',
      noise: 'Captured via variance',
      intuition: 'Expectation-Maximization modeling samples as a mixture of multivariate Gaussian distributions with full or diagonal covariances.',
      bestFor: 'Overlapping clusters with unequal sizes, orientations, and variances.'
    },
    {
      name: 'Fuzzy C-Means',
      category: 'Probabilistic',
      categoryColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      shortFormula: 'J_m = Σ Σ u_ij^m ||x_i - c_j||²',
      timeComp: 'O(n · k · d · i)',
      spaceComp: 'O(n · k + k · d)',
      shape: 'Soft spherical',
      noise: 'Soft memberships',
      intuition: 'Computes continuous degree of membership u_ij ∈ [0, 1] for each point across clusters, accommodating ambiguous boundaries.',
      bestFor: 'Gradual boundaries, overlapping phenotypes, and probabilistic medical diagnosis.'
    }
  ];

  const paradigms = ['All', 'Partitional', 'Density-Based', 'Hierarchical', 'Graph-Theoretic', 'Probabilistic', 'Mode-Seeking'];

  const filteredAlgorithms = selectedParadigm === 'All'
    ? algorithms
    : algorithms.filter((a) => a.category === selectedParadigm);

  const metricsInfo = [
    {
      name: 'Silhouette Score',
      range: '[-1, +1]',
      target: 'Maximize (→ 1.0)',
      formula: 's(i) = (b(i) - a(i)) / max(a(i), b(i))',
      color: 'text-cyan-500 dark:text-cyan-400',
      borderGlow: 'hover:border-cyan-500/40',
      badge: 'Internal Validity',
      intuition: 'Measures how well-separated cluster boundaries are. Scores above 0.5 denote distinct, well-isolated clusters.'
    },
    {
      name: 'Davies-Bouldin Index',
      range: '[0, ∞)',
      target: 'Minimize (→ 0.0)',
      formula: 'DB = (1/k) Σ max_{j≠i} (s_i + s_j) / d(c_i, c_j)',
      color: 'text-amber-500 dark:text-amber-400',
      borderGlow: 'hover:border-amber-500/40',
      badge: 'Separation Ratio',
      intuition: 'Evaluates similarity between clusters by comparing intra-cluster spread to inter-centroid separation. Lower is strictly better.'
    },
    {
      name: 'Calinski-Harabasz Score',
      range: '[0, ∞)',
      target: 'Maximize (Higher = Better)',
      formula: 'CH = [SS_B / (k - 1)] / [SS_W / (n - k)]',
      color: 'text-emerald-500 dark:text-emerald-400',
      borderGlow: 'hover:border-emerald-500/40',
      badge: 'Variance Ratio',
      intuition: 'Variance ratio criterion comparing between-cluster dispersion to within-cluster dispersion.'
    },
    {
      name: 'Cluster Purity & ARI',
      range: '[0, 1.0]',
      target: 'Maximize (→ 1.0)',
      formula: 'Purity = (1/N) Σ max_j |c_k ∩ t_j|',
      color: 'text-purple-500 dark:text-purple-400',
      borderGlow: 'hover:border-purple-500/40',
      badge: 'Ground Truth Alignment',
      intuition: 'Assesses agreement against known biological class labels (e.g. Edible vs. Poisonous in Mushroom, Plant Diseases in Soybean).'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Bento Header */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg overflow-hidden group">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-mono font-bold bg-gradient-to-r from-cyan-500/15 via-violet-500/15 to-fuchsia-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>NEXT-GEN CLUSTERING STUDIO</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                ● 9 SOTA Models Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Benchmark <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">High-Dimensional</span> Manifolds
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Real-time clustering lab comparing 9 algorithms across UCI Mushroom, Soybean, and synthetic topologies with multi-criteria MCDM ranking, 2D/3D projections, and diagnostic sweeps.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10.5px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Sub-10ms Inference</span>
              </span>
              <span className="text-[10.5px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] flex items-center gap-1.5">
                <Atom className="w-3 h-3 text-cyan-400" />
                <span>2D/3D PCA & t-SNE</span>
              </span>
              <span className="text-[10.5px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] flex items-center gap-1.5">
                <Binary className="w-3 h-3 text-purple-400" />
                <span>MCDM Pareto Ranking</span>
              </span>
            </div>
          </div>

          {/* Quick Stats Bento Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] hover:border-cyan-500/40 transition">
              <div className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Models</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">9 SOTA</div>
              <div className="text-[10px] text-cyan-500 font-medium">Partitional & Density</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] hover:border-violet-500/40 transition">
              <div className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Metrics</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">7 Scores</div>
              <div className="text-[10px] text-violet-500 font-medium">Internal & Supervised</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] hover:border-emerald-500/40 transition">
              <div className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Datasets</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Mushroom</div>
              <div className="text-[10px] text-emerald-500 font-medium">8,124 Instances</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] hover:border-fuchsia-500/40 transition">
              <div className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Decision</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">MCDM</div>
              <div className="text-[10px] text-fuchsia-500 font-medium">Auto Weighted Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Matrix Section */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>Clustering Model Spectrum</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hover over any card to reveal mathematical formulations, geometry assumptions, and optimal use cases.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] text-xs">
            {paradigms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedParadigm(p)}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                  selectedParadigm === p
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-white/[0.08]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlgorithms.map((alg) => (
            <div
              key={alg.name}
              className="group relative p-4 rounded-2xl bg-white/60 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-white/[0.06] hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition">
                    {alg.name}
                  </h3>
                  <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border bg-gradient-to-r ${alg.categoryColor}`}>
                    {alg.category}
                  </span>
                </div>

                {/* Compact Formula Pill */}
                <div className="font-mono text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06] truncate mb-3">
                  {alg.shortFormula}
                </div>
              </div>

              {/* Bottom Quick Specs & Hover Cue */}
              <div className="pt-2.5 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-[10.5px] font-mono text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-600 dark:text-slate-400">{alg.timeComp}</span>
                <span className="text-[10px] text-cyan-500 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Hover details <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>

              {/* Floating Hover Card (Revealed on hover) */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-84 p-4 rounded-2xl bg-slate-950/95 dark:bg-[#0c1021]/95 text-white text-xs shadow-2xl border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 backdrop-blur-xl scale-95 group-hover:scale-100 origin-bottom">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.1]">
                  <span className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    {alg.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    {alg.timeComp}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Mechanism:</span>
                    <p className="text-slate-200 leading-snug">{alg.intuition}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Formula:</span>
                    <code className="text-amber-300 font-mono text-[10px] block bg-black/60 p-1.5 rounded-lg border border-white/[0.08]">
                      {alg.shortFormula}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
                    <div className="bg-white/[0.04] p-1.5 rounded-lg border border-white/[0.05]">
                      <span className="text-slate-400 block">Geometry:</span>
                      <span className="text-cyan-300 font-bold">{alg.shape}</span>
                    </div>
                    <div className="bg-white/[0.04] p-1.5 rounded-lg border border-white/[0.05]">
                      <span className="text-slate-400 block">Noise:</span>
                      <span className="text-violet-300 font-bold">{alg.noise}</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[10px]">
                    <span className="text-emerald-400 font-semibold">Best For:</span>{' '}
                    <span className="text-slate-300">{alg.bestFor}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Criteria Section */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Evaluation Criteria & Internal Validity</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hover over any metric card to review its mathematical formulation and interpretation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsInfo.map((m) => (
            <div
              key={m.name}
              className={`group relative p-4 rounded-2xl bg-white/60 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-white/[0.06] ${m.borderGlow} hover:shadow-lg transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                  {m.range}
                </span>
              </div>
              <div className={`text-xs font-semibold ${m.color} mb-1`}>{m.target}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>{m.badge}</span>
                <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition" />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-76 p-3.5 rounded-2xl bg-slate-950/95 dark:bg-[#0c1021]/95 text-white text-xs shadow-2xl border border-white/[0.1] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 backdrop-blur-xl scale-95 group-hover:scale-100 origin-bottom">
                <div className="font-bold text-cyan-400 text-xs mb-1">{m.name} Formulation</div>
                <div className="p-2 mb-2 rounded-lg bg-black/70 font-mono text-[10px] text-amber-300 border border-white/[0.08] overflow-x-auto">
                  {m.formula}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                  {m.intuition}
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
