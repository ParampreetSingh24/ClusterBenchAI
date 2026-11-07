import React, { useEffect, useRef } from 'react';

export default function PlotlyChart({ data, layout, config, style, isDark = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !window.Plotly) return;

    const baseLayout = {
      autosize: true,
      paper_bgcolor: isDark ? '#0f172a' : '#ffffff',
      plot_bgcolor: isDark ? '#0f172a' : '#ffffff',
      font: {
        family: 'Inter, sans-serif',
        color: isDark ? '#cbd5e1' : '#334155',
        size: 11
      },
      margin: { l: 45, r: 25, t: 35, b: 40 },
      ...layout
    };

    const baseConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      ...config
    };

    window.Plotly.react(containerRef.current, data, baseLayout, baseConfig);

    const handleResize = () => {
      if (containerRef.current && window.Plotly) {
        window.Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, layout, config, isDark]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '320px', ...style }}
    />
  );
}
