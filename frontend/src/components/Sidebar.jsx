import React from 'react';
import {
  Compass,
  Database,
  Sliders,
  BarChart3,
  Trophy,
  PieChart,
  FileDown,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Compass,
      tag: '9 Models'
    },
    {
      id: 'dataset',
      label: 'Data & Pipeline',
      icon: Database,
      tag: 'Clean & Scale'
    },
    {
      id: 'lab',
      label: 'Algorithm Lab',
      icon: Sliders,
      tag: '2D / 3D Tuning'
    },
    {
      id: 'benchmark',
      label: 'Benchmark Suite',
      icon: BarChart3,
      tag: 'Compare All'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      tag: 'Podium'
    },
    {
      id: 'gallery',
      label: 'Visualizations',
      icon: PieChart,
      tag: 'Diagnostics'
    },
    {
      id: 'export',
      label: 'Export Center',
      icon: FileDown,
      tag: 'PDF & CSV'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200/70 dark:border-white/[0.08] bg-white/60 dark:bg-[#0c1021]/60 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0 transition-colors z-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Control Center
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            v1.0
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-transparent border-l-2 border-cyan-400 text-cyan-600 dark:text-cyan-400 font-bold shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="text-xs">{item.label}</span>
                </div>
                <span
                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/30'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                  }`}
                >
                  {item.tag}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cyber Platform Status Banner */}
      <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-[#070913]/80 border border-slate-200/80 dark:border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Clustering Engine</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            READY
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200/60 dark:border-white/[0.05] font-mono">
          <span>Latency: ~4.8ms</span>
          <span>GPU: WebGL</span>
        </div>
      </div>
    </aside>
  );
}
