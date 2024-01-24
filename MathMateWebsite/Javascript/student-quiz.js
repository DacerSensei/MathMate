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
    CreateQuestion();
});

document.getElementById("CreateData").addEventListener("click", () => {
    ClearQuestions();
});

document.getElementById("quiz-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const sectionElement = document.getElementById("quiz-form").querySelector("section");
    const title = document.getElementById("quiz-form").querySelector("section").children[2].querySelector("input").value;
    const description = document.getElementById("quiz-form").querySelector("section").children[3].querySelector("input").value;
    const dueDate = document.getElementById("quiz-form").querySelector("section").children[4].querySelector("input").value;

    const firstIndex = 5;
    const lastIndex = sectionElement.children.length - 2;

    let quizData = {};
    quizData.description = description;
    quizData.DueDate = dueDate;
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
    for (let i = firstIndex + 1; i < lastIndex; i++) {
        sectionElement.children[6].remove();
    }
    document.getElementById("table-body").innerHTML = "";

    await StudentQuiz();
    HideLoading();
});

const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
    if (event.target && event.target.matches(".Button-Yellow-Icon")) {
        const sectionElement = document.getElementById("quiz-form").querySelector("section");

        const firstIndex = 5;
        const lastIndex = sectionElement.children.length - 2;

        for (let i = firstIndex + 1; i < lastIndex; i++) {
            sectionElement.children[6].remove();
        }

        const row = event.target.closest("tr");
        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;
        const parsedData = JSON.parse(localStorage.getItem('userData'));
        document.getElementById("quiz-form").querySelector("section").children[2].querySelector("input").value = id;
        try {
            await get(child(ref(Database), 'teachers/' + parsedData.uid + '/Quiz/' + id)).then(async (quizSnapshot) => {
                const data = quizSnapshot.val();
                if (data) {
                    for (let i = 0; i < Object.keys(data).length - (1 + 2); i++) {
                        CreateQuestion();
                    }
                    const sectionElement = document.getElementById("quiz-form").querySelector("section");
                    let firstIndex = 5;
                    for (const [key, values] of Object.entries(data)) {
                        if (key.toString().toLowerCase() == "description") {
                            document.getElementById("quiz-form").querySelector("section").children[3].querySelector("input").value = values;
                            continue;
                        }
                        if (key.toString().toLowerCase() == "duedate") {
                            document.getElementById("quiz-form").querySelector("section").children[4].querySelector("input").value = values;
                            continue;
                        }
                        const questionAndSolution = sectionElement.children[firstIndex].querySelectorAll("input");
                        questionAndSolution[0].value = values.problem;
                        questionAndSolution[1].value = values.solution;
                        firstIndex++;
                    }
                }
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

        const parsedData = JSON.parse(localStorage.getItem('userData'));
        var result = await ShowPopup('Are you sure you want to delete?', PopupType.Prompt);
        if (result) {
            await remove(ref(Database, "teachers/" + parsedData.uid + '/Quiz/' + id));
            row.remove();
            ShowNotification('Deleted Successfully', Colors.Green);
        }
    }
});

function CreateQuestion() {
    const sectionElement = document.getElementById("quiz-form").querySelector("section");
    const previousTitle = sectionElement.children[sectionElement.children.length - 3].querySelector("p").textContent;
    const previousInt = parseInt(previousTitle.charAt(previousTitle.length - 1))

    const quizProblemDiv = document.createElement("div");
    quizProblemDiv.classList.add("quiz-problem");

    const questionParagraph = document.createElement("p");
    questionParagraph.textContent = "Question " + (previousInt + 1).toString();

    const firstInputDiv = document.createElement("div");
    firstInputDiv.classList.add("Solid-Textbox-Red");

    const firstIcon = document.createElement("i");
    firstIcon.classList.add("fa-solid", "fa-signature");

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
    secondIcon.classList.add("fa-solid", "fa-signature");

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

    sectionElement.insertBefore(quizProblemDiv, sectionElement.children[sectionElement.children.length - 2]);
}

function ClearQuestions() {
    const sectionElement = document.getElementById("quiz-form").querySelector("section");

    const firstIndex = 5;
    const lastIndex = sectionElement.children.length - 2;

    for (let i = firstIndex + 1; i < lastIndex; i++) {
        sectionElement.children[6].remove();
    }
}