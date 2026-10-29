# Cafe Mobile

Projeto de estudo (HTML + CSS + JavaScript puro): cardápio, pedido e galeria de fotos "Meu Café".

## Rodar no PC

Basta abrir o `index.html` no navegador.

## Testar no celular com QR Code

1. Instale as dependências (só na primeira vez):

   ```powershell
   npm install
   ```

2. Inicie o servidor e gere o QR Code:

   ```powershell
   npm run qr
   ```

3. O terminal mostra o endereço (ex.: `http://192.168.0.10:5500`) e a imagem
   `dev/qr.png` abre automaticamente. Aponte a câmera do celular para o QR Code.

O celular precisa estar na **mesma rede Wi-Fi** do PC. Para parar o servidor: `Ctrl + C`.

### Se o celular não abrir a página

- Confira se o celular está na mesma rede do PC (não use dados móveis).
- Libere a porta no Firewall do Windows (executar como Administrador):

  ```powershell
  New-NetFirewallRule -DisplayName "Cafe Mobile 5500" -Direction Inbound -Protocol TCP -LocalPort 5500 -Action Allow
  ```

- Para usar outra porta: `set PORTA=8080` e depois `npm run qr`.

### Sobre a câmera

O acesso à câmera ao vivo (`getUserMedia`) só funciona em `https://` ou em `localhost`.
Ao abrir pelo IP da rede local (http), use o botão **"Usar o app de câmera"**,
que abre a câmera do próprio celular e continua alimentando a galeria.
