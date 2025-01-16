      // Configuração do Firebase
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
    
      // Lidar com a escolha de um item
      document.querySelectorAll('.item-btn').forEach(button => {
        button.addEventListener('click', () => {
          const userName = prompt("Digite seu nome:");
          if (!userName) return;
    
          const itemName = button.dataset.item; // Pega o nome do item do data-item
          const itemDiv = button.closest('.item'); // A div .item
          const statusDiv = itemDiv.querySelector('.status'); // A div .status
    
          // Atualizar o banco de dados com a reserva do item
          set(ref(db, `items/${itemName}`), {
            reserved: true,
            reservedBy: userName
          }).then(() => {
            // Atualizar a div .status quando o item for reservado
            statusDiv.textContent = "Indisponível"; // Muda o texto para "Indisponível"
            statusDiv.style.backgroundColor = "#f44336"; // Muda o fundo para vermelho
            alert(`${itemName} foi reservado por ${userName}.`);
          }).catch((error) => {
            console.error("Erro ao reservar o item:", error);
          });
        });
      });
    
      // Senha correta para acesso ao painel
      const correctPassword = "filhos212325"; // Altere para a senha desejada
    
      // Variáveis para controle de acesso
      let isPasswordCorrect = false;
    
      // Fechar o modal de senha ao clicar no "X"
      document.querySelector(".close-password-modal").addEventListener("click", () => {
        document.getElementById("password-modal").style.display = "none";
      });
    
      // Fechar o modal de gerenciamento ao clicar no "X"
      document.querySelector(".close").addEventListener("click", () => {
        document.getElementById("modal").style.display = "none";
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
          document.getElementById("modal").style.display = "block";
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
        document.getElementById("password-modal").style.display = "block";
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
          li.textContent = `${itemName} foi reservado por ${item.reservedBy}`;

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
    
        // Excluir a reserva no Firebase
        set(itemRef, {
          reserved: false,
          reservedBy: null
        }).then(() => {
          alert(`${itemName} agora está disponível novamente.`);
          loadChoices(); // Atualiza a lista de escolhas após a exclusão
        }).catch((error) => {
          console.error("Erro ao excluir a reserva:", error);
        });
      }

      document.addEventListener("DOMContentLoaded", () => {
        const hamburger = document.querySelector(".hamburger-btn");
        const menu = document.querySelector(".list");
        const menuLinks = document.querySelectorAll(".menu a"); // Seleciona todas as opções do menu
        const body = document.body; // Seleciona o body
        const html = document.documentElement; // Seleciona o html para suportar celulares
    
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            menu.classList.toggle("active");
    
            // Impede ou libera a rolagem da página
            if (menu.classList.contains("active")) {
                body.style.overflow = "hidden"; // Desativa a rolagem do body
                html.style.overflow = "hidden"; // Desativa a rolagem do html
            } else {
                body.style.overflow = ""; // Restaura a rolagem do body
                html.style.overflow = ""; // Restaura a rolagem do html
            }
        });
    
        // Fecha o menu quando qualquer link for clicado
        menuLinks.forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active"); // Remove a classe "active" do hamburger
                menu.classList.remove("active"); // Remove a classe "active" do menu
                body.style.overflow = ""; // Restaura a rolagem do body
                html.style.overflow = ""; // Restaura a rolagem do html
            });
        });
    });
    
    

    document.addEventListener("DOMContentLoaded", () => {
      const header = document.querySelector("header"); // Seleciona o header
      let lastScrollTop = 0; // Variável para armazenar a última posição do scroll
  
      window.addEventListener("scroll", () => {
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  
          // Se o usuário rolar para baixo
          if (currentScroll > lastScrollTop) {
              header.classList.add("hide"); // Adiciona a classe para esconder o header
          } else {
              header.classList.remove("hide"); // Remove a classe para mostrar o header
          }
  
          lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Previne que o valor de scroll seja negativo
      });
  });

