const firebaseConfig = {
  apiKey: "AIzaSyDTCwy1pQM0E3yVifYsW69vhrSSGh-zr5M",
  authDomain: "cha-de-panela-39a8e.firebaseapp.com",
  databaseURL: "https://cha-de-panela-39a8e-default-rtdb.firebaseio.com",
  projectId: "cha-de-panela-39a8e",
  storageBucket: "cha-de-panela-39a8e.firebasestorage.app",
  messagingSenderId: "427821589232",
  appId: "1:427821589232:web:9dd9dfd2d695ffbb955835",
};

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function carregarItens() {
  const itemsRef = ref(database, "items");

  onValue(itemsRef, (snapshot) => {
    const items = snapshot.val();

    const categories = [
      ...new Set(Object.values(items).map((item) => item.category)),
    ];

    categories.forEach((category) => {
      const grid = document.getElementById(category);
      if (grid) {
        grid.innerHTML = ""; 
      }
    });

    for (const key in items) {
      if (items.hasOwnProperty(key)) {
        const item = items[key];
        const grid = document.getElementById(item.category);

        if (grid) {
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

          grid.appendChild(div);
        } else {
          console.warn(
            `Grid para a categoria "${item.category}" não encontrado.`
          );
        }
      }
    }
  });
}

function adicionarItemFirebase(nome, imagem, categoria) {
  if (!nome || !imagem || !categoria) {
    alert("Por favor, forneça um nome, a categoria e um link de imagem.");
    return;
  }

  const itemsRef = ref(database, "items");
  const newItemRef = push(itemsRef);

  set(newItemRef, {
    name: nome,
    image: imagem,
    category: categoria,
    reserved: false, 
    reservedBy: null, 
  })
    .then(() => {
      carregarItens();
    })
    .catch((error) => {
      alert("Erro ao adicionar item: " + error.message);
    });
}

function handleAddItemFormSubmit(event) {
  event.preventDefault();

  const nomeItem = document.getElementById("item-name").value;
  const imagemItem = document.getElementById("item-image").value;
  const categoriaItem = document.getElementById("item-category").value;

  if (nomeItem && imagemItem && categoriaItem) {
    adicionarItemFirebase(nomeItem, imagemItem, categoriaItem);

    document.getElementById("add-item-form").reset();
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}


document.getElementById("add-item-form").addEventListener("submit", handleAddItemFormSubmit);


function carregarItensReservados() {
  const itemsRef = ref(database, "items");

  onValue(itemsRef, (snapshot) => {
    const items = snapshot.val();
    const choicesList = document.getElementById("choices-list");

    choicesList.innerHTML = "";

    if (items) {
      let temReservas = false;

      for (const key in items) {
        if (items.hasOwnProperty(key)) {
          const item = items[key];

          if (item.reserved) {
            temReservas = true;

            const listItem = document.createElement("li");
            listItem.classList.add("choice-item");

            const itens = [
              `<p><b>${item.name}</b>`,
              `foi reservado por`,
              `<b>${item.reservedBy}</b></p>`, 
            ];

            const mensagem = document.createElement("p");
            mensagem.innerHTML = itens.join(" ");

            const button = document.createElement("button");
            button.classList.add("delete-btn");
            button.innerHTML = '<i class="fas fa-trash"></i>';

            button.addEventListener("click", () => deletarItem(key, listItem));

            listItem.appendChild(mensagem);
            listItem.appendChild(button);

            choicesList.appendChild(listItem);
          }
        }
      }

      if (!temReservas) {
        const noItemsMessage = document.createElement("li");
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhum item reservado no momento.";
        noItemsMessage.appendChild(mensagem);
        noItemsMessage.classList.add("no-items");
        choicesList.appendChild(noItemsMessage);
      }
    } else {
      const noItemsMessage = document.createElement("li");
      const mensagem = document.createElement("p");
      mensagem.textContent = "Nenhum item reservado no momento.";
      noItemsMessage.appendChild(mensagem);
      noItemsMessage.classList.add("no-items");
      choicesList.appendChild(noItemsMessage);
    }
  });
}

function deletarItem(itemId, itemDiv) {
  const itemRef = ref(database, "items/" + itemId);

  get(itemRef)
    .then((snapshot) => {
      const item = snapshot.val();

      set(itemRef, {
        reserved: false, 
        reservedBy: null, 
        image: item.image,
        name: item.name,
        category: item.category,
      })
        .then(() => {
          itemDiv.remove();

          
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
  carregarItens();
  carregarItensReservados(); 
};

let currentItemId = null; 

function abrirReservationModal(itemId) {
  currentItemId = itemId; 
  const reservationModal = document.getElementById("reservation-modal");
  reservationModal.style.display = "flex"; 
}

document.querySelectorAll(".modal .close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    closeBtn.parentElement.parentElement.style.display = "none";
  });
});

document.getElementById("confirm-reservation").addEventListener("click", () => {
  const userNameInput = document.getElementById("user-name");
  const userName = userNameInput.value.trim();

  if (userName && currentItemId) {
    const itemRef = ref(database, "items/" + currentItemId);

    update(itemRef, {
      reserved: true,
      reservedBy: userName,
    })
      .then(() => {
        document.getElementById("reservation-modal").style.display = "none";
        document.getElementById("thank-you-modal").style.display = "flex";

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

document.getElementById("thank-you-modal").addEventListener("click", () => {
  document.getElementById("thank-you-modal").style.display = "none";
});

const senhaRef = ref(database, "senha/valor"); 
let senhaCorreta = "";

get(senhaRef)
  .then((snapshot) => {
    senhaCorreta = snapshot.exists() ? snapshot.val() : null; 
  })
  .catch((error) => console.error("Erro ao buscar a senha:", error));

const manageBtn = document.getElementById("manage-btn");
const passwordModal = document.getElementById("password-modal");
const reportModal = document.getElementById("modal");
const submitPasswordBtn = document.getElementById("submit-password");
const closeButtons = document.querySelectorAll(".modal .close");
const errorMessage = document.getElementById("error-message");

manageBtn.addEventListener("click", () => {
  passwordModal.style.display = "flex";
});

closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.parentElement.parentElement.style.display = "none";
    errorMessage.style.display = "none"; 
    document.getElementById("password").value = ""; 
  });
});

submitPasswordBtn.addEventListener("click", () => {
  const passwordInput = document.getElementById("password").value;

  if (passwordInput === senhaCorreta) {
    passwordModal.style.display = "none";
    reportModal.style.display = "flex";
    errorMessage.style.display = "none";

    carregarItensReservados();
  } else {
    errorMessage.textContent = "Senha incorreta. Tente novamente.";
    errorMessage.style.display = "flex";
  }
});

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

let isDescending = true; 

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

document.getElementById("toggle-sort-btn").addEventListener("click", function () {
    const grids = document.querySelectorAll(".grid");
    const isDescending = this.dataset.sortOrder === "desc";

    this.dataset.sortOrder = isDescending ? "asc" : "desc";

    const icon = this.querySelector("i");
    if (isDescending) {
      icon.classList.add("fa-arrow-down-a-z");
      icon.classList.remove("fa-arrow-down-z-a");
    } else {
      icon.classList.add("fa-arrow-down-z-a");
      icon.classList.remove("fa-arrow-down-a-z");
    }

    grids.forEach((grid) => {
      const items = Array.from(grid.getElementsByClassName("item"));

      items.sort((a, b) => {
        const nameA = a.querySelector("p").textContent.toUpperCase();
        const nameB = b.querySelector("p").textContent.toUpperCase();

        return isDescending
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      });

      items.forEach((item) => grid.appendChild(item));
    });
  });

  document.getElementById("filter-status").addEventListener("change", function () {
    const filterValue = this.value; // "all", "disponivel", or "reservado"
    const items = Array.from(document.getElementsByClassName("item"));
  
    items.forEach((item) => {
      const itemStatus = item.getAttribute("data-status");
  
      if (filterValue === "all" || itemStatus === filterValue) {
        item.style.display = ""; // Mostrar item
      } else {
        item.style.display = "none"; // Esconder item
      }
    });
  });
  

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger-btn");
  const menu = document.querySelector(".list");
  const menuLinks = document.querySelectorAll(".menu a");
  const body = document.body;
  const html = document.documentElement;
  const header = document.querySelector("header");
  const navbar = document.querySelector(".navbar");

  let scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    menu.classList.toggle("active");
    header.classList.remove("hide");
    navbar.style.position = "fixed";

    if (menu.classList.contains("active")) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      body.style.paddingRight = `${scrollBarWidth}px`;
      body.style.marginTop = `${8}vh`;
    } else {
      body.style.overflow = "";
      html.style.overflow = "";
      navbar.style.position = "sticky";
      body.style.paddingRight = "";
      body.style.marginTop = "";
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      menu.classList.remove("active");
      navbar.style.position = "sticky";
      body.style.paddingRight = "";
      body.style.marginTop = "";
      body.style.overflow = "";
      html.style.overflow = "";
    });
  });
});

document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  let lastScrollTop = 0; 
  const menu = document.querySelector(".list");

  window.addEventListener("scroll", () => {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    if (!menu.classList.contains("active")) {
      // Se o usuário rolar para baixo
      if (currentScroll > lastScrollTop) {
        header.classList.add("hide");
      } else {
        header.classList.remove("hide");
      }
    } else {
      header.classList.remove("hide");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
  });
});
