

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("sw.js")
      .then(function () {
        console.log("Service Worker registrado!");
      })
      .catch(function (erro) {
        console.log("Service Worker não registrado:", erro.message);
      });
  });
}

const btnInstalar = document.querySelector("#btn-instalar");
let pedidoDeInstalacao = null;

window.addEventListener("beforeinstallprompt", function (evento) {
  evento.preventDefault();
  pedidoDeInstalacao = evento;
  btnInstalar.hidden = false;
});

btnInstalar.addEventListener("click", async function () {
  if (!pedidoDeInstalacao) {
    return;
  }
  pedidoDeInstalacao.prompt();
  const escolha = await pedidoDeInstalacao.userChoice;
  console.log("Resposta do usuário:", escolha.outcome);
  pedidoDeInstalacao = null;
  btnInstalar.hidden = true;
});

window.addEventListener("appinstalled", function () {
  mostrarAviso("☕ Café Mobile instalado!");
});

function montarResumoPedido() {
  let texto = "☕ Meu pedido no Café Mobile:\n";
  for (const item of pedido) {
    texto = texto + item.quantidade + "x " + item.nome + " - " + formatarPreco(item.preco * item.quantidade) + "\n";
  }
  texto = texto + "Total: " + formatarPreco(calcularTotal());
  return texto;
}

async function compartilharPedido() {
  const texto = montarResumoPedido();

  if (navigator.share) {
    try {
      await navigator.share({ title: "Meu pedido", text: texto });
    } catch (erro) {
      console.log("Compartilhamento cancelado");
    }
  } else {

    await navigator.clipboard.writeText(texto);
    mostrarAviso("Resumo copiado! Cole onde quiser.");
  }
}

document.querySelector("#btn-compartilhar-pedido").addEventListener("click", compartilharPedido);

async function compartilharFoto(foto) {

  const resposta = await fetch(foto.imagem);
  const blob = await resposta.blob();
  const arquivo = new File([blob], "meu-cafe.jpg", { type: "image/jpeg" });

  if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: "Meu café", text: "Olha o meu café! ☕" });
    } catch (erro) {
      console.log("Compartilhamento cancelado");
    }
  } else {
    mostrarAviso("Este aparelho não compartilha imagens");
  }
}
