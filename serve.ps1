$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server started! Click here: http://localhost:8080/"
Write-Host "Press Ctrl+C to stop."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        $request = $context.Request
        
        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ($localPath -eq "") { $localPath = "index.html" }
        
        # Replace forward slashes with backslashes for Windows path
        $localPath = $localPath -replace '/', '\'
        $fullPath = Join-Path (Get-Location).Path $localPath

        if (Test-Path $fullPath -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $buffer.Length
            
            if ($fullPath -match '\.css$') { $response.ContentType = "text/css" }
            elseif ($fullPath -match '\.js$') { $response.ContentType = "application/javascript" }
            elseif ($fullPath -match '\.html$') { $response.ContentType = "text/html" }
            elseif ($fullPath -match '\.jpg$') { $response.ContentType = "image/jpeg" }
            
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
