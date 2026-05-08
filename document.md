<!-- Wishlist Sidebar -->

    <div id="wishlistSidebar" class="wishlist-sidebar">
      <div class="wishlist-header">
        <h2>My Wishlist (<span id="sidebarWishlistCount">0</span>)</h2>
        <span class="close-wishlist">&times;</span>
      </div>
      <div id="wishlistItems" class="wishlist-items">
        <!-- Wishlist items will be dynamically added here -->
      </div>
      <div class="wishlist-empty" id="emptyWishlistMessage">
        <i class="fa-solid fa-heart"></i>
        <p>Your wishlist is empty</p>
      </div>
    </div>
    <div id="wishlistOverlay" class="wishlist-overlay"></div>

--->

/_ Wishlist Sidebar _/
.wishlist-sidebar {
position: fixed;
top: 0;
right: -400px;
width: 400px;
height: 100%;
background: #fff;
box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
z-index: 1000;
transition: right 0.3s ease;
overflow-y: auto;
}

.wishlist-sidebar.active {
right: 0;
}

.wishlist-overlay {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.5);
z-index: 999;
display: none;
}

.wishlist-overlay.active {
display: block;
}

.wishlist-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 20px;
border-bottom: 1px solid #eee;
background: #facc15;
}

.wishlist-header h2 {
margin: 0;
font-size: 1.5rem;
color: #222;
}

.close-wishlist {
font-size: 2rem;
cursor: pointer;
color: #222;
transition: transform 0.2s;
}

.close-wishlist:hover {
transform: scale(1.1);
}

.wishlist-items {
padding: 20px;
}

.wishlist-item {
display: flex;
align-items: center;
gap: 15px;
padding: 15px;
margin-bottom: 15px;
background: #f9f9f9;
border-radius: 10px;
transition: transform 0.2s;
}

.wishlist-item:hover {
transform: translateX(-5px);
box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.wishlist-item-image {
width: 80px;
height: 80px;
object-fit: cover;
border-radius: 8px;
}

.wishlist-item-details {
flex: 1;
}

.wishlist-item-title {
font-weight: bold;
margin-bottom: 5px;
color: #222;
}

.wishlist-item-price {
color: #ef4444;
font-weight: bold;
}

.remove-from-wishlist {
background: #ef4444;
color: white;
border: none;
padding: 8px 15px;
border-radius: 5px;
cursor: pointer;
transition: background 0.3s;
}

.remove-from-wishlist:hover {
background: #dc2626;
}

.wishlist-empty {
display: none;
text-align: center;
padding: 60px 20px;
color: #999;
}

.wishlist-empty i {
font-size: 4rem;
margin-bottom: 20px;
color: #ddd;
}

.wishlist-empty p {
font-size: 1.2rem;
}

/_ Mobile responsiveness _/
@media (max-width: 480px) {
.wishlist-sidebar {
width: 100%;
right: -100%;
}
}

--->

// WISHLIST FUNCTIONALITY FIRST
const wishlistCount = document.getElementById("wishlist-count");
const sidebarWishlistCount = document.getElementById("sidebarWishlistCount");
const wishlistSidebar = document.getElementById("wishlistSidebar");
const wishlistOverlay = document.getElementById("wishlistOverlay");
const wishlistItems = document.getElementById("wishlistItems");
const emptyMessage = document.getElementById("emptyWishlistMessage");
const navWishlistIcon = document.getElementById("navbar-wishlist-icon");
const closeWishlistBtn = document.querySelector(".close-wishlist");

let wishlistData = new Map(); // Store product data with title as key

// Function to update wishlist display
function updateWishlistDisplay() {
const count = wishlistData.size;
wishlistCount.textContent = count;
sidebarWishlistCount.textContent = count;

    // Clear current items
    wishlistItems.innerHTML = "";

    if (count === 0) {
      emptyMessage.style.display = "block";
      wishlistItems.style.display = "none";
    } else {
      emptyMessage.style.display = "none";
      wishlistItems.style.display = "block";

      // Add each item to sidebar
      wishlistData.forEach((product, title) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "wishlist-item";
        itemDiv.innerHTML = `
          <img src="${product.image}" alt="${title}" class="wishlist-item-image">
          <div class="wishlist-item-details">
            <div class="wishlist-item-title">${title}</div>
            <div class="wishlist-item-price">${product.price}</div>
          </div>
          <button class="remove-from-wishlist" data-title="${title}">
            <i class="fa-solid fa-trash"></i>
          </button>
        `;
        wishlistItems.appendChild(itemDiv);
      });

      // Add remove functionality
      document.querySelectorAll(".remove-from-wishlist").forEach((btn) => {
        btn.addEventListener("click", function () {
          const title = this.getAttribute("data-title");
          removeFromWishlist(title);
        });
      });
    }

}

// Function to remove item from wishlist
function removeFromWishlist(title) {
wishlistData.delete(title);

    // Find and update the heart icon
    document.querySelectorAll(".product-card").forEach((card) => {
      const cardTitle = card.querySelector(".product-title").textContent.trim();
      if (cardTitle === title) {
        const icon = card.querySelector(".wishlist-icon");
        icon.classList.remove("active");
      }
    });

    updateWishlistDisplay();

}

// Open wishlist sidebar
navWishlistIcon.addEventListener("click", function () {
wishlistSidebar.classList.add("active");
wishlistOverlay.classList.add("active");
document.body.style.overflow = "hidden";
});

// Close wishlist sidebar
function closeWishlist() {
wishlistSidebar.classList.remove("active");
wishlistOverlay.classList.remove("active");
document.body.style.overflow = "";
}

closeWishlistBtn.addEventListener("click", closeWishlist);
wishlistOverlay.addEventListener("click", closeWishlist);

// Get all wishlist icons
const wishlistIcons = document.querySelectorAll(".wishlist-icon");
console.log("Found wishlist icons:", wishlistIcons.length);

// Attach click event to all wishlist icons
wishlistIcons.forEach(function (icon) {
icon.addEventListener("click", function (e) {
e.stopPropagation();
e.preventDefault();

      // Find the product card
      const card = icon.closest(".product-card");
      const productTitle = card
        .querySelector(".product-title")
        .textContent.trim();
      const productPrice = card.querySelector(".product-price").textContent;
      const productImage = card.querySelector(".product-image").src;

      // Toggle wishlist state
      if (icon.classList.contains("active")) {
        icon.classList.remove("active");
        wishlistData.delete(productTitle);
      } else {
        icon.classList.add("active");
        wishlistData.set(productTitle, {
          price: productPrice,
          image: productImage,
        });
      }

      updateWishlistDisplay();
    });

});

// Initialize display
updateWishlistDisplay();
