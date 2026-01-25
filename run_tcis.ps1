# TCIS v2.0 Launch Orchestrator
# Auto-clears ports and starts both Backend and Frontend in synchronous background processes.

Write-Host "--- INITIALIZING TCIS ENTERPRISE COMMAND ---" -ForegroundColor Cyan

# 1. Kill stale processes on ports 8000 and 8501
Write-Host "[1/3] Clearing environment ports..." -ForegroundColor Yellow
$p1 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$p2 = Get-NetTCPConnection -LocalPort 8501 -ErrorAction SilentlyContinue

if ($p1) { Stop-Process -Id $p1.OwningProcess -Force -ErrorAction SilentlyContinue }
if ($p2) { Stop-Process -Id $p2.OwningProcess -Force -ErrorAction SilentlyContinue }

# 2. Start Backend (Uvicorn)
Write-Host "[2/3] Launching Data Engine (Backend)..." -ForegroundColor Yellow
Start-Process python -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory (Join-Path $pwd "backend") -WindowStyle Hidden

# 3. Start Frontend (Streamlit)
Write-Host "[3/3] Launching Intelligence Command (Frontend)..." -ForegroundColor Yellow
Start-Process python -ArgumentList "-m streamlit run streamlit_app.py --server.address 127.0.0.1 --server.port 8501 --server.headless true" -WorkingDirectory (Join-Path $pwd "frontend") -WindowStyle Hidden

Write-Host "--- SYSTEM ONLINE ---" -ForegroundColor Green
Write-Host "URL: http://127.0.0.1:8501" -ForegroundColor Cyan
