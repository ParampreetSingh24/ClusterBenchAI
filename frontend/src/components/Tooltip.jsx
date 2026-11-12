import React from 'react';

export default function Tooltip({
  title,
  content,
  formula,
  position = 'top',
  children,
  width = 'w-64'
}) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#0c1021]/95 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#0c1021]/95 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#0c1021]/95 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#0c1021]/95 border-y-transparent border-l-transparent'
  };

  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div
        className={`absolute ${positionClasses[position]} ${width} p-3.5 rounded-2xl bg-[#0c1021]/95 text-white text-xs shadow-2xl border border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 backdrop-blur-xl scale-95 group-hover:scale-100 origin-center`}
      >
        {title && (
          <div className="font-bold text-cyan-400 text-xs mb-1 flex items-center justify-between">
            <span>{title}</span>
          </div>
        )}
        {formula && (
          <div className="px-2.5 py-1 mb-1.5 rounded-lg bg-black/60 font-mono text-[10.5px] text-amber-300 border border-white/[0.08] overflow-x-auto">
            {formula}
          </div>
        )}
        {content && (
          <div className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {content}
          </div>
        )}
        <div className={`absolute border-4 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
}
