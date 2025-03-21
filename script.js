const cartIcon = document.querySelector("#cart-icon");
const cart = document.querySelector(".cart");
const cartClose = document.querySelector("#cart-close");
cartIcon.addEventListener("click", () => cart.classList.add("active"));
cartClose.addEventListener("click", () => cart.classList.remove("active"));

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
    cashInputElement.value = "0";
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
    cashInputElement.value = "0";
    changeGivenElement.textContent = `$0.00`;
});

// Set amount-price to 0 on page load
window.onload = () => {
    cashInputElement.value = "0";
};