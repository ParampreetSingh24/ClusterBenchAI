import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  BookOpen,
  X,
  ArrowRight,
  Info,
  Flame,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Tooltip from './Tooltip';

export default function LeaderboardView({
  benchmarkData,
  activeDatasetId
}) {
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);

  const rankedResults = benchmarkData?.ranked_results || [];
  const insights = benchmarkData?.insights || {};
  const winner = rankedResults[0];

  useEffect(() => {
    if (winner) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [winner]);

  const bibtexCode = `@misc{clusterbench2026,
  title={ClusterBenchAI: Clustering Benchmark on ${activeDatasetId || 'Mushroom'}},
  author={Vansh},
  howpublished={Personal ML Project},
  year={2026}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCode);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const paperSections = insights.paper_sections || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cyberpunk Grand Champion Podium */}
      {winner && (
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-cyan-500/10 to-violet-500/15 backdrop-blur-xl border border-amber-400/40 dark:border-amber-400/30 shadow-[0_0_35px_rgba(251,191,36,0.12)] overflow-hidden group">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 shrink-0">
                  <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 shadow-xs">
                    ★ #1 GRAND CHAMPION
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Score: <strong className="text-amber-500 font-bold">{winner.composite_score?.toFixed(1)} / 100</strong>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {winner.algorithm}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(winner.badges || []).map((b, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-white/[0.06] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 3 Cyber Podium */}
            <div className="flex items-end gap-3 shrink-0">
              {/* 2nd Place */}
              {rankedResults[1] && (
                <div className="text-center">
                  <div className="text-[9.5px] font-bold text-slate-400 mb-1 uppercase tracking-wider">#2 Runner Up</div>
                  <div className="w-18 h-22 rounded-t-2xl bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center p-2 border-t-2 border-x-2 border-slate-300 dark:border-slate-600">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {rankedResults[1].algorithm}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                      {rankedResults[1].composite_score?.toFixed(0)} pts
                    </span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="text-center">
                <div className="text-[9.5px] font-extrabold text-amber-500 mb-1 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Winner</span>
                </div>
                <div className="w-22 h-30 rounded-t-2xl bg-gradient-to-t from-amber-500/30 via-amber-400/20 to-amber-300/10 backdrop-blur-md border-t-2 border-x-2 border-amber-400 flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                  <Trophy className="w-7 h-7 text-amber-500 mb-1 animate-bounce" style={{ animationDuration: '3s' }} />
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate w-full text-center">
                    {winner.algorithm}
                  </span>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-black">
                    {winner.composite_score?.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 3rd Place */}
              {rankedResults[2] && (
                <div className="text-center">
                  <div className="text-[9.5px] font-bold text-slate-400 mb-1 uppercase tracking-wider">#3 Bronze</div>
                  <div className="w-18 h-18 rounded-t-2xl bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center p-2 border-t-2 border-x-2 border-amber-700/40">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {rankedResults[2].algorithm}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                      {rankedResults[2].composite_score?.toFixed(0)} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rationale & Topology Diagnostics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why Winner Won */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>Winner Decision Rationale</span>
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                Score: {winner?.composite_score?.toFixed(1)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {insights.why_winner}
            </p>

            <div className="space-y-2">
              {(insights.topology_notes || []).map((note, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Trade-offs Grid */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-500" />
              <span>Algorithm Trade-offs Matrix</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Hover cards for details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {(insights.algorithm_evaluations || []).slice(0, 6).map((evalItem) => (
              <Tooltip
                key={evalItem.algorithm}
                title={`${evalItem.algorithm} (Rank #${evalItem.rank})`}
                content={
                  <div className="space-y-1.5 text-left">
                    <div>
                      <span className="text-emerald-400 font-semibold block text-[10px]">Strengths:</span>
                      {evalItem.strengths?.map((s, idx) => (
                        <div key={idx} className="text-slate-200 text-[10.5px]">✓ {s}</div>
                      ))}
                    </div>
                    <div>
                      <span className="text-rose-400 font-semibold block text-[10px]">Constraints:</span>
                      {evalItem.weaknesses?.map((w, idx) => (
                        <div key={idx} className="text-slate-300 text-[10.5px]">✗ {w}</div>
                      ))}
                    </div>
                  </div>
                }
                position="top"
                width="w-72"
              >
                <div className="w-full p-2.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-white/[0.06] hover:border-cyan-500/40 transition cursor-pointer text-left">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{evalItem.algorithm}</span>
                    <span className="font-mono text-cyan-500">#{evalItem.rank}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">
                    {evalItem.strengths?.[0] || 'Standard clustering profile'}
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Computational Complexity Table */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Computational Complexity Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Theoretical Big-O bounds and asymptotic memory footprint.
            </p>
          </div>

          <button
            onClick={() => setShowResearchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Research Notes & Citation</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-white/[0.06] rounded-2xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/[0.06] text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Paradigm</th>
                <th className="py-2.5 px-3">Time Complexity</th>
                <th className="py-2.5 px-3">Space Complexity</th>
                <th className="py-2.5 px-3">Scalability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono text-[11px]">
              {(insights.complexity_matrix || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{row.algorithm}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-500">{row.paradigm}</td>
                  <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{row.time_complexity}</td>
                  <td className="py-2.5 px-3 text-violet-600 dark:text-violet-400">{row.space_complexity}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300">
                      {row.scalability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Documentation Modal */}
      {showResearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1021] border border-slate-200 dark:border-white/[0.1] rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-500" />
                  <span>Project Research Documentation</span>
                </h3>
                <p className="text-xs text-slate-500">Methodology, dataset specifications, and citation key.</p>
              </div>
              <button
                onClick={() => setShowResearchModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Abstract</h4>
                <p>{paperSections.abstract || 'A benchmark of 9 clustering paradigms evaluated on UCI datasets.'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Methodology</h4>
                <p>{paperSections.methodology || 'Data was standardized and evaluated against silhouette, Davies-Bouldin, and purity metrics.'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Conclusion</h4>
                <p>{paperSections.conclusion || 'DBSCAN and K-Means exhibit distinct trade-offs across spherical vs manifold geometries.'}</p>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">BibTeX Citation Key</span>
                  <button
                    onClick={handleCopyBibtex}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                  >
                    {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBibtex ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-cyan-400 font-mono text-[11px] overflow-x-auto border border-white/[0.08]">
                  {bibtexCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
