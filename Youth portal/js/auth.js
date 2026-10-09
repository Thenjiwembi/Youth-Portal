// Browser-local prototype account and profile behavior; not secure authentication.
document.addEventListener("DOMContentLoaded", () => {
  setupSignup();
  setupLogin();
  setupProfile();
  setupLogout();
});

function setupSignup() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = {
      fullName: readValue("signup-fullname"),
      email: readValue("signup-email").toLowerCase(),
      location: readValue("signup-location"),
      phone: "",
      qualification: "",
      about: "",
      skills: "",
      interests: "",
      avatarDataUrl: ""
    };
    if (!saveUserProfile(user)) {
      window.alert("This browser could not save the demo profile. Check that local storage is available, then try again.");
      return;
    }
    try {
      localStorage.setItem("isLoggedIn", "true");
    } catch (_) {
      // The profile itself is still stored, but this prototype cannot track a session.
    }
    window.alert("Your local demo profile has been created. You can add more details on the profile page.");
    window.location.href = "profile.html";
  });
}

function setupLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = readValue("login-email").toLowerCase();
    const user = readStoredUser() || {};
    user.fullName = asText(user.fullName);
    user.email = email;
    user.location = asText(user.location);
    user.phone = asText(user.phone);
    user.qualification = asText(user.qualification);
    user.about = asText(user.about);
    user.skills = asText(user.skills);
    user.interests = asText(user.interests);
    user.avatarDataUrl = safeAvatarDataUrl(user.avatarDataUrl);

    if (!saveUserProfile(user)) {
      window.alert("This browser could not save the local demo profile. Check that local storage is available, then try again.");
      return;
    }
    try {
      localStorage.setItem("isLoggedIn", "true");
    } catch (_) {
      // This is only a browser-local prototype; no server session exists.
    }
    window.location.href = "profile.html";
  });
}

function setupProfile() {
  const form = document.getElementById("profile-edit-form");
  if (!form) return;

  const editButton = document.getElementById("edit-profile-btn");
  const cancelButton = document.getElementById("cancel-profile-btn");
  const photoInput = document.getElementById("profile-photo-input");
  let currentUser = readStoredUser() || emptyProfile();

  renderProfile(currentUser);
  fillProfileForm(currentUser);

  editButton.addEventListener("click", () => {
    if (!form.hidden) {
      currentUser = readStoredUser() || emptyProfile();
      fillProfileForm(currentUser);
      setEditMode(false);
      showProfileStatus("Editing cancelled. Your saved profile has not changed.");
      return;
    }
    fillProfileForm(currentUser);
    setEditMode(true);
    document.getElementById("profile-fullname").focus({ preventScroll: true });
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  cancelButton.addEventListener("click", () => {
    currentUser = readStoredUser() || emptyProfile();
    fillProfileForm(currentUser);
    setEditMode(false);
    showProfileStatus("Editing cancelled. Your saved profile has not changed.");
    editButton.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedUser = {
      ...currentUser,
      fullName: readValue("profile-fullname").trim(),
      email: readValue("profile-email").trim().toLowerCase(),
      location: readValue("profile-location").trim(),
      phone: readValue("profile-phone").trim(),
      qualification: readValue("profile-qualification").trim(),
      about: readValue("profile-about").trim(),
      skills: readValue("profile-skills").trim(),
      interests: readValue("profile-interests").trim(),
      avatarDataUrl: safeAvatarDataUrl(currentUser.avatarDataUrl),
      updatedAt: new Date().toISOString()
    };

    if (!saveUserProfile(updatedUser)) {
      showProfileStatus("Could not save changes in this browser. Check available storage and try again.", true);
      return;
    }
    currentUser = updatedUser;
    renderProfile(currentUser);
    setEditMode(false);
    showProfileStatus("Your profile has been saved in this browser.");
    editButton.focus();
  });

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    photoInput.value = "";

    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      showProfileStatus("Choose a JPG, PNG, or WebP image.", true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showProfileStatus("That picture is over 5 MB. Choose a smaller image and try again.", true);
      return;
    }

    showProfileStatus("Preparing your picture…");
    try {
      const compressedImage = await compressProfilePhoto(file);
      const latestUser = readStoredUser() || currentUser || emptyProfile();
      const updatedUser = {
        ...latestUser,
        avatarDataUrl: compressedImage,
        updatedAt: new Date().toISOString()
      };
      if (!saveUserProfile(updatedUser)) {
        showProfileStatus("Could not save this picture in the browser. Try a smaller image or remove other site data.", true);
        return;
      }
      currentUser = updatedUser;
      renderProfile(currentUser);
      showProfileStatus("Profile picture updated and saved in this browser.");
    } catch (_) {
      showProfileStatus("We could not read that image. Try another JPG, PNG, or WebP file.", true);
    }
  });

  document.getElementById("remove-photo-btn").addEventListener("click", () => {
    const latestUser = readStoredUser() || currentUser || emptyProfile();
    const updatedUser = { ...latestUser, avatarDataUrl: "", updatedAt: new Date().toISOString() };
    if (!saveUserProfile(updatedUser)) {
      showProfileStatus("Could not update the picture in this browser. Please try again.", true);
      return;
    }
    currentUser = updatedUser;
    renderProfile(currentUser);
    showProfileStatus("Profile picture removed.");
  });

  function setEditMode(isEditing) {
    form.hidden = !isEditing;
    editButton.setAttribute("aria-expanded", String(isEditing));
    document.getElementById("edit-profile-label").textContent = isEditing ? "Close editor" : "Edit profile";
  }
}

function setupLogout() {
  const button = document.getElementById("logout-btn");
  if (!button) return;
  button.addEventListener("click", () => {
    try {
      localStorage.setItem("isLoggedIn", "false");
    } catch (_) {
      // Continue to the local login prototype even if storage is unavailable.
    }
    window.location.href = "login.html";
  });
}

function emptyProfile() {
  return { fullName: "", email: "", location: "", phone: "", qualification: "", about: "", skills: "", interests: "", avatarDataUrl: "" };
}

function readStoredUser() {
  try {
    const value = JSON.parse(localStorage.getItem("userProfile") || "null");
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch (_) {
    return null;
  }
}

function saveUserProfile(user) {
  try {
    localStorage.setItem("userProfile", JSON.stringify(user));
    return true;
  } catch (_) {
    return false;
  }
}

function renderProfile(user) {
  const fullName = asText(user.fullName).trim();
  const email = asText(user.email).trim();
  setText("profile-display-name", fullName || "Your profile");
  setText("profile-display-email", email || "Add an email address");
  setText("profile-member-note", fullName || email
    ? "Your details are saved on this browser. You can update them at any time."
    : "Complete your profile to personalise your opportunity search.");
  setText("profile-display-location", asText(user.location).trim() || "Not added yet");
  setText("profile-display-phone", asText(user.phone).trim() || "Not added yet");
  setText("profile-display-qualification", asText(user.qualification).trim() || "Not added yet");
  setText("profile-display-about", asText(user.about).trim() || "Add a short introduction to tell us about yourself.");

  const initials = fullName
    ? fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase()
    : "Y";
  setText("avatar-fallback", initials);
  const avatar = safeAvatarDataUrl(user.avatarDataUrl);
  const image = document.getElementById("profile-avatar-image");
  const fallback = document.getElementById("avatar-fallback");
  image.hidden = !avatar;
  fallback.hidden = Boolean(avatar);
  if (avatar) {
    image.src = avatar;
    image.alt = fullName ? `Profile picture of ${fullName}` : "Profile picture";
  } else {
    image.removeAttribute("src");
    image.alt = "";
  }
  document.getElementById("remove-photo-btn").hidden = !avatar;
  renderChipList("profile-display-skills", user.skills, "Add your skills when you edit your profile.");
  renderChipList("profile-display-interests", user.interests, "Add roles or fields you’re interested in.");
}

function fillProfileForm(user) {
  setValue("profile-fullname", asText(user.fullName));
  setValue("profile-email", asText(user.email));
  setValue("profile-location", asText(user.location));
  setValue("profile-phone", asText(user.phone));
  setValue("profile-qualification", asText(user.qualification));
  setValue("profile-about", asText(user.about));
  setValue("profile-skills", asText(user.skills));
  setValue("profile-interests", asText(user.interests));
}

function renderChipList(id, value, emptyMessage) {
  const container = document.getElementById(id);
  container.replaceChildren();
  const items = asText(value).split(/[,;\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 30);
  if (!items.length) {
    const empty = document.createElement("span");
    empty.className = "profile-empty-inline";
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "profile-chip";
    chip.textContent = item;
    container.appendChild(chip);
  });
}

async function compressProfilePhoto(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Image could not be decoded"));
      element.src = objectUrl;
    });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("Image has no dimensions");

    const maxEdge = 640;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Image compression failed")), "image/jpeg", 0.82);
    });
    if (blob.size > 500 * 1024) throw new Error("Compressed image is too large");
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Image could not be saved"));
      reader.readAsDataURL(blob);
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function safeAvatarDataUrl(value) {
  if (typeof value !== "string") return "";
  return /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value) ? value : "";
}

function readValue(id) {
  const element = document.getElementById(id);
  return element ? element.value : "";
}
function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value;
}
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
function asText(value) {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}
function showProfileStatus(message, isError = false) {
  const status = document.getElementById("profile-status");
  if (!status) return;
  status.textContent = message;
  status.hidden = false;
  status.classList.toggle("is-error", isError);
  if (!isError) {
    window.clearTimeout(showProfileStatus.timer);
    showProfileStatus.timer = window.setTimeout(() => { status.hidden = true; }, 5000);
  }
}
