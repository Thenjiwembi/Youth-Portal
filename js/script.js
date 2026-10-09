document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedOpportunities();
  renderUpcomingDeadlines();
  renderSavedOpportunities();
  renderRecentlyViewed();
  setupSearchForm();
  setupCareerResources();
  document.addEventListener("portal:saved-change", renderSavedOpportunities);
});

function getActiveOpportunities() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return opportunitiesData.filter((opp) => {
    const rawClosingDate = typeof opp.closingDate === "string" ? opp.closingDate.trim() : "";
    if (!rawClosingDate) return true;
    const closingDate = new Date(`${rawClosingDate}T00:00:00`);
    return Number.isNaN(closingDate.getTime()) || closingDate >= today;
  });
}

function renderFeaturedOpportunities() {
  const container = document.getElementById("featured-grid");
  if (!container) return;

  const featuredList = getActiveOpportunities().slice(0, 3);
  container.innerHTML = featuredList.length
    ? featuredList.map(createCardHTML).join("")
    : '<p class="empty-state">There are no active sample opportunities right now.</p>';
}

function renderUpcomingDeadlines() {
  const container = document.getElementById("deadlines-grid");
  if (!container) return;

  const upcoming = [...getActiveOpportunities()]
    .sort((a, b) => {
      const aTime = a.closingDate ? new Date(`${a.closingDate}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.closingDate ? new Date(`${b.closingDate}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, 3);
  container.innerHTML = upcoming.length
    ? upcoming.map(createCardHTML).join("")
    : '<p class="empty-state">No upcoming sample deadlines.</p>';
}

function renderSavedOpportunities() {
  const section = document.getElementById("saved-section");
  const container = document.getElementById("saved-grid");
  if (!section || !container || typeof getSavedOpportunityIds !== "function") return;
  const ids = getSavedOpportunityIds();
  const saved = ids.map((id) => opportunitiesData.find((item) => String(item.id) === String(id))).filter(Boolean);
  section.hidden = saved.length === 0;
  container.innerHTML = saved.map(createCardHTML).join("");
}

function renderRecentlyViewed() {
  const section = document.getElementById("recent-section");
  const container = document.getElementById("recent-grid");
  if (!section || !container || typeof getRecentOpportunityIds !== "function") return;
  const ids = getRecentOpportunityIds();
  const recentlyViewed = ids.map((id) => opportunitiesData.find((item) => String(item.id) === String(id))).filter(Boolean);
  section.hidden = recentlyViewed.length === 0;
  container.innerHTML = recentlyViewed.map(createCardHTML).join("");
}

function createCardHTML(opp) {
  const countdown = getOpportunityCountdown(opp.closingDate);
  const saved = isOpportunitySaved(opp.id);
  const sourceLink = opp.applicationLink ? `<a href="${opp.applicationLink}" class="btn-tertiary card-action" target="_blank" rel="noopener noreferrer">Official link</a>` : "";
  return `
    <article class="card">
      <span class="demo-badge">Sample listing · Not verified</span>
      <div>
        <span class="card-tag">${opp.category}</span>
        <h3 class="card-title">${opp.title}</h3>
        <p class="card-org">${opp.organisation}</p>
        <p class="card-meta">📍 ${opp.location}<br>🎓 ${opp.experienceLevel}<br>⏳ Closes: <strong>${opp.closingDate || "Check official source"}</strong></p>
        <span class="deadline-countdown ${countdown.soon ? "closing-soon" : ""}">${countdown.text}</span>
        <p class="card-desc">${opp.shortDescription}</p>
        <p class="card-updated">Sample data updated: ${opp.updatedDate}</p>
      </div>
      <div class="card-actions">
        <a href="opportunity-details.html?id=${encodeURIComponent(opp.id)}" class="btn-primary card-action">View Details</a>
        ${sourceLink}
        <button type="button" class="save-opportunity-btn ${saved ? "is-saved" : ""}" data-save-id="${opp.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove saved opportunity" : "Save opportunity"}"><span aria-hidden="true">★</span><span class="save-label">${saved ? "Saved" : "Save"}</span></button>
        <button type="button" class="share-opportunity-btn" data-share-id="${opp.id}" aria-label="Share ${opp.title}"><span aria-hidden="true">↗</span><span class="visually-hidden">Share</span></button>
      </div>
    </article>
  `;
}

function setupSearchForm() {
  const searchForm = document.getElementById("home-search-form");
  if (!searchForm) return;

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const keyword = document.getElementById("search-keyword").value.trim();
    const category = document.getElementById("search-category").value;
    const location = document.getElementById("search-location").value.trim();
    const params = new URLSearchParams();
    if (keyword) params.set("search", keyword);
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    const query = params.toString();
    window.location.href = `opportunities.html${query ? `?${query}` : ""}`;
  });
}

function setupCareerResources() {
  const resourceButtons = [
    { id: "download-cv-btn", handler: downloadCVTemplate },
    { id: "view-cover-letter-btn", handler: () => openResourceModal("Cover Letter Sample", coverLetterTemplate()) },
    { id: "read-guideline-btn", handler: () => openResourceModal("Interview Preparation Guidelines", guidelineTemplate()) }
  ];

  resourceButtons.forEach(({ id, handler }) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      handler();
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".close-btn") || event.target.id === "resource-modal") {
      closeResourceModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeResourceModal();
  });
}

function downloadCVTemplate() {
  const fileContent = `YOUR FULL NAME
City, South Africa | phone | email | LinkedIn | Portfolio

PROFESSIONAL SUMMARY
Write a short summary tailored to the opportunity.

EDUCATION
Qualification | Institution | Year

SKILLS
List relevant skills with examples.

EXPERIENCE & PROJECTS
Role or project | Dates
Describe your contribution and results.`;
  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Youth_Portal_CV_Template.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function coverLetterTemplate() {
  return `
    <div class="sample-letter">
      <p><strong>[Your Full Name]</strong><br>[City] | [Email] | [Phone]</p>
      <hr>
      <p><strong>Dear Hiring Team,</strong></p>
      <p>I am applying for [opportunity title]. My experience in [relevant skill or project] has prepared me to contribute to [organisation/team].</p>
      <p>I am particularly interested in this opportunity because [specific reason]. I would welcome the opportunity to discuss how my skills and motivation fit your requirements.</p>
      <p>Thank you for considering my application.</p>
      <p>Sincerely,<br><strong>[Your Name]</strong></p>
    </div>
  `;
}

function guidelineTemplate() {
  return `
    <div class="guidelines-content">
      <h4>Before your interview</h4>
      <ul>
        <li><strong>Research the organisation:</strong> Use its official website and verify the role.</li>
        <li><strong>Review the listing:</strong> Match your skills and examples to its requirements.</li>
        <li><strong>Use STAR:</strong> Explain the Situation, Task, Action, and Result in your examples.</li>
        <li><strong>Prepare questions:</strong> Ask about responsibilities, support, and next steps.</li>
        <li><strong>Stay safe:</strong> Never pay recruitment, interview, or placement fees.</li>
      </ul>
    </div>
  `;
}

function openResourceModal(title, htmlContent) {
  let modal = document.getElementById("resource-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "resource-modal";
    modal.className = "modal-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "resource-modal-title");
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="resource-modal-title">${title}</h3>
        <button type="button" class="close-btn" aria-label="Close dialog">&times;</button>
      </div>
      <div class="modal-body">${htmlContent}</div>
    </div>
  `;
  modal.style.display = "flex";
  modal.querySelector(".close-btn").focus();
}

function closeResourceModal() {
  const modal = document.getElementById("resource-modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.innerHTML = "";
}
