import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
    getDatabase, ref, set, onValue, get, child
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const FirebaseConfig = {
    apiKey: "AIzaSyAUpaMjpjjFKoacRv7fB6bdGXmFaODkQjM",
    authDomain: "mathmate-ee4f2.firebaseapp.com",
    databaseURL: "https://mathmate-ee4f2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mathmate-ee4f2",
    storageBucket: "mathmate-ee4f2.appspot.com",
    messagingSenderId: "961521874280",
    appId: "1:961521874280:web:ef232ccdfe6e91402f92dd",
    secret: "Qv2VwbHV1co7hSYw1rq8HS8TSWjJxj4fwKDmF9gm"
};

const App = initializeApp(FirebaseConfig);
const Auth = getAuth(App);
const Database = getDatabase(App);
export const FirebaseStorage = getStorage(App);


async function RenderElementInBody(link, elementType, isAppend = true) {
    const response = await fetch(link);
    const responseHTML = await response.text();
    const tempContainer = document.createElement(elementType);
    tempContainer.innerHTML = responseHTML;
    const body = document.body;
    if (isAppend) {
        body.append(...tempContainer.childNodes);
    } else {
        body.prepend(...tempContainer.childNodes);
    }
}

async function RenderElementById(link, elementType, id, isAppend = true) {
    const response = await fetch(link);
    const responseHTML = await response.text();
    const tempContainer = document.createElement(elementType);
    tempContainer.innerHTML = responseHTML;
    const element = document.getElementById(id);
    if (element) {
        if (isAppend) {
            element.append(...tempContainer.childNodes);
        } else {
            element.prepend(...tempContainer.childNodes);
        }
    }
}

(async () => {
    RenderElementInBody("/Library/loading.html", "div", false);
    const storedData = localStorage.getItem('userData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);

        RenderElementInBody("/Library/notification.html", "div");
        if (!window.location.pathname.includes("/index.html")) {
            await RenderElementInBody("/Library/header.html", "header", false);
            if (parsedData.isAdmin) {
                await RenderElementById("/Library/sidebar-admin.html", "aside", "main", false)
            } else {
                await RenderElementById("/Library/sidebar-teacher.html", "aside", "main", false)
            }
            const links = document.querySelectorAll(".nav-links");
            const currentURL = window.location.href;
            links.forEach((link) => {
                if (link.href === currentURL) {
                    link.classList.add("NavigationActive");
                } else {
                    link.classList.remove("NavigationActive");
                }
            });
            Logout();
            if (parsedData.isAdmin) {
                SetContentByQuerySelector(".user-profile-name", parsedData.Name);
            } else {
                SetContentByQuerySelector(".user-profile-name", parsedData.FirstName + " " + parsedData.LastName);
            }
        }
        const HeaderButtons = document.getElementsByClassName("header-button");
        if (HeaderButtons) {
            if (HeaderButtons.length > 0) {
                for (let i = 0; i < HeaderButtons.length; i++) {
                    HeaderButtons[i].onclick = function () {

                        for (let j = 0; j < HeaderButtons.length; j++) {
                            let list = HeaderButtons[j].parentNode.getElementsByTagName("ul")[0].classList;
                            if (i == j) continue;
                            if (list.contains("Show")) {
                                list.remove("Show");
                            }
                        }
                        HeaderButtons[i].parentNode.getElementsByTagName("ul")[0].classList.toggle("Show");
                    }
                }
            }
        }
        const SideMenuButton = document.querySelector(".side-menu-collapse");
        if (SideMenuButton) {
            if (SideMenuButton != undefined) {
                SideMenuButton.onclick = SideBarMenuToggleEvent;
            }
        }
        const DropdownButton = document.querySelectorAll(".DropdownMenu");
        if (DropdownButton) {
            function AttachSideMenuEvent() {
                if (DropdownButton.length > 0) {
                    DropdownButton.forEach(button => {
                        let list = button.querySelector(".DropdownMenuList");
                        button.querySelector(".DropdownButton").onclick = function () {
                            list.classList.toggle("show")
                            if (list.classList.contains("show")) {
                                list.style.maxHeight = list.scrollHeight + "px";
                            } else {
                                list.style.maxHeight = 0 + "px";
                            }
                        }
                    });
                }
            }
            AttachSideMenuEvent();
        }
        ShowLoading();
        if (parsedData.isAdmin) {
            if (window.location.pathname.includes("/admin-dashboard.html")) {
                await DashboardLoaded();
            } else if (window.location.pathname.includes("/teacher-accounts.html")) {
                await TeacherAccount();
            }
        }
        else if (!parsedData.isAdmin) {
            if (window.location.pathname.includes("/teacher-dashboard.html")) {
                await TeacherDashboard();
            }
            else if (window.location.pathname.includes("/student-accounts.html")) {
                await StudentAccount();
            }
            else if (window.location.pathname.includes("/student-quiz.html")) {
                await StudentQuiz();
            }
            else if (window.location.pathname.includes("/student-lesson.html")) {
                await StudentLesson();
            }
            else if (window.location.pathname.includes("/archive-student.html")) {
                await ArchiveStudents();
            }
        }

        // else if (window.location.pathname.includes("/admin-accounts.html")) {
        //     await AdminAccount();
        // }
    } else {
        Login();
    }
    HideLoading();
})();

function SideBarMenuToggleEvent() {
    const sideMenu = document.querySelector("#Side-Menu-Container")
    const logo = document.querySelector("#Logo")
    const root = document.querySelector(':root');
    const liElements = document.querySelectorAll("#MainNavigation > ul > li");
    if (getComputedStyle(document.documentElement).getPropertyValue('--sidebar-toggle') == '16rem') {
        root.style.setProperty('--sidebar-toggle', '4rem');
        document.querySelector("#MainNavigation > h4").style.display = "none";
        if (logo) {
            logo.lastElementChild.style.display = "none";
        }
        liElements.forEach(function (li) {
            li.querySelector("span").style.display = "none";
            if (li.classList.contains("DropdownMenu")) {
                const list = li.querySelector(".DropdownMenuList");
                if (li.querySelector(".DropdownMenuList").classList.contains("show")) {
                    li.querySelector(".DropdownMenuList").classList.remove("show");
                }
                li.querySelector(".DropdownButton").onclick = null;
                list.style.maxHeight = 0 + "px";
                list.classList.add("absolute");
                li.classList.add("flex");
                li.querySelector("svg:nth-of-type(2)").style.display = "none";
                li.onmouseover = function () {
                    list.style.maxHeight = list.scrollHeight + "px";
                }
                li.onmouseout = function () {
                    list.style.maxHeight = 0 + "px";
                }
            }
        });
    } else {
        root.style.setProperty('--sidebar-toggle', '16rem');
        document.querySelector("#MainNavigation > h4").style.display = "block";
        liElements.forEach(function (li) {
            if (li.classList.contains("DropdownMenu")) {
                let list = li.querySelector(".DropdownMenuList");
                list.classList.remove("absolute");
                li.classList.remove("flex");
                li.onmouseover = null;
                li.onmouseout = null;
            }
        });
        setTimeout(() => {
            liElements.forEach(function (li) {
                li.querySelector("span").style.display = "block";
                if (logo) {
                    logo.lastElementChild.style.display = "block";
                }
                if (li.classList.contains("DropdownMenu")) {
                    AttachSideMenuEvent();
                    li.querySelector("svg:nth-of-type(2)").style.display = "block";
                }
            });
        }, 300);
    }
}

async function DashboardLoaded() {

    const usersSnapshot = await get(child(ref(Database), 'users'));
    try {
        await get(child(ref(Database), 'admins')).then(async (adminSnapshot) => {
            if (await adminSnapshot.exists()) {
                const data = adminSnapshot.val();
                if (data) {
                    SetContentById("AdminAccounts", Object.entries(data).length);
                }
            } else {
                ShowNotification("Something went wrong", Colors.Red);
            }
        }).catch((error) => {
            console.log(error);
        });
        await get(child(ref(Database), 'teachers')).then(async (teacherSnapshot) => {
            if (await teacherSnapshot.exists()) {
                const data = teacherSnapshot.val();
                if (data) {
                    SetContentById("TeacherAccounts", Object.entries(data).length);
                }
            } else {
                ShowNotification("Something went wrong", Colors.Red);
            }
        }).catch((error) => {
            console.log(error);
        });
        await get(child(ref(Database), 'users')).then(async (studentSnapshot) => {
            if (await studentSnapshot.exists()) {
                const data = studentSnapshot.val();
                if (data) {
                    SetContentById("StudentAccounts", Object.entries(data).length);
                }
            } else {
                ShowNotification("Something went wrong", Colors.Red);
            }
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

async function TeacherDashboard() {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        try {
            const usersSnapshot = await get(child(ref(Database), 'users'));
            if (usersSnapshot.exists()) {
                const students = usersSnapshot.val();
                if (students) {
                    let numberOfStudent = 0;
                    Object.values(students).forEach((student) => {
                        if (parsedData.uid === student.Teacher && student.Status.toLowerCase() === "active") {
                            numberOfStudent++;
                        }
                    })
                    SetContentById("StudentAccounts", numberOfStudent);
                }
            }

            const lessonSnapshot = await get(child(ref(Database), 'teachers/' + parsedData.uid + '/Lesson'));
            if (lessonSnapshot.exists()) {
                const lessons = lessonSnapshot.val();
                if (lessons) {
                    SetContentById("TotalLessons", Object.entries(lessons).length);
                }
            }

            const quizSnapshot = await get(child(ref(Database), 'teachers/' + parsedData.uid + '/Quiz'));
            if (quizSnapshot.exists()) {
                const quiz = quizSnapshot.val();
                if (quiz) {
                    SetContentById("TotalQuiz", Object.entries(quiz).length);
                }
            }

            if (quizSnapshot.exists()) {
                const quiz = quizSnapshot.val();
                let totalStudents = 0;
                let totalQuizzes = Object.entries(quiz).length;
                let totalStudentsAnswered = 0;
                let totalQuizzesAnswered = 0;

                const data = []; // fill the data for charts

                const usersSnapshot = await get(child(ref(Database), 'users'));

                if (usersSnapshot.exists()) {
                    const students = usersSnapshot.val();

                    if (students) {
                        Object.values(students).forEach((student) => {
                            if (parsedData.uid === student.Teacher && student.Status.toLowerCase() === "active") {
                                totalStudents++;
                                const studentAnsweredQuiz = student.Quiz;
                                let answeredAllQuizzes = true;
                                if (studentAnsweredQuiz) {
                                    for (const [quizKey, quizValue] of Object.entries(studentAnsweredQuiz)) {
                                        const answeredDate = quizValue.Date;
                                        const existingDataIndex = data.findIndex(item => item.date === answeredDate);

                                        if (existingDataIndex !== -1) {
                                            data[existingDataIndex].count++;
                                        } else {
                                            data.push({ date: answeredDate, count: 1 });
                                        }
                                    }
                                }

                                for (const [quizKey] of Object.entries(quiz)) {
                                    if (studentAnsweredQuiz && studentAnsweredQuiz.hasOwnProperty(quizKey)) {
                                        totalQuizzesAnswered++;

                                    } else {
                                        answeredAllQuizzes = false;
                                        break;
                                    }
                                }
                                if (answeredAllQuizzes) {
                                    totalStudentsAnswered++;
                                }


                            }
                        });
                    }
                }
                const totalPercentage = (totalQuizzesAnswered / (totalStudents * totalQuizzes)) * 100;
                SetContentById("TotalQuizAnswered", Math.round(totalPercentage) + "%");
                data.sort((a, b) => new Date(a.date) - new Date(b.date));
                let highestCount = 0;
                data.forEach((item) => {
                    if (item.count > highestCount) {
                        highestCount = item.count;
                    }
                });
                new Chart(document.getElementById('dashboard-chart').getContext("2d"),
                    {
                        type: 'line',
                        data: {
                            labels: data.map(row => row.date),
                            datasets: [
                                {
                                    label: 'Student Answered',
                                    data: data.map(row => row.count),
                                    fill: false,
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
                                    easing: 'linear',
                                    from: 1,
                                    to: 0,
                                    loop: true
                                }
                            },
                            scales: {
                                y: { // defining min and max so hiding the dataset does not change scale range
                                    min: 0,
                                    max: Math.ceil(highestCount / 10) * 10
                                }
                            }
                        }
                    }
                );
            }

        } catch (error) {
            console.log(error);
        }
    }
}

async function AdminAccount() {
    try {
        await get(child(ref(Database), 'admins')).then(async (adminSnapshot) => {
            if (await adminSnapshot.exists()) {
                const data = adminSnapshot.val();
                if (data) {
                    const tableBody = document.getElementById("table-body");
                    for (const [key, values] of Object.entries(data)) {
                        const row = document.createElement("tr");
                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.value = key;

                        const nameCell = document.createElement("td");
                        nameCell.textContent = values.Name;

                        const emailCell = document.createElement("td");
                        emailCell.textContent = values.Email;

                        const statusCell = document.createElement("td");
                        const statusDiv = document.createElement("div");
                        statusDiv.textContent = values.Status.toUpperCase();
                        if (values.Status.toLowerCase() == "active") {
                            statusDiv.className = "Status-Green";
                        } else {
                            statusDiv.className = "Status-Red";
                        }

                        const actionsCell = document.createElement("td");
                        const editButton = document.createElement("button");
                        editButton.classList.add('Button-Blue-Icon', 'modal-trigger');
                        editButton.title = "Edit";
                        editButton.setAttribute('data-target', 'Edit-Modal');
                        editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>';

                        const disableButton = document.createElement("button");
                        disableButton.className = "Button-Red-Icon";
                        disableButton.style = "margin-left: 4px;"
                        disableButton.title = "Disable";
                        disableButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" style="pointer-events: none;"><path d="M538-538ZM424-424Zm56 264q51 0 98-15.5t88-44.5q-41-29-88-44.5T480-280q-51 0-98 15.5T294-220q41 29 88 44.5t98 15.5Zm106-328-57-57q5-8 8-17t3-18q0-25-17.5-42.5T480-640q-9 0-18 3t-17 8l-57-57q19-17 42.5-25.5T480-720q58 0 99 41t41 99q0 26-8.5 49.5T586-488Zm228 228-58-58q22-37 33-78t11-84q0-134-93-227t-227-93q-43 0-84 11t-78 33l-58-58q49-32 105-49t115-17q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 59-17 115t-49 105ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-59 16.5-115T145-701L27-820l57-57L876-85l-57 57-615-614q-22 37-33 78t-11 84q0 57 19 109t55 95q54-41 116.5-62.5T480-360q38 0 76 8t74 22l133 133q-57 57-130 87T480-80Z"/></svg>';

                        actionsCell.appendChild(editButton);
                        actionsCell.appendChild(disableButton);

                        statusCell.appendChild(statusDiv)

                        row.appendChild(hiddenInput);
                        row.appendChild(nameCell);
                        row.appendChild(emailCell);
                        row.appendChild(statusCell);
                        row.appendChild(actionsCell);

                        tableBody.appendChild(row);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

async function TeacherAccount() {
    try {
        await get(child(ref(Database), 'teachers')).then(async (teacherSnapshot) => {
            if (await teacherSnapshot.exists()) {
                const data = teacherSnapshot.val();
                if (data) {
                    const tableBody = document.getElementById("table-body");
                    for (const [key, values] of Object.entries(data)) {
                        const row = document.createElement("tr");
                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.value = key;

                        const nameCell = document.createElement("td");
                        nameCell.textContent = values.LastName + ", " + values.FirstName;

                        const emailCell = document.createElement("td");
                        emailCell.textContent = values.Email;

                        const birthdayCell = document.createElement("td");
                        birthdayCell.textContent = values.Birthday;

                        const gradeCell = document.createElement("td");
                        const gradeDiv = document.createElement("div");
                        gradeDiv.textContent = values.GradeLevel;
                        if (values.GradeLevel.toLowerCase() == "Grade 1".toLowerCase()) {
                            gradeDiv.className = "Status-Green";
                        }
                        else if (values.GradeLevel.toLowerCase() == "Grade 2".toLowerCase()) {
                            gradeDiv.className = "Status-Purple";
                        } else if (values.GradeLevel.toLowerCase() == "Grade 3".toLowerCase()) {
                            gradeDiv.className = "Status-Yellow";
                        } else {
                            gradeDiv.className = "Status-Red";
                        }

                        const genderCell = document.createElement("td");
                        const genderDiv = document.createElement("div");
                        genderDiv.textContent = values.Gender;
                        if (values.Gender.toLowerCase() == "Male".toLowerCase()) {
                            genderDiv.className = "Status-Blue";
                        } else {
                            genderDiv.className = "Status-Pink";
                        }



                        const actionsCell = document.createElement("td");
                        const editButton = document.createElement("button");
                        editButton.classList.add('Button-Blue-Icon', 'modal-trigger');
                        editButton.title = "Edit";
                        editButton.setAttribute('data-target', 'Edit-Modal');
                        editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>';

                        // const disableButton = document.createElement("button");
                        // disableButton.className = "Button-Red-Icon";
                        // disableButton.style = "margin-left: 4px;"
                        // disableButton.title = "Disable";
                        // disableButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" style="pointer-events: none;"><path d="M538-538ZM424-424Zm56 264q51 0 98-15.5t88-44.5q-41-29-88-44.5T480-280q-51 0-98 15.5T294-220q41 29 88 44.5t98 15.5Zm106-328-57-57q5-8 8-17t3-18q0-25-17.5-42.5T480-640q-9 0-18 3t-17 8l-57-57q19-17 42.5-25.5T480-720q58 0 99 41t41 99q0 26-8.5 49.5T586-488Zm228 228-58-58q22-37 33-78t11-84q0-134-93-227t-227-93q-43 0-84 11t-78 33l-58-58q49-32 105-49t115-17q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 59-17 115t-49 105ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-59 16.5-115T145-701L27-820l57-57L876-85l-57 57-615-614q-22 37-33 78t-11 84q0 57 19 109t55 95q54-41 116.5-62.5T480-360q38 0 76 8t74 22l133 133q-57 57-130 87T480-80Z"/></svg>';

                        actionsCell.appendChild(editButton);
                        // actionsCell.appendChild(disableButton);

                        gradeCell.appendChild(gradeDiv)
                        genderCell.appendChild(genderDiv)

                        row.appendChild(hiddenInput);
                        row.appendChild(nameCell);
                        row.appendChild(emailCell);
                        row.appendChild(gradeCell);
                        row.appendChild(genderCell);
                        row.appendChild(birthdayCell);
                        row.appendChild(actionsCell);

                        tableBody.appendChild(row);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

async function StudentAccount() {

    try {
        const parsedData = JSON.parse(localStorage.getItem('userData'));
        await get(child(ref(Database), 'teachers')).then(async (teacherSnapshot) => {
            if (await teacherSnapshot.exists()) {
                const teachers = teacherSnapshot.val();
                await get(child(ref(Database), 'users')).then(async (userSnapshot) => {
                    if (await userSnapshot.exists()) {
                        const data = userSnapshot.val();
                        if (data) {
                            const tableBody = document.getElementById("table-body");
                            for (const [key, values] of Object.entries(data)) {
                                if (parsedData.uid != values.Teacher || values.Status.toLowerCase() != "active") {
                                    continue;
                                }
                                const teacher = teachers[values.Teacher];
                                const row = document.createElement("tr");
                                const hiddenInput = document.createElement("input");
                                hiddenInput.type = "hidden";
                                hiddenInput.value = key;

                                const studentNumberCell = document.createElement("td");
                                studentNumberCell.textContent = values.Username;

                                const nameCell = document.createElement("td");
                                nameCell.textContent = values.LastName + ", " + values.FirstName;

                                const teacherCell = document.createElement("td");
                                teacherCell.textContent = teacher.LastName + ", " + teacher.FirstName;

                                const gradeCell = document.createElement("td");
                                const gradeDiv = document.createElement("div");
                                gradeDiv.textContent = teacher.GradeLevel;
                                if (teacher.GradeLevel.toLowerCase() == "Grade 1".toLowerCase()) {
                                    gradeDiv.className = "Status-Green";
                                }
                                else if (teacher.GradeLevel.toLowerCase() == "Grade 2".toLowerCase()) {
                                    gradeDiv.className = "Status-Purple";
                                } else if (teacher.GradeLevel.toLowerCase() == "Grade 3".toLowerCase()) {
                                    gradeDiv.className = "Status-Yellow";
                                } else {
                                    gradeDiv.className = "Status-Red";
                                }

                                const genderCell = document.createElement("td");
                                const genderDiv = document.createElement("div");
                                genderDiv.textContent = values.Gender;
                                if (values.Gender.toLowerCase() == "Male".toLowerCase()) {
                                    genderDiv.className = "Status-Blue";
                                } else {
                                    genderDiv.className = "Status-Pink";
                                }

                                const actionsCell = document.createElement("td");
                                const viewButton = document.createElement("button");
                                viewButton.classList.add('Button-Blue-Icon', 'modal-trigger');
                                viewButton.title = "View";
                                viewButton.setAttribute('data-target', 'View-Modal');
                                viewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg></svg>';

                                viewButton.addEventListener('click', function () {
                                    const modal = document.getElementById(this.dataset.target);
                                    modal.style.display = 'flex';

                                    // When the user clicks on the close button, close the modal
                                    var closeBtn = modal.querySelector('.modal-close');
                                    closeBtn.addEventListener('click', function () {
                                        modal.style.display = 'none';
                                    });
                                });

                                const editButton = document.createElement("button");
                                editButton.classList.add('Button-Yellow-Icon', 'modal-trigger');
                                editButton.title = "Edit";
                                editButton.setAttribute('data-target', 'Add-Modal');
                                editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>';
                                editButton.style.marginLeft = "5px";

                                editButton.addEventListener('click', function () {
                                    const modal = document.getElementById(this.dataset.target);
                                    modal.style.display = 'flex';

                                    // When the user clicks on the close button, close the modal
                                    var closeBtn = modal.querySelector('.modal-close');
                                    closeBtn.addEventListener('click', function () {
                                        modal.style.display = 'none';
                                        document.getElementById("student-form").reset();
                                    });
                                });

                                const deleteButton = document.createElement("button");
                                deleteButton.className = "Button-Red-Icon";
                                deleteButton.title = "Delete";
                                deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>';
                                deleteButton.style.marginLeft = "5px";


                                actionsCell.appendChild(viewButton);
                                actionsCell.appendChild(editButton);
                                actionsCell.appendChild(deleteButton);

                                gradeCell.appendChild(gradeDiv)
                                genderCell.appendChild(genderDiv)

                                row.appendChild(hiddenInput);
                                row.appendChild(studentNumberCell);
                                row.appendChild(nameCell);
                                row.appendChild(gradeCell);
                                row.appendChild(genderCell);
                                row.appendChild(teacherCell);
                                row.appendChild(actionsCell);

                                tableBody.appendChild(row);
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error);
                });
            }
        }).catch((error) => {
            console.log(error);
        });

    } catch (error) {
        console.log(error);
    }
}

async function StudentQuiz() {
    try {
        const parsedData = JSON.parse(localStorage.getItem('userData'));
        await get(child(ref(Database), 'teachers/' + parsedData.uid + '/Quiz')).then(async (quizSnapshot) => {
            if (await quizSnapshot.exists()) {
                const quizzes = quizSnapshot.val();
                if (quizzes) {
                    const tableBody = document.getElementById("table-body");
                    for (const [key, values] of Object.entries(quizzes)) {
                        let numberOfStudents = 0;
                        let numberOfStudentsAnswered = 0;

                        const usersSnapshot = await get(child(ref(Database), 'users'));

                        if (quizSnapshot.exists()) {
                            const students = usersSnapshot.val();

                            if (students) {
                                Object.values(students).forEach((student) => {
                                    if (parsedData.uid === student.Teacher && student.Status.toLowerCase() === "active") {
                                        numberOfStudents++;
                                        const studentAnsweredQuiz = student.Quiz;
                                        if (studentAnsweredQuiz && studentAnsweredQuiz.hasOwnProperty(key)) {
                                            numberOfStudentsAnswered++;
                                        }
                                    }
                                });
                            }
                        }

                        const row = document.createElement("tr");
                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.value = key;

                        const titleCell = document.createElement("td");
                        titleCell.textContent = values.Title;

                        const overViewCell = document.createElement("td");
                        overViewCell.textContent = numberOfStudentsAnswered + "/" + numberOfStudents;
                        overViewCell.style.whiteSpace = "nowrap";
                        overViewCell.style.textOverflow = "ellipsis";
                        overViewCell.style.overflow = "hidden";

                        const actionsCell = document.createElement("td");
                        const editButton = document.createElement("button");
                        editButton.classList.add('Button-Yellow-Icon', 'modal-trigger');
                        editButton.title = "Edit";
                        editButton.setAttribute('data-target', 'Add-Modal');
                        editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>';

                        editButton.addEventListener('click', function () {
                            const modal = document.getElementById(this.dataset.target);
                            console.log(modal);
                            modal.style.display = 'flex';

                            // When the user clicks on the close button, close the modal
                            var closeBtn = modal.querySelector('.modal-close');
                            closeBtn.addEventListener('click', function () {
                                modal.style.display = 'none';
                                document.getElementById("quiz-form").reset();
                            });
                        });

                        const deleteButton = document.createElement("button");
                        deleteButton.className = "Button-Red-Icon";
                        deleteButton.title = "Delete";
                        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>';
                        deleteButton.style.marginLeft = "5px";

                        // const disableButton = document.createElement("button");
                        // disableButton.className = "Button-Red-Icon";
                        // disableButton.style = "margin-left: 4px;"
                        // disableButton.title = "Disable";
                        // disableButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" style="pointer-events: none;"><path d="M538-538ZM424-424Zm56 264q51 0 98-15.5t88-44.5q-41-29-88-44.5T480-280q-51 0-98 15.5T294-220q41 29 88 44.5t98 15.5Zm106-328-57-57q5-8 8-17t3-18q0-25-17.5-42.5T480-640q-9 0-18 3t-17 8l-57-57q19-17 42.5-25.5T480-720q58 0 99 41t41 99q0 26-8.5 49.5T586-488Zm228 228-58-58q22-37 33-78t11-84q0-134-93-227t-227-93q-43 0-84 11t-78 33l-58-58q49-32 105-49t115-17q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 59-17 115t-49 105ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-59 16.5-115T145-701L27-820l57-57L876-85l-57 57-615-614q-22 37-33 78t-11 84q0 57 19 109t55 95q54-41 116.5-62.5T480-360q38 0 76 8t74 22l133 133q-57 57-130 87T480-80Z"/></svg>';

                        actionsCell.appendChild(editButton);
                        actionsCell.appendChild(deleteButton);
                        // actionsCell.appendChild(disableButton);

                        row.appendChild(hiddenInput);
                        row.appendChild(titleCell);
                        row.appendChild(overViewCell);
                        row.appendChild(actionsCell);

                        tableBody.appendChild(row);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

async function StudentLesson() {
    try {
        const parsedData = JSON.parse(localStorage.getItem('userData'));
        await get(child(ref(Database), 'teachers/' + parsedData.uid + '/Lesson')).then(async (quizSnapshot) => {
            if (await quizSnapshot.exists()) {
                const quizzes = quizSnapshot.val();
                if (quizzes) {
                    const tableBody = document.getElementById("table-body");
                    for (const [key, values] of Object.entries(quizzes)) {
                        const row = document.createElement("tr");
                        const hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.value = key;

                        const titleCell = document.createElement("td");
                        titleCell.style.maxWidth = "350px";
                        titleCell.textContent = values.title;

                        const descriptionCell = document.createElement("td");
                        descriptionCell.style.maxWidth = "350px";
                        descriptionCell.textContent = values.description;

                        const createdCell = document.createElement("td");
                        createdCell.textContent = values.created;

                        const actionsCell = document.createElement("td");
                        // const editButton = document.createElement("button");
                        // editButton.classList.add('Button-Yellow-Icon', 'modal-trigger');
                        // editButton.title = "Edit";
                        // editButton.setAttribute('data-target', 'Edit-Modal');
                        // editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>';

                        const deleteButton = document.createElement("button");
                        deleteButton.className = "Button-Red-Icon";
                        deleteButton.title = "Delete";
                        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>';
                        deleteButton.style.marginLeft = "5px";

                        // const disableButton = document.createElement("button");
                        // disableButton.className = "Button-Red-Icon";
                        // disableButton.style = "margin-left: 4px;"
                        // disableButton.title = "Disable";
                        // disableButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" style="pointer-events: none;"><path d="M538-538ZM424-424Zm56 264q51 0 98-15.5t88-44.5q-41-29-88-44.5T480-280q-51 0-98 15.5T294-220q41 29 88 44.5t98 15.5Zm106-328-57-57q5-8 8-17t3-18q0-25-17.5-42.5T480-640q-9 0-18 3t-17 8l-57-57q19-17 42.5-25.5T480-720q58 0 99 41t41 99q0 26-8.5 49.5T586-488Zm228 228-58-58q22-37 33-78t11-84q0-134-93-227t-227-93q-43 0-84 11t-78 33l-58-58q49-32 105-49t115-17q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 59-17 115t-49 105ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-59 16.5-115T145-701L27-820l57-57L876-85l-57 57-615-614q-22 37-33 78t-11 84q0 57 19 109t55 95q54-41 116.5-62.5T480-360q38 0 76 8t74 22l133 133q-57 57-130 87T480-80Z"/></svg>';

                        // actionsCell.appendChild(editButton);
                        actionsCell.appendChild(deleteButton);
                        // actionsCell.appendChild(disableButton);

                        row.appendChild(hiddenInput);
                        row.appendChild(titleCell);
                        row.appendChild(descriptionCell);
                        row.appendChild(createdCell);
                        row.appendChild(actionsCell);

                        tableBody.appendChild(row);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

async function ArchiveStudents() {
    try {
        const parsedData = JSON.parse(localStorage.getItem('userData'));
        await get(child(ref(Database), 'teachers')).then(async (teacherSnapshot) => {
            if (await teacherSnapshot.exists()) {
                const teachers = teacherSnapshot.val();
                await get(child(ref(Database), 'users')).then(async (userSnapshot) => {
                    if (await userSnapshot.exists()) {
                        const data = userSnapshot.val();
                        if (data) {
                            const tableBody = document.getElementById("table-body");
                            for (const [key, values] of Object.entries(data)) {
                                if (parsedData.uid != values.Teacher || values.Status.toLowerCase() != "archived") {
                                    continue;
                                }
                                const teacher = teachers[values.Teacher];
                                const row = document.createElement("tr");
                                const hiddenInput = document.createElement("input");
                                hiddenInput.type = "hidden";
                                hiddenInput.value = key;

                                const studentNumberCell = document.createElement("td");
                                studentNumberCell.textContent = values.Username;

                                const nameCell = document.createElement("td");
                                nameCell.textContent = values.LastName + ", " + values.FirstName;

                                const teacherCell = document.createElement("td");
                                teacherCell.textContent = teacher.LastName + ", " + teacher.FirstName;

                                const gradeCell = document.createElement("td");
                                const gradeDiv = document.createElement("div");
                                gradeDiv.textContent = teacher.GradeLevel;
                                if (teacher.GradeLevel.toLowerCase() == "Grade 1".toLowerCase()) {
                                    gradeDiv.className = "Status-Green";
                                }
                                else if (teacher.GradeLevel.toLowerCase() == "Grade 2".toLowerCase()) {
                                    gradeDiv.className = "Status-Purple";
                                } else if (teacher.GradeLevel.toLowerCase() == "Grade 3".toLowerCase()) {
                                    gradeDiv.className = "Status-Yellow";
                                } else {
                                    gradeDiv.className = "Status-Red";
                                }

                                const genderCell = document.createElement("td");
                                const genderDiv = document.createElement("div");
                                genderDiv.textContent = values.Gender;
                                if (values.Gender.toLowerCase() == "Male".toLowerCase()) {
                                    genderDiv.className = "Status-Blue";
                                } else {
                                    genderDiv.className = "Status-Pink";
                                }

                                const actionsCell = document.createElement("td");
                                const viewButton = document.createElement("button");
                                viewButton.classList.add('Button-Blue-Icon', 'modal-trigger');
                                viewButton.title = "Edit";
                                viewButton.setAttribute('data-target', 'View-Modal');
                                viewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg></svg>';

                                viewButton.addEventListener('click', function () {
                                    const modal = document.getElementById(this.dataset.target);
                                    modal.style.display = 'flex';

                                    // When the user clicks on the close button, close the modal
                                    var closeBtn = modal.querySelector('.modal-close');
                                    closeBtn.addEventListener('click', function () {
                                        modal.style.display = 'none';
                                        document.getElementById("student-view").reset();
                                    });
                                });

                                const editButton = document.createElement("button");
                                editButton.classList.add('Button-Yellow-Icon', 'modal-trigger');
                                editButton.title = "Edit";
                                editButton.setAttribute('data-target', 'Add-Modal');
                                editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"/></svg>';
                                editButton.style.marginLeft = "5px";

                                editButton.addEventListener('click', function () {
                                    const modal = document.getElementById(this.dataset.target);
                                    modal.style.display = 'flex';

                                    // When the user clicks on the close button, close the modal
                                    var closeBtn = modal.querySelector('.modal-close');
                                    closeBtn.addEventListener('click', function () {
                                        modal.style.display = 'none';
                                        document.getElementById("student-form").reset();
                                    });
                                });

                                const deleteButton = document.createElement("button");
                                deleteButton.className = "Button-Red-Icon";
                                deleteButton.title = "Delete";
                                deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-events: none;"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>';
                                deleteButton.style.marginLeft = "5px";


                                actionsCell.appendChild(viewButton);
                                actionsCell.appendChild(editButton);
                                actionsCell.appendChild(deleteButton);

                                gradeCell.appendChild(gradeDiv)
                                genderCell.appendChild(genderDiv)

                                row.appendChild(hiddenInput);
                                row.appendChild(studentNumberCell);
                                row.appendChild(nameCell);
                                row.appendChild(gradeCell);
                                row.appendChild(genderCell);
                                row.appendChild(teacherCell);
                                row.appendChild(actionsCell);

                                tableBody.appendChild(row);
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error);
                });
            }
        }).catch((error) => {
            console.log(error);
        });

    } catch (error) {
        console.log(error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    onAuthStateChanged(Auth, async (userCredentials) => {
        if (userCredentials) {
            if (window.location.pathname === "/index.html") {
                ShowLoading();
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (userData.isAdmin == undefined || userData.isTeacher == undefined) {
                    signOut(Auth).then(() => {
                        localStorage.clear();
                    }).catch((error) => {
                        console.log(error.message);
                    });
                }
                if (userData.isAdmin == true && userData.isTeacher == false) {
                    window.location.href = "/admin-dashboard.html";
                } else if (userData.isAdmin == false && userData.isTeacher == true) {
                    window.location.href = "/teacher-dashboard.html";
                } else {
                    signOut(Auth).then(() => {
                        localStorage.clear();
                    }).catch((error) => {
                        console.log(error.message);
                    });
                }
                HideLoading();
            }
        } else {
            if (window.location.pathname !== "/index.html") {
                window.location.href = "/index.html";
            }
        }
    });
});

function Login() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = GetElementValue("email") ?? "";
            const password = GetElementValue("password") ?? "";

            if (email == "" || password == "") {
                ShowNotification("Email or password cannot be empty", Colors.Red);
                return;
            }
            ShowLoading();
            const areTeacher = IsTeacher(email);
            if (areTeacher == false) {
                let isAdmin = false;
                await get(child(ref(Database), 'admins')).then(async (userSnapshot) => {
                    if (await userSnapshot.exists()) {
                        const data = userSnapshot.val();
                        if (data) {
                            for (const [key, values] of Object.entries(data)) {
                                if (values.Email == email) {
                                    isAdmin = true;
                                    break;
                                }
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error);
                });
                if (isAdmin) {
                    await signInWithEmailAndPassword(Auth, email, password).then(async (userCredential) => {
                        const userId = userCredential.user.uid;
                        await get(child(ref(Database), 'admins/' + userId)).then(async (userSnapshot) => {
                            if (await userSnapshot.exists()) {
                                const userData = userSnapshot.val();
                                userData.uid = userId;
                                userData.isAdmin = true;
                                userData.isTeacher = false;
                                localStorage.setItem('userData', JSON.stringify(userData));
                                window.location.href = "/admin-dashboard.html";
                            } else {
                                ShowNotification("Your account is not admin", Colors.Red);
                                signOut(Auth).then(() => {
                                }).catch((error) => {
                                    console.log(error.message);
                                });
                            }
                        }).catch((error) => {
                            console.log(error);
                        });
                    }).catch((error) => {
                        console.log(error.message);
                        ShowNotification("Your email or password is incorrect.", Colors.Red);
                        HideLoading();
                    });
                } else {
                    ShowNotification("Your account is not admin", Colors.Red);
                    HideLoading();
                }
            } else {
                let isTeacher = false;
                await get(child(ref(Database), 'teachers')).then(async (userSnapshot) => {
                    if (await userSnapshot.exists()) {
                        const data = userSnapshot.val();
                        if (data) {
                            for (const [key, values] of Object.entries(data)) {
                                if (values.Email == email) {
                                    isTeacher = true;
                                    break;
                                }
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error);
                });
                if (isTeacher) {
                    await signInWithEmailAndPassword(Auth, email, password).then(async (userCredential) => {
                        const userId = userCredential.user.uid;
                        await get(child(ref(Database), 'teachers/' + userId)).then(async (userSnapshot) => {
                            if (await userSnapshot.exists()) {
                                const userData = userSnapshot.val();
                                userData.uid = userId;
                                userData.isAdmin = false;
                                userData.isTeacher = true;
                                localStorage.setItem('userData', JSON.stringify(userData));
                                window.location.href = "/teacher-dashboard.html";
                            } else {
                                ShowNotification("Your account is not teacher", Colors.Red);
                                signOut(Auth).then(() => {
                                }).catch((error) => {
                                    console.log(error.message);
                                });
                            }
                        }).catch((error) => {
                            console.log(error);
                        });
                    }).catch((error) => {
                        console.log(error.message);
                        ShowNotification("Your email or password is incorrect.", Colors.Red);
                        HideLoading();
                    });
                } else {
                    ShowNotification("Your account is not teacher", Colors.Red);
                    HideLoading();
                }
            }
        });
    }
}

function IsTeacher(email) {
    if (email == "admin@gmail.com") {
        return false;
    } else {
        return true;
    }
}

function Logout() {
    const logoutButton = document.getElementById("LogoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            ShowLoading();
            signOut(Auth).then(() => {
                localStorage.clear();
            }).catch((error) => {
                console.log(error.message);
            });
            HideLoading();
        });
    }
}

function GetElementValue(id) {
    return document.getElementById(id).value;
}

function SetContentById(id, textContent) {
    return document.getElementById(id).textContent = textContent;
}

function SetContentByQuerySelector(querySelector, textContent) {
    if (querySelector) {
        return document.querySelector(querySelector).textContent = textContent;
    }
    return;
}

function IsNullOrEmpty(string) {
    if (string == "" || string == null || string == undefined) {
        return true;
    }
    return false;
}

export {
    Auth,
    Database,
    FirebaseConfig,
    GetElementValue,
    AdminAccount,
    TeacherAccount,
    StudentAccount,
    StudentQuiz,
    StudentLesson,
    IsNullOrEmpty,
    ArchiveStudents
};