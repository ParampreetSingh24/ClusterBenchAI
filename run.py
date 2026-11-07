import os
import sys
import subprocess
import webbrowser
import time

def start_clusterbench():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    
    print("=" * 60)
    print("  ClusterBenchAI: AI-Powered Research Clustering Platform")
    print("=" * 60)
    print(f"Working Directory: {base_dir}")
    print("Launching FastAPI Full-Stack Server on http://127.0.0.1:8000 ...")

    # Launch server
    try:
        import uvicorn
        webbrowser.open("http://127.0.0.1:8000")
        uvicorn.run("main:app", app_dir=backend_dir, host="127.0.0.1", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\nClusterBenchAI server stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    start_clusterbench()
