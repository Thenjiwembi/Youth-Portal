const YP_STORAGE = {
  saved: "youthportal-saved-opportunities",
  recent: "youthportal-recently-viewed",
  theme: "youthportal-theme",
  archive: "youthportal-archive"
};

function readPortalStorage(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function getSavedOpportunityIds() {
  const value = readPortalStorage(YP_STORAGE.saved, []);
  return Array.isArray(value) ? value : [];
}

function isOpportunitySaved(id) {
  return getSavedOpportunityIds().includes(String(id));
}

function getArchiveEntries() {
  const value = readPortalStorage(YP_STORAGE.archive, []);
  return Array.isArray(value) ? value : [];
}

function saveArchiveEntry(entry) {
  const entries = [entry, ...getArchiveEntries()];
  try { localStorage.setItem(YP_STORAGE.archive, JSON.stringify(entries)); } catch { /* Archive remains unavailable when storage is blocked. */ }
}

function recordDocumentReview(fileName, type, review) {
  saveArchiveEntry({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: "document",
    fileName,
    documentType: type,
    positiveCount: review.good.length,
    improvementCount: review.improvements.length,
    createdAt: new Date().toISOString()
  });
}

function recordOpportunityShare(opportunity, detailsUrl) {
  saveArchiveEntry({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: "opportunity",
    title: opportunity ? opportunity.title : "Youth Portal opportunity",
    organisation: opportunity ? opportunity.organisation : "",
    detailsUrl,
    createdAt: new Date().toISOString()
  });
}

function getOpportunityCountdown(closingDate) {
  const rawClosingDate = typeof closingDate === "string" ? closingDate.trim() : "";
  if (!rawClosingDate) return { days: null, text: "Closing date unavailable", soon: false, expired: false };

  const end = new Date(`${rawClosingDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) return { days: null, text: "Closing date unavailable", soon: false, expired: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { days, text: "Closed", soon: false, expired: true };
  if (days === 0) return { days, text: "Closes today", soon: true, expired: false };
  return { days, text: `Closes in ${days} day${days === 1 ? "" : "s"}`, soon: days <= 7, expired: false };
}

function getRecentOpportunityIds() {
  const value = readPortalStorage(YP_STORAGE.recent, []);
  return Array.isArray(value) ? value : [];
}

function recordOpportunityView(id) {
  const normalized = String(id);
  const ids = [normalized, ...getRecentOpportunityIds().filter((item) => item !== normalized)].slice(0, 6);
  try { localStorage.setItem(YP_STORAGE.recent, JSON.stringify(ids)); } catch { /* Storage may be unavailable in private contexts. */ }
}

function refreshSavedOpportunityUI() {
  document.querySelectorAll(".save-opportunity-btn[data-save-id]").forEach((button) => {
    const saved = isOpportunitySaved(button.dataset.saveId);
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? "Remove saved opportunity" : "Save opportunity");
    button.classList.toggle("is-saved", saved);
    const label = button.querySelector(".save-label");
    if (label) label.textContent = saved ? "Saved" : "Save";
    else button.textContent = saved ? "★ Saved" : "☆ Save";
  });
  const count = getSavedOpportunityIds().length;
  document.querySelectorAll("[data-saved-count]").forEach((element) => { element.textContent = String(count); });
}

function setPortalTheme(theme) {
  const selected = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = selected;
  try { localStorage.setItem(YP_STORAGE.theme, selected); } catch { /* Theme still works for this page view. */ }
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.setAttribute("aria-pressed", String(selected === "dark"));
    button.innerHTML = selected === "dark" ? '<span aria-hidden="true">☀</span><span class="theme-label">Light</span>' : '<span aria-hidden="true">◐</span><span class="theme-label">Dark</span>';
  });
}

async function shareOpportunity(id) {
  const opportunity = typeof opportunitiesData !== "undefined" ? opportunitiesData.find((item) => String(item.id) === String(id)) : null;
  const detailsUrl = new URL(`opportunity-details.html?id=${encodeURIComponent(id)}`, window.location.href).href;
  const shareData = { title: opportunity ? opportunity.title : "Youth Portal opportunity", text: "View this opportunity on Youth Portal", url: detailsUrl };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      recordOpportunityShare(opportunity, detailsUrl);
    }
    else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(detailsUrl);
      recordOpportunityShare(opportunity, detailsUrl);
      announcePortalMessage("Link copied to clipboard.");
    } else {
      window.prompt("Copy this opportunity link:", detailsUrl);
    }
  } catch (error) {
    if (error && error.name !== "AbortError") announcePortalMessage("Could not share this link. You can copy the page address instead.");
  }
}

function announcePortalMessage(message) {
  let status = document.getElementById("portal-live-message");
  if (!status) {
    status = document.createElement("p");
    status.id = "portal-live-message";
    status.className = "visually-hidden";
    status.setAttribute("role", "status");
    document.body.appendChild(status);
  }
  status.textContent = message;
}

function setupPortalFeatures() {
  let theme = "light";
  try { theme = localStorage.getItem(YP_STORAGE.theme) || "light"; } catch { /* Use light theme. */ }
  setPortalTheme(theme);

  document.querySelectorAll(".nav-actions").forEach((actions) => {
    if (actions.querySelector(".theme-toggle")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.addEventListener("click", () => setPortalTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
    actions.appendChild(button);
  });
  setPortalTheme(theme);
  refreshSavedOpportunityUI();
  renderArchive();

  document.addEventListener("click", (event) => {
    const saveButton = event.target.closest(".save-opportunity-btn[data-save-id]");
    if (saveButton) {
      const id = String(saveButton.dataset.saveId);
      const ids = getSavedOpportunityIds();
      const next = ids.includes(id) ? ids.filter((value) => value !== id) : [id, ...ids];
      try { localStorage.setItem(YP_STORAGE.saved, JSON.stringify(next)); } catch { /* No persistence in blocked storage contexts. */ }
      refreshSavedOpportunityUI();
      document.dispatchEvent(new CustomEvent("portal:saved-change", { detail: { ids: next } }));
      return;
    }

    const shareButton = event.target.closest(".share-opportunity-btn[data-share-id]");
    if (shareButton) shareOpportunity(shareButton.dataset.shareId);
  });

  const alertForm = document.getElementById("email-alert-form");
  if (alertForm) {
    alertForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.getElementById("email-alert-status");
      if (status) status.textContent = "Mock-up complete. No email address was stored and no notifications were sent.";
      alertForm.reset();
    });
  }
}

function renderArchive() {
  const documents = document.getElementById("archive-documents");
  const opportunities = document.getElementById("archive-opportunities");
  if (!documents || !opportunities) return;

  const entries = getArchiveEntries();
  const renderGroup = (container, kind, emptyMessage) => {
    const matching = entries.filter((entry) => entry && entry.kind === kind);
    if (!matching.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = emptyMessage;
      container.replaceChildren(empty);
      return;
    }

    const cards = matching.map((entry) => {
      const card = document.createElement("article");
      card.className = "archive-entry";
      const title = document.createElement("h3");
      title.textContent = kind === "document" ? entry.fileName || "Checked document" : entry.title || "Shared opportunity";
      const details = document.createElement("p");
      if (kind === "document") {
        const type = entry.documentType === "cv" ? "CV" : "Cover letter";
        const positiveCount = entry.positiveCount || 0;
        const improvementCount = entry.improvementCount || 0;
        details.textContent = `${type} · ${positiveCount} positive check${positiveCount === 1 ? "" : "s"} · ${improvementCount} suggestion${improvementCount === 1 ? "" : "s"}`;
      } else {
        details.textContent = entry.organisation || "Opportunity";
      }
      const date = document.createElement("time");
      const createdAt = new Date(entry.createdAt);
      date.dateTime = Number.isNaN(createdAt.getTime()) ? "" : createdAt.toISOString();
      date.textContent = Number.isNaN(createdAt.getTime()) ? "Date unavailable" : createdAt.toLocaleString();
      card.append(title, details, date);
      if (kind === "opportunity" && entry.detailsUrl) {
        const link = document.createElement("a");
        link.href = entry.detailsUrl;
        link.className = "archive-entry-link";
        link.textContent = "View opportunity";
        card.append(link);
      }
      return card;
    });
    container.replaceChildren(...cards);
  };

  renderGroup(documents, "document", "Documents you check will appear here. Only the file name and check summary are saved, never the file itself.");
  renderGroup(opportunities, "opportunity", "Opportunities you share will appear here.");

  const clearButton = document.getElementById("clear-archive");
  if (clearButton && !clearButton.dataset.ready) {
    clearButton.dataset.ready = "true";
    clearButton.addEventListener("click", () => {
      if (!window.confirm("Clear all archived document checks and shared opportunities from this browser?")) return;
      try { localStorage.removeItem(YP_STORAGE.archive); } catch { /* Storage may be unavailable. */ }
      renderArchive();
    });
  }
}

document.addEventListener("DOMContentLoaded", setupPortalFeatures);
