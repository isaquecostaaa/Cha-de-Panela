// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "SEU_DATABASE_URL",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
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
      const itemName = button.dataset.item;
      if (items && items[itemName] && items[itemName].reserved) {
        button.textContent = `${itemName} (Indisponível)`;
        button.disabled = true;
      } else {
        button.textContent = itemName;
        button.disabled = false;
      }
    });
  });
  
  // Lidar com a escolha de um item
  document.querySelectorAll('.item-btn').forEach(button => {
    button.addEventListener('click', () => {
      const userName = prompt("Digite seu nome:");
      if (!userName) return;
  
      const itemName = button.dataset.item;
  
      // Atualizar o banco de dados com a reserva do item
      set(ref(db, `items/${itemName}`), {
        reserved: true,
        reservedBy: userName
      }).then(() => {
        alert(`${itemName} foi reservado por ${userName}.`);
      }).catch((error) => {
        console.error("Erro ao reservar o item:", error);
      });
    });
  });
  