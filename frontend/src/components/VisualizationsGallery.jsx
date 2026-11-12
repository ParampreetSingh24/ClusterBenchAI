import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Activity,
  Layers,
  GitBranch,
  Grid,
  RefreshCw,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';
import Tooltip from './Tooltip';

const ALGORITHM_OPTIONS = [
  { id: 'kmeans', name: 'K-Means' },
  { id: 'gmm', name: 'GMM' },
  { id: 'agglomerative', name: 'Agglomerative' },
  { id: 'spectral', name: 'Spectral' },
  { id: 'kmedoids', name: 'K-Medoids' },
  { id: 'fuzzy_cmeans', name: 'Fuzzy C-Means' }
];

export default function VisualizationsGallery({
  activeDatasetId,
  isDark
}) {
  const [selectedAlg, setSelectedAlg] = useState('kmeans');
  const [kClusters, setKClusters] = useState(3);
  const [loading, setLoading] = useState(false);
  const [vizData, setVizData] = useState(null);
  const [sweepData, setSweepData] = useState(null);
  const [loadingSweep, setLoadingSweep] = useState(false);

  // Fetch full visualizations payload
  const fetchVisualizations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cluster/visualizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: activeDatasetId,
          algorithm: selectedAlg,
          params: { n_clusters: parseInt(kClusters) }
        })
      });
      const data = await res.json();
      setVizData(data);
    } catch (err) {
      console.error('Error fetching visualizations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch parameter sweep (Elbow & Silhouette curves)
  const fetchParameterSweep = async () => {
    setLoadingSweep(true);
    try {
      const res = await fetch('/api/cluster/parameter-sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: activeDatasetId,
          k_min: 2,
          k_max: 10
        })
      });
      const data = await res.json();
      setSweepData(data);
    } catch (err) {
      console.error('Error fetching sweep:', err);
    } finally {
      setLoadingSweep(false);
    }
  };

  useEffect(() => {
    fetchVisualizations();
    fetchParameterSweep();
  }, [activeDatasetId, selectedAlg, kClusters]);

  // Construct Silhouette Plot Data
  const getSilhouettePlotData = () => {
    const sil = vizData?.silhouette_plot;
    if (!sil || !sil.clusters) return [];

    const traces = [];
    let currentY = 0;
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    sil.clusters.forEach((c, idx) => {
      const yValues = c.values.map((_, i) => currentY + i);
      currentY += c.values.length + 10;

      traces.push({
        x: c.values,
        y: yValues,
        type: 'bar',
        orientation: 'h',
        name: `Cluster ${c.cluster}`,
        marker: {
          color: colors[idx % colors.length],
          opacity: 0.85
        }
      });
    });

    return traces;
  };

  // Construct Correlation Heatmap Data
  const getCorrelationHeatmapData = () => {
    const hm = vizData?.heatmaps;
    if (!hm || !hm.correlation_matrix) return [];

    return [
      {
        z: hm.correlation_matrix,
        x: hm.feature_names,
        y: hm.feature_names,
        type: 'heatmap',
        colorscale: 'Blues',
        reversescale: false
      }
    ];
  };

  // Construct Cluster Profile Heatmap Data
  const getClusterProfileHeatmapData = () => {
    const hm = vizData?.heatmaps;
    if (!hm || !hm.cluster_profiles || !hm.cluster_profiles.length) return [];

    return [
      {
        z: hm.cluster_profiles,
        x: hm.feature_names,
        y: hm.cluster_ids.map((id) => `Cluster ${id}`),
        type: 'heatmap',
        colorscale: 'Viridis'
      }
    ];
  };

  // Construct Dendrogram Data
  const getDendrogramData = () => {
    const dend = vizData?.dendrogram;
    if (!dend || !dend.icoord) return [];

    const traces = [];
    for (let i = 0; i < dend.icoord.length; i++) {
      traces.push({
        x: dend.icoord[i],
        y: dend.dcoord[i],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#0284c7', width: 1.5 },
        showlegend: false
      });
    }
    return traces;
  };

  // Peak silhouette from sweep
  const peakSilhouetteK = sweepData?.k_values && sweepData?.silhouette_scores
    ? sweepData.k_values[sweepData.silhouette_scores.indexOf(Math.max(...sweepData.silhouette_scores))]
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Control Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Visualizations & Diagnostic Curves
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive parameter sweeps, dendrograms, silhouette profiles, and correlation matrices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Algorithm Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Model:</span>
            <select
              value={selectedAlg}
              onChange={(e) => setSelectedAlg(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {ALGORITHM_OPTIONS.map((alg) => (
                <option key={alg.id} value={alg.id}>
                  {alg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clusters Input */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">k =</span>
            <input
              type="number"
              min="2"
              max="10"
              value={kClusters}
              onChange={(e) => setKClusters(e.target.value)}
              className="w-14 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => {
              fetchVisualizations();
              fetchParameterSweep();
            }}
            disabled={loading || loadingSweep}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-60 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loading || loadingSweep) ? 'animate-spin' : ''}`} />
            <span>Update</span>
          </button>
        </div>
      </div>

      {/* Row 1: Elbow Method & Silhouette vs K Sweep */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elbow Curve */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Elbow Criterion (WCSS / Inertia)
              </h3>
              <Tooltip
                title="Elbow Inflection Method"
                formula="WCSS = Σ_k Σ_{x ∈ C_k} ||x - μ_k||²"
                content="Detects the point where adding clusters yields diminishing returns in intra-cluster variance reduction. The sharpest curve bend signifies optimal partition compactness."
                position="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-sky-500 cursor-pointer transition" />
              </Tooltip>
            </div>
            {sweepData?.recommended_k && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Elbow k = {sweepData.recommended_k}
              </span>
            )}
          </div>

          <div className="w-full h-72">
            <PlotlyChart
              data={[
                {
                  x: sweepData?.k_values || [2, 3, 4, 5, 6, 7, 8],
                  y: sweepData?.inertias || [1000, 700, 500, 420, 370, 340, 315],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: '#0284c7', size: 7 },
                  line: { color: '#0284c7', width: 2.5 }
                }
              ]}
              layout={{
                xaxis: { title: 'Clusters (k)', dtick: 1 },
                yaxis: { title: 'Inertia / WCSS' },
                margin: { l: 50, r: 20, t: 15, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Silhouette Score vs K */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Global Silhouette vs. Cluster Count
              </h3>
              <Tooltip
                title="Global Silhouette Profile"
                formula="s(i) = (b(i) - a(i)) / max(a(i), b(i))"
                content="Measures individual sample cohesion relative to neighboring cluster separation. Peak bar height indicates the k value that maximizes separation distinctness."
                position="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500 cursor-pointer transition" />
              </Tooltip>
            </div>
            {peakSilhouetteK && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
                Peak k = {peakSilhouetteK}
              </span>
            )}
          </div>

          <div className="w-full h-72">
            <PlotlyChart
              data={[
                {
                  x: sweepData?.k_values || [2, 3, 4, 5, 6, 7, 8],
                  y: sweepData?.silhouette_scores || [0.45, 0.52, 0.48, 0.41, 0.38, 0.35, 0.32],
                  type: 'bar',
                  marker: {
                    color: '#10b981',
                    opacity: 0.85
                  }
                }
              ]}
              layout={{
                xaxis: { title: 'Clusters (k)', dtick: 1 },
                yaxis: { title: 'Silhouette Score', range: [0, 1] },
                margin: { l: 50, r: 20, t: 15, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Per-Cluster Silhouette Plot & Dendrogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Silhouette Plot */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Per-Cluster Silhouette Profiles
              </h3>
              <Tooltip
                title="Cluster Thickness & Silhouette"
                formula="Dashed Line: Dataset Average"
                content="Thickness of silhouette knives reflects cluster size. Knives extending well past the red dashed threshold represent dense, cohesive clusters without spillover."
                position="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500 cursor-pointer transition" />
              </Tooltip>
            </div>
            {vizData?.silhouette_plot?.average_silhouette !== undefined && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                Mean s = {vizData.silhouette_plot.average_silhouette}
              </span>
            )}
          </div>

          <div className="w-full h-80">
            <PlotlyChart
              data={getSilhouettePlotData()}
              layout={{
                xaxis: { title: 'Silhouette Coefficient', range: [-0.1, 1.0] },
                yaxis: { title: 'Samples (Grouped)', showticklabels: false },
                shapes: [
                  {
                    type: 'line',
                    x0: vizData?.silhouette_plot?.average_silhouette || 0.4,
                    x1: vizData?.silhouette_plot?.average_silhouette || 0.4,
                    y0: 0,
                    y1: 1,
                    yref: 'paper',
                    line: { color: '#ef4444', width: 2, dash: 'dash' }
                  }
                ],
                margin: { l: 45, r: 20, t: 15, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Dendrogram */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hierarchical Dendrogram
              </h3>
              <Tooltip
                title="Ward Linkage Agglomeration"
                formula="d(A, B) = min-variance pairwise distance"
                content="Tree representation of bottom-up hierarchical agglomeration. Vertical U-stem height corresponds to cophenetic distance between merged clusters."
                position="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 cursor-pointer transition" />
              </Tooltip>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
              Ward Linkage
            </span>
          </div>

          <div className="w-full h-80">
            <PlotlyChart
              data={getDendrogramData()}
              layout={{
                xaxis: { title: 'Sample Instances', showticklabels: false },
                yaxis: { title: 'Linkage Distance' },
                margin: { l: 45, r: 20, t: 15, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Feature Correlation Matrix Heatmap & Cluster Centroid Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Heatmap */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Feature Correlation Heatmap
              </h3>
              <Tooltip
                title="Pairwise Pearson Correlation"
                formula="r = Cov(X, Y) / (σ_X · σ_Y)"
                content="Detects linear dependencies across key preprocessed attributes. High correlation flags redundant dimensions suitable for PCA reduction."
                position="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-sky-500 cursor-pointer transition" />
              </Tooltip>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
              Pearson r
            </span>
          </div>

          <div className="w-full h-80">
            <PlotlyChart
              data={getCorrelationHeatmapData()}
              layout={{
                margin: { l: 70, r: 20, t: 15, b: 70 },
                xaxis: { tickangle: -45 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Cluster Centroid Profile Heatmap */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cluster Centroid Profiles
              </h3>
              <Tooltip
                title="Normalized Centroid Signatures"
                formula="μ_{k,j} = 1/|C_k| · Σ x_{i,j}"
                content="Standardized mean expression levels per cluster. Visualizes the exact morphological or statistical traits that distinguish each group."
                position="top"
              >
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500 cursor-pointer transition" />
              </Tooltip>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Centroid Means
            </span>
          </div>

          <div className="w-full h-80">
            <PlotlyChart
              data={getClusterProfileHeatmapData()}
              layout={{
                margin: { l: 70, r: 20, t: 15, b: 70 },
                xaxis: { tickangle: -45 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
