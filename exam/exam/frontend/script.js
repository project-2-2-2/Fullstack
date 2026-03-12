const backUrl = "http://localhost:3000";

async function getLogin(username, password) {
    const url = `${backUrl}/login`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('user', data.user_id);
        window.location.replace("./home.html");
    } else {
        alert(data.message || "Login Failed");
    }
}

async function getSignup(username, passwd) {

    const url = `${backUrl}/signup`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: passwd
        })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('user', data.user_id);
        window.location.replace("./home.html");
    } else {
        alert(data.message);
    }
}

async function markAsCompleted(taskId) {

    const url = `${backUrl}/completeTask`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            taskId: taskId
        })
    });

    const data = await res.json();

    if (res.ok) {
        return data.marked_finished;
    } else {
        alert("Failed to update task");
    }
}

async function loadTasks() {
    console.log(localStorage.getItem('user'));
    const url = `${backUrl}/getTasks`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: localStorage.getItem('user')
        })
    });

    const data = await res.json();

    const list = document.getElementById("Tasks");

    let html = "";

    data.tasks.forEach((task) => {

        className = (task.marked_finish) ? "finished" : "notFinished";
        html += `
        <div class=${className} style="margin:10px;padding:10px;border:1px solid black">
            <b>${task.title}</b><br>
            ${task.content}<br><br>
            <button onclick = "deletefunc('${task._id}')">Delete</button>
            <button onclick="togglefunc('${task._id}')">${!task.marked_finish ? "Mark completed" : "Mark incomplete"}</button>
        </div>`;
        console.log(data.tasks);

    });

    list.innerHTML = html;
}

async function completeTask(taskId) {

    await fetch(`${backUrl}/markComplete`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ taskId })
    });

    loadTasks();
}

async function deletefunc(taskId) {
    const res = await fetch(`${backUrl}/deleteTask/${taskId}`, {
        method: "DELETE"
    });
    loadTasks();
}

async function togglefunc(taskId) {
    const res = await fetch(`${backUrl}/toggleComplete`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            taskId: taskId,
        })
    });
    loadTasks();
}

async function helper(title, content) {
    console.log(localStorage.getItem("user"))
    const res = await fetch(`${backUrl}/addTask`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title, content: content, userId: localStorage.getItem('user')

        })
    });

    loadTasks();
}

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
})