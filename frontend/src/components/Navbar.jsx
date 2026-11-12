import React from 'react';
import { Sparkles, Moon, Sun, Download, FileText, Database, Activity, Check, Zap } from 'lucide-react';
import Tooltip from './Tooltip';

export default function Navbar({
  darkMode,
  setDarkMode,
  activeDataset,
  onDownloadPdf,
  onDownloadCsv,
  isBenchmarking
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-white/[0.08] bg-white/75 dark:bg-[#0c1021]/80 backdrop-blur-xl px-5 sm:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Cluster<span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Bench</span>
              </span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                AI LAB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium tracking-wide">
              High-Dimensional Clustering & Topology Studio
            </p>
          </div>
        </div>

        {/* Center: Active Dataset Chip with Live Heartbeat */}
        <Tooltip
          title={`Active Dataset: ${activeDataset?.name || 'Mushroom (UCI)'}`}
          content={activeDataset?.description || 'Preloaded benchmark dataset for clustering comparison.'}
          position="bottom"
          width="w-72"
        >
          <div className="cursor-pointer hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-900/70 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/[0.08] text-xs transition-all shadow-xs group">
            <Database className="w-3.5 h-3.5 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {activeDataset?.name || 'Mushroom (UCI)'}
            </span>
            <span className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500">
              ({activeDataset?.num_rows?.toLocaleString()} × {activeDataset?.num_cols})
            </span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        </Tooltip>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick PDF Report Export */}
          <Tooltip
            title="Download PDF Report"
            content="Instantly generate an executive PDF report containing methodology, benchmark metrics, and complexity taxonomy."
            position="bottom"
            width="w-56"
          >
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-rose-500/40 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </Tooltip>

          {/* Quick CSV Export */}
          <Tooltip
            title="Export CSV Metrics"
            content="Download raw tabular metrics for all 9 algorithms (Silhouette, DB, Calinski, Purity, Latency, RAM)."
            position="bottom"
            width="w-56"
          >
            <button
              onClick={onDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </Tooltip>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/40 transition cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
