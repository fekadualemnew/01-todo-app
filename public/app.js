const input = document.getElementById('taskInput');
let currentFilter = 'all';

// Allow pressing "Enter" key
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") addTask();
});

function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const list = document.getElementById('taskList');
            list.innerHTML = "";

            // FILTERING LOGIC
            const filteredTasks = tasks.filter(task => {
                if (currentFilter === 'all') return true;
                if (currentFilter === 'active') return task.status !== 'done';
                if (currentFilter === 'completed') return task.status === 'done';
            });

            filteredTasks.forEach(task => {
                const li = document.createElement('li');

                // 1. Checkbox
                const checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.checked = (task.status === 'done');
                checkbox.onchange = () => toggleTask(task.id, checkbox.checked);

                // 2. Info Container (Text + Date)
                const infoDiv = document.createElement('div');
                infoDiv.style.flexGrow = "1";
                infoDiv.style.marginLeft = "10px";
                infoDiv.style.display = "flex";
                infoDiv.style.flexDirection = "column";

                // Task Text
                const textSpan = document.createElement('span');
                textSpan.textContent = task.text;
                if (task.status === 'done') textSpan.classList.add('completed');

                // Task Date
                const dateSpan = document.createElement('span');
                dateSpan.style.fontSize = "0.75rem";
                dateSpan.style.color = "#aaa";
                if (task.created_at) {
                    const date = new Date(task.created_at);
                    dateSpan.textContent = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }

                infoDiv.appendChild(textSpan);
                infoDiv.appendChild(dateSpan);

                // 3. Buttons (Edit & Delete)
                const actions = document.createElement('div');
                
                const editBtn = document.createElement('button');
                editBtn.innerHTML = "✏️";
                editBtn.className = "edit-btn";
                editBtn.onclick = () => editTask(task.id, task.text);

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = "&times;";
                deleteBtn.className = "delete-btn";
                deleteBtn.onclick = () => deleteTask(task.id);

                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);

                // Assemble List Item
                li.appendChild(checkbox);
                li.appendChild(infoDiv);
                li.appendChild(actions);
                list.appendChild(li);
            });
        });
}

function addTask() {
    const text = input.value;
    if (text === "") return;

    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
    }).then(() => {
        input.value = "";
        loadTasks();
    });
}

function deleteTask(id) {
    fetch('/tasks/' + id, {
         method: 'DELETE'
         })
         .then(() => loadTasks());
}

function toggleTask(id, isChecked) {
    const status = isChecked ? 'done' : 'pending';
    fetch('/tasks/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status })
    }).then(() => loadTasks());
}

function editTask(id, oldText) {
    const newText = prompt("Update task:", oldText);
    if (newText !== null && newText.trim() !== "") {
        fetch('/tasks/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newText })
        }).then(() => loadTasks());
    }
}

function setFilter(filterType) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === filterType) btn.classList.add('active');
    });
    loadTasks();
}

// Start
loadTasks();