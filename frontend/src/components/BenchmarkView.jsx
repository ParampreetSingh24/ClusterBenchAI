import React, { useState } from 'react';
import {
  BarChart3,
  Play,
  SlidersHorizontal,
  Award,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';

export default function BenchmarkView({
  activeDatasetId,
  isDark,
  benchmarkData,
  onRunBenchmark,
  isBenchmarking
}) {
  const [sortField, setSortField] = useState('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [nClusters, setNClusters] = useState(3);
  const [showWeightsModal, setShowWeightsModal] = useState(false);

  // Custom MCDM weights
  const [weights, setWeights] = useState({
    silhouette: 0.30,
    davies_bouldin: 0.20,
    calinski_harabasz: 0.15,
    purity: 0.20,
    time_efficiency: 0.15
  });

  const rankedResults = benchmarkData?.ranked_results || [];

  const handleRun = () => {
    onRunBenchmark({
      n_clusters: parseInt(nClusters),
      metric_weights: weights
    });
  };

  // Sorting
  const sortedResults = [...rankedResults].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (a.metrics && a.metrics[sortField] !== undefined) aVal = a.metrics[sortField];
    if (b.metrics && b.metrics[sortField] !== undefined) bVal = b.metrics[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleHeaderSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for metrics
    }
  };

  // Construct Multi-Metric Radar Chart for Top 4 Algorithms
  const top4 = rankedResults.slice(0, 4);
  const radarCategories = ['Silhouette', 'Compactness (1/DB)', 'Calinski-H (Log)', 'Purity', 'Speed (Efficiency)'];
  
  const getRadarData = () => {
    if (!top4.length) return [];
    
    return top4.map((alg) => {
      const m = alg.metrics || {};
      const sil = Math.max(0, m.silhouette_score ?? 0);
      const db = m.davies_bouldin_index ? Math.min(1, 1 / m.davies_bouldin_index) : 0.5;
      const ch = m.calinski_harabasz_score ? Math.min(1, Math.log10(m.calinski_harabasz_score + 1) / 4) : 0.5;
      const pur = m.purity ?? 0.5;
      const speed = m.execution_time_ms ? Math.min(1, 100 / Math.max(1, m.execution_time_ms)) : 0.5;

      return {
        type: 'scatterpolar',
        r: [sil, db, ch, pur, speed],
        theta: radarCategories,
        fill: 'toself',
        name: alg.algorithm,
        opacity: 0.6
      };
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Benchmark Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500" />
              Comparative Clustering Benchmark Suite
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Simultaneously executes and ranks all 9 algorithms against internal validity and ground-truth metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Cluster count input */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500">Clusters (k):</span>
              <input
                type="number"
                min="2"
                max="15"
                value={nClusters}
                onChange={(e) => setNClusters(e.target.value)}
                className="w-12 bg-white dark:bg-slate-900 font-mono font-bold text-center px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Customize MCDM weights */}
            <button
              onClick={() => setShowWeightsModal(!showWeightsModal)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
              <span>Weights</span>
            </button>

            {/* Run Full Benchmark Button */}
            <button
              onClick={handleRun}
              disabled={isBenchmarking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 transition disabled:opacity-60"
            >
              <Play className={`w-4 h-4 fill-current ${isBenchmarking ? 'animate-spin' : ''}`} />
              <span>{isBenchmarking ? 'Benchmarking All 9...' : 'Run 9-Algorithm Benchmark'}</span>
            </button>
          </div>
        </div>

        {/* Weights Drawer / Panel */}
        {showWeightsModal && (
          <div className="p-4 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Silhouette</span>
                <span>{(weights.silhouette * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={weights.silhouette}
                onChange={(e) => setWeights({ ...weights, silhouette: parseFloat(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Davies-Bouldin</span>
                <span>{(weights.davies_bouldin * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.davies_bouldin}
                onChange={(e) => setWeights({ ...weights, davies_bouldin: parseFloat(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Calinski-H</span>
                <span>{(weights.calinski_harabasz * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={weights.calinski_harabasz}
                onChange={(e) => setWeights({ ...weights, calinski_harabasz: parseFloat(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Purity</span>
                <span>{(weights.purity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.purity}
                onChange={(e) => setWeights({ ...weights, purity: parseFloat(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Speed</span>
                <span>{(weights.time_efficiency * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={weights.time_efficiency}
                onChange={(e) => setWeights({ ...weights, time_efficiency: parseFloat(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Comparative Ranking Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Complete Comparative Benchmark Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any column header to sort algorithms. Badges highlight top separation, purity, and speed.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {rankedResults.length} Algorithms Evaluated
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => handleHeaderSort('rank')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('algorithm')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  Algorithm
                </th>
                <th
                  onClick={() => handleHeaderSort('composite_score')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Score (0-100)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('silhouette_score')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Silhouette ↑</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('davies_bouldin_index')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Davies-B ↓</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('calinski_harabasz_score')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Calinski ↑</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('purity')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Purity ↑</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort('execution_time_ms')}
                  className="py-3 px-3 cursor-pointer hover:text-sky-500"
                >
                  <div className="flex items-center gap-1">
                    <span>Time (ms)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Badges & Accolades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {sortedResults.map((item) => {
                const m = item.metrics || {};
                const isChampion = item.rank === 1;
                return (
                  <tr
                    key={item.algorithm}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                      isChampion ? 'bg-sky-50/40 dark:bg-sky-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        item.rank === 1 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                        item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                        item.rank === 3 ? 'bg-amber-600 text-white' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">
                      {item.algorithm}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">
                      {item.composite_score?.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {m.silhouette_score !== null ? m.silhouette_score.toFixed(3) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {m.davies_bouldin_index !== null ? m.davies_bouldin_index.toFixed(3) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {m.calinski_harabasz_score !== null ? m.calinski_harabasz_score.toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {m.purity !== null ? `${(m.purity * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {m.execution_time_ms !== null ? `${m.execution_time_ms.toFixed(1)} ms` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 font-sans">
                        {(item.badges || []).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Metric Radar Chart & Grouped Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            Multi-Metric Radar Comparison (Top 4 Algorithms)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Normalized spider chart evaluating Silhouette, Compactness, Calinski Dispersion, Purity, and Speed.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={getRadarData()}
              layout={{
                polar: {
                  radialaxis: {
                    visible: true,
                    range: [0, 1]
                  }
                },
                margin: { l: 40, r: 40, t: 20, b: 30 }
              }}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Execution Time vs Silhouette Score Comparison */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Silhouette Quality vs. Computational Latency
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Trade-off curve between cluster separation quality and wall-clock execution time.
          </p>

          <div className="w-full h-80">
            <PlotlyChart
              data={[
                {
                  x: rankedResults.map((r) => r.metrics?.execution_time_ms ?? 0),
                  y: rankedResults.map((r) => r.metrics?.silhouette_score ?? 0),
                  text: rankedResults.map((r) => r.algorithm),
                  mode: 'markers+text',
                  textposition: 'top center',
                  type: 'scatter',
                  marker: {
                    size: 10,
                    color: '#0284c7',
                    opacity: 0.85
                  }
                }
              ]}
              layout={{
                xaxis: { title: 'Execution Latency (ms)' },
                yaxis: { title: 'Silhouette Score' },
                margin: { l: 50, r: 30, t: 20, b: 40 }
              }}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
