import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child, remove
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, StudentQuiz, IsNullOrEmpty } from "./main.js";

const SecondaryApp = initializeApp(FirebaseConfig, "SecondaryApp");
const SecondaryAuth = getAuth(SecondaryApp);

document.getElementById("AddProblem").addEventListener("click", async (e) => {
    const sectionElement = document.getElementById("quiz-form").querySelector("section");
    // Create a new input element
    // Assuming you have a reference to the parent container
    const previousTitle = sectionElement.children[sectionElement.children.length - 3].querySelector("p").textContent;
    const previousInt = parseInt(previousTitle.charAt(previousTitle.length - 1))

    // Create a div element with the class "quiz-problem"
    const quizProblemDiv = document.createElement("div");
    quizProblemDiv.classList.add("quiz-problem");

    // Create a paragraph element with the text "Question 1"
    const questionParagraph = document.createElement("p");
    questionParagraph.textContent = "Question " + (previousInt + 1).toString();

    // Create the first input div with the class "Solid-Textbox-Red"
    const firstInputDiv = document.createElement("div");
    firstInputDiv.classList.add("Solid-Textbox-Red");

    // Create an icon element with the class "fa-solid fa-signature"
    const firstIcon = document.createElement("i");
    firstIcon.classList.add("fa-solid", "fa-signature");

    // Create the first input element with the type "text" and the id "quiz-title"
    const firstInput = document.createElement("input");
    firstInput.type = "text";
    firstInput.id = "quiz-title";
    firstInput.placeholder = "Enter your problem";
    firstInput.required = true;

    // Append the icon and input to the first input div
    firstInputDiv.appendChild(firstIcon);
    firstInputDiv.appendChild(firstInput);

    // Create the second input div with the class "Solid-Textbox-Red"
    const secondInputDiv = document.createElement("div");
    secondInputDiv.classList.add("Solid-Textbox-Red");

    // Create an icon element with the class "fa-solid fa-signature"
    const secondIcon = document.createElement("i");
    secondIcon.classList.add("fa-solid", "fa-signature");

    // Create the second input element with the type "text" and the id "quiz-title"
    const secondInput = document.createElement("input");
    secondInput.type = "text";
    secondInput.id = "quiz-title";
    secondInput.placeholder = "Enter your solution";
    secondInput.required = true;

    // Append the icon and input to the second input div
    secondInputDiv.appendChild(secondIcon);
    secondInputDiv.appendChild(secondInput);

    // Append all elements to the main quiz problem div
    quizProblemDiv.appendChild(questionParagraph);
    quizProblemDiv.appendChild(firstInputDiv);
    quizProblemDiv.appendChild(secondInputDiv);

    // Insert the new input element at the specified position
    sectionElement.insertBefore(quizProblemDiv, sectionElement.children[sectionElement.children.length - 2]);
});

document.getElementById("quiz-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const sectionElement = document.getElementById("quiz-form").querySelector("section");
    const title = document.getElementById("quiz-form").querySelector("section").children[2].querySelector("input").value;

    const firstIndex = 3;
    const lastIndex = sectionElement.children.length - 2;

    let quizData = {};
    for (let i = firstIndex; i < lastIndex; i++) {
        const questionAndSolution = sectionElement.children[i].querySelectorAll("input");
        const questionParagraph = sectionElement.children[i].querySelector("p").textContent;

        quizData[questionParagraph] = {
            problem: questionAndSolution[0].value,
            solution: questionAndSolution[1].value
        };
    }
    ShowLoading();
    await set(ref(Database, "teachers/" + parsedData.uid + '/Quiz/' + title), quizData);
    document.getElementById("quiz-form").reset();
    document.querySelector('.modal-close').click();
    ShowPopup("You just created a new quiz");
    document.getElementById("table-body").innerHTML = "";
    await StudentQuiz();
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
            await remove(ref(Database, "teachers/" + parsedData.uid + '/Quiz/' + id));
            row.remove();
            ShowNotification('Deleted Successfully', Colors.Green);
        }
    }
});