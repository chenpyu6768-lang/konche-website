@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required for the recommended preview.
  echo You can also extract all files and then open index.html directly.
  pause
  exit /b 1
)
start "KONCHE Preview Server" /min node "%~dp0_preview_server.mjs" "%~dp0" 8765
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='http://127.0.0.1:8765/index.html'; $ready=$false; for($i=0;$i -lt 20;$i++){try{$r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1;if($r.StatusCode -eq 200){$ready=$true;break}}catch{};Start-Sleep -Milliseconds 300};if($ready){Start-Process $url;exit 0}else{Write-Host 'Preview server did not start.';exit 1}"
if errorlevel 1 pause

