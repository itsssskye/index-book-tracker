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

// ===== CREATE CARDS =====
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  card.innerHTML = `
    <strong>${book.title}</strong><br>
    <em>${book.author}</em><br>
    <small>${book.format}</small>
    ${book.dateStarted ? `<br><small>Started: ${book.dateStarted}</small>` : ""}
    ${book.dateFinished ? `<br><small>Finished: ${book.dateFinished}</small>` : ""}
  `;

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
  const confirmReset = confirm("Clear all saved books?");
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
}

bookForm.addEventListener("submit", e => {
  e.preventDefault();

  const newBook = {
    id: crypto.randomUUID(),
    title: title.value.trim(),
    author: author.value.trim(),
    status: status.value,
    format: format.value,
    rating: rating.value ? Number(rating.value) : null,
    notes: notes.value,
    cover: cover.value || null,
    dateStarted: dateStarted.value || null,
    dateFinished: dateFinished.value || null
  };

  const books = getBooks();
  books.push(newBook);
  saveBooks(books);

  renderBooks();
  closeModal();
});

renderBooks();