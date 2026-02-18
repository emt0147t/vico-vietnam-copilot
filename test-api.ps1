$body = @{
    userCompany = @{
        name = "Test Company"
        industry = "Technology"
        description = "Test description"
        products = "Test products"
        location = "Vietnam"
        size = "11-50"
    }
    selectedCompetitors = @()
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/market-intelligence" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -ErrorAction SilentlyContinue

$response | ConvertTo-Json -Depth 10
