param([string]$In, [string]$Out, [int]$Top, [int]$CropW = 1280, [int]$CropH = 800)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile($In)
if ($Top -lt 0) { $Top = $src.Height + $Top }
if ($Top + $CropH -gt $src.Height) { $CropH = $src.Height - $Top }
$bmp = New-Object System.Drawing.Bitmap($CropW, $CropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$srcRect = New-Object System.Drawing.Rectangle(0, $Top, $CropW, $CropH)
$dstRect = New-Object System.Drawing.Rectangle(0, 0, $CropW, $CropH)
$g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()
Write-Output ("cropped " + $CropW + "x" + $CropH + " from y=" + $Top)
