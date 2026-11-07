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
  Sparkles
} from 'lucide-react';

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

  // Preprocessing options state
  const [missingStrategy, setMissingStrategy] = useState('most_frequent');
  const [encodingStrategy, setEncodingStrategy] = useState('one_hot');
  const [scalingMethod, setScalingMethod] = useState('standard');
  const [outlierMethod, setOutlierMethod] = useState('none');
  const [contamination, setContamination] = useState(0.05);
  const [featureSelection, setFeatureSelection] = useState('none');
  const [pcaComponents, setPcaComponents] = useState(10);
  const [kBest, setKBest] = useState(10);
  const [subsampleLimit, setSubsampleLimit] = useState(2500);

  // Fetch dataset preview whenever activeDatasetId changes
  useEffect(() => {
    if (!activeDatasetId) return;
    setLoadingPreview(true);
    fetch(`/api/datasets/${activeDatasetId}/preview`)
      .then((res) => res.json())
      .then((data) => {
        setPreview(data);
        setLoadingPreview(false);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Dataset Selector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-500" />
              Dataset Manager & Preprocessing Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select built-in benchmark datasets or upload custom CSV, Excel, or ARFF data files.
            </p>
          </div>

          {/* File Upload Button */}
          <div>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-sm transition">
              <Upload className="w-4 h-4" />
              <span>{uploadLoading ? 'Uploading...' : 'Upload Dataset (CSV/XLSX/ARFF)'}</span>
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

        {/* Dataset Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {datasets.map((ds) => {
            const isSelected = activeDatasetId === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => setActiveDatasetId(ds.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white capitalize">
                    {ds.name}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {ds.description}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>{ds.num_rows?.toLocaleString()} rows</span>
                  <span>•</span>
                  <span>{ds.num_cols} cols</span>
                  <span>•</span>
                  <span>k = {ds.default_k}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Statistics Panel */}
      {preview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">Total Instances (N)</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {summary.num_rows?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Data observations</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">Feature Dimension (D)</div>
            <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
              {summary.num_cols}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Attributes / measurements</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">Missing Cells</div>
            <div className={`text-xl font-extrabold font-mono ${summary.total_missing_cells > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {summary.total_missing_cells}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Requiring imputation</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">Ground Truth Class</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
              {summary.detected_target || 'None (Unsupervised)'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {summary.detected_target ? 'Purity & ARI enabled' : 'Internal validation only'}
            </div>
          </div>
        </div>
      )}

      {/* Preprocessing Controls Configuration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-500" />
              Interactive Data Preprocessing Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure imputation, encoding, feature scaling, outlier filtering, and dimensionality selection.
            </p>
          </div>
          <button
            onClick={handleApplyPreprocessing}
            disabled={isPreprocessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPreprocessing ? 'animate-spin' : ''}`} />
            <span>{isPreprocessing ? 'Processing Pipeline...' : 'Apply Preprocessing'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Missing Value Handling */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              1. Missing Value Imputation
            </label>
            <select
              value={missingStrategy}
              onChange={(e) => setMissingStrategy(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="most_frequent">Most Frequent (Mode - Recommended for Categorical)</option>
              <option value="mean">Mean (Continuous Attributes)</option>
              <option value="median">Median (Robust to Skewness)</option>
              <option value="drop_rows">Drop Incomplete Rows</option>
              <option value="constant">Constant (Zero / 'missing')</option>
            </select>
          </div>

          {/* Categorical Encoding */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              2. Categorical Encoding
            </label>
            <select
              value={encodingStrategy}
              onChange={(e) => setEncodingStrategy(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="one_hot">One-Hot Encoding (Binary Sparsity)</option>
              <option value="label">Label Encoding (Ordinal Integers)</option>
            </select>
          </div>

          {/* Feature Scaling */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              3. Feature Normalization / Scaling
            </label>
            <select
              value={scalingMethod}
              onChange={(e) => setScalingMethod(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="standard">StandardScaler (Zero Mean, Unit Variance)</option>
              <option value="minmax">MinMaxScaler (Range [0, 1])</option>
              <option value="robust">RobustScaler (Median & IQR)</option>
              <option value="none">No Scaling (Raw Scale)</option>
            </select>
          </div>

          {/* Outlier Detection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              4. Outlier Detection & Removal
            </label>
            <select
              value={outlierMethod}
              onChange={(e) => setOutlierMethod(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="none">None (Keep all instances)</option>
              <option value="isolation_forest">Isolation Forest (Tree-Based)</option>
              <option value="lof">Local Outlier Factor (LOF Density)</option>
              <option value="zscore">Z-Score Filtering (|z| &gt; 3.5)</option>
            </select>
          </div>

          {/* Feature Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              5. Dimensionality & Feature Selection
            </label>
            <select
              value={featureSelection}
              onChange={(e) => setFeatureSelection(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="none">All Extracted Features</option>
              <option value="variance">Variance Threshold (Remove Constant)</option>
              <option value="pca">Principal Component Analysis (PCA)</option>
              <option value="kbest">SelectKBest (ANOVA F-Test)</option>
            </select>
          </div>

          {/* Subsample Limit for responsiveness */}
          <div className="space-y-1.5">
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
              className="w-full accent-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Raw Data Table Explorer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Raw Dataset Explorer (First 50 Rows)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect attribute values, nominal codes, and class ground-truth distributions.
            </p>
          </div>

          {/* Search Table */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter instances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-64"
            />
          </div>
        </div>

        {loadingPreview ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
            Loading dataset instances...
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-mono text-slate-400">#</th>
                  {columns.map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredRows.slice(0, 50).map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-2 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className={`py-2 px-3 whitespace-nowrap ${
                          col === summary.detected_target
                            ? 'font-bold text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
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
        )}
      </div>
    </div>
  );
}
