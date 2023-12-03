import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const FirebaseConfig = {
    apiKey: "AIzaSyAUpaMjpjjFKoacRv7fB6bdGXmFaODkQjM",
    authDomain: "mathmate-ee4f2.firebaseapp.com",
    databaseURL: "https://mathmate-ee4f2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mathmate-ee4f2",
    storageBucket: "mathmate-ee4f2.appspot.com",
    messagingSenderId: "961521874280",
    appId: "1:961521874280:web:ef232ccdfe6e91402f92dd"
};

const App = initializeApp(FirebaseConfig);
const Auth = getAuth(App);
const Database = getDatabase(App);


async function RenderElement(link, elementType, isAppend = true) {
    const response = await fetch(link);
    const responseHTML = await response.text();
    const tempContainer = document.createElement(elementType);
    tempContainer.innerHTML = responseHTML;
    const body = document.body;
    if (isAppend) {
        body.append(...tempContainer.childNodes);
    } else {
        body.prepend(...tempContainer.childNodes);
    }
}

RenderElement("/Library/loading.html", "div", false);
RenderElement("/Library/notification.html", "div");

document.addEventListener("DOMContentLoaded", function () {
    onAuthStateChanged(Auth, async (userCredentials) => {
        ShowLoading();
        if (userCredentials) {
            const userId = userCredentials.uid;
            get(child(ref(Database), 'admins/' + userId)).then((userSnapshot) => {
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    console.log(userData);
                    localStorage.setItem('adminData', JSON.stringify(userData));
                    if (window.location.pathname === "/index.html") {
                        window.location.href = "/dashboard.html";
                    }
                } else {
                    ShowNotification("Your account is not admin", Colors.Red);
                    signOut(Auth).then(() => {
                    }).catch((error) => {
                        console.log(error.message);
                    });
                }
            }).catch((error) => {
                console.log(error);
            });
        } else {
            if (window.location.pathname !== "/index.html") {
                window.location.href = "/index.html";
            }
        }
        HideLoading();
    });
});

function Login() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = GetElementValue("email") ?? "";
            const password = GetElementValue("password") ?? "";

            if (email == "" || password == "") {
                ShowNotification("Email or password cannot be empty", Colors.Red);
                return;
            }
            ShowLoading();
            signInWithEmailAndPassword(Auth, email, password).then(async (userCredential) => {
            }).catch((error) => {
                console.log(error.message);
                ShowNotification("Your email or password is incorrect.", Colors.Red);
            });
            HideLoading();
        });
    }
}

function Logout() {
    const logoutButton = document.getElementById("LogoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            ShowLoading();
            signOut(Auth).then(() => {
                localStorage.clear();
            }).catch((error) => {
                console.log(error.message);
            });
            HideLoading();
        });
    }
}

if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
    Login();
} else {
    Logout();
}

function GetElementValue(id) {
    return document.getElementById(id).value;
}