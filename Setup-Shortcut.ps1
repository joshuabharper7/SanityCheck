$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("Desktop"), "SanityCheck.lnk")

# Delete old shortcut if it exists
if (Test-Path $ShortcutPath) { Remove-Item $ShortcutPath -Force }

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

# Get current directory
$CurrentDir = (Get-Location).Path
$TargetFile = Join-Path $CurrentDir "SanityCheck.exe"

$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = $CurrentDir
$Shortcut.Description = "Launch SanityCheck AI Interviewer"
$Shortcut.Save()

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: Native EXE Shortcut created on Desktop!" -ForegroundColor Green
Write-Host " The icon is embedded and should look perfect." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
