import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  Download,
  Copy,
  Check,
  Award,
  Sparkles,
  BookOpen,
  Database
} from 'lucide-react';

export default function ReportExportCenter({
  activeDatasetId,
  benchmarkData,
  onDownloadPdf,
  onDownloadCsv,
  onDownloadClustered
}) {
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const bibtexCode = `@misc{clusterbench2026,
  title={ClusterBenchAI: Comprehensive Clustering Benchmark on ${activeDatasetId || 'Mushroom'}},
  author={Vansh},
  howpublished={Personal ML Project},
  year={2026}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCode);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const rankedResults = benchmarkData?.ranked_results || [];
  const winner = rankedResults[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileDown className="w-5 h-5 text-sky-500" />
          Benchmark Report & Data Export Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Export comprehensive benchmark PDF reports, raw metrics CSV, or partitioned dataset CSVs.
        </p>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Download */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Comprehensive PDF Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Complete summary containing project overview, dataset specifications, complete benchmark table, AI discussion, and asymptotic complexity matrix.
            </p>
          </div>

          <button
            onClick={onDownloadPdf}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* CSV Benchmark Metrics Download */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Benchmark Metrics CSV
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Full tabular metrics matrix for all 9 algorithms: Silhouette scores, Davies-Bouldin, Calinski-Harabasz, Inertia, Purity, ARI, NMI, runtime latency, and peak memory.
            </p>
          </div>

          <button
            onClick={onDownloadCsv}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition"
          >
            <FileText className="w-4 h-4" />
            <span>Download Metrics CSV</span>
          </button>
        </div>

        {/* Clustered Dataset CSV */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Clustered Dataset CSV
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Export the underlying dataset augmented with assigned cluster labels from the #1 ranked winning algorithm ({winner?.algorithm || 'K-Means'}) and 2D PCA coordinates.
            </p>
          </div>

          <button
            onClick={onDownloadClustered}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 transition"
          >
            <Database className="w-4 h-4" />
            <span>Download Clustered CSV</span>
          </button>
        </div>
      </div>

      {/* BibTeX Citation Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              BibTeX Citation Generator
            </h3>
          </div>
          <button
            onClick={handleCopyBibtex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBibtex ? 'Copied to Clipboard' : 'Copy Citation'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-sky-400 text-xs font-mono overflow-x-auto border border-slate-800">
          {bibtexCode}
        </pre>
      </div>
    </div>
  );
}
