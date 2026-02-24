# ================================================================
#   ShopNest — Stop All Services (PowerShell)
# ================================================================

$RootDir = $PSScriptRoot
$PidDir  = Join-Path $RootDir "logs"

Write-Host "Stopping all ShopNest services..." -ForegroundColor Yellow

# Kill all Spring Boot / Node processes by PID file
$pidFiles = Get-ChildItem -Path $PidDir -Filter "*.pid" -ErrorAction SilentlyContinue
foreach ($pidFile in $pidFiles) {
    $pid = Get-Content $pidFile.FullName -ErrorAction SilentlyContinue
    if ($pid) {
        try {
            Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped $($pidFile.BaseName) (PID $pid)" -ForegroundColor Gray
        } catch {
            Write-Host "  $($pidFile.BaseName) already stopped." -ForegroundColor Gray
        }
    }
    Remove-Item $pidFile.FullName -Force
}

# Stop infra containers
Write-Host "Stopping Docker infrastructure..." -ForegroundColor Yellow
& docker-compose -f "$RootDir\docker-compose.infra.yml" down

Write-Host ""
Write-Host "✔ All ShopNest services stopped." -ForegroundColor Green
