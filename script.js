const viewOrderButton = document.querySelector("#btn-view");
const addOrderButton = document.querySelector("#btn-add");
const orders = document.querySelector(".orders");
const viewOrderClose = document.querySelector("#order-close");

// Show orders on "View Orders" click
viewOrderButton.addEventListener("click", () => orders.classList.add("active"));

// Hide orders on "X" close click
viewOrderClose.addEventListener("click", () => orders.classList.remove("active"));


const cashInputElement = document.querySelector(".amount-price");
const changeGivenElement = document.querySelector(".change-price");

const addCartButtons = document.querySelectorAll(".add-cart");
addCartButtons.forEach(button => {
    button.addEventListener("click", event => {
        const productBox = event.target.closest(".product-box");
        addToCart(productBox);
    });
});

const cartContent = document.querySelector(".cart-content");
const addToCart = productBox => {
    const productImgSrc = productBox.querySelector("img").src;
    const productTitle = productBox.querySelector(".product-title").textContent;
    const productPrice = productBox.querySelector(".price").textContent;

    const cartItems = cartContent.querySelectorAll(".cart-box"); // Select cart boxes

    for (let cartBox of cartItems) {
        const titleElement = cartBox.querySelector(".cart-product-title");
        if (titleElement.textContent === productTitle) {
            // Item already exists, increment quantity
            const numberElement = cartBox.querySelector(".number");
            let quantity = parseInt(numberElement.textContent);
            quantity++;
            numberElement.textContent = quantity;
            updateTotalPrice();
            return; // Exit function
        }
    }

    // Item does not exist, create a new cart box
    const cartBox = document.createElement("div");
    cartBox.classList.add("cart-box");
    cartBox.innerHTML = `
        <img src="${productImgSrc}" class="cart-img">
        <div class="cart-detail">
            <h2 class="cart-product-title">${productTitle}</h2>
            <span class="cart-price">${productPrice}</span>
            <div class="cart-quantity">
                <button id="decrement">-</button>
                <span class="number">1</span>
                <button id="increment">+</button>
            </div>
        </div>
        <i class="ri-delete-bin-line cart-remove"></i>
    `;

    cartContent.appendChild(cartBox);

    cartBox.querySelector(".cart-remove").addEventListener("click", () => {
        cartBox.remove();
        updateCartCount(-1);
        updateTotalPrice();
    });

    cartBox.querySelector(".cart-quantity").addEventListener("click", event => {
        const numberElement = cartBox.querySelector(".number");
        const decrementButton = cartBox.querySelector("#decrement");
        let quantity = parseInt(numberElement.textContent);

        if (event.target.id === "decrement" && quantity > 1) {
            quantity--;
            if (quantity === 1) {
                decrementButton.style.color = "#999";
            }
        } else if (event.target.id === "increment") {
            quantity++;
            decrementButton.style.color = "#333";
        }

        numberElement.textContent = quantity;
        updateTotalPrice();
    });

    updateCartCount(1);
    updateTotalPrice();
};

const updateTotalPrice = () => {
    const totalPriceElement = document.querySelector(".total-price");
    const cartBoxes = cartContent.querySelectorAll(".cart-box");
    let total = 0;
    cartBoxes.forEach(cartBox => {
        const priceElement = cartBox.querySelector(".cart-price");
        const quantityElement = cartBox.querySelector(".number");
        const price = parseFloat(priceElement.textContent.replace("$", ""));
        const quantity = parseInt(quantityElement.textContent);
        total += price * quantity;
    });
    totalPriceElement.textContent = `$${total.toFixed(2)}`;
    cashInputElement.value = "";
    changeGivenElement.textContent = `$0.00`;

    cashInputElement.addEventListener("input", () => {
            const cashInput = parseFloat(cashInputElement.value);
            let changeGive = 0;
            if (isNaN(cashInput) || cashInput < 1 || total < 1 || total > cashInput) {
                changeGivenElement.textContent = `$0.00`;
            } else {
                changeGive = cashInput - total;
                changeGivenElement.textContent = `$${changeGive.toFixed(2)}`;
            }
        });

};




let cartItemCount = 0;
const updateCartCount = change => {
    const cartItemCountBadge = document.querySelector(".cart-item-count");
    cartItemCount += change;
    if (cartItemCount > 0) {
        cartItemCountBadge.style.visibility = "visible";
        cartItemCountBadge.textContent = cartItemCount;
    } else {
        cartItemCountBadge.style.visibility = "hidden";
        cartItemCountBadge.textContent = "";
    }
};

const buyNowButton = document.querySelector(".btn-buy");
buyNowButton.addEventListener("click", () => {
    const cartBoxes = cartContent.querySelectorAll(".cart-box");
    if (cartBoxes.length === 0) {
        alert("Orders are empty");
        return;
    }

    cartBoxes.forEach(cartBox => cartBox.remove());

    cartItemCount = 0;
    updateCartCount(0);
    updateTotalPrice();
    cashInputElement.value = "";
    changeGivenElement.textContent = `$0.00`;
});

// Set amount-price to 0 on page load
window.onload = () => {
    cashInputElement.value = "";
};

// order code
const btnAdd = document.getElementById("btn-add");
    const orderTableBody = document.getElementById("order-table-body");
    const ordersDiv = document.querySelector(".orders");

    let orderCounter = 1;
    let ordersData = JSON.parse(localStorage.getItem("orders")) || [];

    function generateOrderNumber() {
      return `ORD-${orderCounter.toString().padStart(3, "0")}`;
    }

    function saveOrdersToLocalStorage() {
      localStorage.setItem("orders", JSON.stringify(ordersData));
      sendOrdersToLaptop();
    }
/*
    function sendOrdersToLaptop() {
      const ipInput = document.getElementById("ipinput").value.trim();
      const feedbackDiv = document.getElementById("ip-feedback");
    
      // Check if the input is empty or the default value
      if (ipInput === "" || ipInput === "192.168.x.x" || !isValidIP(ipInput)) {
        feedbackDiv.textContent = "Invalid IP address. Please enter a valid one.";
        feedbackDiv.style.display = "block"; // Show the feedback message
        return; // Don't run the function if the IP is invalid or empty
      } else {
        feedbackDiv.style.display = "none"; // Hide feedback if the IP is valid
      }
    
      // Proceed with sending the orders if the IP is valid
      fetch(`http://${ipInput}:3000/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordersData)
      })
      .then(response => response.text())
      .then(data => console.log("Response from server:", data))
      .catch(error => console.error("Error:", error));
    }
    */

    //fuction to python 3000
    function sendOrdersToLaptop() {
      const ipInput = document.getElementById("ipinput").value.trim();
      const feedbackDiv = document.getElementById("ip-feedback");
  
      if (ipInput === "" || ipInput === "192.168.x.x" || !isValidIP(ipInput)) {
          feedbackDiv.textContent = "Invalid IP address. Please enter a valid one.";
          feedbackDiv.style.display = "block";
          return;
      } else {
          feedbackDiv.style.display = "none";
      }
  
      const jsonData = JSON.stringify(ordersData);
      const url = `http://${ipInput}:3000/?data=${encodeURIComponent(jsonData)}`; // Corrected line
  
      fetch(url)
          .then(response => response.text())
          .then(data => console.log("Response from server:", data))
          .catch(error => console.error("Error:", error));
  }

    // Function to check if the IP address format is valid
function isValidIP(ip) {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
}
    

    function loadOrdersFromLocalStorage() {
      ordersData.forEach(order => {
        addOrderToTable(order.orderNumber, order.dishes, order.completed);
        if(order.orderNumber.slice(4)*1 >= orderCounter){
          orderCounter = order.orderNumber.slice(4)*1 +1;
        }
      });
    }

    function addOrderToTable(orderNumber, dishes, completed = false) {
  const row = document.createElement("tr");
  if (completed) {
    row.classList.add("completed-order");
  }
  row.innerHTML = `
    <td>
      ${orderNumber}
      <i class="fa-solid fa-check icon-button complete-button"></i>
      <i class="fa-solid fa-trash-can icon-button delete-button"></i>
      ${completed ? '<i class="fa-solid fa-undo icon-button undo-button"></i>' : ''}
    </td>
    <td>${dishes.join(", ")}</td>
  `;
  orderTableBody.appendChild(row);

  row.querySelector(".delete-button").addEventListener("click", () => {
    const index = ordersData.findIndex(o => o.orderNumber === orderNumber);
    if (index !== -1) {
      ordersData.splice(index, 1);
      saveOrdersToLocalStorage();
      row.remove();
    }
  });

  row.querySelector(".complete-button").addEventListener("click", () => {
    row.classList.add("completed-order");
    const order = ordersData.find(o => o.orderNumber === orderNumber);
    if (order) {
      order.completed = true;
      saveOrdersToLocalStorage();
      row.innerHTML = `
        <td>
          ${orderNumber}
          
          <i class="fa-solid fa-check icon-button complete-button"></i>
          <i class="fa-solid fa-undo icon-button undo-button"></i>
          <i class="fa-solid fa-trash-can icon-button delete-button"></i>
        </td>
        <td>${dishes.join(", ")}</td>
      `;
      row.querySelector(".undo-button").addEventListener("click", undoRow);
      row.querySelector(".delete-button").addEventListener("click", deleteRow);
      row.querySelector(".complete-button").addEventListener("click", completeRow);
    }
  });

  function undoRow(){
    row.classList.remove("completed-order");
    const order = ordersData.find(o => o.orderNumber === orderNumber);
    if (order) {
      order.completed = false;
      saveOrdersToLocalStorage();
      row.innerHTML = `
        <td>
          ${orderNumber}
          <i class="fa-solid fa-check icon-button complete-button"></i>
          <i class="fa-solid fa-trash-can icon-button delete-button"></i>
          
        </td>
        <td>${dishes.join(", ")}</td>
      `;
      row.querySelector(".delete-button").addEventListener("click", deleteRow);
      row.querySelector(".complete-button").addEventListener("click", completeRow);
    }
  }

  function deleteRow(){
    const index = ordersData.findIndex(o => o.orderNumber === orderNumber);
    if (index !== -1) {
      ordersData.splice(index, 1);
      saveOrdersToLocalStorage();
      row.remove();
    }
  }

  function completeRow(){
    row.classList.add("completed-order");
    const order = ordersData.find(o => o.orderNumber === orderNumber);
    if (order) {
      order.completed = true;
      saveOrdersToLocalStorage();
      row.innerHTML = `
        <td>
          ${orderNumber}
          
          <i class="fa-solid fa-check icon-button complete-button"></i>
          <i class="fa-solid fa-undo icon-button undo-button"></i>
          <i class="fa-solid fa-trash-can icon-button delete-button"></i>
        </td>
        <td>${dishes.join(", ")}</td>
      `;
      row.querySelector(".undo-button").addEventListener("click", undoRow);
      row.querySelector(".delete-button").addEventListener("click", deleteRow);
      row.querySelector(".complete-button").addEventListener("click", completeRow);
    }
  }

  if(completed){
    row.querySelector(".undo-button").addEventListener("click", undoRow);
  }
  row.querySelector(".delete-button").addEventListener("click", deleteRow);
  row.querySelector(".complete-button").addEventListener("click", completeRow);
}

btnAdd.addEventListener("click", () => {
    const orderNumber = generateOrderNumber();
    const cartBoxes = cartContent.querySelectorAll(".cart-box");
    const dishes = Array.from(cartBoxes).map(cartBox => {
      const title = cartBox.querySelector(".cart-product-title").textContent;
      const quantity = cartBox.querySelector(".number").textContent;
      return `${quantity} ${title}`;
    });

    if (dishes.length === 0) {
      alert("Cart is empty!");
      return;
    }

    ordersData.push({ orderNumber, dishes, completed: false });
    saveOrdersToLocalStorage();
    addOrderToTable(orderNumber, dishes);
    orderCounter++;

    //clear cart
    buyNowButton.click();
    ordersDiv.classList.add("active");
  });

  loadOrdersFromLocalStorage();