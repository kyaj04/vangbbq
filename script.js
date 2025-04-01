const viewOrderButton = document.querySelector("#btn-view");
const addOrderButton = document.querySelector("#btn-add");
const orders = document.querySelector(".orders");
const viewOrderClose = document.querySelector("#order-close");

// Show orders on "View Orders" click
viewOrderButton.addEventListener("click", () => {
  orders.classList.add("active")
  fetchAndSyncOrders()
});



// Hide orders on "X" close click
viewOrderClose.addEventListener("click", () => orders.classList.remove("active"));

const cartDiv = document.querySelector(".cart"); // Get the cart div

// Hide orders on click on the cart div background
cartDiv.addEventListener("click", (event) => {

  if (orders.classList.contains("active")) {
    // Check if the click target is the cart div itself (background click)
    if (event.target === cartDiv) {
      orders.classList.remove("active");
    }
  }
});

const cashInputElement = document.querySelector(".amount-price");
const changeGivenElement = document.querySelector(".change-price");

document.addEventListener("click", function (event) {
  const cartIcon = event.target.closest(".cart-icon");
  if (cartIcon) {
    console.log("cart icon clicked");
    const productBox = cartIcon.closest(".product-box");
    if (productBox) {
      console.log(productBox);
      addToCart(productBox);
      fetchAndSyncOrders();
    }
  }
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
            <i class="trash-icon cart-remove"></i>
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

const buyNowButton = document.querySelector(".btn-clear");
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

// addding code to customer orders

const btnAdd = document.getElementById("btn-add");
const orderTableBody = document.getElementById("order-table-body");
const ordersDiv = document.querySelector(".orders");
const ticketInput = document.getElementById("ticket-input");
let orderNumber = 1;
const ordersDisplayDiv = document.getElementById("orders-display");



let serverOnline = false;

ticketInput.addEventListener("blur", () => {
  fetchAndSyncOrders()
});

function saveOrdersToLocalStorage() {
  try {
    localStorage.setItem('localOrders', JSON.stringify(localOrders));
    console.log('Orders saved to localStorage.');
  } catch (error) {
    console.error('Error saving orders to localStorage:', error);
  }
}

//localStorage.removeItem('localOrders');
//debugger;
let localOrders = localStorage.getItem('localOrders')
//let localOrders = []; // Array to store orders locally

function isServerUp() {
  console.time(isServerUp)

  fetch('/get_orders')
    .then(response => {
      if (response.ok) {
        serverOnline = true;
        //return response.json(); // Proceed with parsing JSON if server is up
      } else {
        serverOnline = false;
        throw new Error('Network response was not ok');
      }
    })
    .catch(error => {
      serverOnline = false;
      console.error('Error checking server status:', error);
    });
  console.timeEnd(isServerUp)
}



function fetchAndSyncOrders() {
  if (serverOnline)  {
fetch('/get_orders')
      .then(response => {
        if (!response.ok) {
          
          throw new Error('Network response was not ok');
        }
        
        return response.json();
      })
      .then(orders => {
        localOrders = orders;
        updateLocalTable();
        setTimeout(() => console.log('Orders synced with server.'), 500);

        // Now get the max order number from the server
        return getMaxOrderNumber();
      })
      .then(maxOrderNumber => {
        const ticketInput = document.getElementById('ticket-input');
        if (ticketInput && ticketInput.value !== '' && parseInt(ticketInput.value, 10) > maxOrderNumber) {
          orderNumber = parseInt(ticketInput.value, 10);
        } else {
          orderNumber = maxOrderNumber + 1;
        }
        console.log(`1 Next Order Number: ${orderNumber}`);
      })
      .catch(error => {
        console.error('Error syncing orders:', error);
        if (localOrders.length > 0) {
          updateLocalTable();
          console.log('Using local orders data.');
          orderNumber = Math.max(...localOrders.map(order => order.orderNumber), 0) + 1;
        } else {
          orderNumber = 1; // Start with 1 if no local orders
        }
        console.log(`2 Next Order Number: ${orderNumber}`);
      })
      .finally(() => {
        const ticketInput = document.getElementById('ticket-input');
        if (ticketInput) {
          ticketInput.value = ''; // Clear the input
        }
      });
  } else {
    // Server is offline logic (similar to your existing code)

    if (typeof localOrders === 'string') {
      localOrders = JSON.parse(localOrders);
    }

    const ticketInput = document.getElementById('ticket-input');
    if (ticketInput && ticketInput.value !== '' && parseInt(ticketInput.value, 10) !== 0) {
      orderNumber = parseInt(ticketInput.value, 10);
    } else if (!localOrders || localOrders.length === 0) {
      orderNumber = 1;
      localOrders = [];
    } else {
      orderNumber = Math.max(...localOrders.map(order => order.orderNumber), 0) + 1;
    }

    if (ticketInput) {
      ticketInput.value = '';
    }

    updateLocalTable();
    saveOrdersToLocalStorage();

    console.log(`Orders: ${JSON.stringify(localOrders)}`);
  }
}


function getMaxOrderNumber() {
  if (serverOnline) {
    return fetch('/get_max_order')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch max order number');
        }
        return response.json();
      })
      .then(data => data.maxOrderNumber || 0)
      .catch(error => {
        console.error('Error getting max order number:', error);
        return 0; // Fallback to 0 if error
      });
  }
}


function updateLocalTable() {
  orderTableBody.innerHTML = ''; // Clear table
  localOrders.forEach(order => {
    if (order.status !== 'deleted') {
      const newRow = document.createElement("tr");

      // Apply CSS classes based on order.status
      if (order.status === 'completed') {
        newRow.classList.add('completed');
      } else if (order.status === 'deleted') {
        newRow.classList.add('deleted');
      }

      newRow.innerHTML = `
              <td>${order.orderNumber}</td>
              <td>${order.orderItems.map(item => `${item.quantity} ${item.items}`).join(", ")}</td>
              <td>${order.time}</td>
              <td><i class="check-icon complete-order" data-order-number="${order.orderNumber}"></i></td>
              <td><i class="undo-icon undo-complete" data-order-number="${order.orderNumber}"></i></td>
              <td><i class="trash-icon delete-order" data-order-number="${order.orderNumber}"></i></td>
          `;

      newRow.dataset.orderData = JSON.stringify(order);
      orderTableBody.appendChild(newRow);
    }
  });
}

btnAdd.addEventListener("click", () => {
  console.time("btnAdd event");

 
  const cartBoxes = cartContent.querySelectorAll(".cart-box");
  if (cartBoxes.length === 0) {
    alert("No items in cart to add to order.");
    return;
  }
  const orderItems = [];
  cartBoxes.forEach(cartBox => {
    const title = cartBox.querySelector(".cart-product-title").textContent;
    const quantity = cartBox.querySelector(".number").textContent;
    orderItems.push({
      items: title,
      quantity: parseInt(quantity)
    });
  });

  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  const popupData = {

    orderNumber: orderNumber,
    orderItems: orderItems,
    time: time,
    status: "pending"
  };

  localOrders.push(popupData); // Add to local orders

  sendOrderToServer(popupData);
  //updateLocalTable()
  //fetchAndSyncOrders()

  const tableContainer = document.querySelector(".table-container");

  ordersDiv.classList.add("active");
  setTimeout(() => {
    ordersDiv.scrollTop = ordersDiv.scrollHeight;
  }, 500);




  // Clear the cart
  cartBoxes.forEach(cartBox => cartBox.remove());
  cartItemCount = 0;
  updateCartCount(0);
  updateTotalPrice();
  cashInputElement.value = "";
  changeGivenElement.textContent = `$0.00`;
  fetchAndSyncOrders()
  console.timeEnd("btnAdd event");
});


orderTableBody.addEventListener("click", (event) => {
  const target = event.target;
  const row = target.closest("tr");
  if (!row) return;

  const orderNumber = target.dataset.orderNumber;
  let orderData = JSON.parse(row.dataset.orderData);
  console.log(target); // Ensure it is the correct <i> element
  console.log(target.classList);
  if (target.classList.contains("complete-order")) {
    orderData.status = "completed";
    row.classList.remove("pending");
    row.classList.add("completed");

  } else if (target.classList.contains("undo-complete")) {
    orderData.status = "pending";
    row.classList.remove("completed");
    row.classList.add("pending");

    target.classList.add("complete-order");
  } else if (target.classList.contains("delete-order")) {
    if (confirm("Are you sure you want to delete this order?")) {
      orderData.status = "deleted";
      row.classList.remove("pending");
      row.classList.remove("completed");
      row.classList.add("deleted");
      const completeIcon = row.querySelector("check-icon, undo-icon");
      if (completeIcon) {
        completeIcon.remove();
      }
    }
  }
  row.dataset.orderData = JSON.stringify(orderData);

  updateOrderStatusOnServer(orderData);

});

function displayOrderInDiv(orderData) {
  ordersDisplayDiv.innerHTML = "";

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
            <tr>
                <th>Items</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${orderData.orderItems.map(item => `${item.quantity} ${item.items}`).join(", ")}</td>
            </tr>
        </tbody>
    `;

  const orderDetails = document.createElement('div');
  orderDetails.innerHTML = `
        <p>Order Number: ${orderData.orderNumber}</p>
        <p>Time: ${orderData.time}</p>
        <p>Status: ${orderData.status}</p>
    `;
}

function sendOrderToServer(orderData) {
  console.log('calling sendOrderToServer');
  if (serverOnline) {
    fetch('/add_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Order sent successfully:', data);
      })
      .catch(error => {
        console.error('Error sending order:', error);
      });
  }
}

function updateOrderStatusOnServer(updatedOrderData) {
  console.log('updatedOrderData');
  if (serverOnline) {
    fetch('/get_orders')
      .then(response => response.json())
      .then(orders => {
        const updatedOrders = orders.map(order => {
          if (order.orderNumber === updatedOrderData.orderNumber) {
            return updatedOrderData;
          }
          return order;
        });

        // Send the updated orders back to the server
        fetch('/get_orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedOrders),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            // If the order was marked as completed, trigger the notification to clients
            if (updatedOrderData.status === 'completed' || updatedOrderData.status === 'pending' || updatedOrderData.status === 'deleted') {
              notifyClientsOrderCompleted(updatedOrderData); // Trigger the notification
            }


            console.log('Order status updated on server.');
          })
          .catch(error => {
            console.error('Error updating order status:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  } else {
    localOrders = localOrders.map(order => {
      if (order.orderNumber === updatedOrderData.orderNumber) {
        return updatedOrderData;
      }
      return order;
    });

    // Update the local table
    updateLocalTable();

    console.log('Order status updated locally (server offline).');
  }
}

// Function to notify the server to emit the completed order to connected clients
function notifyClientsOrderCompleted(order) {
  console.log('calling notifyClientsOrderCompleted');
  if (serverOnline) {
    fetch('/notify_order_completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'order completed'
        }) // Send a simple message
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error notifying clients');
        }
        console.log('Notified clients that the order was completed.');
      })
      .catch(error => {
        console.error('Error notifying clients:', error);
      });
  }
}

// JavaScript to load and display menu items
const meatsItems = document.getElementById('meats-items');
const meatsAndRiceItems = document.getElementById('meats-and-rice-items');
const appetizersItems = document.getElementById('appetizers-items');
const beveragesItems = document.getElementById('beverages-items');

let menuItems = [];

function displayMenuItems() {
  meatsItems.innerHTML = '';
  meatsAndRiceItems.innerHTML = '';
  appetizersItems.innerHTML = '';
  beveragesItems.innerHTML = '';

  menuItems.forEach(item => {
    const productBox = document.createElement('div');
    productBox.classList.add('product-box');
    productBox.innerHTML = `
            <div class="img-box">
                <img src="${item.image}">
            </div>
            <h2 class="product-title">${item.name}</h2>
            <div class="price-and-cart">
                <span class="price">$${item.price}</span>

                    <i class="cart-icon"></i>

            </div>
        `;
    if (item.category === "Meats") {
      meatsItems.appendChild(productBox);
    } else if (item.category === "Meats and Rice") {
      meatsAndRiceItems.appendChild(productBox);
    } else if (item.category === "Appetizers") {
      appetizersItems.appendChild(productBox);
    } else if (item.category === "Beverages") {
      beveragesItems.appendChild(productBox);
    }
  });
}

function fetchMenuItems() {
  fetch('/menu')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      menuItems = data;
      displayMenuItems();
    })
    .catch(error => {
      console.error('Error fetching menu items:', error);
      menuItems = defaultMenuItems; // Use default menu items
      displayMenuItems();
    });
}

// Set up EventSource connection
const eventSource = new EventSource('/events/menu');
eventSource.onopen = () => console.log('Connected to /events/menu');
eventSource.onerror = (err) => console.error('SSE Error:', err);
eventSource.onmessage = (event) => {
  console.log('Data received:', JSON.parse(event.data));
  const updatedMenuItems = JSON.parse(event.data);
  menuItems = updatedMenuItems;
  displayMenuItems();
};

const defaultMenuItems = [{
    "category": "Meats",
    "name": "Pork",
    "price": 13,
    "image": "img/porkm.jpg"
  },
  {
    "category": "Meats",
    "name": "H. Sausage",
    "price": 13,
    "image": "img/sausagem.jpg"
  },
  {
    "category": "Meats",
    "name": "Chicken",
    "price": 13,
    "image": "img/chickenm.jpg"
  },
  {
    "category": "Meats",
    "name": "Sweet Pork",
    "price": 13,
    "image": "img/sweetpork.jpg"
  },
  {
    "category": "Meats and Rice",
    "name": "Pork & Rice",
    "price": 15,
    "image": "img/porkricem.jpg"
  },
  {
    "category": "Meats and Rice",
    "name": "H. Sausage & Rice",
    "price": 15,
    "image": "img/sausagericem.jpg"
  },
  {
    "category": "Meats and Rice",
    "name": "Chicken & Rice",
    "price": 15,
    "image": "img/chickenricem.jpg"
  },
  {
    "category": "Meats and Rice",
    "name": "Sweet Pork & Rice",
    "price": 15,
    "image": "img/sweetporkrice.jpg"
  },
  {
    "category": "Appetizers",
    "name": "Mango",
    "price": 5,
    "image": "img/mangom.jpg"
  },
  {
    "category": "Appetizers",
    "name": "Pickel",
    "price": 3,
    "image": "img/pickelm.jpg"
  },
  {
    "category": "Appetizers",
    "name": "Naab Vaam",
    "price": 5,
    "image": "img/naamvaabm.jpg"
  },
  {
    "category": "Appetizers",
    "name": "Sticky Rice",
    "price": 5,
    "image": "img/stickyricem.jpg"
  },
  {
    "category": "Beverages",
    "name": "Water/Soda",
    "price": 1,
    "image": "img/beveragesm.jpg"
  },
  {
    "category": "Beverages",
    "name": "Red/Green Drink",
    "price": 5,
    "image": "img/rgdrinkm.jpg"
  }
];

// Initial load 
fetchMenuItems();
isServerUp()
fetchAndSyncOrders();