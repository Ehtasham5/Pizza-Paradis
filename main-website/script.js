document.addEventListener("DOMContentLoaded", () => {
  // hamburger
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Wishlist Icon

  // const wishlistIcon = document.querySelectorAll(".wishlist-icon");

  // wishlistIcon.forEach((button) => {
  //   button.addEventListener("click", () => {
  //     button.classList.toggle("active");
  //   });
  // });

  // location function
  const location = document.querySelector(".location");
  location.addEventListener("click", function () {
    const address = this.textContent;

    window.open(
      `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      "_blank"
    );
  });

  /// Bottom to Top
  const btn = document.querySelector(".scroll-up-button");
  btn.addEventListener("click", () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      btn.style.display = "block"; // Show button
    } else {
      btn.style.display = "none"; // Hide button
    }
  });

  // WISHLIST FUNCTIONALITY FIRST
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
    sidebarWishlistCount.textContent = count;

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
            <button class="wishlist-item-button"><a href="https://order.foodsted.com/restaurant/pizza-paradis-stv"
                  target="_main">Bestill nå</a></button>
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
        // const icon = card.querySelector(".wishlist-icon");
        // icon.classList.remove("active");
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

  const wishlistIcons = document.querySelectorAll(".wishlist-icon");
  console.log("Found wishlist icons:", wishlistIcons.length);

  wishlistIcons.forEach(function (icon) {
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

  //SEARCH FUNCTIONALITY
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  const products = productCards.map((card) => ({
    title: card.querySelector(".product-title").textContent.trim(),
    card: card,
  }));

  const searchInput = document.getElementById("searchInput");
  const suggestions = document.getElementById("searchSuggestions");

  searchInput.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();
    suggestions.innerHTML = "";
    if (!value) {
      suggestions.style.display = "none";
      return;
    }
    // Filter products
    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(value)
    );
    if (filtered.length === 0) {
      suggestions.style.display = "none";
      return;
    }
    // Show suggestions
    searchInput.addEventListener("input", function () {
      const value = this.value.trim().toLowerCase();
      suggestions.innerHTML = "";
      if (!value) {
        suggestions.style.display = "none";
        return;
      }
      // Filter products
      const filtered = products.filter((p) =>
        p.title.toLowerCase().includes(value)
      );
      if (filtered.length === 0) {
        suggestions.style.display = "none";
        return;
      }
      // Show suggestions with image and name
      filtered.forEach((p) => {
        const li = document.createElement("li");
        // Get product image
        const imgSrc = p.card.querySelector(".product-image").src;
        li.innerHTML = `
      <img src="${imgSrc}" alt="${p.title}";>
      <span style="vertical-align:middle;">${p.title}</span>
    `;
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "10px";
        li.addEventListener("mousedown", function (e) {
          e.preventDefault();
          p.card.scrollIntoView({ behavior: "smooth", block: "center" });
          productCards.forEach((card) => card.classList.remove("highlighted"));
          p.card.classList.add("highlighted");
          setTimeout(() => p.card.classList.remove("highlighted"), 2000);
          suggestions.style.display = "none";
          searchInput.value = p.title;
        });
        suggestions.appendChild(li);
      });
      suggestions.style.display = "block";
    });
  });

  // Mobile search
  const mobileOverlay = document.getElementById("mobileSearchOverlay");
  const mobileInput = document.getElementById("mobileSearchInput");
  const mobileSuggestions = document.getElementById("mobileSearchSuggestions");
  const closeBtn = document.querySelector(".close-mobile-search");
  const navSearchIcon = document.querySelector(
    ".nav-icons i.fa-magnifying-glass"
  );

  navSearchIcon.addEventListener("click", function (e) {
    if (window.innerWidth <= 990) {
      mobileOverlay.style.display = "flex";
      document.body.classList.add("mobile-search-open");
      mobileInput.value = "";
      mobileSuggestions.innerHTML = "";
      setTimeout(() => mobileInput.focus(), 100);
    }
  });

  closeBtn.addEventListener("click", function () {
    mobileOverlay.style.display = "none";
    document.body.classList.remove("mobile-search-open");
  });

  mobileOverlay.addEventListener("click", function (e) {
    if (e.target === mobileOverlay) {
      mobileOverlay.style.display = "none";
      document.body.classList.remove("mobile-search-open");
    }
  });

  // Mobile search filter
  mobileInput.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();
    mobileSuggestions.innerHTML = "";
    if (!value) {
      mobileSuggestions.style.display = "none";
      return;
    }
    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(value)
    );
    if (filtered.length === 0) {
      mobileSuggestions.style.display = "none";
      return;
    }
    filtered.forEach((p) => {
      const li = document.createElement("li");
      // Get product image
      const imgSrc = p.card.querySelector(".product-image").src;
      li.innerHTML = `
      <img src="${imgSrc}" alt="${p.title}";>
      <span style="vertical-align:middle;">${p.title}</span>
    `;
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.gap = "10px";
      li.addEventListener("mousedown", function (e) {
        e.preventDefault();
        p.card.scrollIntoView({ behavior: "smooth", block: "center" });
        productCards.forEach((card) => card.classList.remove("highlighted"));
        p.card.classList.add("highlighted");
        setTimeout(() => p.card.classList.remove("highlighted"), 2000);
        mobileOverlay.style.display = "none";
        document.body.classList.remove("mobile-search-open");
      });
      mobileSuggestions.appendChild(li);
    });
    mobileSuggestions.style.display = "block";
  });
});
