import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child, push, remove
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, StudentAccount, IsNullOrEmpty } from "./main.js";

import * as XLSX from '/node_modules/xlsx/xlsx.mjs';


const SecondaryApp = initializeApp(FirebaseConfig, "SecondaryApp");
const SecondaryAuth = getAuth(SecondaryApp);

function createExpander(parentExpander, headerContent, htmlContent) {
    // Create the main expander container
    const expander = document.createElement('div');
    expander.classList.add('expander');

    // Create the header
    const header = document.createElement('div');
    header.classList.add('header');
    header.addEventListener('click', toggleExpander);



    // Create the title
    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = headerContent;

    // Create the arrow
    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    arrow.textContent = '\u25BC'; // Downward arrow

    // Append title and arrow to the header
    header.appendChild(title);
    header.appendChild(arrow);

    const content = document.createElement('div');
    content.classList.add('content');
    content.innerHTML = htmlContent;

    expander.appendChild(header);
    expander.appendChild(content);

    parentExpander.appendChild(expander);
}

function toggleExpander(event) {
    if (event.target.parentNode) {
        event.target.parentNode.parentNode.classList.toggle('active');
    }

}

document.getElementById("CreateData").addEventListener("click", () => {
    isUpdating = false;
    document.getElementById("CreateStudentButton").innerHTML = "Create Student";
    document.getElementById("student-form").querySelector("section").children[2].querySelector("input").disabled = false;
});

document.getElementById("ArchiveButton").addEventListener("click", async () => {
    let result = await ShowPopup('Are you sure you want to archive all students?', PopupType.Prompt);
    if (result) {
        const students = table.querySelectorAll("tbody > tr");
        const updatePromises = [];

        students.forEach(async student => {
            const id = student.querySelector("input").value;
            const updatePromise = set(ref(Database, "users/" + id + "/Status"), "archived");
            updatePromises.push(updatePromise);
        });
        await Promise.all(updatePromises);

        document.getElementById("table-body").innerHTML = "";
        await StudentAccount();
    }
});

let isUpdating = false;
let hiddenKey = null;

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const genderElement = document.getElementById("gender");

    const studentNumber = GetElementValue("student-number") ?? "";
    const firstName = GetElementValue("first-name") ?? "";
    const lastName = GetElementValue("last-name") ?? "";
    const birthday = GetElementValue("birthday") ?? "";
    const email = GetElementValue("email") ?? "";
    const contact = GetElementValue("contact") ?? "";
    const gender = (genderElement === null) ? "None" : genderElement.Value;
    const teacher = parsedData.uid ?? "None"
    if (IsNullOrEmpty(studentNumber) || IsNullOrEmpty(firstName) || IsNullOrEmpty(lastName) || IsNullOrEmpty(birthday) || IsNullOrEmpty(contact) || gender == "None" || teacher == "None" || IsNullOrEmpty(email)) {
        ShowNotification("Please fill up all the required data", Colors.Red);
        return;
    }
    ShowLoading();

    let studentData = {
        FirstName: firstName,
        LastName: lastName,
        Gender: gender,
        Contact: contact,
        Email: email,
        Teacher: teacher,
        Birthday: birthday,
        Username: studentNumber,
        Password: studentNumber,
        Status: "active"
    };

    if (isUpdating == false) {
        await set(ref(Database, "users/" + studentNumber), studentData);
    } else if (isUpdating == true) {
        if (hiddenKey != null) {
            await set(ref(Database, "users/" + hiddenKey), studentData);
            hiddenKey = null;
        }
    }
    HideLoading();
    ShowPopup("You just created a new account");
    document.getElementById("student-form").reset();
    document.querySelector('.modal-close').click();
    genderElement.SelectedItem = genderElement.Items[0];
    document.getElementById("table-body").innerHTML = "";
    await StudentAccount();
    HideLoading();
});

document.getElementById("Excel-Import").addEventListener("change", ExcelImportStudent);

function ExcelImportStudent(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        let result = await ShowPopup('Are you sure you want import ' + file.name + '?', PopupType.Prompt);
        if (result) {
            const teacher = JSON.parse(localStorage.getItem('userData')).uid ?? "None";
            ShowLoading();
            for (const [key, values] of Object.entries(jsonData)) {
                const splitBirthday = values["Birthday"].split("/");
                const Birthday = new Date(splitBirthday[2], splitBirthday[0] - 1, splitBirthday[1]);
                values["Birthday"] = splitBirthday[2] + "-" + splitBirthday[0] + "-" + splitBirthday[1]; // rearrange bday date
                await set(ref(Database, "users/" + values["Student Number"]), {
                    'FirstName': values["First Name"],
                    'LastName': values["Last Name"],
                    'Gender': values["Sex"],
                    'Contact': values["Contact Number"],
                    'Email': values["Guardian Email"],
                    'Teacher': teacher,
                    'Birthday': Birthday.getFullYear() + "-" + ('0' + (Birthday.getMonth() + 1)).slice(-2) + "-" + ('0' + Birthday.getDate()).slice(-2),
                    'Username': values["Student Number"],
                    'Password': values["Student Number"],
                    'Status': "active"
                });
            }
            document.getElementById("table-body").innerHTML = "";
            await StudentAccount();
            HideLoading();
            ShowPopup("Import Finished");
        }
    };
    reader.readAsArrayBuffer(file);
}

SetTab();
let quizChart = new Chart(document.getElementById('quiz-chart').getContext("2d"));
let lessonChart = new Chart(document.getElementById('lesson-chart').getContext("2d"));
const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
    if (event.target && event.target.matches(".Button-Blue-Icon")) {
        document.getElementById("Tab-1").innerHTML = "";
        document.getElementById("Tab-2").innerHTML = "";
        if(quizChart){
            quizChart.destroy();
        }
        if(lessonChart){
            lessonChart.destroy();
        }

        const row = event.target.closest("tr");
        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;

        try {
            await get(child(ref(Database), 'users/' + id)).then(async (studentSnapshot) => {
                const data = studentSnapshot.val();

                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentID").textContent = data.Username;
                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentID").classList.add("Status-Purple", "width-fill-available")
                document.getElementById("overview-modal-content").querySelector(".overview-name #CompleteName").textContent = data.LastName + " " + data.FirstName;
                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentStatus").textContent = data.Status;
                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentStatus").classList.add("Status-Green", "width-fill-available")

                if (data.Gender === "Male") {
                    document.getElementById("overview-modal-content").querySelector(".overview-name #StudentGender").classList.add("Status-Blue", "width-fill-available")
                } else if (data.Gender === "Female") {
                    document.getElementById("overview-modal-content").querySelector(".overview-name #StudentGender").classList.add("Status-Pink", "width-fill-available")
                }
                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentEmail").textContent = data.Email;
                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentEmail").classList.add("Status-Red", "width-fill-available")

                document.getElementById("overview-modal-content").querySelector(".overview-name #StudentGender").textContent = data.Gender;
                if (data.DisplayPicture) {
                    document.getElementById("overview-modal-content").querySelector(".overview-picture #ProfilePicture").src = data.DisplayPicture;
                } else {
                    document.getElementById("overview-modal-content").querySelector(".overview-picture #ProfilePicture").src = "/Assets/Logo.png"
                }

                let quizChartData = []
                let lessonChartData = []

                let tab1 = document.getElementById("Tab-1");
                if (data.Quiz) {
                    for (const [key, values] of Object.entries(data.Quiz)) {
                        let result = parseInt(values.Score) / parseInt(values.Total) * 100;
                        quizChartData.push({ date: values.Date, score: result })

                        const htmlContent = `
                        <p>Date: ${values.Date}</p>
                        <p>Score: ${values.Score}/${values.Total}</p>
                        `
                        createExpander(tab1, values.Description, htmlContent);
                    }
                }
                let tab2 = document.getElementById("Tab-2");
                if (data.Lesson) {
                    for (const [key, values] of Object.entries(data.Lesson)) {
                        let preResult = parseInt(values.InitialScore) / parseInt(values.Total) * 100;
                        let postResult = parseInt(values.FinalScore) / parseInt(values.Total) * 100;
                        lessonChartData.push({ date: values.Date, initial: preResult, final: postResult })

                        const htmlContent = `
                    <p>Date: ${values.Date}</p>
                    <p>Pre Score: ${values.InitialScore}/${values.Total}</p>
                    <p>Post Score: ${values.FinalScore}/${values.Total}</p>
                    `
                        createExpander(tab2, key, htmlContent);
                    }
                }

                quizChart = new Chart(document.getElementById('quiz-chart').getContext("2d"),
                    {
                        type: 'bar',
                        data: {
                            labels: quizChartData.map(row => row.date),
                            datasets: [
                                {
                                    label: 'Quiz Scores',
                                    data: quizChartData.map(row => row.score),
                                    fill: true,
                                    borderColor: 'rgb(209, 39, 44)',
                                    backgroundColor: 'rgb(209, 39, 44)',
                                    tension: 0.1
                                }
                            ]
                        },
                        options: {
                            animations: {
                                tension: {
                                    duration: 1000,
                                    easing: 'bar',
                                    from: 1,
                                    to: 0,
                                    loop: true
                                }
                            },
                            scales: {
                                y: { // defining min and max so hiding the dataset does not change scale range
                                    min: 0,
                                    max: 100
                                }
                            }
                        }
                    }
                );

                lessonChart = new Chart(document.getElementById('lesson-chart').getContext("2d"),
                    {
                        type: 'line',
                        data: {
                            labels: lessonChartData.map(row => row.date),
                            datasets: [
                                {
                                    label: 'Pre Scores',
                                    data: lessonChartData.map(row => row.initial),
                                    fill: false,
                                    borderColor: '#d81159',
                                    backgroundColor: '#d81159',
                                    tension: 0.1
                                },
                                {
                                    label: 'Post Scores',
                                    data: lessonChartData.map(row => row.final),
                                    fill: false,
                                    borderColor: '#02c39a',
                                    backgroundColor: '#02c39a',
                                    tension: 0.1
                                }
                            ],
                        },
                        options: {
                            animations: {
                                tension: {
                                    duration: 1000,
                                    easing: 'line',
                                    from: 1,
                                    to: 0,
                                    loop: true
                                }
                            },
                            scales: {
                                y: { // defining min and max so hiding the dataset does not change scale range
                                    min: 0,
                                    max: 100
                                }
                            }
                        }
                    }
                );

            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }

    }
    if (event.target && event.target.matches(".Button-Yellow-Icon")) {
        isUpdating = true;

        document.getElementById("CreateStudentButton").innerHTML = "Update Student";

        const row = event.target.closest("tr");
        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;
        hiddenKey = hiddenInput.value;

        try {
            await get(child(ref(Database), 'users/' + id)).then(async (studentSnapshot) => {
                const data = studentSnapshot.val();

                document.getElementById("student-form").querySelector("section").children[2].querySelector("input").value = studentSnapshot.key;
                document.getElementById("student-form").querySelector("section").children[2].querySelector("input").disabled = true;
                document.getElementById("student-form").querySelector("section").children[3].querySelector("input").value = data.FirstName;
                document.getElementById("student-form").querySelector("section").children[4].querySelector("input").value = data.LastName;
                document.getElementById("student-form").querySelector("section").children[5].querySelector("input").value = data.Birthday;
                const sexElement = document.getElementById("student-form").querySelector("section").children[6].querySelector("picker-component");
                if (data.Gender === "Male") {
                    sexElement.SelectedItem = sexElement.Items[1];
                } else if (data.Gender === "Female") {
                    sexElement.SelectedItem = sexElement.Items[2];
                }
                document.getElementById("student-form").querySelector("section").children[7].querySelector("input").value = data.Email;
                document.getElementById("student-form").querySelector("section").children[8].querySelector("input").value = data.Contact;
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
    }
    if (event.target && event.target.matches(".Button-Red-Icon")) {
        const row = event.target.closest("tr");

        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;

        var result = await ShowPopup('Are you sure you want to delete?', PopupType.Prompt);
        if (result) {
            await remove(ref(Database, "users/" + id));
            row.remove();
            ShowNotification('Deleted Successfully', Colors.Green);
        }
    }
});

// document.getElementById("grade-level").addEventListener("change", async () => {
//     const gradeElement = document.getElementById("grade-level");
//     const teacherElement = document.getElementById("teacher");
//     const teacherItems = teacherElement.querySelector("picker-item-container-component");

//     teacherItems.innerHTML = "";

//     const pickerItemDefault = document.createElement("picker-item-component");
//     pickerItemDefault.setAttribute("value", "None");
//     pickerItemDefault.textContent = "Select Teacher";
//     teacherItems.append(pickerItemDefault);

//     const gradeLevel = (gradeElement === null) ? "None" : gradeElement.SelectedItem.value;
//     ShowLoading();
//     try {
//         await get(child(ref(Database), 'teachers')).then(async (teacherSnapshot) => {
//             if (await teacherSnapshot.exists()) {
//                 const data = teacherSnapshot.val();
//                 console.log(data);
//                 if (data) {
//                     for (const [key, values] of Object.entries(data)) {
//                         if (values.GradeLevel == gradeLevel) {
//                             const pickerItem = document.createElement("picker-item-component");
//                             pickerItem.setAttribute("value", key);
//                             pickerItem.textContent = values.LastName + ", " + values.FirstName;
//                             teacherItems.appendChild(pickerItem);
//                         }
//                     }
//                 }
//             }
//         }).catch((error) => {
//             console.log(error);
//         });
//     } catch (error) {
//         console.log(error);
//     }
//     HideLoading();
// });