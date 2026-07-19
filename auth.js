import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ----------------------
// REGISTER
// ----------------------

const registerForm = document.getElementById("registerForm");

if(registerForm){

let isRegistering = false;

registerForm.addEventListener("submit", async(e)=>{

e.preventDefault();

if(isRegistering){
    return;
}

isRegistering = true;

const submitButton = registerForm.querySelector("button[type='submit']");
if(submitButton){
    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";
}

const name=document.getElementById("name").value.trim();

const email=document.getElementById("email").value.trim();

// Optional fields collected at signup so the profile page
// has something to show right away instead of being empty.
const githubUsername = document.getElementById("githubUsername")
    ? document.getElementById("githubUsername").value.trim()
    : "";

const location = document.getElementById("location")
    ? document.getElementById("location").value.trim()
    : "";

const bio = document.getElementById("bio")
    ? document.getElementById("bio").value.trim()
    : "";

const password=document.getElementById("password").value;

const confirm=document.getElementById("confirmPassword").value;

const normalizedEmail = email.toLowerCase();

if(password!==confirm){

alert("Passwords do not match!");

isRegistering = false;
if(submitButton){
    submitButton.disabled = false;
    submitButton.textContent = "Create Account";
}

return;

}

try{

const userCredential=await createUserWithEmailAndPassword(auth, normalizedEmail, password);

await updateProfile(userCredential.user,{
displayName:name
});

await setDoc(doc(db,"users",userCredential.user.uid),{

name:name,
email:normalizedEmail,
githubUsername:githubUsername,
location:location,
bio:bio,
photo:""

});

alert("Registration Successful!");

window.location.href="login.html";

}

catch(error){
    console.log(error);

    if(error.code === "auth/network-request-failed"){
        alert("Network error. Please check your internet connection and try again.");
    } else if(error.code === "auth/email-already-in-use"){
        alert("This email is already registered. Please use a different email.");
    } else if(error.code === "auth/weak-password"){
        alert("Password should be at least 6 characters long.");
    } else {
        alert("Error code: " + error.code + "\n\nMessage: " + error.message);
    }
    
    }

finally{
    isRegistering = false;
    if(submitButton){
        submitButton.disabled = false;
        submitButton.textContent = "Create Account";
    }
}

});
}




// ----------------------
// LOGIN
// ----------------------

const loginForm=document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const email=document.getElementById("loginEmail").value.trim().toLowerCase();

const password=document.getElementById("loginPassword").value;

try{

await signInWithEmailAndPassword(auth,email,password);

window.location.href="dashboard.html";

}

catch(error){

    console.log("Login error code:", error.code);

    if (error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password") {
        alert("Invalid email or password.");
    } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
    } else if (error.code === "auth/too-many-requests") {
        alert("Too many failed attempts. Please try again later.");
    } else {
        alert("Error code: " + error.code + "\n\nMessage: " + error.message);
    }

}

});

}