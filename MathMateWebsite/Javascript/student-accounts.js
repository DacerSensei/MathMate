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

const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
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