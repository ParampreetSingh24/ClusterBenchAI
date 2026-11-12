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
  Database,
  Info,
  CheckCircle2
} from 'lucide-react';
import Tooltip from './Tooltip';

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Export & Reporting Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate formatted PDF reports, raw metrics tables, and partitioned clustered datasets
            </p>
          </div>
        </div>

        {winner && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Top Model:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {winner.algorithm} ({winner.composite_score?.toFixed(1)}/100)
            </span>
          </div>
        )}
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Report Card */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between hover:border-rose-500/40 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                .PDF
              </span>
              <Tooltip
                title="ReportLab Generated PDF"
                content="Includes project overview, dataset dimensions, 9-algorithm benchmark table, mathematical formulation discussion, and asymptotic complexity matrix."
                position="left"
              >
                <Info className="w-4 h-4 text-slate-400 hover:text-rose-500 cursor-pointer transition" />
              </Tooltip>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Executive Benchmark Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Multi-page PDF complete with methodology, evaluation tables, and AI discussion.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Dataset Summary
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                All 9 Algorithms
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Big-O Complexity
              </span>
            </div>
          </div>

          <button
            onClick={onDownloadPdf}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* CSV Metrics Card */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                .CSV
              </span>
              <Tooltip
                title="Tabular Evaluation Metrics"
                content="Complete benchmark results for all 9 algorithms: Silhouette, Davies-Bouldin, Calinski-Harabasz, Inertia, Purity, ARI, NMI, runtime latency, and peak RAM."
                position="left"
              >
                <Info className="w-4 h-4 text-slate-400 hover:text-emerald-500 cursor-pointer transition" />
              </Tooltip>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Benchmark Metrics Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Raw tabular data formatted for spreadsheet analysis or Python ingestion.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Silhouette & DB
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Purity & ARI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Latency & RAM
              </span>
            </div>
          </div>

          <button
            onClick={onDownloadCsv}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Download Metrics CSV</span>
          </button>
        </div>

        {/* Clustered Dataset CSV Card */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                .CSV + PCA
              </span>
              <Tooltip
                title="Augmented Dataset"
                content="Raw features enriched with the top-ranking algorithm's cluster assignment and 2D Principal Component projections (PCA_1, PCA_2)."
                position="left"
              >
                <Info className="w-4 h-4 text-slate-400 hover:text-cyan-500 cursor-pointer transition" />
              </Tooltip>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Clustered Dataset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Original dataset augmented with assigned cluster labels and 2D PCA projections.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Raw Attributes
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                Cluster Label
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-mono">
                PCA_1 & PCA_2
              </span>
            </div>
          </div>

          <button
            onClick={onDownloadClustered}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Download Clustered CSV</span>
          </button>
        </div>
      </div>

      {/* BibTeX Citation Box */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Project Citation Key (BibTeX)
            </h3>
          </div>
          <button
            onClick={handleCopyBibtex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBibtex ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>

        <pre className="p-3.5 rounded-xl bg-slate-950 text-sky-400 text-xs font-mono overflow-x-auto border border-slate-800">
          {bibtexCode}
        </pre>
      </div>
    </div>
  );
}
