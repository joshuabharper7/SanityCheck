Add-Type -AssemblyName System.Drawing
$pngPath = Join-Path (Get-Location).Path "public\logo.png"
$icoPath = Join-Path (Get-Location).Path "public\logo.ico"

if (Test-Path $pngPath) {
    try {
        $sourceBmp = [System.Drawing.Bitmap]::FromFile($pngPath)
        
        # Create a 256x256 bitmap (standard high-res icon size)
        $newBmp = New-Object System.Drawing.Bitmap(256, 256)
        $g = [System.Drawing.Graphics]::FromImage($newBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($sourceBmp, 0, 0, 256, 256)
        
        # Convert to Icon
        $hIcon = $newBmp.GetHicon()
        $icon = [System.Drawing.Icon]::FromHandle($hIcon)
        
        # Save explicitly
        $stream = [System.IO.File]::Create($icoPath)
        $icon.Save($stream)
        $stream.Close()
        
        # Cleanup
        $icon.Dispose()
        $g.Dispose()
        $newBmp.Dispose()
        $sourceBmp.Dispose()
        
        Write-Host "SUCCESS: Re-created $icoPath with 256x256 dimensions." -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to convert icon. $_" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: logo.png not found." -ForegroundColor Red
}
