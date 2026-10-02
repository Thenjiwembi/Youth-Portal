document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedOpportunities();
  setupSearchForm();
});

function renderFeaturedOpportunities() {
  const container = document.getElementById("featured-grid");
  if (!container) return;

  const featuredList = opportunitiesData.slice(0, 3);
  container.innerHTML = featuredList.map(opp => createCardHTML(opp)).join("");
}

function createCardHTML(opp) {
  return `
    <article class="card">
      <div>
        <span class="card-tag">${opp.category}</span>
        <h3 class="card-title">${opp.title}</h3>
        <p class="card-org">${opp.organisation}</p>
        <p class="card-meta">📍 ${opp.location} | ⏳ Closes: <strong>${opp.closingDate}</strong></p>
        <p class="card-desc">${opp.shortDescription}</p>
      </div>
      <div>
        <a href="opportunity-detail.html?id=${opp.id}" class="btn-primary" style="width: 100%; text-align: center;">View Details</a>
      </div>
    </article>
  `;
}

function setupSearchForm() {
  const searchForm = document.getElementById("home-search-form");
  if (!searchForm) return;

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = document.getElementById("search-keyword").value;
    const category = document.getElementById("search-category").value;
    const location = document.getElementById("search-location").value;

    window.location.href = `opportunities.html?search=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`;
  });
}