// ===== FORM INPUTS =====
const title = document.getElementById("title");
const author = document.getElementById("author");
const status = document.getElementById("status");
const format = document.getElementById("format");
const rating = document.getElementById("rating");
const notes = document.getElementById("notes");
const cover = document.getElementById("cover");
const dateStarted = document.getElementById("dateStarted");
const dateFinished = document.getElementById("dateFinished");

let editingBookId = null;

let selectedRating = null;

const stars = document.querySelectorAll(".star-rating span");

stars.forEach(star => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    stars.forEach(s =>
      s.classList.toggle("active", Number(s.dataset.value) <= selectedRating)
    );
  });
});

// ===== STORAGE HELPERS =====
function getBooks() {
  return JSON.parse(localStorage.getItem("books")) || [];
}

function saveBooks(books) {
  localStorage.setItem("books", JSON.stringify(books));
}

// ===== RENDERING =====
function renderBooks() {
  const books = getBooks();

  document.querySelectorAll(".tab-content").forEach(section => {
    section.innerHTML = "";
  });

  books.forEach(book => {
    const section = document.getElementById(book.status);

    if (!section) {
      console.error("No section found for status:", book.status);
      return;
    }

    const card = createBookCard(book);
    section.appendChild(card);
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

  card.innerHTML = `
    <strong>${book.title}</strong>
    <em>${book.author}</em>

    <div class="book-meta">
        <span>${book.format}</span>
        ${book.dateStarted ? `<span>Started: ${book.dateStarted}</span>` : ""}
        ${book.dateFinished ? `<span>Finished: ${book.dateFinished}</span>` : ""}
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

  return card;
}

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
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  const confirmReset = confirm("This will delete ALL books. Are you sure?");
  if (!confirmReset) return;

  localStorage.removeItem("books");
  renderBooks();
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
}

bookForm.addEventListener("submit", e => {
  e.preventDefault();

  const books = getBooks();

  if (editingBookId) {
    // EDIT
    const book = books.find(b => b.id === editingBookId);

    book.title = title.value.trim();
    book.author = author.value.trim();
    book.status = status.value;
    book.format = format.value;
    book.rating = rating.value ? Number(rating.value) : null;
    book.notes = notes.value;
    book.cover = cover.value || null;
    book.dateStarted = dateStarted.value || null;
    book.dateFinished = dateFinished.value || null;

    editingBookId = null;
  } else {
    // ADD
    books.push({
      id: crypto.randomUUID(),
      title: title.value.trim(),
      author: author.value.trim(),
      status: status.value,
      format: format.value,
      rating: selectedRating,
      notes: notes.value,
      cover: cover.value || null,
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
  status.value = book.status;
  format.value = book.format;
  rating.value = book.rating ?? "";
  notes.value = book.notes;
  cover.value = book.cover ?? "";
  dateStarted.value = book.dateStarted ?? "";
  dateFinished.value = book.dateFinished ?? "";

  modal.classList.remove("hidden");
}

renderBooks();