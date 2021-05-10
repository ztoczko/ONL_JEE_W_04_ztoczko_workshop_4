//*1* declarations od constant variables
//*2* functions for direct communication with API controller 
//*3* event functions 
//*4* functions responsible for filling page with content on load
//*5* trigger for loading content

//*1* declarations od constant variables

const apikey = "5a091f95-bbce-42bd-94b1-cc5595c01848";
const apihost = 'https://todo-api.coderslab.pl';
const taskBoxTemplate = // set task id here:
    // "  <section class=\"card mt-5 shadow-sm\" data-taskId='0'>\n" +
    "<!--    task header part-->\n" +
    "    <div class=\"card-header d-flex justify-content-between align-items-center\">\n" +
    "      <div>\n" +
    // title goes here
    "        <h5>Title</h5>\n" +
    // description goes here
    "        <h6 class=\"card-subtitle text-muted\">Description</h6>\n" +
    "      </div>\n" +
    "      <div>\n" +
    "        <button class=\"btn btn-dark btn-sm\">Finish</button>\n" +
    "        <button class=\"btn btn-outline-danger btn-sm ml-2\">Delete</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "<!--    end of task header part-->\n" +
    "\n" +
    "<!--    operations list-->\n" +
    "    <ul class=\"list-group list-group-flush\">\n" +
    "    </ul>\n" +
    "<!--    end of operations list-->\n" +
    "\n" +
    "<!--    adding new operation-->\n" +
    "    <div class=\"card-body\">\n" +
    "      <form>\n" +
    "        <div class=\"input-group\">\n" +
    "          <input type=\"text\" placeholder=\"Operation description\" class=\"form-control\" minlength=\"5\">\n" +
    "          <div class=\"input-group-append\">\n" +
    "            <button type=\"button\" class=\"btn btn-info\">Add</button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </form>\n" +
    "          <div class=\"text-danger d-none\">Operation description too short - it needs to be at least 5 characters long</div>" +
    "          <div class=\"text-success d-none\" style=\"opacity: 1\">Operation added successfully</div>" +
    "    </div>\n" +
    // "  </section>" +
    "<!--  end of adding new operation-->";

const operationItemTemplate =
    // "      <li class=\"list-group-item d-flex justify-content-between align-items-center\" data-operationID = '0'>\n" +
    "        <div>\n" +
    "          <span>Operation description\n</span>" +
    "          <span class=\"badge badge-success badge-pill ml-2\">Operation time</span>\n" +
    "        </div>\n" +
    "        <div>\n" +
    "          <button class=\"btn btn-outline-success btn-sm mr-2\">+15m</button>\n" +
    "          <button class=\"btn btn-outline-success btn-sm mr-2\">+1h</button>\n" +
    "          <button class=\"btn btn-outline-danger btn-sm\">Delete</button>\n" +
    "        </div>\n"
// "      </li>";

const main = document.getElementById("app");

//*2* functions for direct communication with API controller

function loadTasksListAPI() {

    return fetch(apihost + "/api/tasks", {
        headers: {
            Authorization: apikey,
        },
        method: "GET"
    }).then(response => response.json()).then(result => {
        return result.data;
    });
}

function loadOperationsListAPI(taskId) {
    return fetch(apihost + "/api/tasks/" + taskId + "/operations", {
        headers: {
            Authorization: apikey,
        },
        method: "GET"
    }).then(response => response.json()).then(result => {
        return result.data;
    });
}

async function addNewTaskAPI(title, description) {

    return await fetch(apihost + "/api/tasks", {
        headers: {
            Authorization: apikey,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            title: title,
            description: description,
            status: "open"
        })
    }).then(response => loadTasksListAPI()).then(result => {
        const oldTaskIdArray = [];
        document.querySelectorAll("[data-task-id]").forEach(item => oldTaskIdArray.push(item.dataset.taskId));
        console.log(result.filter(item => !oldTaskIdArray.includes(item.id)));
        return result.filter(item => !oldTaskIdArray.includes(item.id))[0].id;
    });
}

function deleteTaskAPI(id) {

    console.log(fetch(apihost + "/api/tasks/" + id, {
        headers: {
            Authorization: apikey
        },
        method: "DELETE"
    }));
}

function updateTaskAPI(id, title, description, status) {

    fetch(apihost + "/api/tasks/" + id, {
        headers: {
            Authorization: apikey,
            "Content-Type": "application/json"
        },
        method: "PUT",
        body: JSON.stringify({
            title: title,
            description: description,
            status: status
        })
    });
}

async function addNewOperationAPI(taskId, description) {
    return await fetch(apihost + "/api/tasks/" + taskId + "/operations", {
        headers: {
            Authorization: apikey,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            description: description,
            timeSpent: 0
        })
    }).then(response => loadOperationsListAPI(taskId)).then(result => {
        const oldOperatonsIdArray = [];
        document.querySelectorAll("[data-task-id=\"" + taskId + "\"] [data-operation-id]").forEach(item => oldOperatonsIdArray.push(item.dataset.operationId));
        return result.filter(item => !oldOperatonsIdArray.includes(item.id))[0].id;
    });
}

function deleteOperationAPI(id) {
    fetch(apihost + "/api/operations/" + id, {
        headers: {
            Authorization: apikey
        },
        method: "DELETE"
    });
}

function updateOperationAPI(id, description, timeSpent) {
    fetch(apihost + "/api/operations/" + id, {
        headers: {
            Authorization: apikey,
            "Content-Type": "application/json"
        },
        method: "PUT",
        body: JSON.stringify({
            description: description,
            timeSpent: timeSpent
        })
    });
}

//*3* event functions

function taskSetFinish(id, updateFlag) {

    const taskElement = document.querySelector("[data-task-id=\"" + id + "\"]");
    taskElement.querySelectorAll("button").forEach((item, index, arr) => {
        if (index === 0) {
            item.disabled = true;
            item.innerText = "Closed";
        }
        if (index > 1) {
            item.classList.add("d-none");
        }
        if (index === arr.length - 1) {
            item.parentElement.parentElement.parentElement.parentElement.classList.add("d-none");
        }
    });
    if (updateFlag) {
        updateTaskAPI(id, taskElement.querySelector("h5").innerText, taskElement.querySelector("h6"), "closed");
    }
}

function deleteTask(id) {

    document.querySelector("[data-task-id=\"" + id + "\"]").remove();
    deleteTaskAPI(id);
}

function addNewTask(title, description) {
    addNewTaskAPI(title, description).then(id => createTaskElement(id, title, description, "open")).then(result => main.appendChild(result));
}

function operationAddTime(id, time) {

    const timer = document.querySelector("[data-operation-id=\"" + id + "\"] span.badge");
    const timeSpent = parseInt(timer.dataset.time) + time;
    timer.innerText = (timeSpent >= 60 ? Math.floor(timeSpent / 60) + "h " : "") + (timeSpent % 60) + "min";
    timer.dataset.time = timeSpent;
    updateOperationAPI(id, timer.parentElement.firstElementChild.innerText, timeSpent);
}

function operationDelete(id) {

    document.querySelector("[data-operation-id=\"" + id + "\"]").remove();
    deleteOperationAPI(id);
}

function addNewOperation(taskId, description) {
    addNewOperationAPI(taskId, description).then(id => document.querySelector("[data-task-id=\"" + taskId + "\"] ul").appendChild(createOperationElement(id, description, 0)));
}

//*4* functions responsible for filling page with content on load

function createOperationElement(id, description, timeSpent) {

    const newOperationELement = document.createElement("li");
    newOperationELement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    newOperationELement.setAttribute("data-operation-id", id);
    newOperationELement.innerHTML = operationItemTemplate;
    newOperationELement.querySelector("div span").innerText = description;
    newOperationELement.querySelector("div span.badge").innerText = (timeSpent >= 60 ? Math.floor(timeSpent / 60) + "h " : "") + (timeSpent % 60) + "min";
    newOperationELement.querySelector("div span.badge").dataset.time = timeSpent;
    newOperationELement.querySelectorAll("button").forEach((item, index) => {
        switch (index) {
            case 0:
                item.onclick = function () {
                    operationAddTime(this.parentElement.parentElement.dataset.operationId, 15);
                }
                break;
            case 1:
                item.onclick = function () {
                    operationAddTime(this.parentElement.parentElement.dataset.operationId, 60);
                }
                break;
            case 2:
                item.onclick = function () {
                    operationDelete(this.parentElement.parentElement.dataset.operationId);
                }
        }
    });
    return newOperationELement;
}

async function createTaskElement(id, title, description, status) {

    const newTaskElement = document.createElement("section");
    newTaskElement.classList.add("card", "mt-5", "shadow-sm");
    newTaskElement.dataset.taskId = id;
    newTaskElement.innerHTML = taskBoxTemplate;
    newTaskElement.querySelector("h5").innerText = title;
    newTaskElement.querySelector("h6").innerText = description;
    const operationListElement = newTaskElement.querySelector("ul");
    await loadOperationsListAPI(id).then(result => result.forEach(item2 => {
        operationListElement.appendChild(createOperationElement(item2.id, item2.description, item2.timeSpent));
    }));
    const buttons = newTaskElement.querySelectorAll("button");

    buttons[1].onclick = function () {
        deleteTask(this.parentElement.parentElement.parentElement.dataset.taskId);
    }
    buttons[0].onclick = function () {
        taskSetFinish(this.parentElement.parentElement.parentElement.dataset.taskId, true);
    }
    buttons[buttons.length - 1].onclick = function () {
        const inputEl = this.parentElement.previousElementSibling;
        if (inputEl.value.length >= 5) {
            const operationSuccess = inputEl.parentElement.parentElement.nextElementSibling.nextElementSibling;
            addNewOperation(this.parentElement.parentElement.parentElement.parentElement.parentElement.dataset.taskId, inputEl.value);
            inputEl.parentElement.parentElement.nextElementSibling.classList.add("d-none");
            inputEl.value = "";
            operationSuccess.classList.remove("d-none");
            operationSuccess.style.opacity = "1";
            operationSuccess.style.transition = "all 5s";
            setTimeout(() => operationSuccess.style.opacity = "0", 50);
            setTimeout(() => operationSuccess.classList.add("d-none"), 5000);
        } else {
            inputEl.parentElement.parentElement.nextElementSibling.classList.remove("d-none");
        }
    }
    return newTaskElement;
}

function start() {

    document.getElementById("addTask").onclick = () => {
        newTitle = document.getElementById("taskTitle").value;
        newDescription = document.getElementById("taskDescription").value;
        if (newTitle.length >= 5 && newDescription.length >= 5) {
            const taskSuccess = document.getElementById("taskAddedSuccess");

            document.getElementById("taskTitle").value = "";
            document.getElementById("taskDescription").value = "";
            addNewTask(newTitle, newDescription);
            document.getElementById("taskTitleError").classList.add("d-none");
            document.getElementById("taskDescriptionError").classList.add("d-none");

            taskSuccess.classList.remove("d-none");
            taskSuccess.style.opacity = "1";
            taskSuccess.style.transition = "all 5s";
            setTimeout(() => taskSuccess.style.opacity = "0", 50);
            setTimeout(() => taskSuccess.classList.add("d-none"), 5000);
        } else {
            if (newTitle.length < 5) {
                document.getElementById("taskTitleError").classList.remove("d-none");
            } else {
                document.getElementById("taskTitleError").classList.add("d-none");
            }
            if (newDescription.length < 5) {
                document.getElementById("taskDescriptionError").classList.remove("d-none");
            } else {
                document.getElementById("taskDescriptionError").classList.add("d-none");
            }
        }
    }

    loadTasksListAPI().then(result => result.forEach(item => {

        createTaskElement(item.id, item.title, item.description, item.status).then(result => {
            main.appendChild(result);
            if (item.status === "closed") {
                taskSetFinish(item.id, false);
            }
        })
    }));
}

//*5* trigger for loading content

start();
