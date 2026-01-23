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

addBookBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", closeModal);

function closeModal() {
  modal.classList.add("hidden");
  bookForm.reset();
}