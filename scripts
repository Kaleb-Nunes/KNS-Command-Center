#  KNS Consultoria Global - Automated Deploy Logger
# Versão: 1.0 | Protocolo 09

param (
    [Parameter(Mandatory=$true)]
    [string]$Titulo,
    
    [Parameter(Mandatory=$true)]
    [string]$DesafiosTecnicos,
    
    [Parameter(Mandatory=$true)]
    [string]$SolucoesAplicadas
)

$Data = Get-Date -Format "dd/MM/yyyy HH:mm"
$User = $env:USERNAME
$FileName = "DEPLOY_LOG_$(Get-Date -Format 'yyyyMMdd_HHmm').md"

$Template = @"
#  KNS Deploy Report: $Titulo

** Data:** $Data  
** Engenheiro Responsável:** $User  
** Status:** PRODUCTION-READY

##  Descrição da Manutenção
Relatório gerado automaticamente após intervenção técnica na infraestrutura da KNS Consultoria Global.

###  Desafios Identificados
$DesafiosTecnicos

###  Soluções e Engenharia Aplicada
$SolucoesAplicadas

###  Ambiente e Ferramentas
- **Engine:** Cloudflare Zero Trust / PowerShell Automation
- **Monitoramento:** Zabbix/Grafana Integration
- **Persistência:** Windows Service Mode

---
*Gerado via KNS Deploy Engine - Protocolo 09*
"@

$Template | Out-File -FilePath $FileName -Encoding utf8
Write-Host " Log de Deploy gerado com sucesso: $FileName" -ForegroundColor Green
