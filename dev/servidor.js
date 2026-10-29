// Servidor local + QR Code para testar o Cafe Mobile no celular.
// Uso: npm run qr   (ou: node dev/servidor.js)
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const QRCode = require("qrcode");

const RAIZ = path.resolve(__dirname, "..");
const PORTA_INICIAL = Number(process.env.PORTA || 5500);

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

// Descobre o IP da rede local (o que o celular vai usar para acessar o PC).
function ipLocal() {
  const candidatos = [];
  for (const [nome, infos] of Object.entries(os.networkInterfaces())) {
    for (const info of infos || []) {
      if (info.family !== "IPv4" || info.internal) continue;
      if (info.address.startsWith("169.254.")) continue;
      let prioridade = 50;
      if (/wi-?fi|wlan|wireless/i.test(nome)) prioridade = 0;
      else if (/ethernet|lan/i.test(nome)) prioridade = 10;
      else if (/vEthernet|virtual|vmware|virtualbox|docker|wsl|loopback/i.test(nome)) prioridade = 90;
      candidatos.push({ ip: info.address, prioridade });
    }
  }
  candidatos.sort((a, b) => a.prioridade - b.prioridade);
  return candidatos.length ? candidatos[0].ip : "127.0.0.1";
}

function criarServidor() {
  return http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    let arquivo = path.join(RAIZ, url);

    // Impede acessar arquivos fora da pasta do projeto.
    if (!arquivo.startsWith(RAIZ)) {
      res.writeHead(403).end("Acesso negado");
      return;
    }
    if (fs.existsSync(arquivo) && fs.statSync(arquivo).isDirectory()) {
      arquivo = path.join(arquivo, "index.html");
    }
    if (!fs.existsSync(arquivo)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Arquivo nao encontrado");
      return;
    }

    const ext = path.extname(arquivo).toLowerCase();
    res.writeHead(200, {
      "Content-Type": TIPOS[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(arquivo).pipe(res);
  });
}

function escutar(servidor, porta) {
  return new Promise((resolve, reject) => {
    servidor.once("error", (erro) => {
      if (erro.code === "EADDRINUSE" && porta < PORTA_INICIAL + 20) {
        escutar(servidor, porta + 1).then(resolve, reject);
      } else {
        reject(erro);
      }
    });
    servidor.listen(porta, "0.0.0.0", () => resolve(porta));
  });
}

(async () => {
  const servidor = criarServidor();
  const porta = await escutar(servidor, PORTA_INICIAL);
  const url = `http://${ipLocal()}:${porta}`;

  const destino = path.join(__dirname, "qr.png");
  await QRCode.toFile(destino, url, { width: 400, margin: 2 });

  console.log("");
  console.log("  ===============================================");
  console.log("   CAFE MOBILE - servidor local");
  console.log("  ===============================================");
  console.log(`   No PC:      http://localhost:${porta}`);
  console.log(`   No celular: ${url}`);
  console.log("");
  console.log("   1. Conecte o celular na MESMA rede Wi-Fi do PC");
  console.log("   2. Abra a camera do celular e aponte para o QR Code");
  console.log(`   3. QR Code salvo em: ${destino}`);
  console.log("");
  console.log("   Para parar o servidor: Ctrl + C");
  console.log("");

  // Abre a imagem do QR Code automaticamente (Windows, macOS ou Linux).
  const abrir =
    process.platform === "win32" ? `start "" "${destino}"`
    : process.platform === "darwin" ? `open "${destino}"`
    : `xdg-open "${destino}"`;
  exec(abrir, () => {});
})().catch((erro) => {
  console.error("Erro ao iniciar o servidor:", erro.message);
  process.exit(1);
});
