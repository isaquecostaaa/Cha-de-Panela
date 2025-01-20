// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTCwy1pQM0E3yVifYsW69vhrSSGh-zr5M",
  authDomain: "cha-de-panela-39a8e.firebaseapp.com",
  databaseURL: "https://cha-de-panela-39a8e-default-rtdb.firebaseio.com",
  projectId: "cha-de-panela-39a8e",
  storageBucket: "cha-de-panela-39a8e.firebasestorage.app",
  messagingSenderId: "427821589232",
  appId: "1:427821589232:web:9dd9dfd2d695ffbb955835",
};

// Importação dos módulos do Firebase v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Função para pegar os itens e exibir no HTML
function carregarItens() {
  const itemsRef = ref(database, "items");

  onValue(itemsRef, (snapshot) => {
    const items = snapshot.val();

    // Antes de adicionar novos itens, limpa os grids baseados nas categorias
    // Primeiro, obtém todas as categorias distintas e limpa os grids.
    const categories = [
      ...new Set(Object.values(items).map((item) => item.category)),
    ];

    categories.forEach((category) => {
      const grid = document.getElementById(category);
      if (grid) {
        grid.innerHTML = ""; // Limpa a grid correspondente à categoria
      }
    });

    // Agora, itere sobre os itens e adicione-os às grids
    for (const key in items) {
      if (items.hasOwnProperty(key)) {
        const item = items[key];

        // Pega o grid de acordo com a categoria
        const grid = document.getElementById(item.category);

        if (grid) {
          // Criação do HTML para cada item
          const div = document.createElement("div");
          div.classList.add("item");
          div.dataset.status = item.reserved ? "reservado" : "disponivel";

          const status = document.createElement("div");
          status.classList.add("status");
          status.textContent = item.reserved ? "INDISPONÍVEL" : "DISPONÍVEL";
          if (item.reserved) status.style.backgroundColor = "red";

          const img = document.createElement("img");
          img.classList.add("item-img");
          img.src = item.image || "link-da-imagem-default.jpg";
          img.alt = item.name;

          const p = document.createElement("p");
          p.textContent = item.name || "Produto sem nome";

          const button = document.createElement("button");
          button.classList.add("item-btn");
          button.dataset.item = key;
          button.textContent = "Escolher";

          if (item.reserved) {
            button.disabled = true;
          } else {
            button.addEventListener("click", () => abrirReservationModal(key));
          }

          div.appendChild(status);
          div.appendChild(img);
          div.appendChild(p);
          div.appendChild(button);

          grid.appendChild(div); // Adiciona o item ao grid correspondente
        } else {
          console.warn(
            `Grid para a categoria "${item.category}" não encontrado.`
          );
        }
      }
    }
  });
}

// Função para reservar o item
/* function reservarItem(itemId, item, div, button, status) {
  const nomeUsuario = prompt("Digite seu nome para reservar o item:");

  if (nomeUsuario) {
    const itemRef = ref(database, "items/" + itemId);

    // Atualizar os dados no Firebase
    update(itemRef, {
      reserved: true,
      reservedBy: nomeUsuario
    }).then(() => {
      // Atualizar a UI
      status.textContent = "INDISPONÍVEL";
      status.style.backgroundColor = "red"; // Alterar fundo para vermelho
      button.disabled = true; // Desabilitar o botão
      button.textContent = "Reservado por " + nomeUsuario; // Alterar texto do botão
    }).catch(error => {
      alert("Erro ao reservar o item: " + error.message);
    });
  }
} */

// Função para adicionar um novo item à base de dados
function adicionarItemFirebase(nome, imagem, categoria) {
  if (!nome || !imagem || !categoria) {
    alert("Por favor, forneça um nome, a categoria e um link de imagem.");
    return;
  }

  const itemsRef = ref(database, "items");

  // Cria uma nova referência com um ID único gerado automaticamente
  const newItemRef = push(itemsRef);

  set(newItemRef, {
    name: nome, // Nome do item
    image: imagem,
    category: categoria, // Link da imagem
    reserved: false, // Por padrão, o item estará disponível
    reservedBy: null, // Inicialmente, ninguém reservou
  })
    .then(() => {
      carregarItens(); // Recarregar os itens na UI
    })
    .catch((error) => {
      alert("Erro ao adicionar item: " + error.message);
    });
}

// Função para lidar com o envio do formulário
function handleAddItemFormSubmit(event) {
  event.preventDefault();

  const nomeItem = document.getElementById("item-name").value;
  const imagemItem = document.getElementById("item-image").value;
  const categoriaItem = document.getElementById("item-category").value;

  if (nomeItem && imagemItem && categoriaItem) {
    // Adicionar o item ao Firebase
    adicionarItemFirebase(nomeItem, imagemItem, categoriaItem);

    // Limpar o formulário após adicionar
    document.getElementById("add-item-form").reset();
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

// Adicionar evento para o envio do formulário
document
  .getElementById("add-item-form")
  .addEventListener("submit", handleAddItemFormSubmit);

// Chama a função ao carregar a página
window.onload = carregarItens;

// Função para carregar os itens reservados
// Função para carregar os itens reservados
function carregarItensReservados() {
  const itemsRef = ref(database, "items");

  onValue(itemsRef, (snapshot) => {
    const items = snapshot.val();
    const choicesList = document.getElementById("choices-list");

    // Limpar a lista antes de adicionar novos itens
    choicesList.innerHTML = "";

    if (items) {
      let temReservas = false; // Verifica se há itens reservados

      for (const key in items) {
        if (items.hasOwnProperty(key)) {
          const item = items[key];

          // Verifica se o item está reservado
          if (item.reserved) {
            temReservas = true;

            // Criação do elemento <li> para cada item reservado
            const listItem = document.createElement("li");
            listItem.classList.add("choice-item");

            // Criação do <p> para a mensagem
            const itens = [
              `<p><b>${item.name}</b>`, // Item em negrito
              `foi reservado por`,
              `<b>${item.reservedBy}</b></p>`, // Nome do reservado em negrito
            ];

            const mensagem = document.createElement("p");
            mensagem.innerHTML = itens.join(" ");

            // Botão para deletar o item reservado
            const button = document.createElement("button");
            button.classList.add("delete-btn");
            button.innerHTML = '<i class="fas fa-trash"></i>';

            // Adiciona o evento de deletar
            button.addEventListener("click", () => deletarItem(key, listItem));

            // Adiciona o <p> e o botão ao <li>
            listItem.appendChild(mensagem);
            listItem.appendChild(button);

            // Adiciona o <li> à lista
            choicesList.appendChild(listItem);
          }
        }
      }

      if (!temReservas) {
        // Adiciona uma mensagem à lista se não houver itens reservados
        const noItemsMessage = document.createElement("li");
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhum item reservado no momento.";
        noItemsMessage.appendChild(mensagem);
        noItemsMessage.classList.add("no-items");
        choicesList.appendChild(noItemsMessage);
      }
    } else {
      // Adiciona uma mensagem à lista se o snapshot for vazio
      const noItemsMessage = document.createElement("li");
      const mensagem = document.createElement("p");
      mensagem.textContent = "Nenhum item reservado no momento.";
      noItemsMessage.appendChild(mensagem);
      noItemsMessage.classList.add("no-items");
      choicesList.appendChild(noItemsMessage);
    }
  });
}

// Função para deletar o item (marcando-o como disponível novamente)
function deletarItem(itemId, itemDiv) {
  const itemRef = ref(database, "items/" + itemId);

  // Obter os dados atuais do item para manter a imagem
  get(itemRef)
    .then((snapshot) => {
      const item = snapshot.val();

      // Atualizar o item para torná-lo disponível novamente, preservando a foto
      set(itemRef, {
        reserved: false, // Torna o item disponível novamente
        reservedBy: null, // Remove o nome da pessoa que reservou
        image: item.image, // Preserva a imagem atual do item
        name: item.name,
        category: item.category, // Preserva o nome atual do item
      })
        .then(() => {
          // Remover o item do relatório na interface
          itemDiv.remove();

          // Recarregar a lista de itens para garantir que tudo está atualizado
          carregarItens();
        })
        .catch((error) => {
          alert("Erro ao deletar o item: " + error.message);
        });
    })
    .catch((error) => {
      alert("Erro ao obter dados do item: " + error.message);
    });
}

window.onload = () => {
  carregarItens(); // Carregar todos os itens na grid
  carregarItensReservados(); // Carregar os itens reservados no relatório
};

let currentItemId = null; // Variável para armazenar o ID do item atual que será reservado

// Função para exibir o modal de reserva
function abrirReservationModal(itemId) {
  currentItemId = itemId; // Salva o ID do item a ser reservado
  const reservationModal = document.getElementById("reservation-modal");
  reservationModal.style.display = "flex"; // Mostra o modal
}

// Evento para fechar modais ao clicar no botão "close"
document.querySelectorAll(".modal .close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    closeBtn.parentElement.parentElement.style.display = "none";
  });
});

// Evento para confirmar a reserva
document.getElementById("confirm-reservation").addEventListener("click", () => {
  const userNameInput = document.getElementById("user-name");
  const userName = userNameInput.value.trim();

  if (userName && currentItemId) {
    const itemRef = ref(database, "items/" + currentItemId);

    // Atualizar os dados no Firebase
    update(itemRef, {
      reserved: true,
      reservedBy: userName,
    })
      .then(() => {
        // Fechar o modal de reserva e abrir o modal de agradecimento
        document.getElementById("reservation-modal").style.display = "none";
        document.getElementById("thank-you-modal").style.display = "flex";

        // Limpar o campo de entrada e atualizar os itens na UI
        userNameInput.value = "";
        carregarItens();
      })
      .catch((error) => {
        alert("Erro ao reservar o item: " + error.message);
      });
  } else {
    alert("Por favor, digite seu nome para continuar.");
  }
});

// Fecha o modal de agradecimento automaticamente após 3 segundos
document.getElementById("thank-you-modal").addEventListener("click", () => {
  document.getElementById("thank-you-modal").style.display = "none";
});

const senhaRef = ref(database, "senha/valor"); // Caminho até o valor da senha
let senhaCorreta = "";

get(senhaRef)
  .then((snapshot) => {
    senhaCorreta = snapshot.exists() ? snapshot.val() : null; // Busca o valor ou null caso não exista
    console.log(senhaCorreta); // Exibe o valor da senha
  })
  .catch((error) => console.error("Erro ao buscar a senha:", error));

// Selecionar elementos do DOM
const manageBtn = document.getElementById("manage-btn");
const passwordModal = document.getElementById("password-modal");
const reportModal = document.getElementById("modal");
const submitPasswordBtn = document.getElementById("submit-password");
const closeButtons = document.querySelectorAll(".modal .close");
const errorMessage = document.getElementById("error-message");

// Abrir o modal de senha ao clicar no botão "Gerenciar"
manageBtn.addEventListener("click", () => {
  passwordModal.style.display = "flex";
});

// Fechar os modais ao clicar nos botões de fechar
closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.parentElement.parentElement.style.display = "none";
    errorMessage.style.display = "none"; // Esconde a mensagem de erro ao fechar o modal
    document.getElementById("password").value = ""; // Limpa o campo de senha
  });
});

// Verificar a senha ao clicar no botão "Confirmar"
submitPasswordBtn.addEventListener("click", () => {
  const passwordInput = document.getElementById("password").value;

  if (passwordInput === senhaCorreta) {
    // Fechar o modal de senha e abrir o modal de relatório
    passwordModal.style.display = "none";
    reportModal.style.display = "flex";
    errorMessage.style.display = "none"; // Esconde mensagem de erro (se exibida anteriormente)

    // Carregar os itens reservados no modal de relatório
    carregarItensReservados();
  } else {
    // Exibir mensagem de erro
    errorMessage.textContent = "Senha incorreta. Tente novamente.";
    errorMessage.style.display = "flex";
  }
});

// Fechar o modal se o usuário clicar fora dele
window.addEventListener("click", (event) => {
  if (event.target === passwordModal) {
    passwordModal.style.display = "none";
    errorMessage.style.display = "none";
  }
  if (event.target === reportModal) {
    reportModal.style.display = "none";
  }
});

// ------------------------------------------------------------------------------------------------------

let isDescending = true; // Variável para controlar a direção da ordenação (Z-A ou A-Z)

document.getElementById("search-bar").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const items = Array.from(document.getElementsByClassName("item"));

  items.forEach((item) => {
    const productName = item.querySelector("p").textContent.toLowerCase();

    if (productName.includes(searchTerm)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
});

document
  .getElementById("toggle-sort-btn")
  .addEventListener("click", function () {
    const grids = document.querySelectorAll(".grid"); // Seleciona todos os grids com a classe .grid
    const isDescending = this.dataset.sortOrder === "desc";

    // Alternar a direção da ordenação
    this.dataset.sortOrder = isDescending ? "asc" : "desc";

    // Atualizar o ícone do botão com base na direção da ordenação
    const icon = this.querySelector("i");
    if (isDescending) {
      icon.classList.add("fa-arrow-down-a-z");
      icon.classList.remove("fa-arrow-down-z-a");
    } else {
      icon.classList.add("fa-arrow-down-z-a");
      icon.classList.remove("fa-arrow-down-a-z");
    }

    // Iterar sobre cada grid e ordenar os itens
    grids.forEach((grid) => {
      const items = Array.from(grid.getElementsByClassName("item"));

      items.sort((a, b) => {
        const nameA = a.querySelector("p").textContent.toUpperCase();
        const nameB = b.querySelector("p").textContent.toUpperCase();

        // Se a direção for descendente (Z-A), ordena em ordem alfabética inversa,
        // caso contrário (A-Z), ordena em ordem alfabética normal
        return isDescending
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      });

      items.forEach((item) => grid.appendChild(item));
    });
  });

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger-btn");
  const menu = document.querySelector(".list");
  const menuLinks = document.querySelectorAll(".menu a");
  const body = document.body;
  const html = document.documentElement;
  const header = document.querySelector("header"); // Seleciona o header
  const navbar = document.querySelector(".navbar"); // Seleciona a lista dentro do menu

  let scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    menu.classList.toggle("active");
    header.classList.remove("hide");
    navbar.style.position = "fixed";
    // Remove a classe para mostrar o header

    if (menu.classList.contains("active")) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      body.style.paddingRight = `${scrollBarWidth}px`; // Compensa a largura da barra de rolagem
      body.style.marginTop = `${8}vh`; // Compensa a largura da barra de rolagem
    } else {
      body.style.overflow = "";
      html.style.overflow = "";
      navbar.style.position = "sticky";
      body.style.paddingRight = "";
      body.style.marginTop = ""; // Compensa a largura da barra de rolagem
      // Remove o padding extra
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      menu.classList.remove("active");
      navbar.style.position = "sticky";
      body.style.paddingRight = "";
      body.style.marginTop = ""; // Compensa a largura da barra de rolagem
      // Remove o padding extra
      body.style.overflow = "";
      html.style.overflow = "";
    });
  });
});

document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault(); // Evita a atualização completa da página
    const targetId = link.getAttribute("href").substring(1); // Pega o ID do destino (exclui o "#")
    const targetElement = document.getElementById(targetId);

    // Rola suavemente até o elemento
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header"); // Seleciona o header
  let lastScrollTop = 0; // Variável para armazenar a última posição do scroll
  const menu = document.querySelector(".list"); // Seleciona a lista dentro do menu

  window.addEventListener("scroll", () => {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    // Verifica se o menu está ativo antes de aplicar a lógica de scroll
    if (!menu.classList.contains("active")) {
      // Se o usuário rolar para baixo
      if (currentScroll > lastScrollTop) {
        header.classList.add("hide"); // Adiciona a classe para esconder o header
      } else {
        header.classList.remove("hide"); // Remove a classe para mostrar o header
      }
    } else {
      // Garante que o header permaneça visível enquanto o menu estiver ativo
      header.classList.remove("hide");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Previne que o valor de scroll seja negativo
  });
});
