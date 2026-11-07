import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clusterbench.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Table for datasets catalog
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        num_rows INTEGER,
        num_cols INTEGER,
        has_ground_truth INTEGER,
        ground_truth_col TEXT,
        created_at TEXT
    )
    ''')
    
    # Table for benchmark runs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS benchmark_runs (
        id TEXT PRIMARY KEY,
        dataset_id TEXT,
        created_at TEXT,
        preprocessing_config TEXT,
        best_algorithm TEXT,
        results_summary TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

def save_benchmark_run(run_id: str, dataset_id: str, preprocessing_config: Dict, best_algorithm: str, results_summary: Dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR REPLACE INTO benchmark_runs (id, dataset_id, created_at, preprocessing_config, best_algorithm, results_summary)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        run_id,
        dataset_id,
        datetime.utcnow().isoformat(),
        json.dumps(preprocessing_config),
        best_algorithm,
        json.dumps(results_summary)
    ))
    conn.commit()
    conn.close()

def get_recent_benchmark_runs(limit: int = 10) -> List[Dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM benchmark_runs ORDER BY created_at DESC LIMIT ?', (limit,))
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            'id': r['id'],
            'dataset_id': r['dataset_id'],
            'created_at': r['created_at'],
            'preprocessing_config': json.loads(r['preprocessing_config']) if r['preprocessing_config'] else {},
            'best_algorithm': r['best_algorithm'],
            'results_summary': json.loads(r['results_summary']) if r['results_summary'] else {}
        })
    conn.close()
    return results

init_db()
