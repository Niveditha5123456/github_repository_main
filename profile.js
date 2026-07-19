import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const profileCard = document.querySelector(".pf-card");
const displayNameInput = document.getElementById("displayName");
const emailInput = document.getElementById("email");
const githubUsernameInput = document.getElementById("githubUsername");
const bioInput = document.getElementById("bio");
const locationInput = document.getElementById("location");
const profilePhoto = document.getElementById("profilePhoto");
const profileForm = document.getElementById("profileForm");
const saveStatus = document.getElementById("saveStatus");
const editToggleBtn = document.getElementById("editToggleBtn");
const cancelBtn = document.getElementById("cancelBtn");
const headerName = document.getElementById("headerName");
const headerEmail = document.getElementById("headerEmail");

let currentUser = null;
let lastSavedValues = {};

// ----------------------
// VIEW <-> EDIT MODE
// ----------------------

function fillViewValues(data) {
    document.getElementById("view-displayName").innerText = data.displayName || "Not set";
    document.getElementById("view-email").innerText = data.email || "Not set";
    document.getElementById("view-githubUsername").innerText = data.githubUsername || "Not set";
    document.getElementById("view-location").innerText = data.location || "Not set";
    document.getElementById("view-bio").innerText = data.bio || "Not set";

    headerName.innerText = data.displayName || "Unnamed User";
    headerEmail.innerText = data.email || "";
}

function enterEditMode() {
    profileCard.classList.add("pf-editing");
    editToggleBtn.classList.add("is-editing");
    editToggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Close';
}

function exitEditMode() {
    profileCard.classList.remove("pf-editing");
    editToggleBtn.classList.remove("is-editing");
    editToggleBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Profile';
}

editToggleBtn.addEventListener("click", () => {
    const isEditing = profileCard.classList.contains("pf-editing");
    if (isEditing) {
        exitEditMode();
    } else {
        enterEditMode();
    }
});

cancelBtn.addEventListener("click", () => {
    // Revert any unsaved edits back to the last saved values
    displayNameInput.value = lastSavedValues.displayName || "";
    githubUsernameInput.value = lastSavedValues.githubUsername || "";
    bioInput.value = lastSavedValues.bio || "";
    locationInput.value = lastSavedValues.location || "";
    if (lastSavedValues.photo) {
        profilePhoto.src = lastSavedValues.photo;
    }
    exitEditMode();
});

// ----------------------
// AUTH GUARD + AUTO-FILL
// ----------------------

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    emailInput.value = user.email || "";

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let profileData = {
            displayName: user.displayName || "",
            email: user.email || "",
            githubUsername: "",
            location: "",
            bio: "",
            photo: user.photoURL || ""
        };

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            profileData = {
                displayName: data.name || user.displayName || "",
                email: user.email || "",
                githubUsername: data.githubUsername || "",
                location: data.location || "",
                bio: data.bio || "",
                photo: data.photo || user.photoURL || ""
            };
        }

        lastSavedValues = profileData;

        displayNameInput.value = profileData.displayName;
        githubUsernameInput.value = profileData.githubUsername;
        bioInput.value = profileData.bio;
        locationInput.value = profileData.location;

        if (profileData.photo) {
            profilePhoto.src = profileData.photo;
        }

        fillViewValues(profileData);

    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Could not load your profile. Please try refreshing the page.");
    }
});

// ----------------------
// SAVE PROFILE
// ----------------------

profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert("You need to be logged in to save changes.");
        return;
    }

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const updatedName = displayNameInput.value.trim();
    const updatedGithub = githubUsernameInput.value.trim();
    const updatedBio = bioInput.value.trim();
    const updatedLocation = locationInput.value.trim();
    const updatedPhoto = profilePhoto.src || "";

    try {
        await updateProfile(currentUser, { displayName: updatedName });

        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, {
            name: updatedName,
            email: currentUser.email,
            githubUsername: updatedGithub,
            bio: updatedBio,
            location: updatedLocation,
            photo: updatedPhoto
        }, { merge: true });

        const newData = {
            displayName: updatedName,
            email: currentUser.email,
            githubUsername: updatedGithub,
            location: updatedLocation,
            bio: updatedBio,
            photo: updatedPhoto
        };

        lastSavedValues = newData;
        fillViewValues(newData);

        saveStatus.innerText = "Saved!";
        setTimeout(() => { saveStatus.innerText = ""; }, 2000);
        exitEditMode();

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Something went wrong while saving. Please try again.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Changes';
    }
});

// ----------------------
// PHOTO UPLOAD (base64 in Firestore doc)
// ----------------------

const photoUpload = document.getElementById("photoUpload");

photoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        profilePhoto.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// ----------------------
// LOGOUT
// ----------------------

window.logout = async function () {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Something went wrong while logging out.");
    }
};