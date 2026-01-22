# 🛡️ KNS Command Center (NOC & Security Dashboard)

> **Full Stack Observability Platform:** Monitoramento Híbrido (Docker + Windows), Backend Python para Automação de Segurança e Visualização em Tempo Real via Grafana/Zabbix.

<div align="center">

![Status](https://img.shields.io/badge/STATUS-PRODUCTION-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/STACK-DOCKER%20|%20PYTHON%20|%20ZABBIX%20|%20GRAFANA-blue?style=for-the-badge)
![Automated](https://img.shields.io/badge/DEPLOY-AUTOMATED_POWERSHELL-blueviolet?style=for-the-badge)

<a href="assets/demo-video.mp4" target="_blank">
  <img src="assets/dashboard-full.png" alt="KNS Dashboard Main View" width="100%" style="border-radius: 10px; border: 2px solid #333; box-shadow: 0 0 20px rgba(0,255,65,0.2);">
</a>
<em>👆 Clique na imagem acima para ver a demonstração do Sistema de Defesa em Vídeo (MP4)</em>

</div>

---

## 🎯 O Objetivo
Desenvolver uma solução de **monitoramento unificado** que transcendesse a simples visualização de dados estáticos. O sistema foi projetado para operar em um cenário **híbrido real**, não simulado, integrando:

1.  **Monitoramento Passivo:** Coleta de métricas de infraestrutura conteinerizada (Linux/Docker) e host físico (Windows).
2.  **Defesa Ativa (C2):** Capacidade de resposta a incidentes (Mitigação) acionada diretamente pelo dashboard.

---

## 🏗️ Arquitetura da Solução

O projeto opera em uma arquitetura de microsserviços orquestrada via Docker Compose, quebrando a barreira entre o Container e o Host Físico:

* **Frontend (Command Node):** Interface HTML5/JS reativa consumindo APIs REST.
* **Backend (Cortex):** API Python (Flask) rodando na porta 5001, responsável por executar scripts de mitigação de segurança (Firewall Logs) e interagir com o sistema de arquivos.
* **Observability Core (Zabbix Server):** Coleta métricas via Agente Docker (Linux) e Agente Zabbix (Windows Host) via túnel DNS (host.docker.internal).
* **Visualization (Grafana):** Renderização de dados em séries temporais correlacionando tráfego de infraestrutura vs. tráfego de usuário.

---

## 🚀 Funcionalidades Chave (Evidências)

### 1. Monitoramento Híbrido (Hybrid Cloud Simulation)
O diferencial técnico deste projeto é a correlação de dados. O painel não mostra apenas "dados do Docker". Ele compara a carga do servidor contra o uso real do usuário na máquina física.

> **Análise do Gráfico:**
> * 🟢 **Linha Verde (Docker ETH0):** Baseline contínuo de servidor (Stress Test controlado via container).
> * 🟡 **Linha Amarela (Wi-Fi Físico):** Tráfego real do usuário (Rajadas/Bursts), capturado fora do container via Zabbix Agent Active.

![Hybrid Graph Visualization](assets/grafana-hybrid-graph.png)

### 2. Infraestrutura "Zero Simulation"
Não há dados "mockados" (falsos). Se a internet cair, o gráfico zera. Se o serviço parar, o alerta dispara.
A imagem abaixo comprova a validação do **Zabbix Server** comunicando com sucesso tanto com o Agente Docker quanto com o Agente Windows via DNS interno (host.docker.internal).

![Zabbix Infrastructure Status](assets/zabbix-hosts-ok.png)

### 3. Backend e Automação ("Protocolo 9")
O sistema possui um **Botão de Pânico** funcional. Ao detectar uma anomalia (como mostrado no Dashboard), o operador aciona o protocolo de defesa. O Frontend envia um comando ao Backend Python, que dispara scripts no servidor para bloqueio de tráfego e geração de logs de auditoria em tempo real.

![Backend Python Execution](assets/powershell-traffic-log.png)

---

## ⚙️ Engineering Challenges & Soluções (Case Study)

Este projeto simula um ambiente de produção real, enfrentando e resolvendo desafios de engenharia comuns em integrações híbridas:

| Desafio | Solução Técnica Implementada |
| :--- | :--- |
| **Conflito de Portas** | Migração do Backend Python para porta 5001 para evitar colisão com AirPlay/System services na porta 5000. |
| **Isolamento de Rede** | Uso de host.docker.internal como ponte DNS para permitir que o Container Zabbix enxergue o Host Windows. |
| **Monitoramento Windows** | Implementação de **Zabbix Agent 2 (Active)** para contornar barreiras de firewall de entrada no Windows. |
| **Contadores de Rede** | Script em PowerShell para descoberta automática de nomes de interface (PT-BR) e mapeamento de Performance Counters. |

---

## 📜 Runbook de Automação (Windows Agent PROD)

Devido à limitação de configurar Zabbix Web/Grafana 100% via script sem tokens de API prévios, foi desenvolvido um **Runbook Automatizado em PowerShell**. Este script prepara o ambiente Windows para integração imediata com o Docker.

> **💡 Nota de Engenharia**
>
> Este projeto não utiliza templates prontos para monitoramento Windows.
> A coleta de tráfego Wi-Fi é feita via **Performance Counters reais**, mapeados dinamicamente em ambiente PT-BR, com Zabbix Agent 2 em modo **Ativo** para simular restrições reais de firewall corporativo.

**Capabilities do Script (setup_agent.ps1):**
✔ Pre-flight Check (Validação de Admin).
✔ Backup automático de configurações.
✔ Configuração de ACTIVE checks e Plugins de Rede.
✔ Validação de portas (Netstat) e Serviços.
✔ **Dynamic Discovery:** Localiza automaticamente a interface Wi-Fi correta independente do hardware.

```powershell
<# =========================================================
 KNS Command Center – Windows Zabbix Agent 2 (PROD)
 Author: Kaleb Nunes dos Santos
 Purpose: Configure Zabbix Agent 2 (ACTIVE) + Real Network Discovery
========================================================= #>

# ... (Trecho do Script de Validação e Discovery) ...
`$interfaces = typeperf -qx "Interface de Rede" | Select-String "Bytes recebidos/s"

# Seleção inteligente baseada em drivers comuns
`$wifi = `$interfaces | Select-String "Wireless|Wi-Fi|Intel"

# Extração automática do nome da interface para o Zabbix
`$iface = (`$wifi -split '\\')[1]
Write-Host "Interface Selecionada para Monitoramento: `$iface" -ForegroundColor Green
🛠️ Stack Tecnológica
Componente,Tecnologia,Função
Container Engine,Docker & Compose,Orquestração e Isolamento
Monitoring,Zabbix Server 7.0,Coleta de Métricas (Active/Passive)
Telemetry,Zabbix Agent 2,Monitoramento do Host Windows
Backend,Python 3 (Flask),API de Automação e Controle
Dashboard,Grafana,Visualização de Dados (Time Series)
Scripting,PowerShell,Automação de Infraestrutura e Stress Test

👨‍💻 "Zero Simulação no Core"
Este projeto não utiliza dados estáticos (hardcoded).

Se a internet cai: O gráfico zera.

Se o Python para: O botão de defesa dá erro de conexão.

Se o Docker trava: O Zabbix alerta.

<div align="center"> <sub>Desenvolvido por <strong>Kaleb Nunes dos Santos</strong>


Consultor de Implantação & Especialista em Monitoramento</sub>


<a href="https://www.linkedin.com/in/kalebnunes/"> <img src="https://www.google.com/search?q=https://img.shields.io/badge/LinkedIn-Connect-blue%3Fstyle%3Dfor-the-badge%26logo%3Dlinkedin"> </a> </div>

