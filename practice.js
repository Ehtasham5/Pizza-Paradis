// === SEARCH FILTER FUNCTIONALITY ===
// 1. Collect all product titles and their cards
const productCards = Array.from(document.querySelectorAll(".product-card"));
const products = productCards.map((card) => ({
  title: card.querySelector(".product-title").textContent.trim(),
  card: card,
}));

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("searchSuggestions");

// 2. Show suggestions as you type
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
  filtered.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p.title;
    li.addEventListener("mousedown", function (e) {
      e.preventDefault(); // Prevent input blur
      // Scroll to product and highlight
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

// Hide suggestions on blur (with a slight delay for click)
searchInput.addEventListener("blur", function () {
  setTimeout(() => (suggestions.style.display = "none"), 150);
});

// Optional: Hide suggestions if you click outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".search-container")) {
    suggestions.style.display = "none";
  }
});

// --- MOBILE SEARCH POPUP ---
const mobileOverlay = document.getElementById("mobileSearchOverlay");
const mobileInput = document.getElementById("mobileSearchInput");
const mobileSuggestions = document.getElementById("mobileSearchSuggestions");
const closeBtn = document.querySelector(".close-mobile-search");
const navSearchIcon = document.querySelector(
  ".nav-icons i.fa-magnifying-glass"
);

// Show popup on icon click (only on mobile)
navSearchIcon.addEventListener("click", function (e) {
  if (window.innerWidth <= 990) {
    mobileOverlay.style.display = "flex";
    document.body.classList.add("mobile-search-open");
    mobileInput.value = "";
    mobileSuggestions.innerHTML = "";
    setTimeout(() => mobileInput.focus(), 100);
  }
});

// Close popup
closeBtn.addEventListener("click", function () {
  mobileOverlay.style.display = "none";
  document.body.classList.remove("mobile-search-open");
});

// Close when clicking outside popup
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
    li.textContent = p.title;
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

// Hide suggestions on blur (with a slight delay for click)
mobileInput.addEventListener("blur", function () {
  setTimeout(() => (mobileSuggestions.style.display = "none"), 150);
});

// Show suggestions again on focus if input has value
mobileInput.addEventListener("focus", function () {
  if (this.value.trim()) mobileSuggestions.style.display = "block";
});
