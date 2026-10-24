param([string]$Only = '')
# 用法：先開本機伺服器（frontend 當根目錄，port 8000），再執行
#   powershell -ExecutionPolicy Bypass -File tools\sweep\sweep_all.ps1
# 每種螢幕大小玩一遍，截圖和問題清單放在 tools\sweep\out
$here = $PSScriptRoot; $sp = Join-Path $here 'out'; New-Item -ItemType Directory -Force $sp | Out-Null
$sizes = @(
  @('phoneSE', 375, 667, 2, 1), @('iphone', 390, 844, 3, 1), @('android', 412, 915, 2.6, 1), @('phoneLand', 844, 390, 3, 1), @('phoneSELand', 667, 375, 2, 1),
  @('ipadMini', 744, 1133, 2, 0), @('ipadP', 820, 1180, 2, 0), @('ipadL', 1180, 820, 2, 0), @('ipadProL', 1366, 1024, 2, 0),
  @('laptop', 1366, 768, 1, 0), @('desktop', 1920, 1080, 1, 0)
)
if (-not $env:SUFFIX) { Remove-Item "$sp\shot_sw_*.png", "$sp\sweep_*.txt" -ErrorAction SilentlyContinue }
foreach ($s in $sizes) {
  if ($Only -and ($Only -split ',') -notcontains $s[0]) { continue }
  Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*edgecdp*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Start-Sleep 1
  Remove-Item -Recurse -Force "$sp\edgecdp" -ErrorAction SilentlyContinue
  $env:TAG = $s[0] + $env:SUFFIX; $env:VW = $s[1]; $env:VH = $s[2]; $env:DPR = $s[3]
  if ($s[4]) { $env:MOBILE = '1' } else { Remove-Item env:MOBILE -ErrorAction SilentlyContinue }
  node "$here\cdp.mjs" "http://localhost:8000/" "$here\s_sweep.mjs" | Select-String -Pattern 'screens|ERR|PAGE ERROR'
}
Get-Content "$sp\sweep_*.txt" -Encoding utf8
