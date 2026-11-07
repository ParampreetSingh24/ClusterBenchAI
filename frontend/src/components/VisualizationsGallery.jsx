import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Activity,
  Layers,
  GitBranch,
  Grid,
  RefreshCw,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';

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
      currentY += c.values.length + 10; // gap

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-sky-500" />
            Deep Clustering Visualizations Gallery
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Examine Elbow criteria, per-cluster silhouette profiles, hierarchical dendrograms, and feature heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Clusters (k):</span>
            <input
              type="number"
              min="2"
              max="10"
              value={kClusters}
              onChange={(e) => setKClusters(e.target.value)}
              className="w-12 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              fetchVisualizations();
              fetchParameterSweep();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Row 1: Elbow Method & Silhouette vs K Sweep */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elbow Curve */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-sky-500" />
              Elbow Method: Within-Cluster Sum of Squares (WCSS)
            </h3>
            {sweepData?.recommended_k && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Suggested k = {sweepData.recommended_k}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Identifies the inflection point (elbow) where diminishing returns in variance reduction occur.
          </p>

          <div className="w-full h-72">
            <PlotlyChart
              data={[
                {
                  x: sweepData?.k_values || [2, 3, 4, 5, 6, 7, 8],
                  y: sweepData?.inertias || [1000, 700, 500, 420, 370, 340, 315],
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: '#0284c7', size: 8 },
                  line: { color: '#0284c7', width: 2.5 }
                }
              ]}
              layout={{
                xaxis: { title: 'Number of Clusters (k)', dtick: 1 },
                yaxis: { title: 'Inertia / WCSS' },
                margin: { l: 50, r: 20, t: 20, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Silhouette Score vs K */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Silhouette Analysis vs. Cluster Count (k)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Global silhouette score evaluated across candidate k values. The maximum represents optimal separation.
          </p>

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
                xaxis: { title: 'Number of Clusters (k)', dtick: 1 },
                yaxis: { title: 'Silhouette Score', range: [0, 1] },
                margin: { l: 50, r: 20, t: 20, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Per-Cluster Silhouette Plot & Dendrogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Silhouette Plot */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Per-Cluster Silhouette Analysis Diagram
            </h3>
            {vizData?.silhouette_plot?.average_silhouette !== undefined && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
                Avg: {vizData.silhouette_plot.average_silhouette}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Horizontal silhouette coefficients per sample. Uniform cluster thickness indicates balanced clustering.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={getSilhouettePlotData()}
              layout={{
                xaxis: { title: 'Silhouette Coefficient values', range: [-0.1, 1.0] },
                yaxis: { title: 'Sample Index (Grouped)', showticklabels: false },
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
                margin: { l: 45, r: 20, t: 20, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Dendrogram */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-500" />
            Hierarchical Dendrogram Tree (Ward Linkage)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Tree diagram representing progressive pairwise agglomeration of multi-dimensional instances.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={getDendrogramData()}
              layout={{
                xaxis: { title: 'Sample Leaves Index', showticklabels: false },
                yaxis: { title: 'Linkage Distance' },
                margin: { l: 45, r: 20, t: 20, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Feature Correlation Matrix Heatmap & Cluster Centroid Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Heatmap */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Grid className="w-4 h-4 text-sky-500" />
            Feature Correlation Matrix Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Pairwise Pearson correlation coefficients between the top attributes in the preprocessed feature space.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={getCorrelationHeatmapData()}
              layout={{
                margin: { l: 70, r: 20, t: 20, b: 70 },
                xaxis: { tickangle: -45 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Cluster Centroid Profile Heatmap */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Cluster Feature Profile Heatmap (Centroids)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Mean normalized feature values per cluster, revealing distinct phenotypic or physiological signatures.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={getClusterProfileHeatmapData()}
              layout={{
                margin: { l: 70, r: 20, t: 20, b: 70 },
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
