$uri = "http://localhost:5000/api/test/seed"
$body = @{
    userId = "6926a80dfa61b41005fdd6b6"
} | ConvertTo-Json

Write-Host "Creating sample match data..."
Write-Host "URI: $uri"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType "application/json"
    Write-Host "`nSuccess!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
}
catch {
    Write-Host "`nError:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd()
    }
}
