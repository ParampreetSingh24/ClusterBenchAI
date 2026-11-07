# ClusterBenchAI: Full-Stack AI-Powered Clustering Benchmark & Visualization Platform

**ClusterBenchAI** is a full-stack web platform designed for analyzing, visualizing, and rigorously comparing machine learning clustering algorithms on the canonical **UCI Mushroom** and **UCI Large Soybean** datasets, as well as user-uploaded datasets (**CSV**, **Excel**, **ARFF**).

Constructed with professional architecture, the platform provides interactive mathematical explorations, hyperparameter tuning, 2D/3D manifold projections, multi-criteria decision making (MCDM) rankings, and downloadable PDF and CSV benchmark reports.

---

## 🌟 Key Features

### 1. Modern Dashboard UI/UX
- **Theme**: Fluid Dark / Light mode toggle with persistent state.
- **Navigation**: Sidebar with 7 structured modules:
  1. **Overview & Methodology**: Mathematical formulations & Big-O asymptotic matrix.
  2. **Dataset & Preprocessing**: Built-in Mushroom & Soybean explorer, custom file uploader, and preprocessing studio.
  3. **Algorithm Lab**: Interactive hyperparameter tuning with 2D/3D PCA, t-SNE, and UMAP scatter projections.
  4. **Benchmark Suite**: One-click 9-algorithm benchmark matrix with customizable metric weights & radar charts.
  5. **Leaderboard & AI Insights**: Champion podium with confetti celebration, topological diagnosis, and project summary.
  6. **Visualizations Gallery**: Per-cluster silhouette analysis, Ward dendrograms, correlation heatmaps, and Elbow curves.
  7. **Report & Export Center**: PDF report download, metrics CSV, and clustered data export with citation metadata.

### 2. Dataset Management & Preprocessing Studio
- **Built-In Datasets**:
  - **Mushroom Classification Database (UCI)**: 8,124 instances, 22 categorical attributes, ground truth edible (`e`) vs. poisonous (`p`).
  - **Large Soybean Disease Database (UCI)**: 683 instances, 35 physiological & environmental attributes, 19 pathology diagnosis classes.
  - **Synthetic Blobs**: 500 instances across 6 continuous dimensions for instant verification.
- **Upload Support**: Parses `.csv`, `.xlsx`, `.xls`, and `.arff` files.
- **Preprocessing Pipeline**:
  - **Imputation**: Mode (most frequent), Mean, Median, Constant, or Row Dropping.
  - **Encoding**: One-Hot Encoding and Label Encoding.
  - **Feature Scaling**: StandardScaler, MinMaxScaler, RobustScaler, or None.
  - **Outlier Mitigation**: Isolation Forest, Local Outlier Factor (LOF), and Z-Score filtering ($|z| > 3.5$).
  - **Feature Selection**: Variance Threshold, Principal Component Analysis (PCA), and ANOVA SelectKBest.

### 3. All 9 Supported Clustering Algorithms
| Algorithm | Paradigm | Time Complexity | Space Complexity | Shape Assumption |
| :--- | :--- | :--- | :--- | :--- |
| **K-Means** | Partitional / Centroid | $O(n \cdot k \cdot d \cdot i)$ | $O((n+k) \cdot d)$ | Isotropic Spherical |
| **K-Medoids (PAM)** | Partitional / Exemplar | $O(k \cdot (n-k)^2 \cdot i)$ | $O(n^2 + n \cdot d)$ | Robust to Outliers |
| **DBSCAN** | Density-Based | $O(n \log n) - O(n^2)$ | $O(n \cdot d)$ | Arbitrary / Non-Convex |
| **Hierarchical** | Tree-Based Agglomeration | $O(n^2 \log n)$ | $O(n^2)$ | Ward / Complete Linkage |
| **Agglomerative** | Pairwise Linkage | $O(n^2 \log n)$ | $O(n^2)$ | Distance Metric Dependent |
| **Spectral Clustering**| Graph Laplacian Cut | $O(n^3)$ | $O(n^2)$ | Non-Linear Manifolds |
| **Mean Shift** | Non-Parametric Mode-Seeking| $O(n^2 \cdot i)$ | $O(n \cdot d)$ | Multi-Modal Density |
| **GMM** | Probabilistic Mixture | $O(n \cdot d^3 \cdot i)$ | $O(k \cdot d^2 + n \cdot k)$ | Anisotropic Ellipsoidal |
| **Fuzzy C-Means** | Soft / Overlapping | $O(n \cdot c \cdot d \cdot i)$ | $O(n \cdot c + c \cdot d)$ | Overlapping Boundaries |

### 4. Validation Metrics Suite
1. **Silhouette Score** $[-1, 1]$: Measures intra-cluster cohesion vs. nearest-cluster separation.
2. **Davies-Bouldin Index** $[0, \infty)$: Evaluates cluster dispersion against centroid distance (lower is better).
3. **Calinski-Harabasz Score**: Variance ratio criterion evaluating between-cluster over within-cluster variance.
4. **Inertia / WCSS**: Within-Cluster Sum of Squared errors.
5. **Cluster Purity**: External ground-truth match percentage $[0, 1]$.
6. **Adjusted Rand Index (ARI)** & **Normalized Mutual Information (NMI)**.
7. **Execution Latency**: Wall-clock CPU execution time measured in milliseconds (ms).
8. **Peak Memory Usage**: Real-time memory profiling via Python `tracemalloc` measured in kilobytes (KB).

### 5. Multi-Criteria Leaderboard & Automated AI Insights
- **MCDM Scoring Engine**: Ranks all 9 algorithms using weighted normalization across Silhouette (30%), Davies-Bouldin (20%), Calinski-Harabasz (15%), Purity (20%), and Latency (15%).
- **AI Rationale**: Analyzes dataset topology (dimensionality, sparsity, geometry) and mathematically explains why the champion algorithm outperformed alternative models.
- **Algorithmic Diagnosis**: Contextual strengths and weaknesses customized for the active dataset.

### 6. Comprehensive Reporting
- **PDF Report**: Generated using ReportLab with title banner, summary, dataset topology table, comprehensive benchmark matrix, AI discussion, and asymptotic complexity table.
- **Benchmark CSV**: Complete metrics matrix export.
- **Clustered Dataset CSV**: Dataset merged with assigned cluster labels and 2D PCA coordinates.

---

## 🏗️ Project Architecture

```
clusterbench-ai/
├── backend/
│   ├── algorithms/
│   │   └── clustering.py         # Vectorized implementations of all 9 clustering models
│   ├── data/
│   │   ├── mushroom.arff & .csv  # UCI Mushroom Dataset (8,124 instances)
│   │   ├── soybean.arff & .csv   # UCI Large Soybean Dataset (683 instances)
│   │   ├── synthetic_blobs.csv   # Calibrated synthetic test dataset
│   │   └── parse_data.py         # Robust ARFF/CSV parser
│   ├── database/
│   │   └── db.py                 # SQLite database for run persistence
│   ├── evaluation/
│   │   ├── metrics.py            # Silhouette, DB, CH, Inertia, Purity, ARI, Time, RAM
│   │   └── leaderboard.py        # MCDM ranking & badge allocation engine
│   ├── insights/
│   │   └── ai_insights.py        # Automated analysis & methodology summary generator
│   ├── preprocessing/
│   │   └── pipeline.py           # Imputation, One-Hot/Label encoding, Scaling, Outlier filtering
│   ├── reports/
│   │   ├── pdf_generator.py      # ReportLab PDF report generator
│   │   └── csv_generator.py      # Tabular CSV export engine
│   ├── visualization/
│   │   └── viz_engine.py         # PCA, t-SNE, UMAP, Silhouette plot, Dendrogram, Heatmaps
│   ├── main.py                   # FastAPI REST API & static frontend server
│   ├── test_direct.py            # End-to-end verification test suite
│   └── test_backend.py           # Backend benchmark smoke test
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar & theme switcher
│   │   │   ├── Sidebar.jsx       # Module selector
│   │   │   ├── OverviewSection.jsx # Methodological & mathematical taxonomy
│   │   │   ├── DatasetManager.jsx  # Dataset explorer & preprocessing studio
│   │   │   ├── AlgorithmLab.jsx    # Interactive hyperparameter sliders & 2D/3D plots
│   │   │   ├── BenchmarkView.jsx   # Comparative benchmark table & radar charts
│   │   │   ├── LeaderboardView.jsx # Champion podium, confetti & AI paper draft
│   │   │   ├── VisualizationsGallery.jsx # Elbow, silhouette plot, dendrogram & heatmaps
│   │   │   ├── ReportExportCenter.jsx   # PDF, CSV, and metadata export center
│   │   │   └── PlotlyChart.jsx    # Reactive dark/light Plotly wrapper
│   │   ├── App.jsx               # Application root state & router
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Tailwind CSS styles & typography
│   ├── index.html                # HTML template with Plotly.js & Inter fonts
│   ├── package.json              # React 19, Lucide, Tailwind v4, Vite
│   └── vite.config.js            # Build configuration & dev proxy
├── run.py                        # Unified launcher script
├── start_platform.bat            # Windows one-click start script
└── README.md                     # Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** & **npm**

### Step 1: Install Python Dependencies
```bash
pip install numpy pandas scipy scikit-learn fastapi uvicorn reportlab python-multipart openpyxl httpx
```

### Step 2: Build the Frontend (Pre-built)
```bash
cd frontend
npm install
npm run build
cd ..
```
*(The production frontend is already pre-compiled into `frontend/dist/`)*.

### Step 3: Run the Platform
Double-click `start_platform.bat` or run:
```bash
python run.py
```
Open your browser at:
👉 **`http://127.0.0.1:8000`**

---

## 📖 Citation

```bibtex
@misc{clusterbench2026,
  title={ClusterBenchAI: Comprehensive Clustering Benchmark on Mushroom and Soybean Datasets},
  author={Vansh},
  howpublished={Personal ML Project},
  year={2026}
}
```

---

*ClusterBenchAI — Machine Learning Clustering Benchmark Platform.*
