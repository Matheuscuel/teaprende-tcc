# demo_min.ps1 — TEAprende (fluxo essencial)

$API = "http://localhost:3001"
$H  = @{ "Content-Type"="application/json" }

function J($o){ $o | ConvertTo-Json -Compress }
function H($t){ @{ Authorization="Bearer $t"; "Content-Type"="application/json" } }

Invoke-RestMethod "$API/api/health" -Headers $H | Out-Null
Write-Host "API OK" -ForegroundColor Green

$admin = Invoke-RestMethod -Method POST "$API/api/auth/login" -Headers $H -Body (J @{email="admin@teste.com";password="Admin@123"})
$ter   = Invoke-RestMethod -Method POST "$API/api/auth/login" -Headers $H -Body (J @{email="leo@teste.com";password="Leo@123456"})
$HA = H $admin.token
$HT = H $ter.token
Write-Host "Logins OK (admin/terapeuta)" -ForegroundColor Green

$gid = (Invoke-RestMethod "$API/api/games" -Headers $HA | Select-Object -First 1).id
Write-Host "Usando game_id=$gid" -ForegroundColor Cyan

try{
  $child = Invoke-RestMethod -Method POST "$API/api/children" -Headers $HT -Body (J @{
    name="Maria Demo"; age=7; gender="feminino"; birthDate="2017-09-01"
  })
  $cid = $child.id
  Write-Host "Criança criada id=$cid" -ForegroundColor Green
}catch{
  $list = Invoke-RestMethod "$API/api/children" -Headers $HT
  $cid = $list.data[0].id
  Write-Host "Usando criança existente id=$cid" -ForegroundColor Yellow
}

$childGames = Invoke-RestMethod "$API/api/children/$cid/games" -Headers $HA
if(-not ($childGames | Where-Object { $_.game_id -eq $gid })){
  Invoke-RestMethod -Method POST "$API/api/children/$cid/games" -Headers $HA -Body (J @{ game_id = [int]$gid })
  Write-Host "Jogo $gid atribuído a child $cid" -ForegroundColor Green
}else{
  Write-Host "Jogo $gid já estava atribuído" -ForegroundColor Yellow
}

$prog = Invoke-RestMethod -Method POST "$API/api/children/$cid/games/$gid/progress" -Headers $HT -Body (J @{ score=90; notes="Ótimo" })
Write-Host ("Progresso salvo: " + (J $prog.progress)) -ForegroundColor Green

try{
  $plist = Invoke-RestMethod "$API/api/children/$cid/games/$gid/progress" -Headers $HT
  Write-Host "Progressos:" -ForegroundColor Cyan
  ($plist | ConvertTo-Json -Depth 6)
}catch{
  Write-Host "Rota de listagem não disponível — use o retorno do POST acima." -ForegroundColor Yellow
}

Write-Host "OK ✔ Fluxo essencial concluído." -ForegroundColor Cyan
