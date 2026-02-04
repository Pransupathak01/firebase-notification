
$sourceFile = "c:\firebaseapp\src\assests\SuRYA.png"
$resDir = "c:\firebaseapp\android\app\src\main\res"

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $sourceFile)) {
    Write-Host "Error: Source file not found at $sourceFile"
    exit 1
}

function Resize-Image {
    param(
        [string]$SrcPath,
        [string]$DestPath,
        [int]$Width,
        [int]$Height
    )

    $srcImage = [System.Drawing.Image]::FromFile($SrcPath)
    $destBitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
    
    $destBitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcImage.Dispose()
    
    Write-Host "Created $DestPath"
}

$iconConfig = @(
    @{ Folder = "mipmap-mdpi"; Size = 48 },
    @{ Folder = "mipmap-hdpi"; Size = 72 },
    @{ Folder = "mipmap-xhdpi"; Size = 96 },
    @{ Folder = "mipmap-xxhdpi"; Size = 144 },
    @{ Folder = "mipmap-xxxhdpi"; Size = 192 }
)

foreach ($config in $iconConfig) {
    $folderPath = Join-Path $resDir $config.Folder
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Force -Path $folderPath | Out-Null
    }
    
    # Standard Icon
    $destPath = Join-Path $folderPath "ic_launcher.png"
    Resize-Image -SrcPath $sourceFile -DestPath $destPath -Width $config.Size -Height $config.Size
    
    # Round Icon (Simple resize, not masking)
    $destPathRound = Join-Path $folderPath "ic_launcher_round.png"
    Resize-Image -SrcPath $sourceFile -DestPath $destPathRound -Width $config.Size -Height $config.Size
}

Write-Host "Icons updated successfully."
