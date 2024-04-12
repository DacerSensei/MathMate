import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref as databaseRef, set, onValue, get, child, push, remove
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import {
    getStorage, getDownloadURL, ref as storageRef, uploadBytes, uploadBytesResumable
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { FirebaseStorage, Database, GetElementValue, FirebaseConfig, StudentLesson, IsNullOrEmpty } from "./main.js";

document.getElementById("AddProblem").addEventListener("click", async (e) => {
    CreateQuestion();
});
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
scheduleRadios.forEach(function (radio) {
    radio.addEventListener("change", handleScheduleChanged);
});

function handleScheduleChanged(event) {
    var selectedSchedule = event.target.value;
    if (selectedSchedule == "scheduled") {
        document.getElementById("schedule-datetime").classList.remove("display-none");
    } else {
        document.getElementById("schedule-datetime").classList.add("display-none");
    }
}

document.getElementById("lesson-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const title = document.getElementById("lesson-title").value;
    const description = document.getElementById("lesson-description").value;
    const link = document.getElementById("lesson-link").value;
    const lessonVideo = document.getElementById("lesson-video").files[0];
    let schedule;
    scheduleRadios.forEach(radio => {
        if (radio.checked) {
            schedule = radio.value;
        }
    });
    var lessonData = {
        title: title,
        description: description,
        created: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        assessment: {}
    };
    if (!IsNullOrEmpty(link)) {
        lessonData["link"] = link;
    }
    if (schedule == ScheduleEnums.INSTANT) {
        lessonData["schedule"] = new Date().toLocaleString('en-US', { timeZone: "Asia/Manila" });
    } else if (schedule == ScheduleEnums.SCHEDULED) {
        lessonData["schedule"] = new Date(GetElementValue("lesson-release")).toLocaleString('en-US', { timeZone: "Asia/Manila" });
    }

    const problems = document.querySelectorAll("#pre-post-container > .pre-post-problem");
    problems.forEach(problem => {
        const problemTitle = problem.querySelector("p").textContent;
        const questionAndSolution = problem.querySelectorAll("input");

        lessonData.assessment[problemTitle] = {
            question: questionAndSolution[0].value,
            answer: questionAndSolution[1].value
        }
    });

    ShowLoading();
    if (lessonVideo != null) {
        const metadata = {
            contentType: 'video/mp4',
        };
        const storagePath = storageRef(FirebaseStorage, "teachers/" + parsedData.uid + '/Lesson/' + lessonVideo.name);
        const uploadTask = uploadBytesResumable(storagePath, lessonVideo, metadata);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                alert(error);
            },
            async () => {
                lessonData["videoPath"] = await getDownloadURL(uploadTask.snapshot.ref);
                lessonData["videoName"] = lessonVideo.name;

                await push(databaseRef(Database, "teachers/" + parsedData.uid + '/Lesson/'), lessonData);
                
                document.querySelector('.modal-close').click();
                ShowPopup("You just created a new lesson");
                document.getElementById("table-body").innerHTML = "";
                await StudentLesson();
            }
        );
    }
    document.getElementById("lesson-form").reset();
    document.getElementById("lesson-video").value = "";
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
            await remove(databaseRef(Database, "teachers/" + parsedData.uid + '/Lesson/' + id));
            row.remove();
            ShowNotification('Deleted Successfully', Colors.Green);
        }
    }
});

function CreateQuestion() {
    const sectionElement = document.getElementById("pre-post-container");
    const previousTitle = sectionElement.children[sectionElement.children.length - 1].querySelector("p").textContent;
    const previousInt = parseInt(previousTitle.charAt(previousTitle.length - 1))

    const quizProblemDiv = document.createElement("div");
    quizProblemDiv.classList.add("pre-post-problem");

    const questionParagraph = document.createElement("p");
    questionParagraph.textContent = "Question " + (previousInt + 1).toString();

    const firstInputDiv = document.createElement("div");
    firstInputDiv.classList.add("Solid-Textbox-Red");

    const firstIcon = document.createElement("i");
    firstIcon.classList.add("fa-solid", "fa-q");

    const firstInput = document.createElement("input");
    firstInput.type = "text";
    firstInput.id = "quiz-title";
    firstInput.placeholder = "Enter your problem";
    firstInput.required = true;

    firstInputDiv.appendChild(firstIcon);
    firstInputDiv.appendChild(firstInput);

    const secondInputDiv = document.createElement("div");
    secondInputDiv.classList.add("Solid-Textbox-Red");

    const secondIcon = document.createElement("i");
    secondIcon.classList.add("fa-solid", "fa-a");

    const secondInput = document.createElement("input");
    secondInput.type = "text";
    secondInput.id = "quiz-title";
    secondInput.placeholder = "Enter your solution";
    secondInput.required = true;

    secondInputDiv.appendChild(secondIcon);
    secondInputDiv.appendChild(secondInput);

    quizProblemDiv.appendChild(questionParagraph);
    quizProblemDiv.appendChild(firstInputDiv);
    quizProblemDiv.appendChild(secondInputDiv);

    sectionElement.appendChild(quizProblemDiv);
}

const ScheduleEnums = {
    INSTANT: "instant",
    SCHEDULED: "scheduled",
}