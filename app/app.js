// ============= ADVANCED SEARCH SYSTEM =============
class AdvancedSearch {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchDropdown = document.getElementById("searchDropdown");
    this.searchSuggestions = document.getElementById("searchSuggestions");
    this.recentSearchesList = document.getElementById("recentSearchesList");
    this.resultCount = document.getElementById("resultCount");

    this.recentSearches = this.loadRecentSearches();
    this.selectedIndex = -1;
    this.searchResults = [];
    this.isSearching = false;

    this.init();
  }

  init() {
    // Debounced search
    const debouncedSearch = debounce(this.performSearch.bind(this), 300);

    // Search input events
    this.searchInput.addEventListener("input", (e) => {
      const value = e.target.value.trim();
      if (value.length > 0) {
        this.showDropdown();
        this.showLoadingState();
        debouncedSearch(value);
      } else {
        this.showDefaultState();
      }
    });

    // Keyboard navigation
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateResults(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateResults(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.searchResults[this.selectedIndex]) {
          this.selectResult(this.searchResults[this.selectedIndex]);
        }
      } else if (e.key === "Escape") {
        this.hideDropdown();
      }
    });

    // Focus events
    this.searchInput.addEventListener("focus", () => {
      if (this.searchInput.value.trim().length === 0) {
        this.showDefaultState();
      }
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        this.hideDropdown();
      }
    });

    // Popular search tags
    document.querySelectorAll(".search-tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        this.searchInput.value = tag.textContent;
        this.performSearch(tag.textContent);
      });
    });

    // Initialize recent searches
    this.updateRecentSearchesUI();
  }

  showDropdown() {
    this.searchDropdown.classList.add("active");
  }

  hideDropdown() {
    this.searchDropdown.classList.remove("active");
    this.selectedIndex = -1;
  }

  showDefaultState() {
    this.showDropdown();
    document.getElementById("recentSearches").style.display = "block";
    document.getElementById("popularSearches").style.display = "block";
    document.getElementById("searchResults").style.display = "none";
  }

  showLoadingState() {
    this.searchSuggestions.innerHTML = `
      <div class="search-loading">
        <div class="search-loading-spinner"></div>
        <p>Searching...</p>
      </div>
    `;
    document.getElementById("recentSearches").style.display = "none";
    document.getElementById("popularSearches").style.display = "none";
    document.getElementById("searchResults").style.display = "block";
  }

  performSearch(query) {
    // Get products with enhanced matching
    const results = this.enhancedSearch(query);
    this.searchResults = results;
    this.selectedIndex = -1;

    // Update UI
    this.updateSearchResults(results, query);

    // Save to recent searches
    this.addToRecentSearches(query);
  }

  enhancedSearch(query) {
    const searchTerm = query.toLowerCase();

    // Score-based search for better results
    const scoredResults = products.map((product) => {
      let score = 0;
      const title = product.title.toLowerCase();

      // Exact match
      if (title === searchTerm) score += 100;

      // Starts with
      if (title.startsWith(searchTerm)) score += 50;

      // Contains
      if (title.includes(searchTerm)) score += 25;

      // Word match
      const words = title.split(" ");
      words.forEach((word) => {
        if (word.startsWith(searchTerm)) score += 10;
      });

      // Fuzzy match (simple)
      if (this.fuzzyMatch(searchTerm, title)) score += 5;

      return { ...product, score };
    });

    // Filter and sort by score
    return scoredResults
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Limit to top 10 results
  }

  fuzzyMatch(pattern, str) {
    pattern = pattern.toLowerCase();
    str = str.toLowerCase();

    let patternIdx = 0;
    let strIdx = 0;

    while (patternIdx < pattern.length && strIdx < str.length) {
      if (pattern[patternIdx] === str[strIdx]) {
        patternIdx++;
      }
      strIdx++;
    }

    return patternIdx === pattern.length;
  }

  updateSearchResults(results, query) {
    this.searchSuggestions.innerHTML = "";

    if (results.length === 0) {
      this.searchSuggestions.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-search"></i>
          <p>No results found for "${query}"</p>
          <p style="font-size: 0.85rem; margin-top: 10px;">Try searching for burger, fries, or combo</p>
        </div>
      `;
      this.resultCount.textContent = "";
    } else {
      this.resultCount.textContent = `(${results.length})`;

      results.forEach((product, index) => {
        const li = this.createSearchResultItem(product, query, index);
        this.searchSuggestions.appendChild(li);
      });
    }
  }

  createSearchResultItem(product, query, index) {
    const li = document.createElement("li");
    if (index === this.selectedIndex) li.classList.add("selected");

    // Determine category based on title
    const category = this.getProductCategory(product.title);

    // Highlight matching text
    const highlightedTitle = this.highlightText(product.title, query);

    // Generate random rating for demo
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const stars =
      "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

    li.innerHTML = `
      <div class="search-suggestion-item">
        <img src="${product.image}" alt="${product.title}" class="search-item-image">
        <div class="search-item-details">
          <span class="search-item-category">${category}</span>
          <div class="search-item-title">${highlightedTitle}</div>
          <div class="search-item-rating">
            <span class="stars">${stars}</span>
            <span style="color: #666; font-size: 0.85rem;">${rating}</span>
          </div>
          <div class="search-item-price">${product.price}</div>
        </div>
      </div>
    `;

    li.addEventListener("click", () => this.selectResult(product));
    li.addEventListener("mouseenter", () => {
      this.selectedIndex = index;
      this.updateSelectedState();
    });

    return li;
  }

  getProductCategory(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("burger")) return "Burger";
    if (titleLower.includes("fries")) return "Fries";
    if (titleLower.includes("combo")) return "Combo";
    if (titleLower.includes("deal")) return "Deal";
    if (titleLower.includes("doner")) return "Doner";
    if (titleLower.includes("cookie")) return "Dessert";
    return "Food";
  }

  highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  navigateResults(direction) {
    if (this.searchResults.length === 0) return;

    this.selectedIndex += direction;

    if (this.selectedIndex < 0) {
      this.selectedIndex = this.searchResults.length - 1;
    } else if (this.selectedIndex >= this.searchResults.length) {
      this.selectedIndex = 0;
    }

    this.updateSelectedState();
  }

  updateSelectedState() {
    const items = this.searchSuggestions.querySelectorAll("li");
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add("selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  selectResult(product) {
    // Scroll to product
    product.card.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight product
    productCards.forEach((card) => card.classList.remove("highlighted"));
    product.card.classList.add("highlighted");
    setTimeout(() => product.card.classList.remove("highlighted"), 2000);

    // Update search input
    this.searchInput.value = product.title;

    // Hide dropdown
    this.hideDropdown();

    // Show toast
    showToast(`Found: ${product.title}`);
  }

  // Recent Searches Management
  loadRecentSearches() {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  }

  saveRecentSearches() {
    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
  }

  addToRecentSearches(query) {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter((q) => q !== query);

    // Add to beginning
    this.recentSearches.unshift(query);

    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);

    this.saveRecentSearches();
    this.updateRecentSearchesUI();
  }

  updateRecentSearchesUI() {
    this.recentSearchesList.innerHTML = "";

    if (this.recentSearches.length === 0) {
      document.getElementById("recentSearches").style.display = "none";
      return;
    }

    document.getElementById("recentSearches").style.display = "block";

    this.recentSearches.forEach((query) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>${query}</span>
      `;
      li.addEventListener("click", () => {
        this.searchInput.value = query;
        this.performSearch(query);
      });
      this.recentSearchesList.appendChild(li);
    });
  }
}

// ============= COMPLETE ENHANCED SCRIPT =============
document.addEventListener("DOMContentLoaded", function () {
  console.log("Advanced Search System Loaded!");

  // Utility Functions
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function showToast(message, type = "success", duration = 3000) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = type === "success" ? "✓" : type === "error" ? "✗" : "ℹ";
    toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove());
    }, duration);
  }

  // Collect Product Data
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  const products = productCards.map((card) => ({
    title: card.querySelector(".product-title").textContent.trim(),
    price: card.querySelector(".product-price").textContent.trim(),
    image: card.querySelector(".product-image").src,
    card: card,
  }));

  // Initialize Advanced Search
  const advancedSearch = new AdvancedSearch();

  // Mobile Search with same advanced features
  const mobileOverlay = document.getElementById("mobileSearchOverlay");
  const mobileInput = document.getElementById("mobileSearchInput");
  const mobileSuggestions = document.getElementById("mobileSearchSuggestions");
  const closeBtn = document.querySelector(".close-mobile-search");
  const navSearchIcon = document.querySelector(
    ".nav-icons i.fa-magnifying-glass"
  );

  // Apply same search logic to mobile
  if (mobileInput) {
    const mobileSearch = new AdvancedSearch();
    // Configure mobileSearch to use mobile elements
    mobileSearch.searchInput = mobileInput;
    mobileSearch.searchSuggestions = mobileSuggestions;
    // ... apply same initialization
  }

  // Mobile overlay controls
  if (navSearchIcon) {
    navSearchIcon.addEventListener("click", () => {
      if (window.innerWidth <= 990) {
        mobileOverlay.style.display = "flex";
        document.body.classList.add("mobile-search-open");
        mobileInput.value = "";
        mobileSuggestions.innerHTML = "";
        setTimeout(() => mobileInput.focus(), 100);
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      mobileOverlay.style.display = "none";
      document.body.classList.remove("mobile-search-open");
    });
  }

  // ============= WISHLIST FUNCTIONALITY =============
  const wishlistCount = document.getElementById("wishlist-count");
  const sidebarWishlistCount = document.getElementById("sidebarWishlistCount");
  const wishlistSidebar = document.getElementById("wishlistSidebar");
  const wishlistOverlay = document.getElementById("wishlistOverlay");
  const wishlistItems = document.getElementById("wishlistItems");
  const emptyMessage = document.getElementById("emptyWishlistMessage");
  const navWishlistIcon = document.getElementById("navbar-wishlist-icon");
  const closeWishlistBtn = document.querySelector(".close-wishlist");

  let wishlistData = new Map();

  function updateWishlistDisplay() {
    const count = wishlistData.size;
    wishlistCount.textContent = count;
    if (sidebarWishlistCount) sidebarWishlistCount.textContent = count;

    wishlistItems.innerHTML = "";

    if (count === 0) {
      emptyMessage.style.display = "block";
      wishlistItems.style.display = "none";
    } else {
      emptyMessage.style.display = "none";
      wishlistItems.style.display = "block";

      wishlistData.forEach((product, title) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "wishlist-item";
        itemDiv.innerHTML = `
          <img src="${product.image}" alt="${title}" class="wishlist-item-image">
          <div class="wishlist-item-details">
            <div class="wishlist-item-title">${title}</div>
            <div class="wishlist-item-price">${product.price}</div>
          </div>
          <div class="wishlist-item-actions">
            <button class="buy-from-wishlist" data-title="${title}" data-price="${product.price}" data-image="${product.image}">
              Buy Now
            </button>
            <button class="remove-from-wishlist" data-title="${title}">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        `;
        wishlistItems.appendChild(itemDiv);
      });

      // Add event listeners
      document.querySelectorAll(".buy-from-wishlist").forEach((btn) => {
        btn.addEventListener("click", function () {
          const title = this.getAttribute("data-title");
          const price = this.getAttribute("data-price");
          const image = this.getAttribute("data-image");

          document.getElementById("orderTitle").textContent = title;
          document.getElementById("orderPrice").textContent = price;
          document.getElementById("orderImage").src = image;
          document.getElementById("totalAmount").textContent = price;

          closeWishlist();
          buyModal.style.display = "block";
          document.body.style.overflow = "hidden";
        });
      });

      document.querySelectorAll(".remove-from-wishlist").forEach((btn) => {
        btn.addEventListener("click", function () {
          const title = this.getAttribute("data-title");
          removeFromWishlist(title);
        });
      });
    }
  }

  function removeFromWishlist(title) {
    wishlistData.delete(title);

    document.querySelectorAll(".product-card").forEach((card) => {
      const cardTitle = card.querySelector(".product-title").textContent.trim();
      if (cardTitle === title) {
        const icon = card.querySelector(".wishlist-icon");
        icon.classList.remove("active");
      }
    });

    updateWishlistDisplay();
    showToast(`${title} removed from wishlist`, "error");
  }

  function closeWishlist() {
    wishlistSidebar.classList.remove("active");
    wishlistOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (navWishlistIcon) {
    navWishlistIcon.addEventListener("click", function () {
      wishlistSidebar.classList.add("active");
      wishlistOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (closeWishlistBtn)
    closeWishlistBtn.addEventListener("click", closeWishlist);
  if (wishlistOverlay) wishlistOverlay.addEventListener("click", closeWishlist);

  // Wishlist heart icons
  document.querySelectorAll(".wishlist-icon").forEach(function (icon) {
    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();

      const card = icon.closest(".product-card");
      const productTitle = card
        .querySelector(".product-title")
        .textContent.trim();
      const productPrice = card.querySelector(".product-price").textContent;
      const productImage = card.querySelector(".product-image").src;

      if (icon.classList.contains("active")) {
        icon.classList.remove("active");
        wishlistData.delete(productTitle);
        showToast(`${productTitle} removed from wishlist`, "error");
      } else {
        icon.classList.add("active");
        wishlistData.set(productTitle, {
          price: productPrice,
          image: productImage,
        });
        showToast(`${productTitle} added to wishlist!`);
      }

      updateWishlistDisplay();
    });
  });

  updateWishlistDisplay();

  // ============= BUY NOW FUNCTIONALITY =============
  const buyModal = document.getElementById("buyModal");
  const orderSuccessModal = document.getElementById("orderSuccessModal");
  const closeBuyModal = document.querySelector(".close-buy-modal");
  const buyForm = document.getElementById("buyForm");
  const closeSuccessBtn = document.querySelector(".close-success-btn");

  document.querySelectorAll(".btn-add-to-cart").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();

      const card = this.closest(".product-card");
      const title = card.querySelector(".product-title").textContent;
      const price = card.querySelector(".product-price").textContent;
      const image = card.querySelector(".product-image").src;

      document.getElementById("orderTitle").textContent = title;
      document.getElementById("orderPrice").textContent = price;
      document.getElementById("orderImage").src = image;
      document.getElementById("totalAmount").textContent = price;

      buyModal.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  });

  if (closeBuyModal) {
    closeBuyModal.addEventListener("click", function () {
      buyModal.style.display = "none";
      document.body.style.overflow = "";
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target === buyModal) {
      buyModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  if (buyForm) {
    buyForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      document.getElementById("orderNumber").textContent = orderNumber;

      buyModal.style.display = "none";
      orderSuccessModal.style.display = "flex";

      buyForm.reset();
    });
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", function () {
      orderSuccessModal.style.display = "none";
      document.body.style.overflow = "";
    });
  }
});
