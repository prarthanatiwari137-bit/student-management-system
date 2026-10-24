
const studentForm = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");
const emailInput = document.getElementById("email");

const studentList = document.getElementById("studentList");
const studentCount = document.getElementById("studentCount");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("search");

const editIndexInput = document.getElementById("editIndex");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Load saved student records
let students = [];

try {
    const savedStudents = JSON.parse(
        localStorage.getItem("students") || "[]"
    );

    if (Array.isArray(savedStudents)) {
        students = savedStudents.filter(student =>
            student &&
            typeof student.name === "string" &&
            typeof student.roll === "string" &&
            typeof student.course === "string" &&
            typeof student.email === "string"
        );
    }
} catch (error) {
    students = [];
}

function saveStudents() {
    try {
        localStorage.setItem("students", JSON.stringify(students));
        return true;
    } catch (error) {
        alert("Could not save records in this browser.");
        return false;
    }
}

function renderStudents() {
    studentList.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();

    const filteredStudents = students
        .map((student, index) => ({ student, index }))
        .filter(({ student }) =>
            [student.name, student.roll, student.course, student.email]
                .some(value => value.toLowerCase().includes(searchText))
        );

    studentCount.textContent = `Total Students: ${students.length}`;
    emptyMessage.hidden = filteredStudents.length > 0;

    filteredStudents.forEach(({ student, index }) => {
        const row = document.createElement("tr");

        [student.name, student.roll, student.course, student.email]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editStudent(index));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteStudent(index));

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);
        studentList.appendChild(row);
    });
}

// Add or update a student
studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const student = {
        name: nameInput.value.trim(),
        roll: rollInput.value.trim(),
        course: courseInput.value.trim(),
        email: emailInput.value.trim()
    };

    if (Object.values(student).some(value => !value)) {
        alert("Please fill in all fields.");
        return;
    }

    const editingIndex = editIndexInput.value;

    const duplicateIndex = students.findIndex((item, index) =>
        item.roll.toLowerCase() === student.roll.toLowerCase() &&
        String(index) !== editingIndex
    );

    if (duplicateIndex !== -1) {
        alert("This roll number already exists.");
        return;
    }

    const previousStudents = [...students];

    if (editingIndex !== "") {
        students[Number(editingIndex)] = student;
    } else {
        students.push(student);
    }

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    studentForm.reset();
    resetForm();
    renderStudents();
});

// Load details into the form for editing
function editStudent(index) {
    const student = students[index];

    nameInput.value = student.name;
    rollInput.value = student.roll;
    courseInput.value = student.course;
    emailInput.value = student.email;

    editIndexInput.value = index;
    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.hidden = false;

    nameInput.focus();
}

// Delete a student record
function deleteStudent(index) {
    const confirmed = confirm(
        `Delete the record for ${students[index].name}?`
    );

    if (!confirmed) return;

    const previousStudents = [...students];
    students.splice(index, 1);

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    resetForm();
    renderStudents();
}

// Cancel edit and reset the form
function resetForm() {
    editIndexInput.value = "";
    formTitle.textContent = "Add New Student";
    submitBtn.textContent = "Add Student";
    cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", () => {
    studentForm.reset();
    resetForm();
});

searchInput.addEventListener("input", renderStudents);

// Display saved records when the page opens
renderStudents();
