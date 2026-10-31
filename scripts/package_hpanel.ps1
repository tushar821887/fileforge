Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = 'D:\Projects\min\fileforge\api-fileforge-hpanel.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-FolderToZip($folderPath, $zipPrefix) {
    if (-not (Test-Path $folderPath)) { return }
    $folderResolved = (Resolve-Path $folderPath).Path
    $files = Get-ChildItem -Path $folderResolved -Recurse -File
    foreach ($file in $files) {
        $relPath = $file.FullName.Substring($folderResolved.Length).TrimStart('\', '/')
        $entryName = ($zipPrefix + $relPath) -replace '\\', '/'
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}

function Add-FileToZip($filePath, $entryName) {
    if (-not (Test-Path $filePath)) { return }
    $fileResolved = (Resolve-Path $filePath).Path
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $fileResolved, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}

Add-FolderToZip 'D:\Projects\min\fileforge\backend\dist' 'dist/'
Add-FolderToZip 'D:\Projects\min\fileforge\backend\tmp' 'tmp/'
Add-FolderToZip 'D:\Projects\min\fileforge\packages\shared\dist' 'packages/shared/dist/'
Add-FileToZip 'D:\Projects\min\fileforge\packages\shared\package.json' 'packages/shared/package.json'
Add-FolderToZip 'D:\Projects\min\fileforge\node_modules\@formatflow\shared' 'node_modules/@formatflow/shared/'

Add-FileToZip 'D:\Projects\min\fileforge\backend\index.js' 'index.js'
Add-FileToZip 'D:\Projects\min\fileforge\backend\app.js' 'app.js'
Add-FileToZip 'D:\Projects\min\fileforge\backend\server.js' 'server.js'
Add-FileToZip 'D:\Projects\min\fileforge\backend\.htaccess' '.htaccess'
Add-FileToZip 'D:\Projects\min\fileforge\backend\.env' '.env'
Add-FileToZip 'D:\Projects\min\fileforge\backend\package.json' 'package.json'
Add-FileToZip 'D:\Projects\min\fileforge\backend\package-lock.json' 'package-lock.json'

$archive.Dispose()
Write-Host "api-fileforge-hpanel.zip generated successfully!"
