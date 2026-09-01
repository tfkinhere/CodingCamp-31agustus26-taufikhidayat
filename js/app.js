/* =============================================
   DASHBOARD PRODUKTIVITAS
   app.js — satu file JS untuk semua fitur
   ============================================= */

// ─────────────────────────────────────────────
// 0. LIGHT / DARK MODE
// ─────────────────────────────────────────────

const STORAGE_THEME = "dashboard_theme";

/**
 * Terapkan tema ke <html> dan perbarui ikon tombol.
 * @param {"dark"|"light"} tema
 */
function applyTheme(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  document.getElementById("theme-icon").textContent = tema === "dark" ? "🌙" : "☀️";
  localStorage.setItem(STORAGE_THEME, tema);
}

// Muat tema tersimpan, atau gunakan dark sebagai default
applyTheme(localStorage.getItem(STORAGE_THEME) || "dark");

document.getElementById("btn-theme").addEventListener("click", () => {
  const temaSaat = document.documentElement.getAttribute("data-theme");
  applyTheme(temaSaat === "dark" ? "light" : "dark");
});


// ─────────────────────────────────────────────
// 1. GREETING & WAKTU
// ─────────────────────────────────────────────

const STORAGE_NAME = "dashboard_username";

/**
 * Ambil nama tersimpan atau kembalikan string kosong.
 * @returns {string}
 */
function getNama() {
  return localStorage.getItem(STORAGE_NAME) || "";
}

/**
 * Kembalikan teks sapa berdasarkan jam saat ini.
 * @param {number} jam - 0–23
 * @returns {string}
 */
function getGreeting(jam) {
  if (jam >= 4 && jam < 12)  return "Selamat Pagi";
  if (jam >= 12 && jam < 15) return "Selamat Siang";
  if (jam >= 15 && jam < 19) return "Selamat Sore";
  return "Selamat Malam";
}

/**
 * Format angka menjadi dua digit, misal 9 → "09".
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Render ulang teks greeting dengan nama (jika ada).
 * Nama di-render sebagai <span> yang bisa diklik.
 */
function renderGreeting(jam) {
  const nama = getNama();
  const sapaText = getGreeting(jam);
  const el = document.getElementById("greeting-text");

  if (nama) {
    el.innerHTML = `${sapaText}, <span class="user-name" id="user-name-span" title="Klik untuk ubah nama">${escapeHtml(nama)}</span>! 👋`;
  } else {
    el.innerHTML = `${sapaText}! 👋 <span class="user-name" id="user-name-span" title="Klik untuk set nama kamu">Siapa namamu?</span>`;
  }

  // Pasang listener klik pada span nama
  document.getElementById("user-name-span").addEventListener("click", mulaiEditNama);
}

/**
 * Tampilkan input untuk mengedit nama pengguna.
 */
function mulaiEditNama() {
  const span = document.getElementById("user-name-span");
  if (!span) return;

  // Cegah double-edit
  if (document.getElementById("name-edit-input")) return;

  const namaLama = getNama();
  const input = document.createElement("input");
  input.type        = "text";
  input.id          = "name-edit-input";
  input.className   = "name-edit-input";
  input.placeholder = "Nama kamu...";
  input.value       = namaLama;
  input.maxLength   = 30;

  // Sembunyikan hint selama edit
  const hintEl = document.getElementById("name-hint");
  hintEl.style.opacity = "0";

  span.replaceWith(input);
  input.focus();
  input.select();

  function simpanNama() {
    const namaBaru = input.value.trim();
    if (namaBaru) {
      localStorage.setItem(STORAGE_NAME, namaBaru);
    } else {
      // Kosongkan nama jika input dikosongkan
      localStorage.removeItem(STORAGE_NAME);
    }
    hintEl.style.opacity = "1";
    renderGreeting(new Date().getHours());
  }

  input.addEventListener("blur",    simpanNama);
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter")  { input.blur(); }
    if (ev.key === "Escape") {
      // Batalkan perubahan
      localStorage.setItem(STORAGE_NAME, namaLama);
      hintEl.style.opacity = "1";
      renderGreeting(new Date().getHours());
    }
  });
}

/**
 * Perbarui tampilan jam dan tanggal setiap detik.
 * Greeting di-render terpisah agar tidak mengganggu input edit nama.
 */
function updateClock() {
  const sekarang = new Date();
  const jam   = sekarang.getHours();
  const menit = sekarang.getMinutes();
  const detik = sekarang.getSeconds();

  // Tampilan jam
  document.getElementById("current-time").textContent =
    `${pad(jam)}:${pad(menit)}:${pad(detik)}`;

  // Tampilan tanggal
  const opsiTanggal = {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  };
  document.getElementById("current-date").textContent =
    sekarang.toLocaleDateString("id-ID", opsiTanggal);

  // Render greeting hanya jika tidak sedang diedit
  if (!document.getElementById("name-edit-input")) {
    renderGreeting(jam);
  }
}

// Jalankan langsung lalu setiap detik
updateClock();
setInterval(updateClock, 1000);


// ─────────────────────────────────────────────
// 2. FOCUS TIMER (25 menit)
// ─────────────────────────────────────────────

const DURASI_DEFAULT = 25 * 60; // detik

let timerSisa       = DURASI_DEFAULT;
let timerInterval   = null;
let timerBerjalan   = false;

const elDisplay = document.getElementById("timer-display");
const btnStart  = document.getElementById("btn-start");
const btnStop   = document.getElementById("btn-stop");
const btnReset  = document.getElementById("btn-reset");

/**
 * Render angka timer ke layar.
 */
function renderTimer() {
  const m = Math.floor(timerSisa / 60);
  const s = timerSisa % 60;
  elDisplay.textContent = `${pad(m)}:${pad(s)}`;
}

/**
 * Perbarui kelas CSS pada display timer sesuai status.
 */
function updateTimerClass() {
  elDisplay.classList.toggle("running", timerBerjalan && timerSisa > 0);
  elDisplay.classList.toggle("finished", timerSisa === 0);
}

/**
 * Mulai timer.
 */
function startTimer() {
  if (timerBerjalan || timerSisa === 0) return;

  timerBerjalan = true;
  updateTimerClass();

  timerInterval = setInterval(() => {
    timerSisa -= 1;
    renderTimer();

    if (timerSisa <= 0) {
      timerSisa     = 0;
      timerBerjalan = false;
      clearInterval(timerInterval);
      updateTimerClass();
      // Notifikasi sederhana
      if (Notification.permission === "granted") {
        new Notification("⏰ Fokus selesai!", { body: "Waktunya istirahat sebentar." });
      }
    }
  }, 1000);
}

/**
 * Berhentikan (pause) timer.
 */
function stopTimer() {
  if (!timerBerjalan) return;
  timerBerjalan = false;
  clearInterval(timerInterval);
  updateTimerClass();
}

/**
 * Reset timer ke durasi default.
 */
function resetTimer() {
  stopTimer();
  timerSisa = DURASI_DEFAULT;
  renderTimer();
  updateTimerClass();
}

btnStart.addEventListener("click", startTimer);
btnStop.addEventListener("click",  stopTimer);
btnReset.addEventListener("click", resetTimer);

// Minta izin notifikasi (opsional, tidak memblokir)
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// Render awal
renderTimer();


// ─────────────────────────────────────────────
// 3. TO-DO LIST
// ─────────────────────────────────────────────

const STORAGE_TODO = "dashboard_todos";

/**
 * Ambil daftar tugas dari localStorage.
 * @returns {Array<{id: string, teks: string, selesai: boolean}>}
 */
function getTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_TODO)) || [];
  } catch {
    return [];
  }
}

/**
 * Simpan daftar tugas ke localStorage.
 * @param {Array} todos
 */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_TODO, JSON.stringify(todos));
}

/**
 * Buat ID unik sederhana.
 * @returns {string}
 */
function buatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Render ulang seluruh daftar tugas ke DOM.
 */
function renderTodos() {
  const todos  = getTodos();
  const listEl = document.getElementById("todo-list");
  const emptyEl = document.getElementById("todo-empty");

  listEl.innerHTML = "";

  if (todos.length === 0) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.selesai ? " done" : ""}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input
        type="checkbox"
        class="todo-checkbox"
        ${todo.selesai ? "checked" : ""}
        aria-label="Tandai selesai"
      />
      <span class="todo-text">${escapeHtml(todo.teks)}</span>
      <div class="todo-actions">
        <button class="btn-icon btn-edit" title="Edit tugas">✏️</button>
        <button class="btn-danger btn-delete" title="Hapus tugas">🗑</button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

/**
 * Escape karakter HTML untuk mencegah XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Tambah tugas baru
document.getElementById("todo-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input     = document.getElementById("todo-input");
  const dupEl     = document.getElementById("todo-duplicate");
  const teks      = input.value.trim();
  if (!teks) return;

  const todos = getTodos();

  // ── Cek duplikat (case-insensitive) ──
  const duplikat = todos.find(
    (t) => t.teks.toLowerCase() === teks.toLowerCase()
  );

  if (duplikat) {
    // Tampilkan pesan dan animasikan item yang sudah ada
    dupEl.textContent = `⚠️ Tugas "${teks}" sudah ada dalam daftar!`;

    // Cari elemen li yang duplikat dan shake
    const liDuplikat = document.querySelector(
      `#todo-list .todo-item[data-id="${duplikat.id}"]`
    );
    if (liDuplikat) {
      liDuplikat.classList.remove("shake");
      // Trigger reflow agar animasi bisa diulang
      void liDuplikat.offsetWidth;
      liDuplikat.classList.add("shake");
      liDuplikat.addEventListener("animationend", () => {
        liDuplikat.classList.remove("shake");
      }, { once: true });
    }

    // Hapus pesan setelah 3 detik
    clearTimeout(input._dupTimer);
    input._dupTimer = setTimeout(() => {
      dupEl.textContent = "";
    }, 3000);

    input.select();
    return;
  }

  // Bersihkan pesan duplikat jika ada
  dupEl.textContent = "";

  todos.push({ id: buatId(), teks, selesai: false });
  saveTodos(todos);
  renderTodos();
  input.value = "";
  input.focus();
});

// Delegasi event untuk checkbox, edit, hapus
document.getElementById("todo-list").addEventListener("click", (e) => {
  const li = e.target.closest(".todo-item");
  if (!li) return;
  const id = li.dataset.id;

  // ── Tandai selesai / belum ──
  if (e.target.classList.contains("todo-checkbox")) {
    const todos = getTodos();
    const item  = todos.find((t) => t.id === id);
    if (item) {
      item.selesai = e.target.checked;
      saveTodos(todos);
      renderTodos();
    }
    return;
  }

  // ── Hapus ──
  if (e.target.classList.contains("btn-delete")) {
    const todos = getTodos().filter((t) => t.id !== id);
    saveTodos(todos);
    renderTodos();
    return;
  }

  // ── Edit (ubah span → input) ──
  if (e.target.classList.contains("btn-edit")) {
    const spanEl = li.querySelector(".todo-text");
    if (!spanEl) return;

    // Jika sudah ada input edit, abaikan
    if (li.querySelector(".todo-edit-input")) return;

    const teksLama = spanEl.textContent;
    const editInput = document.createElement("input");
    editInput.type      = "text";
    editInput.className = "todo-edit-input";
    editInput.value     = teksLama;
    editInput.maxLength = 100;

    spanEl.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    function simpanEdit() {
      const teksBar = editInput.value.trim();
      if (teksBar && teksBar.toLowerCase() !== teksLama.toLowerCase()) {
        const todos = getTodos();
        // Cek duplikat dengan tugas lain (kecuali dirinya sendiri)
        const duplikat = todos.find(
          (t) => t.id !== id && t.teks.toLowerCase() === teksBar.toLowerCase()
        );
        if (duplikat) {
          editInput.style.borderColor = "var(--warning)";
          editInput.title = `⚠️ Tugas "${teksBar}" sudah ada!`;
          editInput.select();
          return; // Jangan simpan, biarkan user edit lagi
        }
        const item = todos.find((t) => t.id === id);
        if (item) {
          item.teks = teksBar;
          saveTodos(todos);
        }
      }
      renderTodos();
    }

    editInput.addEventListener("blur",  simpanEdit);
    editInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") simpanEdit();
      if (ev.key === "Escape") renderTodos(); // batalkan
    });
  }
});

// Render awal
renderTodos();


// ─────────────────────────────────────────────
// 4. QUICK LINKS
// ─────────────────────────────────────────────

const STORAGE_LINKS = "dashboard_links";

/**
 * Ambil daftar tautan dari localStorage.
 * @returns {Array<{id: string, nama: string, url: string}>}
 */
function getLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_LINKS)) || [];
  } catch {
    return [];
  }
}

/**
 * Simpan daftar tautan ke localStorage.
 * @param {Array} links
 */
function saveLinks(links) {
  localStorage.setItem(STORAGE_LINKS, JSON.stringify(links));
}

/**
 * Buat URL favicon dari Google S2.
 * @param {string} url
 * @returns {string}
 */
function faviconUrl(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return "";
  }
}

/**
 * Render ulang semua chip tautan ke DOM.
 */
function renderLinks() {
  const links   = getLinks();
  const kontainer = document.getElementById("links-container");
  const emptyEl   = document.getElementById("links-empty");

  kontainer.innerHTML = "";

  if (links.length === 0) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  links.forEach((link) => {
    const chip = document.createElement("div");
    chip.className  = "link-chip";
    chip.dataset.id = link.id;

    const favicon = faviconUrl(link.url);
    chip.innerHTML = `
      ${favicon ? `<img class="link-favicon" src="${favicon}" alt="" loading="lazy" onerror="this.style.display='none'" />` : ""}
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(link.nama)}
      </a>
      <button class="link-delete" title="Hapus tautan" aria-label="Hapus ${escapeHtml(link.nama)}">✕</button>
    `;
    kontainer.appendChild(chip);
  });
}

// Tambah tautan baru
document.getElementById("link-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const namaInput = document.getElementById("link-name");
  const urlInput  = document.getElementById("link-url");
  const nama = namaInput.value.trim();
  const url  = urlInput.value.trim();

  if (!nama || !url) return;

  // Validasi URL dasar
  try {
    new URL(url);
  } catch {
    urlInput.setCustomValidity("URL tidak valid. Gunakan format https://...");
    urlInput.reportValidity();
    return;
  }
  urlInput.setCustomValidity("");

  const links = getLinks();
  links.push({ id: buatId(), nama, url });
  saveLinks(links);
  renderLinks();

  namaInput.value = "";
  urlInput.value  = "";
  namaInput.focus();
});

// Hapus tautan
document.getElementById("links-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("link-delete")) {
    const chip = e.target.closest(".link-chip");
    if (!chip) return;
    const id    = chip.dataset.id;
    const links = getLinks().filter((l) => l.id !== id);
    saveLinks(links);
    renderLinks();
  }
});

// Render awal
renderLinks();
