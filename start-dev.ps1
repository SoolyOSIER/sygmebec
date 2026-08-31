$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPython = Join-Path $root "venv\Scripts\python.exe"
$vitrineDir = Join-Path $root "sygmebec-vitrine"
$dashboardDir = Join-Path $root "sygmebec-frontend"
$vitrinePort = 5174
$dashboardPort = 5173
$logDir = Join-Path $root "logs"
$backendLog = Join-Path $logDir "backend-dev.log"
$backendErr = Join-Path $logDir "backend-dev.err.log"
$frontendLog = Join-Path $logDir "vitrine-dev.log"
$frontendErr = Join-Path $logDir "vitrine-dev.err.log"
$dashboardLog = Join-Path $logDir "dashboard-dev.log"
$dashboardErr = Join-Path $logDir "dashboard-dev.err.log"

if (-not (Test-Path $backendPython)) {
    Write-Error "Python introuvable: $backendPython. Installez les dependances avec: .\venv\Scripts\pip install -r requirements.txt"
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

if (-not (Test-Path (Join-Path $vitrineDir "node_modules"))) {
    Write-Host "Installation des dependances du site vitrine..."
    Push-Location $vitrineDir
    npm install
    Pop-Location
}

if (-not (Test-Path (Join-Path $dashboardDir "node_modules"))) {
    Write-Host "Installation des dependances du tableau de bord..."
    Push-Location $dashboardDir
    npm install
    Pop-Location
}

$backendPort = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "Backend deja lance sur http://127.0.0.1:8000"
} else {
    Write-Host "Lancement du backend Django sur http://127.0.0.1:8000"
    $backend = Start-Process -FilePath $backendPython `
        -ArgumentList @("manage.py", "runserver", "127.0.0.1:8000", "--noreload") `
        -WorkingDirectory $root `
        -RedirectStandardOutput $backendLog `
        -RedirectStandardError $backendErr `
        -WindowStyle Hidden `
        -PassThru
    Write-Host "Backend PID: $($backend.Id)"
}

$vitrineProcess = Get-NetTCPConnection -LocalPort $vitrinePort -State Listen -ErrorAction SilentlyContinue
if ($vitrineProcess) {
    Write-Host "Site vitrine deja lance sur http://127.0.0.1:$vitrinePort"
} else {
    Write-Host "Lancement du site vitrine sur http://127.0.0.1:$vitrinePort"
    $vitrine = Start-Process -FilePath "cmd.exe" `
        -ArgumentList @("/c", "npm run dev -- --host 127.0.0.1 --port $vitrinePort") `
        -WorkingDirectory $vitrineDir `
        -RedirectStandardOutput $frontendLog `
        -RedirectStandardError $frontendErr `
        -WindowStyle Hidden `
        -PassThru
    Write-Host "Site vitrine PID: $($vitrine.Id)"
}

$dashboardProcess = Get-NetTCPConnection -LocalPort $dashboardPort -State Listen -ErrorAction SilentlyContinue
if ($dashboardProcess) {
    Write-Host "Tableau de bord deja lance sur http://127.0.0.1:$dashboardPort"
} else {
    Write-Host "Lancement du tableau de bord sur http://127.0.0.1:$dashboardPort"
    $dashboard = Start-Process -FilePath "cmd.exe" `
        -ArgumentList @("/c", "npm run dev -- --host 127.0.0.1 --port $dashboardPort") `
        -WorkingDirectory $dashboardDir `
        -RedirectStandardOutput $dashboardLog `
        -RedirectStandardError $dashboardErr `
        -WindowStyle Hidden `
        -PassThru
    Write-Host "Tableau de bord PID: $($dashboard.Id)"
}

Write-Host "Ouverture du site vitrine public sur http://127.0.0.1:$vitrinePort"
Start-Process "http://127.0.0.1:$vitrinePort"
Write-Host "Logs backend: $backendLog"
Write-Host "Logs du site vitrine: $frontendLog"
Write-Host "Logs du tableau de bord: $dashboardLog"
