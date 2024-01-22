import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child, push
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, StudentLesson, IsNullOrEmpty } from "./main.js";

document.getElementById("lesson-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const title = document.getElementById("lesson-title").value;
    const description = document.getElementById("lesson-description").value;

    let lessonData = {
        title: title,
        description: description
    };
    ShowLoading();
    await push(ref(Database, "teachers/" + parsedData.uid + '/Lesson/'), lessonData);
    document.getElementById("lesson-form").reset();
    document.querySelector('.modal-close').click();
    ShowPopup("You just created a new lesson");
    document.getElementById("table-body").innerHTML = "";
    await StudentLesson();
    HideLoading();
});