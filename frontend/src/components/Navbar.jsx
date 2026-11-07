import React from 'react';
import { Sparkles, Moon, Sun, Download, FileText, Database, ShieldCheck } from 'lucide-react';

export default function Navbar({
  darkMode,
  setDarkMode,
  activeDataset,
  onDownloadPdf,
  onDownloadCsv,
  isBenchmarking
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Brand & Academic Badges */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ClusterBench<span className="text-sky-500">AI</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                ML Platform
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Multi-Paradigm Clustering Analysis & Benchmarking Platform
            </p>
          </div>
        </div>

        {/* Center: Active Dataset Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <Database className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-slate-500 dark:text-slate-400">Active Dataset:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
            {activeDataset?.name || 'Mushroom (UCI)'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>

        {/* Right Actions: Reports & Dark Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Download PDF Benchmark Report"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>

          <button
            onClick={onDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Download Benchmark Metrics CSV"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">CSV Data</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
