// ===== FORM INPUTS =====
const title = document.getElementById("title");
const author = document.getElementById("author");
const statusSelect = document.getElementById("status");
const format = document.getElementById("format");
const notes = document.getElementById("notes");
const dateStarted = document.getElementById("dateStarted");
const dateFinished = document.getElementById("dateFinished");
const ratingSelect = document.getElementById("rating");

let editingBookId = null;

const today = new Date().toISOString().split("T")[0];
dateStarted.max = today;
dateFinished.max = today;

const noteModal = document.getElementById("noteModal");
const fullNoteText = document.getElementById("fullNoteText");
const closeNoteBtn = document.getElementById("closeNoteBtn");

closeNoteBtn.addEventListener("click", () => {
  noteModal.classList.add("hidden");
});

// ==== EVENT LISTENERS ====
dateStarted.addEventListener("change", validateDates);
dateFinished.addEventListener("change", validateDates);
dateStarted.addEventListener("input", enforceStatusRules);
dateFinished.addEventListener("input", enforceStatusRules);
statusSelect.addEventListener("change", enforceStatusRules);
statusSelect.addEventListener("input", enforceStatusRules);
ratingSelect.addEventListener("change", enforceStatusRules);

function validateDates() {
  if (dateStarted.value && dateFinished.value) {
    if (dateFinished.value < dateStarted.value) {
      alert("Finished date cannot be before start date.");
      dateFinished.value = "";
    }
  }

  enforceStatusRules();
}

function formatRating(value) {
  return {
    skip: "Skip..",
    fine: "Fine.",
    good: "Good",
    great: "Great!",
    holy: "HOLY SHIT!?!"
  }[value];
}

// ===== STORAGE HELPERS =====
function getBooks() {
  return JSON.parse(localStorage.getItem("books")) || [];
}

function saveBooks(books) {
  localStorage.setItem("books", JSON.stringify(books));
}

// ==== STATUS HELPERS ====
function enforceStatusRules() {
  const hasStart = !!dateStarted.value;
  const hasFinish = !!dateFinished.value;
  const hasRating = !!ratingSelect.value;

  const options = Array.from(statusSelect.options);

  // Reset
  options.forEach(o => o.disabled = false);
  statusSelect.disabled = false;

  // RATING = ABSOLUTE READ
  if (hasRating) {
    options.forEach(o => o.disabled = o.value !== "read");
    statusSelect.value = "read";
    return;
  }

  // FINISHED = READ
  if (hasFinish) {
    options.forEach(o => o.disabled = o.value !== "read");
    statusSelect.value = "read";
    return;
  }

  // STARTED = CURRENTLY or READ
  if (hasStart) {
    options.forEach(o => {
      if (!["currently", "read"].includes(o.value)) {
        o.disabled = true;
      }
    });

    if (!["currently", "read"].includes(statusSelect.value)) {
      statusSelect.value = "currently";
    }
  }
}

// ===== RENDERING =====
function renderBooks() {
  const books = getBooks();

  document.querySelectorAll(".tab-content").forEach(section => {
    section.innerHTML = "";
  });

  books.forEach(book => {
    if (!document.getElementById(book.status)) {
      console.warn("Invalid status fixed:", book.status);
      book.status = "want_read";
    }

    const section = document.getElementById(book.status);
    section.appendChild(createBookCard(book));
  });
}

// ===== DELETE LOGIC =====
function deleteBook(id) {
  const books = getBooks().filter(book => book.id !== id);
  saveBooks(books);
  renderBooks();
}

// ===== CREATE CARDS =====
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const MAX = 120;
  const shortNotes = book.notes && book.notes.length > MAX
    ? book.notes.slice(0, MAX) + "..."
    : book.notes || "";

  card.innerHTML = `
    <strong>${book.title}</strong>
    <em>${book.author}</em>

    <div class="book-meta">
      <span>${book.format === "ebook" ? "eBook" : "Paperback"}</span>
      ${book.dateStarted ? `<span>Started: ${book.dateStarted}</span>` : ""}
      ${book.dateFinished ? `<span>Finished: ${book.dateFinished}</span>` : ""}
      ${book.rating ? `<span class="rating-text">${formatRating(book.rating)}</span>` : ""}
      ${book.notes
        ? `<p class="notes">
             ${shortNotes}
             ${book.notes.length > MAX ? `<button class="read-more" type="button">Read more</button>` : ""}
           </p>`
        : ""
      }
    </div>

    <div class="card-actions">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  // Edit
  card.querySelector(".edit-btn").addEventListener("click", () => {
    openEditModal(book);
  });

  // Delete
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteBook(book.id);
  });

  // Read More
  card.querySelector(".read-more")?.addEventListener("click", () => {
    fullNoteText.textContent = book.notes;
    noteModal.classList.remove("hidden");
  });

  return card;
};

// ===== TAB SWITCHING =====
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    // Activate clicked tab
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.getElementById(target).classList.add("active");
  });
});

// ===== MODAL OPEN / CLOSE =====
const addBookBtn = document.getElementById("addBookBtn");
const modal = document.getElementById("bookModal");
const cancelBtn = document.getElementById("cancelBtn");
const bookForm = document.getElementById("bookForm");

// ===== RESET APP =====
const resetModal = document.getElementById("resetModal");
const confirmResetBtn = document.getElementById("confirmReset");
const cancelResetBtn = document.getElementById("cancelReset");

resetBtn.addEventListener("click", () => {
  resetModal.classList.remove("hidden");
});

cancelResetBtn.addEventListener("click", () => {
  resetModal.classList.add("hidden");
});

confirmResetBtn.addEventListener("click", () => {
  localStorage.removeItem("books");
  renderBooks();
  resetModal.classList.add("hidden");
});

addBookBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", closeModal);

function closeModal() {
  modal.classList.add("hidden");
  bookForm.reset();
  editingBookId = null;
  selectedRating = null;
  stars.forEach(s => s.classList.remove("active"));
  enforceStatusRules();
}

bookForm.addEventListener("submit", e => {
  e.preventDefault();

  const ratingValue = ratingSelect.value || null;

  enforceStatusRules();

  const books = getBooks();
  let finalStatus = ratingValue ? "read" : statusSelect.value;

  // Only force when invalid
  if (dateStarted.value && statusSelect.value === "want_read") {
    finalStatus = "currently";
  }

  if (editingBookId !== null) {
    // EDIT
    const book = books.find(b => b.id === editingBookId);

    book.title = title.value.trim();
    book.author = author.value.trim();
    book.status = finalStatus;
    book.format = format.value;
    book.rating = ratingValue
    book.notes = notes.value;
    book.dateStarted = dateStarted.value || null;
    book.dateFinished = dateFinished.value || null;

    editingBookId = null;
  } else {
    // ADD
    books.unshift({
      id: Date.now().toString(),
      title: title.value.trim(),
      author: author.value.trim(),
      status: finalStatus,
      format: format.value,
      rating: ratingValue,
      notes: notes.value,
      dateStarted: dateStarted.value || null,
      dateFinished: dateFinished.value || null
    });
  }

  saveBooks(books);
  renderBooks();
  closeModal();
});

function openEditModal(book) {
  editingBookId = book.id;

  title.value = book.title;
  author.value = book.author;
  statusSelect.value = book.status;
  format.value = book.format;

  notes.value = book.notes;
  dateStarted.value = book.dateStarted ?? "";
  dateFinished.value = book.dateFinished ?? "";
  ratingSelect.value = book.rating || "";

  enforceStatusRules();
  modal.classList.remove("hidden");
}

renderBooks();