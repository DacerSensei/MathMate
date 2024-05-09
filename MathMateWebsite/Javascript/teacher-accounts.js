import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, TeacherAccount, IsNullOrEmpty } from "./main.js";

const SecondaryApp = initializeApp(FirebaseConfig, "SecondaryApp");
const SecondaryAuth = getAuth(SecondaryApp);

document.getElementById("CreateData").addEventListener("click", () => {
    isUpdating = false;
    document.getElementById("CreateTeacherButton").innerHTML = "Create Teacher";

    if (!document.getElementById("password")) {
        const inputData = [
            { id: "confirm-password", placeholder: "Re-type your password" },
            { id: "password", placeholder: "Enter your password" },
        ];

        // Loop through input data and create input elements
        inputData.forEach(data => {
            const inputContainer = document.createElement("div");
            inputContainer.classList.add("Solid-Textbox-Red");

            const icon = document.createElement("i");
            icon.classList.add("fa-solid", "fa-key");

            const input = document.createElement("input");
            input.id = data.id;
            input.type = "password";
            input.placeholder = data.placeholder;
            input.required = true;

            inputContainer.appendChild(icon);
            inputContainer.appendChild(input);

            const parentContainer = document.getElementById("teacher-form").querySelector("section").children[8];
            const siblingElement = document.getElementById("teacher-form").querySelector("section").children[9];

            parentContainer.parentNode.insertBefore(inputContainer, siblingElement);
        });
    }
    const sexElement = document.getElementById("teacher-form").querySelector("section").children[5].querySelector("picker-component");
    sexElement.SelectedItem = sexElement.Items[0];
    document.getElementById("teacher-form").querySelector("section").children[8].querySelector("input").disabled = false;
});

let isUpdating = false;
let hiddenKey = null;

document.getElementById("teacher-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    // const gradeElement = document.getElementById("grade-level");
    const genderElement = document.getElementById("gender");

    const firstname = GetElementValue("first-name") ?? "";
    const lastname = GetElementValue("last-name") ?? "";
    const contact = GetElementValue("contact") ?? "";
    const section = GetElementValue("section") ?? "";
    const email = GetElementValue("email") ?? "";
    const birthday = GetElementValue("birthday") ?? "";
    const gradeLevel = "Grade 3";
    const gender = (genderElement === null) ? "None" : genderElement.Value;
    let password;

    if (isUpdating == false) {
        // const gradeLevel = (gradeElement === null) ? "None" : gradeElement.Value;
        password = GetElementValue("password") ?? "";
        if (IsNullOrEmpty(firstname) || IsNullOrEmpty(lastname) || IsNullOrEmpty(section) || IsNullOrEmpty(contact) || IsNullOrEmpty(email) || IsNullOrEmpty(password) || IsNullOrEmpty(birthday) || gradeLevel == "None" || gender == "None") {
            ShowNotification("Please fill up all the required data", Colors.Red);
            return;
        }
        if (isUpdating == false) {
            const conpassword = GetElementValue('confirm-password');
            if (password != conpassword) {
                ShowNotification("Your password and confirm password didn't match", Colors.Red);
                return;
            }
        }
    }
    ShowLoading();

    let teacherData = {
        Email: email,
        FirstName: firstname,
        LastName: lastname,
        Contact: contact,
        Gender: gender,
        GradeLevel: gradeLevel,
        Section: section,
        Birthday: birthday,
        Status: "active"
    };

    if (isUpdating == false) {
        await createUserWithEmailAndPassword(SecondaryAuth, email, password).then(async (userCredential) => {
            await set(ref(Database, "teachers/" + userCredential.user.uid), teacherData);
            signOut(SecondaryAuth).then(() => {
            }).catch((error) => {
                console.log(error.message);
            });
        }).catch((error) => {
            HideLoading();
            if (error.code == "auth/email-already-in-use") {
                ShowPopup("Email already in use");
            } else if (error.code == "auth/invalid-email") {
                ShowPopup("Invalid Email");
            } else if (error.code == "auth/weak-password") {
                ShowPopup("Your password is too weak");
            } else {
                ShowPopup(error.message);
            }
        });
    } else if (isUpdating == true) {
        if (hiddenKey != null) {
            await set(ref(Database, "teachers/" + hiddenKey), teacherData);
            hiddenKey = null;
        }
    }

    HideLoading();
    if (isUpdating == false) {
        ShowPopup("You just created a new teacher");
    } else if (isUpdating == true) {
        ShowPopup("You update the teacher " + firstname + " " + lastname);
    }
    document.getElementById("teacher-form").reset();
    document.querySelector('.modal-close').click();
    // gradeElement.SelectedItem = gradeElement.Items[0];
    genderElement.SelectedItem = genderElement.Items[0];
    document.getElementById("table-body").innerHTML = "";
    await TeacherAccount();
});

const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
    if (event.target && event.target.matches(".Button-Yellow-Icon")) {
        isUpdating = true;

        document.getElementById("CreateTeacherButton").innerHTML = "Update Teacher";

        const row = event.target.closest("tr");
        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;
        hiddenKey = hiddenInput.value;

        try {
            await get(child(ref(Database), 'teachers/' + id)).then(async (teacherSnapshot) => {
                const data = teacherSnapshot.val();

                document.getElementById("teacher-form").querySelector("section").children[2].querySelector("input").value = data.FirstName;
                document.getElementById("teacher-form").querySelector("section").children[3].querySelector("input").value = data.LastName;
                document.getElementById("teacher-form").querySelector("section").children[4].querySelector("input").value = data.Birthday;
                const sexElement = document.getElementById("teacher-form").querySelector("section").children[5].querySelector("picker-component");
                if (data.Gender === "Male") {
                    sexElement.SelectedItem = sexElement.Items[1];
                } else if (data.Gender === "Female") {
                    sexElement.SelectedItem = sexElement.Items[2];
                }
                document.getElementById("teacher-form").querySelector("section").children[6].querySelector("input").value = data.Section;
                document.getElementById("teacher-form").querySelector("section").children[7].querySelector("input").value = data.Contact;

                document.getElementById("teacher-form").querySelector("section").children[8].querySelector("input").value = data.Email;
                document.getElementById("teacher-form").querySelector("section").children[8].querySelector("input").disabled = true;
                if (document.getElementById("password")) {
                    document.getElementById("teacher-form").querySelector("section").children[9].remove();
                    document.getElementById("teacher-form").querySelector("section").children[9].remove();
                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
    }
});

document.getElementById("SearchButton").addEventListener("click", async (e) => {
    e.preventDefault();
    ShowLoading();
    document.getElementById("table-body").innerHTML = "";
    await TeacherAccount(document.getElementById("ContentSearch").value);
    HideLoading();
});