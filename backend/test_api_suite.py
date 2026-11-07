import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("--- 1. Health check ---")
r = client.get('/api/health')
print("Status:", r.status_code, r.json())
assert r.status_code == 200

print("\n--- 2. Datasets catalog ---")
r = client.get('/api/datasets')
datasets = r.json()['datasets']
print("Status:", r.status_code, "Datasets:", [d['id'] for d in datasets])
assert any(d['id'] == 'mushroom' for d in datasets)
assert any(d['id'] == 'soybean' for d in datasets)

print("\n--- 3. Dataset preview (Mushroom) ---")
r = client.get('/api/datasets/mushroom/preview')
preview = r.json()
print("Status:", r.status_code, "Instances:", preview['summary']['num_rows'], "Features:", preview['summary']['num_cols'], "Target:", preview['summary']['detected_target'])
assert r.status_code == 200
assert len(preview['preview_data']) > 0

print("\n--- 4. Preprocessing Mushroom ---")
r = client.post('/api/preprocess', json={
    'dataset_id': 'mushroom',
    'missing_strategy': 'most_frequent',
    'encoding_strategy': 'one_hot',
    'scaling_method': 'standard',
    'subsample_limit': 1000
})
prep_res = r.json()
print("Status:", r.status_code, "Processed shape:", prep_res['processed_shape'], "Steps:", prep_res['report']['steps_applied'])
assert r.status_code == 200

print("\n--- 5. Single Algorithm Execution (K-Medoids on Soybean) ---")
r = client.post('/api/cluster/single', json={
    'dataset_id': 'soybean',
    'algorithm': 'kmedoids',
    'params': {'n_clusters': 4}
})
single_res = r.json()
print("Status:", r.status_code, "Algorithm:", single_res['algorithm'], "Metrics:", single_res['metrics'])
assert r.status_code == 200
assert 'pca_2d' in single_res['projections']

print("\n--- 6. Full Benchmark Execution (All 9 Algorithms on Synthetic) ---")
r = client.post('/api/cluster/benchmark', json={
    'dataset_id': 'synthetic_blobs',
    'n_clusters': 4
})
bench_res = r.json()
print("Status:", r.status_code, "Total Ranked:", len(bench_res['ranked_results']))
for rank_item in bench_res['ranked_results']:
    m = rank_item.get('metrics', {})
    print(f"  #{rank_item['rank']:2d} | {rank_item['algorithm']:15s} | Score: {rank_item['composite_score']:5.1f} | Sil: {m.get('silhouette_score')} | Latency: {m.get('execution_time_ms')}ms")
assert r.status_code == 200
assert len(bench_res['ranked_results']) == 9

print("\n--- 7. Automated AI Insights & Academic Rationale ---")
insights = bench_res['insights']
print("Winner:", insights['winner'], "(Score:", insights['winner_score'], ")")
print("Why Winner Won:", insights['why_winner'][:120], "...")
print("Abstract excerpt:", insights['paper_sections']['abstract'][:120], "...")

print("\n--- 8. Parameter Sweep (Elbow & Silhouette) ---")
r = client.post('/api/cluster/parameter-sweep', json={
    'dataset_id': 'synthetic_blobs',
    'k_min': 2,
    'k_max': 6
})
sweep = r.json()
print("Status:", r.status_code, "K values:", sweep['k_values'], "Inertias:", sweep['inertias'], "Recommended k:", sweep['recommended_k'])
assert r.status_code == 200

print("\n--- 9. Report Downloads (PDF, CSV, Clustered Data) ---")
# PDF
r_pdf = client.get('/api/reports/pdf')
print("PDF Report Status:", r_pdf.status_code, "Content-Type:", r_pdf.headers.get('content-type'), "Bytes:", len(r_pdf.content))
assert r_pdf.status_code == 200 and len(r_pdf.content) > 1000

# CSV
r_csv = client.get('/api/reports/csv')
print("CSV Metrics Status:", r_csv.status_code, "Lines:", len(r_csv.text.splitlines()))
assert r_csv.status_code == 200

# Clustered dataset
r_clust = client.get('/api/reports/export-clusters')
print("Clustered Dataset Status:", r_clust.status_code, "Lines:", len(r_clust.text.splitlines()))
assert r_clust.status_code == 200

print("\n--- 10. Frontend Production Bundle Serving ---")
r_front = client.get('/')
print("Frontend Root Status:", r_front.status_code, "Bytes:", len(r_front.content))
assert r_front.status_code == 200
assert b'ClusterBenchAI' in r_front.content

print("\n=======================================================")
print("ALL 10 VERIFICATION TESTS PASSED FLAWLESSLY WITH 100% SUCCESS!")
print("=======================================================")
