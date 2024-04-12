import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child, push, remove
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, ArchiveStudents, IsNullOrEmpty } from "./main.js";

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
        Status: "archived"
    };


    await set(ref(Database, "users/" + hiddenKey), studentData);
    hiddenKey = null;
    HideLoading();
    ShowPopup("You just updated the account");
    document.getElementById("student-form").reset();
    document.querySelector('.modal-close').click();
    genderElement.SelectedItem = genderElement.Items[0];
    document.getElementById("table-body").innerHTML = "";
    await ArchiveStudents();
    HideLoading();
});

const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
    if (event.target && event.target.matches(".Button-Yellow-Icon")) {

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