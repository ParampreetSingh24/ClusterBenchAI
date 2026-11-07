import React from 'react';
import {
  BookOpen,
  Database,
  Sliders,
  BarChart3,
  Trophy,
  PieChart,
  FileDown
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview & Methodology',
      icon: BookOpen,
      desc: 'Formulations & Complexity'
    },
    {
      id: 'dataset',
      label: 'Dataset & Preprocessing',
      icon: Database,
      desc: 'Imputation & Scaling'
    },
    {
      id: 'lab',
      label: 'Algorithm Lab',
      icon: Sliders,
      desc: 'Interactive 2D/3D Tuning'
    },
    {
      id: 'benchmark',
      label: 'Benchmark & Compare',
      icon: BarChart3,
      desc: 'Full 9-Algorithm Matrix'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard & AI Insights',
      icon: Trophy,
      desc: 'Champion & Paper Discussion'
    },
    {
      id: 'gallery',
      label: 'Visualizations Gallery',
      icon: PieChart,
      desc: 'Silhouette, Heatmap, Dendrogram'
    },
    {
      id: 'export',
      label: 'Report & Export',
      icon: FileDown,
      desc: 'PDF, CSV & BibTeX'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 flex flex-col justify-between shrink-0 transition-colors">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800/80 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <div>
                    <div className="text-xs leading-none">{item.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-normal leading-tight">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Algorithm Coverage Mini Badge */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px]">
          <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Algorithms Covered</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono font-bold">9/9</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[9.5px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">K-Means</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">K-Medoids</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">DBSCAN</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">Hierarch</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">Agglom</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">Spectral</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">MeanShift</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">GMM</span>
            <span className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-center">Fuzzy C</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
        <p className="font-mono">ClusterBenchAI v1.0</p>
        <p>Clustering Benchmark Platform</p>
      </div>
    </aside>
  );
}
