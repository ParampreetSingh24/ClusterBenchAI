import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewSection from './components/OverviewSection';
import DatasetManager from './components/DatasetManager';
import AlgorithmLab from './components/AlgorithmLab';
import BenchmarkView from './components/BenchmarkView';
import LeaderboardView from './components/LeaderboardView';
import VisualizationsGallery from './components/VisualizationsGallery';
import ReportExportCenter from './components/ReportExportCenter';
import ClusterCanvasBackground from './components/ClusterCanvasBackground';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Datasets state
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState('mushroom');
  
  // Benchmark state
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [isPreprocessing, setIsPreprocessing] = useState(false);

  // Sync dark mode with document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load datasets list on mount
  const loadDatasets = async () => {
    try {
      const res = await fetch('/api/datasets');
      const data = await res.json();
      if (data.datasets && data.datasets.length > 0) {
        setDatasets(data.datasets);
        if (!activeDatasetId) {
          setActiveDatasetId(data.datasets[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  // Run benchmark for the active dataset
  const triggerBenchmark = async (options = {}) => {
    setIsBenchmarking(true);
    try {
      const payload = {
        dataset_id: activeDatasetId,
        n_clusters: options.n_clusters || (activeDatasetId === 'soybean' ? 4 : 2),
        metric_weights: options.metric_weights || null
      };

      const res = await fetch('/api/cluster/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Benchmark failed');
      setBenchmarkData(data);
    } catch (err) {
      console.error('Benchmark execution failed:', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Trigger benchmark when active dataset changes
  useEffect(() => {
    if (activeDatasetId) {
      triggerBenchmark();
    }
  }, [activeDatasetId]);

  // File Download Handlers
  const handleDownloadPdf = () => {
    window.open('/api/reports/pdf', '_blank');
  };

  const handleDownloadCsv = () => {
    window.open('/api/reports/csv', '_blank');
  };

  const handleDownloadClustered = () => {
    window.open('/api/reports/export-clusters', '_blank');
  };

  const activeDatasetObj = datasets.find((d) => d.id === activeDatasetId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Clustering Particle & Aurora Mesh Background */}
      <ClusterCanvasBackground isDark={darkMode} />

      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeDataset={activeDatasetObj}
        onDownloadPdf={handleDownloadPdf}
        onDownloadCsv={handleDownloadCsv}
        isBenchmarking={isBenchmarking}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {currentTab === 'overview' && <OverviewSection />}

          {currentTab === 'dataset' && (
            <DatasetManager
              datasets={datasets}
              activeDatasetId={activeDatasetId}
              setActiveDatasetId={setActiveDatasetId}
              onUploadSuccess={(newId) => {
                loadDatasets();
                setActiveDatasetId(newId);
              }}
              onPreprocessingDone={(report) => {
                triggerBenchmark();
              }}
              isPreprocessing={isPreprocessing}
              setIsPreprocessing={setIsPreprocessing}
            />
          )}

          {currentTab === 'lab' && (
            <AlgorithmLab
              activeDatasetId={activeDatasetId}
              isDark={darkMode}
            />
          )}

          {currentTab === 'benchmark' && (
            <BenchmarkView
              activeDatasetId={activeDatasetId}
              isDark={darkMode}
              benchmarkData={benchmarkData}
              onRunBenchmark={triggerBenchmark}
              isBenchmarking={isBenchmarking}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardView
              benchmarkData={benchmarkData}
              activeDatasetId={activeDatasetId}
            />
          )}

          {currentTab === 'gallery' && (
            <VisualizationsGallery
              activeDatasetId={activeDatasetId}
              isDark={darkMode}
            />
          )}

          {currentTab === 'export' && (
            <ReportExportCenter
              activeDatasetId={activeDatasetId}
              benchmarkData={benchmarkData}
              onDownloadPdf={handleDownloadPdf}
              onDownloadCsv={handleDownloadCsv}
              onDownloadClustered={handleDownloadClustered}
            />
          )}
        </main>
      </div>
    </div>
  );
}
