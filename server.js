const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");

const APP_PORT = 5000;
const app = express();
app.use(express.json());

// --- CONFIGURAÇÃO CONFIRMADA ---
const ZABBIX_CONFIG = {
    url: "http://host.docker.internal:8080/api_jsonrpc.php", 
    user: "Admin",    // 'A' maiúsculo é obrigatório
    pass: "zabbix"    // A senha que funcionou no seu navegador
};

let zabbixToken = null;
let systemState = { latencyMod: 0, ddosActive: false };

let globalStats = {
    latam: { target: 'uol.com.br', ms: 0, status: 'OK' },
    useast: { target: 'google.com', ms: 0, status: 'OK' },
    euwest: { target: 'bbc.com', ms: 0, status: 'OK' }
};

let realMetrics = { cpu: 0, mem: 0, source: "Local" };

// --- CONEXÃO ZABBIX ---
async function zabbixAuth() {
    try {
        const res = await axios.post(ZABBIX_CONFIG.url, {
            jsonrpc: "2.0", method: "user.login",
            params: { username: ZABBIX_CONFIG.user, password: ZABBIX_CONFIG.pass },
            id: 1
        });
        
        if (res.data.result) {
            zabbixToken = res.data.result;
            console.log(" Zabbix Conectado! Token: " + zabbixToken.substring(0, 10) + "...");
        } else {
            console.log(" Erro Login Zabbix: " + JSON.stringify(res.data.error));
        }
    } catch (e) { 
        console.log(" Zabbix Offline: " + e.message); 
    }
}

async function fetchZabbixMetrics() {
    if (!zabbixToken) { await zabbixAuth(); return; }
    try {
        const res = await axios.post(ZABBIX_CONFIG.url, {
            jsonrpc: "2.0", method: "item.get",
            params: {
                output: ["lastvalue", "key_"],
                search: { key_: "system.cpu.util" }, 
                sortfield: "name", limit: 1
            },
            auth: zabbixToken, id: 2
        });

        if (res.data.result && res.data.result.length > 0) {
            let cpuVal = parseFloat(res.data.result[0].lastvalue);
            realMetrics.cpu = Math.round(cpuVal);
            realMetrics.mem = Math.round(40 + (cpuVal * 0.5)); 
            realMetrics.source = "Zabbix API";
        }
    } catch (e) { zabbixToken = null; }
}

setInterval(fetchZabbixMetrics, 5000);
setTimeout(fetchZabbixMetrics, 2000);

// --- MONITORAMENTO ---
function pingHost(host) {
    return new Promise(resolve => {
        const cmd = "ping -c 1 " + host;
        exec(cmd, { timeout: 2000 }, (err, stdout) => {
            if (err || !stdout) return resolve(null);
            const m = stdout.match(/time=([\d.]+)\s*ms/i);
            resolve(m ? parseInt(m[1], 10) + systemState.latencyMod : null);
        });
    });
}

async function updateGlobalMetrics() {
    const [latam, us, eu] = await Promise.all([
        pingHost(globalStats.latam.target),
        pingHost(globalStats.useast.target),
        pingHost(globalStats.euwest.target)
    ]);
    globalStats.latam.ms = latam || 0;
    globalStats.useast.ms = us || 0;
    globalStats.euwest.ms = eu || 0;
    
    globalStats.latam.status = (latam && latam < 200) ? 'ONLINE' : 'OFFLINE';
    globalStats.useast.status = (us) ? 'ONLINE' : 'OFFLINE';
    globalStats.euwest.status = (eu) ? 'ONLINE' : 'OFFLINE';
}
setInterval(updateGlobalMetrics, 5000);

// --- API ---
app.get("/api/enterprise-status", (req, res) => {
    const cpuDisplay = systemState.ddosActive ? 100 : realMetrics.cpu;
    res.json({
        regions: globalStats,
        system: { cpu: cpuDisplay, mem: realMetrics.mem, source: realMetrics.source },
        business: { rps: 1240, is_under_attack: systemState.ddosActive, latency_issue: systemState.latencyMod > 0 }
    });
});

app.post("/api/actions", (req, res) => {
    const { action } = req.body;
    if (action === 'MITIGATE_DDOS') systemState.ddosActive = false;
    if (action === 'REROUTE_TRAFFIC') systemState.latencyMod = 0;
    if (action === 'SIMULATE_ATTACK') systemState.ddosActive = true;
    res.json({ success: true });
});

app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(APP_PORT, () => { console.log(" KNS Enterprise v2.0 rodando na porta " + APP_PORT); });
