const firebaseConfig = {
  apiKey: "AIzaSyDTCwy1pQM0E3yVifYsW69vhrSSGh-zr5M",
  authDomain: "cha-de-panela-39a8e.firebaseapp.com",
  databaseURL: "https://cha-de-panela-39a8e-default-rtdb.firebaseio.com",
  projectId: "cha-de-panela-39a8e",
  storageBucket: "cha-de-panela-39a8e.firebasestorage.app",
  messagingSenderId: "427821589232",
  appId: "1:427821589232:web:9dd9dfd2d695ffbb955835"
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referência ao banco de dados
const itemsRef = ref(db, 'items/');

// Monitorar itens no banco de dados
onValue(itemsRef, (snapshot) => {
  const items = snapshot.val();
  document.querySelectorAll('.item-btn').forEach(button => {
    const itemName = button.dataset.item; // O valor do data-item
    const itemDiv = button.closest('.item'); // A div .item
    const statusDiv = itemDiv.querySelector('.status'); // A div .status

    if (items && items[itemName] && items[itemName].reserved) {
      // Alterar o texto e a cor da div .status quando o item estiver reservado
      statusDiv.textContent = "Indisponível"; // Atualiza o texto para "Indisponível"
      statusDiv.style.backgroundColor = "#f44336"; // Muda o fundo para vermelho
      button.textContent = "Indisponível"; // Texto do botão
      button.disabled = true; // Desabilita o botão
    } else {
      // Caso contrário, mantém o texto e o botão habilitado
      statusDiv.textContent = "Disponível"; // Texto padrão
      statusDiv.style.backgroundColor = "#4caf50"; // Cor de fundo padrão (verde)
      button.textContent = "Escolher"; // Texto do botão
      button.disabled = false; // Habilita o botão
    }
  });
});

// Modais
const reservationModal = document.getElementById("reservation-modal");
const thankYouModal = document.getElementById("thank-you-modal");
const closeBtns = document.querySelectorAll(".close");

// Fechar modais
closeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    reservationModal.style.display = "none";
    thankYouModal.style.display = "none";
  });
});

// Lidar com o clique no botão "Escolher"
document.querySelectorAll('.item-btn').forEach(button => {
  button.addEventListener('click', () => {
    const itemName = button.dataset.item;
    const itemDiv = button.closest('.item');
    const statusDiv = itemDiv.querySelector('.status');

    // Verificar se o item já foi reservado
    if (statusDiv.textContent === "Indisponível") {
      alert("Este item já foi reservado!");
      return; // Impede que o modal seja aberto
    }

    // Exibir o modal de reserva
    reservationModal.style.display = "flex";

    // Lidar com o clique no botão "Confirmar" do modal
    document.getElementById('confirm-reservation').onclick = () => {
      const userName = document.getElementById('user-name').value.trim();

      if (!userName) {
        alert("Por favor, insira seu nome!");
        return;
      }

      // Atualizar o banco de dados com a reserva do item
      set(ref(db, `items/${itemName}`), {
        reserved: true,
        reservedBy: userName
      }).then(() => {
        // Atualizar a interface
        statusDiv.textContent = "Indisponível";
        statusDiv.style.backgroundColor = "#f44336";
        button.textContent = "Indisponível";
        button.disabled = true;

        // Fechar o modal de reserva e abrir o de agradecimento
        reservationModal.style.display = "none";
        thankYouModal.style.display = "flex";
      }).catch((error) => {
        console.error("Erro ao reservar o item:", error);
      });
    };
  });
});
      
    
      // Senha correta para acesso ao painel
      const correctPassword = "filhos212325"; // Altere para a senha desejada
    
      // Variáveis para controle de acesso
      let isPasswordCorrect = false;
    
      // Fechar o modal de senha ao clicar no "X"
      document.querySelectorAll(".close").forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
          // Encontra o modal pai (o mais próximo com a classe 'modal') e oculta
          const modal = closeButton.closest(".modal");
          if (modal) {
            modal.style.display = "none";
          }
        });
      });
    
      // Ao clicar no botão de confirmar senha
      document.getElementById("submit-password").addEventListener("click", () => {
        const enteredPassword = document.getElementById("password").value;
        const errorMessage = document.getElementById("error-message"); // Referência à mensagem de erro

  // Limpar a mensagem de erro, caso tenha sido exibida anteriormente
        errorMessage.style.display = "none";
        errorMessage.textContent = "";
    
        if (enteredPassword === correctPassword) {
          // Se a senha estiver correta, esconder o modal de senha
          document.getElementById("password-modal").style.display = "none";
          isPasswordCorrect = true; // Define que a senha foi correta
    
          // Exibir o modal de gerenciamento após a senha correta
          document.getElementById("modal").style.display = "flex";
          loadChoices(); // Carrega as escolhas feitas

        } else {
          // Se a senha estiver errada, mostrar um aviso
          errorMessage.style.display = "block"; // Exibe a mensagem de erro
        errorMessage.textContent = "Senha incorreta! Tente novamente.";
        }
      });
    
      // Função para abrir o modal de senha ao clicar no botão
      document.getElementById("manage-btn").addEventListener("click", () => {
        // Ao clicar em "Gerenciar", exibe o modal de senha
        document.getElementById("password-modal").style.display = "flex";
      });
    
      function loadChoices() {
  const choicesList = document.getElementById("choices-list");
  choicesList.innerHTML = ""; // Limpa a lista antes de carregar as novas escolhas

  // Obter dados do Firebase
  const itemsRef = ref(db, 'items/');
  onValue(itemsRef, (snapshot) => {
    const items = snapshot.val();
    if (items) {
      for (const itemName in items) {
        const item = items[itemName];
        if (item.reserved) {
          const li = document.createElement("li");
          
          // Usando array para armazenar as partes do texto
          const itens = [
            `<p><b>${itemName}</b>`, // Item em negrito
            `foi reservado por`,
            `<b>${item.reservedBy}</b></p>` // Nome do reservado em negrito
          ];
  
          // Usando join() para juntar a string
          li.innerHTML = itens.join(' ');
  
          // Cria o ícone de lixeira
          const deleteButton = document.createElement("button");
          deleteButton.classList.add("delete-btn");
          // Usando Font Awesome para ícone de lixeira
          deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  
          // Adiciona o evento de clique para excluir a reserva
          deleteButton.addEventListener("click", () => deleteReservation(itemName));
          li.appendChild(deleteButton);
  
          choicesList.appendChild(li);
        }
      }
    }
  });
}

      // Função para excluir a reserva
      function deleteReservation(itemName) {
        const itemRef = ref(db, `items/${itemName}`);
    
        // Excluir a reserva no Firebase, configurando os valores corretamente
        set(itemRef, {
            reserved: false,
            reservedBy: null
        }).then(() => {
            // Recarregar as escolhas após a exclusão
            loadChoices();
        }).catch((error) => {
            console.error("Erro ao excluir a reserva:", error);
        });
    }


//----------------------------------------------------------------------------------------------

let isDescending = true; // Variável para controlar a direção da ordenação (Z-A ou A-Z)

document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const items = Array.from(document.getElementsByClassName('item'));

    items.forEach(item => {
        const productName = item.querySelector('p').textContent.toLowerCase();

        if (productName.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

document.getElementById('toggle-sort-btn').addEventListener('click', function() {
    const grid = document.getElementById('kitchen-grid');
    const items = Array.from(grid.getElementsByClassName('item'));

    // Alternar a direção da ordenação
    isDescending = !isDescending;

    // Atualizar o ícone do botão com base na direção da ordenação
    const icon = this.querySelector('i');
    if (isDescending) {
        icon.classList.add('fa-arrow-down-a-z');
        icon.classList.remove('fa-arrow-down-z-a');
    } else {
        icon.classList.add('fa-arrow-down-z-a');
        icon.classList.remove('fa-arrow-down-a-z');
    }

    items.sort((a, b) => {
        const nameA = a.querySelector('p').textContent.toUpperCase();
        const nameB = b.querySelector('p').textContent.toUpperCase();

        // Se a direção for descendente (Z-A), ordena em ordem alfabética inversa,
        // caso contrário (A-Z), ordena em ordem alfabética normal
        return isDescending ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });

    items.forEach(item => grid.appendChild(item));
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
            navbar.style.position = "fixed"
             // Remove a classe para mostrar o header

    
            if (menu.classList.contains("active")) {
                body.style.overflow = "hidden";
                html.style.overflow = "hidden";
                body.style.paddingRight = `${scrollBarWidth}px`; // Compensa a largura da barra de rolagem
                body.style.marginTop = `${8}vh`; // Compensa a largura da barra de rolagem

            } else {
                body.style.overflow = "";
                html.style.overflow = "";
                navbar.style.position = "sticky"
                body.style.paddingRight = "";
                body.style.marginTop = ""; // Compensa a largura da barra de rolagem
                // Remove o padding extra


            }
        });
    
        menuLinks.forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                menu.classList.remove("active");
                navbar.style.position = "sticky"
                body.style.paddingRight = ""; 
                body.style.marginTop = ""; // Compensa a largura da barra de rolagem
                // Remove o padding extra
                body.style.overflow = "";
                html.style.overflow = "";
            });
        });
    });

    document.querySelectorAll('.menu-link').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault(); // Evita a atualização completa da página
        const targetId = link.getAttribute('href').substring(1); // Pega o ID do destino (exclui o "#")
        const targetElement = document.getElementById(targetId);
    
        // Rola suavemente até o elemento
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header"); // Seleciona o header
  let lastScrollTop = 0; // Variável para armazenar a última posição do scroll
  const menu = document.querySelector(".list"); // Seleciona a lista dentro do menu

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

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

    

