import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child, push, remove
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, StudentLesson, IsNullOrEmpty } from "./main.js";

document.getElementById("lesson-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const title = document.getElementById("lesson-title").value;
    const description = document.getElementById("lesson-description").value;

    let lessonData = {
        title: title,
        description: description,
        created: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
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

const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
    if (event.target && event.target.matches(".Button-Red-Icon")) {
        const row = event.target.closest("tr");

        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;

        const parsedData = JSON.parse(localStorage.getItem('userData'));
        var result = await ShowPopup('Are you sure you want to delete?', PopupType.Prompt);
        if (result) {
            await remove(ref(Database, "teachers/" + parsedData.uid + '/Lesson/' + id));
            row.remove();
            ShowNotification('Deleted Successfully', Colors.Green);
        }
    }
});