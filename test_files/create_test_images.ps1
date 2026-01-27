Add-Type -AssemblyName System.Drawing

# Create PNG
$bmp1 = New-Object System.Drawing.Bitmap(100,100)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.Clear([System.Drawing.Color]::Blue)
$g1.FillRectangle([System.Drawing.Brushes]::Red, 20, 20, 60, 60)
$bmp1.Save("C:\Users\HP\fileflip\test_files\test_image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bmp1.Dispose()
Write-Host "Created test_image.png"

# Create JPG
$bmp2 = New-Object System.Drawing.Bitmap(200,150)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.Clear([System.Drawing.Color]::Green)
$g2.FillEllipse([System.Drawing.Brushes]::Yellow, 30, 30, 140, 90)
$bmp2.Save("C:\Users\HP\fileflip\test_files\test_image.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g2.Dispose()
$bmp2.Dispose()
Write-Host "Created test_image.jpg"

# Create BMP
$bmp3 = New-Object System.Drawing.Bitmap(80,80)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.Clear([System.Drawing.Color]::Purple)
$bmp3.Save("C:\Users\HP\fileflip\test_files\test_image.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
$g3.Dispose()
$bmp3.Dispose()
Write-Host "Created test_image.bmp"
