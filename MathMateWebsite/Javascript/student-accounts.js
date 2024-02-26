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

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const genderElement = document.getElementById("gender");

    const studentNumber = GetElementValue("student-number") ?? "";
    const firstName = GetElementValue("first-name") ?? "";
    const lastName = GetElementValue("last-name") ?? "";
    const birthday = GetElementValue("birthday") ?? "";
    const contact = GetElementValue("contact") ?? "";
    const gender = (genderElement === null) ? "None" : genderElement.Value;
    const teacher = parsedData.uid ?? "None"
    if (IsNullOrEmpty(studentNumber) || IsNullOrEmpty(firstName) || IsNullOrEmpty(lastName) || IsNullOrEmpty(birthday) || IsNullOrEmpty(contact) || gender == "None" || teacher == "None") {
        ShowNotification("Please fill up all the required data", Colors.Red);
        return;
    }
    ShowLoading();
    await set(ref(Database, "users/" + studentNumber), {
        'FirstName': firstName,
        'LastName': lastName,
        'Gender': gender,
        'Contact': contact,
        'Teacher': teacher,
        'Birthday': birthday,
        'Username': studentNumber,
        'Password': studentNumber,
        'Status': "active"
    });
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
        var result = await ShowPopup('Are you sure you want import ' + file.name + '?', PopupType.Prompt);
        if (result) {
            const teacher = JSON.parse(localStorage.getItem('userData')).uid ?? "None";
            ShowLoading();
            for (const [key, values] of Object.entries(jsonData)) {
                await set(ref(Database, "users/" + values["Student Number"]), {
                    'FirstName': values["First Name"],
                    'LastName': values["Last Name"],
                    'Gender': values["Sex"],
                    'Contact': values["Contact Number"],
                    'Teacher': teacher,
                    'Birthday': values["Birthday"],
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