import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Cpu,
  BookOpen,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LeaderboardView({
  benchmarkData,
  activeDatasetId
}) {
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const rankedResults = benchmarkData?.ranked_results || [];
  const insights = benchmarkData?.insights || {};
  const winner = rankedResults[0];

  useEffect(() => {
    if (winner) {
      // Trigger subtle celebratory confetti
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Champion Podium */}
      {winner && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-500/30 dark:border-amber-500/20 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0">
                <Trophy className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                    Grand Champion
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    MCDM Score: <strong className="text-slate-800 dark:text-white">{winner.composite_score?.toFixed(1)} / 100</strong>
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {winner.algorithm}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                  {insights.why_winner || 'Optimal clustering configuration balancing cohesion, separation, and execution efficiency.'}
                </p>
              </div>
            </div>

            {/* Top 3 Quick Badges */}
            <div className="flex items-end gap-3 shrink-0">
              {/* 2nd Place */}
              {rankedResults[1] && (
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">#2 Runner Up</div>
                  <div className="w-16 h-20 rounded-t-xl bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center p-1 border border-slate-300 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {rankedResults[1].algorithm}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {rankedResults[1].composite_score?.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="text-center">
                <div className="text-[10px] font-bold text-amber-500 mb-1">#1 Champion</div>
                <div className="w-20 h-28 rounded-t-xl bg-gradient-to-t from-amber-500/30 to-amber-400/20 border-t-2 border-x-2 border-amber-400 flex flex-col items-center justify-center p-1">
                  <Trophy className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate w-full text-center">
                    {winner.algorithm}
                  </span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {winner.composite_score?.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 3rd Place */}
              {rankedResults[2] && (
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">#3 Bronze</div>
                  <div className="w-16 h-16 rounded-t-xl bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center p-1 border border-slate-300 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {rankedResults[2].algorithm}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {rankedResults[2].composite_score?.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Automated AI Rationale & Topology Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            Why {winner?.algorithm} Achieved Superior Performance
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {insights.why_winner}
          </p>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Dataset Topology Diagnosis
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {(insights.topology_notes || []).map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths & Weaknesses of Algorithms */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              Algorithmic Trade-offs & Empirical Behavioral Diagnosis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Contextual analysis of individual algorithms on this dataset geometry.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {(insights.algorithm_evaluations || []).slice(0, 4).map((evalItem) => (
                <div
                  key={evalItem.algorithm}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span>{evalItem.algorithm} (Rank #{evalItem.rank})</span>
                    <span className="font-mono text-sky-500">{evalItem.composite_score?.toFixed(1)} pts</span>
                  </div>

                  <div className="space-y-1">
                    {evalItem.strengths.map((str, sIdx) => (
                      <div key={sIdx} className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5">
                        <span className="font-bold">+</span>
                        <span>{str}</span>
                      </div>
                    ))}
                    {evalItem.weaknesses.map((wk, wIdx) => (
                      <div key={wIdx} className="text-[11px] text-rose-500 dark:text-rose-400 flex items-start gap-1.5">
                        <span className="font-bold">-</span>
                        <span>{wk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asymptotic Computational Complexity Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-500" />
          Comprehensive Algorithmic Complexity & Scalability Taxonomy
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Theoretical asymptotic boundaries for Big-O time and space complexity across all 9 paradigms.
        </p>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Paradigm</th>
                <th className="py-2.5 px-3">Time Complexity</th>
                <th className="py-2.5 px-3">Space Complexity</th>
                <th className="py-2.5 px-3">Scalability</th>
                <th className="py-2.5 px-3">Noise Resilience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {(insights.complexity_matrix || []).map((row) => (
                <tr key={row.algorithm} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">
                    {row.algorithm}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    {row.paradigm}
                  </td>
                  <td className="py-2 px-3 text-sky-600 dark:text-sky-400 font-bold">
                    {row.time_complexity}
                  </td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                    {row.space_complexity}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    {row.scalability}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                    {row.handles_noise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Documentation & Methodology Sections */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Project Documentation & Methodology
          </h3>
          <button
            onClick={handleCopyBibtex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBibtex ? 'Citation Copied!' : 'Copy Citation'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Abstract</h4>
            <p className="italic text-slate-600 dark:text-slate-400">{paperSections.abstract}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Methodology</h4>
            <p>{paperSections.methodology}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Experimental Results</h4>
            <p>{paperSections.experimental_results}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Comparative Analysis</h4>
            <p>{paperSections.comparative_analysis}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Conclusion</h4>
            <p>{paperSections.conclusion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
