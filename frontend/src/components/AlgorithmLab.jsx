import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Layers,
  RotateCcw,
  Sparkles,
  BarChart2,
  Box,
  Compass,
  Zap,
  Clock,
  HardDrive
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';

export default function AlgorithmLab({
  activeDatasetId,
  isDark,
  onSingleRunComplete
}) {
  const [selectedAlg, setSelectedAlg] = useState('kmeans');
  const [kClusters, setKClusters] = useState(3);
  const [dbscanEps, setDbscanEps] = useState(1.2);
  const [dbscanMinSamples, setDbscanMinSamples] = useState(5);
  const [linkageMethod, setLinkageMethod] = useState('ward');
  const [covType, setCovType] = useState('full');
  const [fuzziness, setFuzziness] = useState(2.0);
  const [bandwidth, setBandwidth] = useState('');

  const [activeVizMode, setActiveVizMode] = useState('pca2d'); // 'pca2d', 'pca3d', 'tsne', 'umap'
  const [colorByGroundTruth, setColorByGroundTruth] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const runAlgorithm = async () => {
    setIsRunning(true);
    try {
      const params = {};
      if (['kmeans', 'kmedoids', 'hierarchical', 'agglomerative', 'spectral', 'fuzzy_cmeans'].includes(selectedAlg)) {
        params.n_clusters = parseInt(kClusters);
      }
      if (selectedAlg === 'dbscan') {
        params.eps = parseFloat(dbscanEps);
        params.min_samples = parseInt(dbscanMinSamples);
      }
      if (['hierarchical', 'agglomerative'].includes(selectedAlg)) {
        params.linkage = linkageMethod;
      }
      if (selectedAlg === 'gmm') {
        params.n_components = parseInt(kClusters);
        params.covariance_type = covType;
      }
      if (selectedAlg === 'fuzzy_cmeans') {
        params.fuzziness = parseFloat(fuzziness);
      }
      if (selectedAlg === 'meanshift' && bandwidth) {
        params.bandwidth = parseFloat(bandwidth);
      }

      const res = await fetch('/api/cluster/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: activeDatasetId,
          algorithm: selectedAlg,
          params
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Clustering execution failed');
      setRunResult(data);
      if (onSingleRunComplete) onSingleRunComplete(data);
    } catch (err) {
      alert(`Error running ${selectedAlg}: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run on mount or when active dataset changes
  useEffect(() => {
    runAlgorithm();
  }, [activeDatasetId, selectedAlg]);

  // Construct Plotly Scatter Data
  const proj = runResult?.projections || {};
  const currentLabels = colorByGroundTruth && proj.ground_truth ? proj.ground_truth : proj.labels || [];
  
  const getScatterPlotData = () => {
    if (!proj || !currentLabels.length) return [];

    // Distinct clusters
    const uniqueClusters = Array.from(new Set(currentLabels)).sort((a, b) => a - b);
    
    // Palette for distinct clusters
    const colorPalette = [
      '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6', '#d946ef'
    ];

    if (activeVizMode === 'pca3d' && proj.pca_3d) {
      const p3 = proj.pca_3d;
      return uniqueClusters.map((c, i) => {
        const mask = currentLabels.map((l, idx) => (l === c ? idx : -1)).filter((idx) => idx !== -1);
        const name = c === -1 ? 'Noise / Outlier' : colorByGroundTruth ? `Class ${c}` : `Cluster ${c}`;
        return {
          x: mask.map((idx) => p3.x[idx]),
          y: mask.map((idx) => p3.y[idx]),
          z: mask.map((idx) => p3.z[idx]),
          mode: 'markers',
          type: 'scatter3d',
          name,
          marker: {
            size: 3.5,
            color: c === -1 ? '#94a3b8' : colorPalette[i % colorPalette.length],
            opacity: 0.85
          }
        };
      });
    }

    let source = proj.pca_2d;
    if (activeVizMode === 'tsne' && proj.tsne_2d) source = proj.tsne_2d;
    if (activeVizMode === 'umap' && proj.umap_proxy_2d) source = proj.umap_proxy_2d;

    if (!source || !source.x) return [];

    return uniqueClusters.map((c, i) => {
      const mask = currentLabels.map((l, idx) => (l === c ? idx : -1)).filter((idx) => idx !== -1);
      const name = c === -1 ? 'Noise / Outlier' : colorByGroundTruth ? `Class ${c}` : `Cluster ${c}`;
      return {
        x: mask.map((idx) => source.x[idx]),
        y: mask.map((idx) => source.y[idx]),
        mode: 'markers',
        type: 'scatter',
        name,
        marker: {
          size: 6,
          color: c === -1 ? '#94a3b8' : colorPalette[i % colorPalette.length],
          opacity: 0.8
        }
      };
    });
  };

  const metrics = runResult?.metrics || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Algorithm Selector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-500" />
              Interactive Algorithm Lab & Parameter Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select any of the 9 clustering algorithms, tune hyperparameters in real-time, and explore 2D/3D manifolds.
            </p>
          </div>

          <button
            onClick={runAlgorithm}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 transition disabled:opacity-60"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Clustering...' : 'Execute Clustering'}</span>
          </button>
        </div>

        {/* Algorithm Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          {[
            { id: 'kmeans', name: 'K-Means' },
            { id: 'kmedoids', name: 'K-Medoids' },
            { id: 'dbscan', name: 'DBSCAN' },
            { id: 'hierarchical', name: 'Hierarchical' },
            { id: 'agglomerative', name: 'Agglomerative' },
            { id: 'spectral', name: 'Spectral' },
            { id: 'meanshift', name: 'Mean Shift' },
            { id: 'gmm', name: 'GMM' },
            { id: 'fuzzy_cmeans', name: 'Fuzzy C-Means' }
          ].map((alg) => (
            <button
              key={alg.id}
              onClick={() => setSelectedAlg(alg.id)}
              className={`py-2 px-1 text-center font-semibold rounded-lg transition-all ${
                selectedAlg === alg.id
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {alg.name}
            </button>
          ))}
        </div>

        {/* Dynamic Hyperparameter Tuning Panel */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Cluster Count Slider */}
          {['kmeans', 'kmedoids', 'hierarchical', 'agglomerative', 'spectral', 'gmm', 'fuzzy_cmeans'].includes(selectedAlg) && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Cluster Count (k)</span>
                <span className="font-mono text-sky-500 font-bold">{kClusters}</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                value={kClusters}
                onChange={(e) => setKClusters(e.target.value)}
                className="w-full accent-sky-500"
              />
            </div>
          )}

          {/* DBSCAN Eps */}
          {selectedAlg === 'dbscan' && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Epsilon (eps)</span>
                  <span className="font-mono text-sky-500 font-bold">{dbscanEps}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={dbscanEps}
                  onChange={(e) => setDbscanEps(e.target.value)}
                  className="w-full accent-sky-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Min Samples (MinPts)</span>
                  <span className="font-mono text-sky-500 font-bold">{dbscanMinSamples}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={dbscanMinSamples}
                  onChange={(e) => setDbscanMinSamples(e.target.value)}
                  className="w-full accent-sky-500"
                />
              </div>
            </>
          )}

          {/* Linkage for Hierarchical & Agglomerative */}
          {['hierarchical', 'agglomerative'].includes(selectedAlg) && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Linkage Criterion
              </label>
              <select
                value={linkageMethod}
                onChange={(e) => setLinkageMethod(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="ward">Ward (Variance Minimization)</option>
                <option value="complete">Complete (Max Distance)</option>
                <option value="average">Average (Mean Distance)</option>
                <option value="single">Single (Min Distance)</option>
              </select>
            </div>
          )}

          {/* GMM Covariance */}
          {selectedAlg === 'gmm' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Covariance Type
              </label>
              <select
                value={covType}
                onChange={(e) => setCovType(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="full">Full (Unconstrained Ellipsoid)</option>
                <option value="tied">Tied (Identical Covariance)</option>
                <option value="diag">Diag (Axis-Aligned Diagonal)</option>
                <option value="spherical">Spherical (Isotropic)</option>
              </select>
            </div>
          )}

          {/* Fuzzy C-Means Fuzziness */}
          {selectedAlg === 'fuzzy_cmeans' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Fuzziness (m)</span>
                <span className="font-mono text-sky-500 font-bold">{fuzziness}</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="3.5"
                step="0.1"
                value={fuzziness}
                onChange={(e) => setFuzziness(e.target.value)}
                className="w-full accent-sky-500"
              />
            </div>
          )}

          {/* MeanShift Bandwidth */}
          {selectedAlg === 'meanshift' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kernel Bandwidth (Blank = Auto)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Auto-estimated"
                value={bandwidth}
                onChange={(e) => setBandwidth(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Silhouette Score</div>
          <div className="text-lg font-extrabold text-sky-600 dark:text-sky-400 font-mono">
            {metrics.silhouette_score !== null ? metrics.silhouette_score : 'N/A'}
          </div>
          <div className="text-[9.5px] text-slate-400">[-1, 1] Higher is better</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Davies-Bouldin</div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.davies_bouldin_index !== null ? metrics.davies_bouldin_index : 'N/A'}
          </div>
          <div className="text-[9.5px] text-slate-400">Lower is better</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Calinski-Harabasz</div>
          <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {metrics.calinski_harabasz_score !== null ? metrics.calinski_harabasz_score : 'N/A'}
          </div>
          <div className="text-[9.5px] text-slate-400">Variance ratio</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Cluster Purity</div>
          <div className="text-lg font-extrabold text-amber-500 font-mono">
            {metrics.purity !== null ? `${(metrics.purity * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-[9.5px] text-slate-400">Ground truth match</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5">Clusters Found</div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {metrics.n_clusters ?? 'N/A'}
          </div>
          <div className="text-[9.5px] text-slate-400">
            {metrics.n_noise_points ? `${metrics.n_noise_points} noise pts` : 'No noise'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-500" /> Latency
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {metrics.execution_time_ms} ms
          </div>
          <div className="text-[9.5px] text-slate-400">CPU execution time</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-emerald-500" /> Peak Memory
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {metrics.memory_kb} KB
          </div>
          <div className="text-[9.5px] text-slate-400">RAM allocation</div>
        </div>
      </div>

      {/* Main Visualizations Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Plot (2D/3D PCA & t-SNE) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                Cluster Manifold Projection ({activeVizMode.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive rotation, zoom, hover inspections, and cluster membership tracking.
              </p>
            </div>

            {/* Projection Mode Switcher & Ground Truth Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                <button
                  onClick={() => setActiveVizMode('pca2d')}
                  className={`px-2 py-1 rounded ${activeVizMode === 'pca2d' ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs' : 'text-slate-500'}`}
                >
                  PCA 2D
                </button>
                <button
                  onClick={() => setActiveVizMode('pca3d')}
                  className={`px-2 py-1 rounded ${activeVizMode === 'pca3d' ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs' : 'text-slate-500'}`}
                >
                  PCA 3D
                </button>
                <button
                  onClick={() => setActiveVizMode('tsne')}
                  className={`px-2 py-1 rounded ${activeVizMode === 'tsne' ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs' : 'text-slate-500'}`}
                >
                  t-SNE
                </button>
                <button
                  onClick={() => setActiveVizMode('umap')}
                  className={`px-2 py-1 rounded ${activeVizMode === 'umap' ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs' : 'text-slate-500'}`}
                >
                  UMAP
                </button>
              </div>

              {proj?.ground_truth && (
                <button
                  onClick={() => setColorByGroundTruth(!colorByGroundTruth)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    colorByGroundTruth
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {colorByGroundTruth ? 'Showing Ground Truth' : 'Color Ground Truth'}
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-96">
            <PlotlyChart
              data={getScatterPlotData()}
              layout={{
                scene: {
                  xaxis: { title: 'Principal Component 1' },
                  yaxis: { title: 'Principal Component 2' },
                  zaxis: { title: 'Principal Component 3' }
                },
                xaxis: { title: 'Dimension 1', zeroline: false },
                yaxis: { title: 'Dimension 2', zeroline: false },
                legend: { orientation: 'h', y: -0.15 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Cluster Size Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-emerald-500" />
              Cluster Size Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Number of samples assigned to each cluster partition.
            </p>

            <div className="w-full h-64">
              <PlotlyChart
                data={[
                  {
                    x: (runResult?.distribution?.distribution || []).map((d) => d.name),
                    y: (runResult?.distribution?.distribution || []).map((d) => d.count),
                    type: 'bar',
                    marker: {
                      color: '#0284c7',
                      opacity: 0.85
                    }
                  }
                ]}
                layout={{
                  xaxis: { title: 'Cluster Identity' },
                  yaxis: { title: 'Sample Count' },
                  margin: { l: 40, r: 20, t: 20, b: 50 }
                }}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
            <table className="w-full text-[11px] font-mono text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-1">Cluster</th>
                  <th className="py-1 text-right">Count</th>
                  <th className="py-1 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(runResult?.distribution?.distribution || []).map((d) => (
                  <tr key={d.cluster}>
                    <td className="py-1 text-slate-700 dark:text-slate-300">{d.name}</td>
                    <td className="py-1 text-right font-bold text-slate-900 dark:text-white">{d.count}</td>
                    <td className="py-1 text-right text-slate-500">{d.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
