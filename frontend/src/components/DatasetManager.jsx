import React, { useState, useEffect } from 'react';
import {
  Upload,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Tooltip from './Tooltip';

export default function DatasetManager({
  datasets,
  activeDatasetId,
  setActiveDatasetId,
  onUploadSuccess,
  onPreprocessingDone,
  isPreprocessing,
  setIsPreprocessing
}) {
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Preprocessing options
  const [missingStrategy, setMissingStrategy] = useState('most_frequent');
  const [encodingStrategy, setEncodingStrategy] = useState('one_hot');
  const [scalingMethod, setScalingMethod] = useState('standard');
  const [outlierMethod, setOutlierMethod] = useState('none');
  const [contamination, setContamination] = useState(0.05);
  const [featureSelection, setFeatureSelection] = useState('none');
  const [pcaComponents, setPcaComponents] = useState(10);
  const [kBest, setKBest] = useState(10);
  const [subsampleLimit, setSubsampleLimit] = useState(2500);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    if (!activeDatasetId) return;
    setLoadingPreview(true);
    fetch(`/api/datasets/${activeDatasetId}/preview`)
      .then((res) => res.json())
      .then((data) => {
        setPreview(data);
        setLoadingPreview(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error('Error fetching preview:', err);
        setLoadingPreview(false);
      });
  }, [activeDatasetId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      onUploadSuccess(data.dataset_id);
      setActiveDatasetId(data.dataset_id);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApplyPreprocessing = async () => {
    setIsPreprocessing(true);
    try {
      const payload = {
        dataset_id: activeDatasetId,
        missing_strategy: missingStrategy,
        encoding_strategy: encodingStrategy,
        scaling_method: scalingMethod,
        outlier_method: outlierMethod,
        contamination: parseFloat(contamination),
        feature_selection: featureSelection,
        pca_components: parseInt(pcaComponents),
        k_best: parseInt(kBest),
        subsample_limit: parseInt(subsampleLimit)
      };

      const res = await fetch('/api/preprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Preprocessing failed');
      onPreprocessingDone(data);
    } catch (err) {
      alert(`Preprocessing failed: ${err.message}`);
    } finally {
      setIsPreprocessing(false);
    }
  };

  const summary = preview?.summary || {};
  const previewRows = preview?.preview_data || [];
  const columns = preview?.columns || [];

  const filteredRows = previewRows.filter((row) =>
    columns.some((col) =>
      String(row[col] ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Dataset Selector */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-500" />
              Dataset Selector
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Choose a preloaded benchmark or upload a custom CSV, Excel, or ARFF file.
            </p>
          </div>

          {/* Upload Button */}
          <div>
            <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-sm transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadLoading ? 'Uploading...' : 'Upload Dataset'}</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.arff"
                onChange={handleFileUpload}
                disabled={uploadLoading}
                className="hidden"
              />
            </label>
            {uploadError && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Dataset Choice Cards with Hover Tooltips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {datasets.map((ds) => {
            const isSelected = activeDatasetId === ds.id;
            return (
              <Tooltip
                key={ds.id}
                title={ds.name}
                content={ds.description}
                position="top"
                width="w-72"
              >
                <div
                  onClick={() => setActiveDatasetId(ds.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/10 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white capitalize">
                      {ds.name.split('(')[0].trim()}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {ds.num_rows?.toLocaleString()} rows
                    </span>
                    <span>•</span>
                    <span>{ds.num_cols} features</span>
                    <span>•</span>
                    <span className="text-sky-500 font-bold">k = {ds.default_k}</span>
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Dataset Statistics Matrix */}
      {preview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Samples (N)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {summary.num_rows?.toLocaleString()}
            </div>
            <div className="text-[10.5px] text-slate-400">Total instances</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dimensions (D)</div>
            <div className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5">
              {summary.num_cols}
            </div>
            <div className="text-[10.5px] text-slate-400">Input attributes</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Missing Values</div>
            <div className={`text-xl font-black font-mono mt-0.5 ${summary.total_missing_cells > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {summary.total_missing_cells}
            </div>
            <div className="text-[10.5px] text-slate-400">{summary.total_missing_cells > 0 ? 'Imputation applied' : 'Complete matrix'}</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ground Truth</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate mt-1">
              {summary.detected_target || 'None (Unsupervised)'}
            </div>
            <div className="text-[10.5px] text-slate-400">
              {summary.detected_target ? 'Purity & ARI active' : 'Internal validation'}
            </div>
          </div>
        </div>
      )}

      {/* Preprocessing Controls Configuration */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-500" />
              Preprocessing Pipeline
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Hover over step labels for advice on categorical data, scalers, and outlier handling.
            </p>
          </div>

          <button
            onClick={handleApplyPreprocessing}
            disabled={isPreprocessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 transition disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPreprocessing ? 'animate-spin' : ''}`} />
            <span>{isPreprocessing ? 'Applying Pipeline...' : 'Apply Pipeline'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Missing Values */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Missing Values
              </label>
              <Tooltip
                title="Missing Value Handling"
                content="Mode imputation is recommended for categorical data (e.g. Mushroom, Soybean) to preserve discrete states."
                position="top"
              >
                <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-sky-500" />
              </Tooltip>
            </div>
            <select
              value={missingStrategy}
              onChange={(e) => setMissingStrategy(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="most_frequent">Most Frequent (Mode - Categorical default)</option>
              <option value="mean">Mean (Continuous variables)</option>
              <option value="median">Median (Skew-resistant)</option>
              <option value="drop_rows">Drop Incomplete Rows</option>
              <option value="constant">Constant (Zero)</option>
            </select>
          </div>

          {/* Categorical Encoding */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Categorical Encoding
              </label>
              <Tooltip
                title="Encoding Strategy"
                content="One-Hot encoding prevents artificial numeric ordering in nominal attributes by projecting them into orthogonal binary spaces."
                position="top"
              >
                <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-sky-500" />
              </Tooltip>
            </div>
            <select
              value={encodingStrategy}
              onChange={(e) => setEncodingStrategy(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="one_hot">One-Hot Encoding (Binary vectors)</option>
              <option value="label">Label Encoding (Ordinal numbers)</option>
            </select>
          </div>

          {/* Feature Scaling */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Feature Scaling
              </label>
              <Tooltip
                title="Feature Normalization"
                content="StandardScaler centers features to μ=0, σ=1, preventing high-variance attributes from skewing Euclidean distances."
                position="top"
              >
                <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-sky-500" />
              </Tooltip>
            </div>
            <select
              value={scalingMethod}
              onChange={(e) => setScalingMethod(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="standard">StandardScaler (Mean = 0, Var = 1)</option>
              <option value="minmax">MinMaxScaler (Range [0, 1])</option>
              <option value="robust">RobustScaler (Median & IQR)</option>
              <option value="none">No Scaling (Raw values)</option>
            </select>
          </div>

          {/* Outlier Detection */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                4. Outlier Filter
              </label>
              <Tooltip
                title="Anomaly Mitigation"
                content="Isolation Forest separates spatial anomalies via random binary partitioning trees, stabilizing centroid convergence."
                position="top"
              >
                <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-sky-500" />
              </Tooltip>
            </div>
            <select
              value={outlierMethod}
              onChange={(e) => setOutlierMethod(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="none">None (Keep all points)</option>
              <option value="isolation_forest">Isolation Forest (Tree-based)</option>
              <option value="lof">Local Outlier Factor (Density)</option>
              <option value="zscore">Z-Score (|z| &gt; 3.5)</option>
            </select>
          </div>

          {/* Feature Selection */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                5. Feature Selection
              </label>
              <Tooltip
                title="Dimensionality Reduction"
                content="PCA projects high-dimensional correlated features into orthogonal principal axes preserving maximal variance."
                position="top"
              >
                <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-sky-500" />
              </Tooltip>
            </div>
            <select
              value={featureSelection}
              onChange={(e) => setFeatureSelection(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="none">Retain All Features</option>
              <option value="variance">Variance Threshold (Remove constants)</option>
              <option value="pca">Principal Component Analysis (PCA)</option>
              <option value="kbest">SelectKBest (ANOVA F-Test)</option>
            </select>
          </div>

          {/* Max Samples */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>6. Max Sample Limit</span>
              <span className="font-mono text-sky-500">{subsampleLimit} rows</span>
            </div>
            <input
              type="range"
              min="500"
              max="8124"
              step="500"
              value={subsampleLimit}
              onChange={(e) => setSubsampleLimit(e.target.value)}
              className="w-full accent-sky-500 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Raw Data Table Explorer */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Matrix Preview
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              ({filteredRows.length} instances filtered)
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 w-56"
            />
          </div>
        </div>

        {loadingPreview ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-sky-500" />
            Loading preview...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
              <table className="w-full text-[11px] text-left border-collapse font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3 text-slate-400">#</th>
                    {columns.map((col) => (
                      <th key={col} className="py-2 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[10.5px]">
                  {paginatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-1.5 px-3 text-slate-400">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                      {columns.map((col) => (
                        <td
                          key={col}
                          className={`py-1.5 px-3 whitespace-nowrap ${
                            col === summary.detected_target
                              ? 'font-bold text-sky-600 dark:text-sky-400 bg-sky-50/40 dark:bg-sky-950/20'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
