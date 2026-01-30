#  Case de Deploy: Infraestrutura de Observabilidade (Protocolo 09)

**Data do Deploy:** 30 de Janeiro de 2026  
**Status Final:** PRODUCTION-READY   
**Responsável:** Kaleb Nunes dos Santos

##  Descrição do Projeto
Implementação de conectividade segura para o **KNS Intelligence Portal** utilizando a arquitetura Zero Trust da Cloudflare. O objetivo foi expor o dashboard local (localhost:3001) através do domínio 
oc.knsconsultoria.com.br sem abertura de portas em firewall.

##  Incident & Resolution Log (Madrugada de Ops)

Durante a implantação, foram enfrentados e mitigados os seguintes desafios técnicos:

- **Auth Conflict:** Identificado certificado legado (cert.pem) em C:\Users\Kaleb\.cloudflared\ que impedia o novo login. Resolvido via deleção manual e re-autenticação do túnel.
- **DNS Overlap:** Registro CNAME antigo para o host 
oc bloqueava a nova rota. Realizada a limpeza de registros DNS fantasmas no painel Cloudflare.
- **Availability:** Configuração inicial via config.yml migrada para **Cloudflare Service Token**, permitindo a persistência nativa como serviço do Windows.

##  Arquitetura de Produção
- **Tunnel Name:** kns-global
- **Connector Type:** cloudflared service
- **Status:** Healthy 
- **Visual Reference:** Estética baseada em UI futurista (Concept UI).

---
*Documentação técnica automatizada via PowerShell.*
