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

// Set the minimum date for the input field
document.getElementById("create-lesson-button").addEventListener("click", () => {
    var now = new Date();

    // Format the date and time to ISO 8601 format
    var year = now.getFullYear().toString().padStart(4, '0');
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var dateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;

    // Set the minimum date and time for the input field
    document.getElementById("lesson-release").setAttribute("min", dateTime);
    document.getElementById("lesson-release").setAttribute("value", dateTime);
});

const scheduleRadios = document.querySelectorAll("#release-scheduled input[name='schedule']");
console.log(scheduleRadios);
scheduleRadios.forEach(function(radio) {
    radio.addEventListener("change", handleScheduleChanged);
});

function handleScheduleChanged(event){
    var selectedSchedule = event.target.value;
    if(selectedSchedule == "scheduled"){
        document.getElementById("schedule-datetime").classList.remove("display-none");
    }else {
        document.getElementById("schedule-datetime").classList.add("display-none");
    }
}

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