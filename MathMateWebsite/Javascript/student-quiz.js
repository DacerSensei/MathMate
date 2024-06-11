import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child, remove, push
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { Database, GetElementValue, FirebaseConfig, StudentQuiz, IsNullOrEmpty } from "./main.js";

const SecondaryApp = initializeApp(FirebaseConfig, "SecondaryApp");
const SecondaryAuth = getAuth(SecondaryApp);

document.getElementById("AddProblem").addEventListener("click", async (e) => {
    CreateQuestion();
});

document.getElementById("CreateData").addEventListener("click", () => {
    isUpdating = false;
    document.getElementById("CreateQuiz").innerHTML = "Create Quiz";
    questionModeRadios.forEach(radio => {
        radio.disabled = false;
    });
    ClearQuestions();
});

const questionModeRadios = document.querySelectorAll("#question-mode input[name='q-mode']");
questionModeRadios.forEach(function (radio) {
    radio.addEventListener("change", handleQuestionModeChanged);
});

function handleQuestionModeChanged() {
    ClearQuestions(0);
    CreateQuestion();
}

let isUpdating = false;
let hiddenKey = null;

document.getElementById("quiz-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedData = JSON.parse(localStorage.getItem('userData'));
    const questionContainer = document.getElementById("question-container");
    const title = document.getElementById("quiz-form").querySelector("section").children[2].querySelector("input").value;
    const description = document.getElementById("quiz-form").querySelector("section").children[3].querySelector("input").value;
    const dueDate = document.getElementById("quiz-form").querySelector("section").children[4].querySelector("input").value;
    let questionMode;
    questionModeRadios.forEach(radio => {
        if (radio.checked) {
            questionMode = radio.value;
        }
    });

    let quizData = {
        Title: title, // replace with your actual title
        Description: description, // replace with your actual description
        Duedate: dueDate, // replace with your actual due date
        QuestionMode: questionMode,
        Created: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        Flashcards: {}
    };

    if (questionMode == QuestionModeEnums.IDENTIFY) {
        for (let i = 0; i < questionContainer.children.length; i++) {
            const questionAndSolution = questionContainer.children[i].querySelectorAll("input");
            const questionParagraph = questionContainer.children[i].querySelector("p").textContent;

            quizData.Flashcards[questionParagraph] = {
                problem: questionAndSolution[0].value,
                solution: questionAndSolution[1].value
            };
        }
    } else if (questionMode == QuestionModeEnums.MULTIPLE) {
        for (let i = 0; i < questionContainer.children.length; i++) {
            const questionAndSolution = questionContainer.children[i].querySelectorAll("input");
            const questionParagraph = questionContainer.children[i].querySelector("p").textContent;

            const separator = "|^|";
            let problem = "";

            for (let j = 0; j <= 4; j++) {
                if (j > 0) {
                    problem += separator;
                }
                problem += questionAndSolution[j].value;
            }

            let solution = questionAndSolution[5].value.toLowerCase();
            let numericSolution;
            switch (solution) {
                case 'a':
                    numericSolution = 1;
                    break;
                case 'b':
                    numericSolution = 2;
                    break;
                case 'c':
                    numericSolution = 3;
                    break;
                case 'd':
                    numericSolution = 4;
                    break;
                default:
                    numericSolution = 0;
            }

            quizData.Flashcards[questionParagraph] = {
                problem: problem,
                solution: numericSolution
            };
        }
    }
    ShowLoading();
    if (isUpdating == false) {
        await push(ref(Database, "teachers/" + parsedData.uid + '/Quiz/'), quizData);
    } else if (isUpdating == true) {
        if (hiddenKey != null) {
            await set(ref(Database, "teachers/" + parsedData.uid + '/Quiz/' + hiddenKey), quizData);
            hiddenKey = null;
        }
    }
    document.getElementById("quiz-form").reset();
    document.querySelector('.modal-close').click();

    if (isUpdating == false) {
        ShowPopup("You just created a new quiz");
    } else if (isUpdating == true) {
        ShowPopup("You just updated a quiz");
    }

    ClearQuestions();
    document.getElementById("table-body").innerHTML = "";

    await StudentQuiz();
    HideLoading();
});

const table = document.getElementById("myTable");
table.addEventListener("click", async (event) => {
    if (event.target && event.target.matches(".Button-Yellow-Icon")) {
        isUpdating = true;

        document.getElementById("CreateQuiz").innerHTML = "Update Quiz";

        ClearQuestions();

        const row = event.target.closest("tr");
        const hiddenInput = row.querySelector("input[type='hidden']");
        const id = hiddenInput.value;
        hiddenKey = hiddenInput.value;
        const parsedData = JSON.parse(localStorage.getItem('userData'));
        try {
            await get(child(ref(Database), 'teachers/' + parsedData.uid + '/Quiz/' + id)).then(async (quizSnapshot) => {
                const data = quizSnapshot.val();

                ClearQuestions(0);

                document.getElementById("quiz-form").querySelector("section").children[2].querySelector("input").value = data.Title;
                document.getElementById("quiz-form").querySelector("section").children[3].querySelector("input").value = data.Description;
                document.getElementById("quiz-form").querySelector("section").children[4].querySelector("input").value = data.Duedate;
                questionModeRadios.forEach(radio => {
                    radio.disabled = true;
                    if (radio.value === data.QuestionMode) {
                        radio.checked = true;
                    }
                });

                if (data.Flashcards) {
                    for (let i = 0; i < Object.keys(data.Flashcards).length; i++) {
                        CreateQuestion(data.QuestionMode);
                    }

                    const questionContainer = document.getElementById("question-container");
                    let firstIndex = 0;
                    for (const [key, values] of Object.entries(data.Flashcards)) {
                        const questionAndSolution = questionContainer.children[firstIndex].querySelectorAll("input");
                        if (data.QuestionMode == QuestionModeEnums.IDENTIFY) {
                            questionAndSolution[0].value = values.problem;
                            questionAndSolution[1].value = values.solution;
                        } else if (data.QuestionMode == QuestionModeEnums.MULTIPLE) {
                            const separator = "|^|";
                            let problem = values.problem.split(separator);
                            for (let j = 0; j < problem.length; j++) {
                                questionAndSolution[j].value = problem[j];
                            }

                            let solution;
                            switch (values.solution) {
                                case 1:
                                    solution = 'A';
                                    break;
                                case 2:
                                    solution = 'B';
                                    break;
                                case 3:
                                    solution = 'C';
                                    break;
                                case 4:
                                    solution = 'D';
                                    break;
                                default:
                                    solution = 'Invalid';
                            }
                            questionAndSolution[5].value = solution;
                        }
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

function CreateQuestion(questionMode = null) {
    if (questionMode == null) {
        questionModeRadios.forEach(radio => {
            if (radio.checked) {
                questionMode = radio.value;
            }
        });;
    }
    if (questionMode == QuestionModeEnums.IDENTIFY) {
        const questionContainer = document.getElementById("question-container");
        let previousTitle;
        if (questionContainer.children.length > 0) {
            previousTitle = questionContainer.children[questionContainer.children.length - 1].querySelector("p").textContent;
        } else {
            previousTitle = "Question 0";

        }
        const previousInt = parseInt(previousTitle.charAt(previousTitle.length - 1))

        const quizProblemDiv = document.createElement("div");
        quizProblemDiv.classList.add("quiz-problem");

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

        questionContainer.appendChild(quizProblemDiv);
    }
    else if (questionMode == QuestionModeEnums.MULTIPLE) {
        const questionContainer = document.getElementById("question-container");
        let previousTitle;
        if (questionContainer.children.length > 0) {
            previousTitle = questionContainer.children[questionContainer.children.length - 1].querySelector("p").textContent;
        } else {
            previousTitle = "Question 0";
        }
        const previousInt = parseInt(previousTitle.charAt(previousTitle.length - 1))

        const quizProblemDiv = document.createElement("div");
        quizProblemDiv.classList.add("quiz-problem");

        const questionParagraph = document.createElement("p");
        questionParagraph.textContent = "Question " + (previousInt + 1).toString();

        quizProblemDiv.appendChild(questionParagraph);
        const elements = [
            { icon: 'fa-p', placeholder: 'Enter your question' },
            { icon: 'fa-a', placeholder: 'Choice A' },
            { icon: 'fa-b', placeholder: 'Choice B' },
            { icon: 'fa-c', placeholder: 'Choice C' },
            { icon: 'fa-d', placeholder: 'Choice D' },
            { icon: 'fa-s', placeholder: 'Answer must be (A, B, C, D)' }
        ];

        elements.forEach(element => {
            const div = document.createElement('div');
            div.classList.add('Solid-Textbox-Red');

            const icon = document.createElement('i');
            icon.classList.add('fa-solid', element.icon);

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = element.placeholder;
            input.required = true;

            div.appendChild(icon);
            div.appendChild(input);
            quizProblemDiv.appendChild(div);
        });

        questionContainer.appendChild(quizProblemDiv);
    }
}

function ClearQuestions(childToRemove = 1) {
    const questionContainer = document.getElementById("question-container");

    const lastIndex = questionContainer.children.length - childToRemove;

    for (let i = 0; i < lastIndex; i++) {
        questionContainer.children[childToRemove].remove();
    }
}

document.getElementById("SearchButton").addEventListener("click", async (e) => {
    e.preventDefault();
    ShowLoading();
    document.getElementById("table-body").innerHTML = "";
    await StudentQuiz(document.getElementById("ContentSearch").value);
    HideLoading();
});

const QuestionModeEnums = {
    IDENTIFY: "identify",
    MULTIPLE: "multiple",
}