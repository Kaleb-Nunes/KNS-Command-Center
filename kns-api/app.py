from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import datetime

app = Flask(__name__, template_folder='templates')

# Configuração de CORS para permitir cookies em redes diferentes
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

@app.after_request
def add_header(response):
    # Permite que o Grafana seja carregado dentro do seu Dashboard sem bloqueio de cookie
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/mitigate', methods=['POST', 'OPTIONS'])
def mitigate():
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # Log que aparece no seu terminal quando o Protocolo 9 é ativado
    print(f"[*] PROTOCOLO 9 ATIVADO: [{now}] - IP BLOQUEADO NA REDE WIFI")
    
    return jsonify({
        "status": "success",
        "action": "FIREWALL_UPDATE_COMPLETE",
        "timestamp": now
    })

if __name__ == '__main__':
    # '0.0.0.0' permite que você acesse pelo IP da sua empresa (ex: 192.168.100.68)
    app.run(host='0.0.0.0', port=5000, debug=True)
    from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__, template_folder='templates')
CORS(app) # Libera o acesso entre portas diferentes na rede da empresa

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # Roda em todas as interfaces de rede para aceitar o Wi-Fi da empresa
    app.run(host='0.0.0.0', port=5000, debug=True)