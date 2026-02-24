# ShopNest - Start All Services (PowerShell / Windows)
# No Docker required - uses H2 in-memory DB, simple Spring Cache, Kafka-optional mode.
#
# Usage:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
#   .\start-all.ps1
#
# Prerequisites:
#   - Java 21    (java -version)
#   - Maven 3.9+ (mvn -version)
#   - Node.js 20+ (node -version)

$ErrorActionPreference = "Stop"
$RootDir    = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$LogDir     = Join-Path $RootDir "logs"
$PidDir     = Join-Path $RootDir "logs"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Banner {
    Write-Host ""
    Write-Host "  ==========================================" -ForegroundColor Cyan
    Write-Host "      ShopNest - Service Launcher           " -ForegroundColor Cyan
    Write-Host "      (No Docker required)                  " -ForegroundColor Cyan
    Write-Host "  ==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Log-Info { param($msg); Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor Green }
function Log-Warn { param($msg); Write-Host "[$(Get-Date -Format 'HH:mm:ss')] WARNING: $msg" -ForegroundColor Yellow }
function Log-Step { param($msg); Write-Host "`n>>> $msg" -ForegroundColor Cyan }

function Wait-ForPort {
    param($name, $port, $retries = 40)
    Write-Host "  Waiting for $name on port $port" -NoNewline -ForegroundColor Gray
    for ($i = 0; $i -lt $retries; $i++) {
        try {
            $conn = New-Object System.Net.Sockets.TcpClient
            $conn.Connect("localhost", $port)
            $conn.Close()
            Write-Host " OK" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "." -NoNewline -ForegroundColor Gray
            Start-Sleep -Seconds 3
        }
    }
    Write-Host " TIMEOUT" -ForegroundColor Red
    return $false
}

function Build-Service {
    param($name, $serviceDir)
    Log-Info "  Building $name..."
    $logFile = Join-Path $LogDir "build-$name.log"
    $proc = Start-Process -FilePath "mvn" `
        -ArgumentList "clean", "package", "-DskipTests", "-q" `
        -WorkingDirectory $serviceDir `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError "$logFile.err" `
        -PassThru -Wait -WindowStyle Hidden
    if ($proc.ExitCode -ne 0) {
        Write-Host "    BUILD FAILED for $name. Check logs\build-$name.log" -ForegroundColor Red
        exit 1
    }
    Log-Info "  $name - OK"
}

function Start-Service {
    param($name, $serviceDir, $port)
    Log-Info "Starting $name (port $port)..."
    $logFile = Join-Path $LogDir "$name.log"
    $pidFile = Join-Path $PidDir "$name.pid"

    $proc = Start-Process -FilePath "mvn" `
        -ArgumentList "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Xmx256m" `
        -WorkingDirectory $serviceDir `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError "$logFile.err" `
        -PassThru -WindowStyle Minimized

    $proc.Id | Out-File -FilePath $pidFile -Encoding utf8
    Log-Info "$name started (PID: $($proc.Id) | log: logs\$name.log)"
    Wait-ForPort $name $port
}

# ======================== MAIN ========================

Write-Banner
Log-Info "No Docker needed — H2 in-memory DB + simple cache + Kafka-optional mode"
Write-Host ""

# Step 1 — Build all services
Log-Step "Step 1: Building all backend Maven services (2-5 mins first time)..."
$services = @(
    "eureka-server", "api-gateway",
    "auth-service", "user-service", "product-service",
    "cart-service", "order-service", "payment-service",
    "inventory-service", "notification-service", "admin-service"
)
foreach ($svc in $services) {
    Build-Service $svc (Join-Path $BackendDir $svc)
}
Log-Info "All services built successfully"

# Step 2 — Start services in order
Log-Step "Step 2: Starting microservices in order..."

Start-Service "eureka-server"        (Join-Path $BackendDir "eureka-server")        8761
Start-Sleep -Seconds 5

Start-Service "api-gateway"          (Join-Path $BackendDir "api-gateway")          8080
Start-Sleep -Seconds 3

Start-Service "auth-service"         (Join-Path $BackendDir "auth-service")         8081
Start-Service "user-service"         (Join-Path $BackendDir "user-service")         8082
Start-Service "product-service"      (Join-Path $BackendDir "product-service")      8083
Start-Service "cart-service"         (Join-Path $BackendDir "cart-service")         8084
Start-Service "order-service"        (Join-Path $BackendDir "order-service")        8085
Start-Service "payment-service"      (Join-Path $BackendDir "payment-service")      8086
Start-Service "inventory-service"    (Join-Path $BackendDir "inventory-service")    8087
Start-Service "notification-service" (Join-Path $BackendDir "notification-service") 8088
Start-Service "admin-service"        (Join-Path $BackendDir "admin-service")        8089

# Step 3 — Frontend
Log-Step "Step 3: Starting React frontend (Vite dev server)..."
$frontendDir = Join-Path $RootDir "frontend"
$frontendLog = Join-Path $LogDir "frontend.log"

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Log-Info "  Installing npm packages..."
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" `
        -WorkingDirectory $frontendDir -Wait -WindowStyle Hidden
}

$frontendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" `
    -WorkingDirectory $frontendDir `
    -RedirectStandardOutput $frontendLog `
    -PassThru -WindowStyle Minimized
$frontendProc.Id | Out-File (Join-Path $PidDir "frontend.pid") -Encoding utf8
Wait-ForPort "frontend" 3000

# ======================== DONE ========================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  All services are RUNNING! (No Docker required)            " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Frontend    -->  http://localhost:3000                     " -ForegroundColor Green
Write-Host "  API Gateway -->  http://localhost:8080/api                 " -ForegroundColor Green
Write-Host "  Eureka UI   -->  http://localhost:8761                     " -ForegroundColor Green
Write-Host "------------------------------------------------------------" -ForegroundColor Green
Write-Host "  Logs -->  .\logs\<service-name>.log                       " -ForegroundColor Green
Write-Host "  Stop -->  .\stop-all.ps1                                  " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
