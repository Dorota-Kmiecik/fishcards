const STORAGE_KEY = "fishki-data-v1";

const icons = {
  fish: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M22.6 9.4c-5.5-3.2-11.9-.8-15.2 5.5-1.1-1.7-2.8-3.1-5.3-3.7.1 4.3 1.2 7.2 5.2 9.4 3.6 5.3 10.4 6.2 15.3 2.5 2.2-1.7 4-4 6.8-6.9-2.5-2.9-4.5-5.3-6.8-6.8Z" fill="currentColor"/><circle cx="21.5" cy="14.2" r="1.5" fill="white"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3.5 6.5h6l2 2h9v10.5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5Z"/><path d="M3.5 9h17"/></svg>`,
  cards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="5" y="4" width="15" height="16" rx="2"/><path d="m5 7-1.3.3A2 2 0 0 0 2.2 9.7l2.3 8.8"/><path d="M9 9h7M9 13h5"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/></svg>`,
  arrow: `<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m5 12 4 4L19 6"/></svg>`,
  circle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>`,
  flip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 7v5h-5"/><path d="M4.8 9a8 8 0 0 1 13-3l2.2 2M4 17v-5h5"/><path d="M19.2 15a8 8 0 0 1-13 3L4 16"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 2 1.5 5.3L19 9l-5.5 1.7L12 16l-1.5-5.3L5 9l5.5-1.7L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>`,
};

const state = {
  data: loadData(),
  route: { page: "home", folderId: null, setId: null },
  modal: null,
  draftCards: [],
  study: null,
};

function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed?.folders && Array.isArray(parsed.folders)) return parsed;
  } catch (_) {}
  return { folders: [] };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value = "") {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function getFolder(folderId = state.route.folderId) {
  return state.data.folders.find((folder) => folder.id === folderId);
}

function getSet(folder = getFolder(), setId = state.route.setId) {
  return folder?.sets.find((set) => set.id === setId);
}

function stats(set) {
  return set.cards.reduce((acc, card) => {
    if (card.status === "known") acc.known++;
    if (card.status === "unknown") acc.unknown++;
    return acc;
  }, { known: 0, unknown: 0 });
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.querySelector("#toast-region").append(node);
  setTimeout(() => node.remove(), 2600);
}

function appHeader() {
  return `<header class="topbar">
    <button class="brand" data-action="go-home" aria-label="Przejdź na stronę główną">
      <span class="brand-mark">${icons.fish}</span><span>Fishki</span>
    </button>
  </header>`;
}

function render() {
  const app = document.querySelector("#app");
  if (state.route.page === "study") {
    app.innerHTML = renderStudy();
  } else {
    const content = state.route.page === "home" ? renderHome()
      : state.route.page === "folder" ? renderFolder()
      : renderSetDetails();
    app.innerHTML = `<div class="shell">${appHeader()}${content}</div>${renderModal()}`;
  }
  bindEvents();
}

function renderHome() {
  const folders = state.data.folders;
  const setCount = folders.reduce((sum, folder) => sum + folder.sets.length, 0);
  return `<main class="page">
    <section>
      <div class="section-head home-section-head">
        <h1 class="library-title">Moje foldery <span class="count">${folders.length} ${plural(folders.length, "folder", "foldery", "folderów")} · ${setCount} ${plural(setCount, "zestaw", "zestawy", "zestawów")}</span></h1>
        <button class="btn btn-primary" data-action="open-folder-modal">${icons.plus}<span>Nowy folder</span></button>
      </div>
      ${folders.length ? `<div class="grid">${folders.map(folderCard).join("")}</div>` : emptyState("folder")}
    </section>
  </main>`;
}

function folderCard(folder) {
  const cardCount = folder.sets.reduce((sum, set) => sum + set.cards.length, 0);
  return `<article class="folder-card" data-action="open-folder" data-id="${folder.id}" tabindex="0">
    <div class="card-top">
      <span class="folder-icon">${icons.folder}</span>
      <button class="icon-btn" data-action="delete-folder" data-id="${folder.id}" aria-label="Usuń folder ${escapeHtml(folder.name)}">${icons.trash}</button>
    </div>
    <h3>${escapeHtml(folder.name)}</h3>
    <div class="meta">${folder.sets.length} ${plural(folder.sets.length, "zestaw", "zestawy", "zestawów")} · ${cardCount} ${plural(cardCount, "fiszka", "fiszki", "fiszek")}</div>
    <div class="card-footer"><span class="open-label">Otwórz folder</span>${icons.arrow}</div>
  </article>`;
}

function renderFolder() {
  const folder = getFolder();
  if (!folder) { state.route = { page: "home", folderId: null, setId: null }; return renderHome(); }
  return `<main class="page">
    <nav class="page-nav" aria-label="Nawigacja"><button class="btn btn-secondary" data-action="go-home">${icons.back} Menu główne</button></nav>
    <section class="hero">
      <div><p class="eyebrow">Folder</p><h1>${escapeHtml(folder.name)}</h1><p class="hero-copy">Wybierz zestaw, aby przejrzeć słówka, albo rozpocznij nowy.</p></div>
      <div class="hero-actions"><button class="btn btn-primary btn-large" data-action="open-set-modal">${icons.plus}<span>Nowy zestaw</span></button></div>
    </section>
    <section>
      <div class="section-head"><h2>Zestawy <span class="count">${folder.sets.length}</span></h2></div>
      ${folder.sets.length ? `<div class="grid">${folder.sets.map(setCard).join("")}</div>` : emptyState("set")}
    </section>
  </main>`;
}

function setCard(set) {
  const { known, unknown } = stats(set);
  const answered = known + unknown;
  const percent = set.cards.length ? Math.round((known / set.cards.length) * 100) : 0;
  return `<article class="set-card" data-action="open-set" data-id="${set.id}" tabindex="0">
    <div class="card-top"><span class="set-icon">${icons.cards}</span><button class="icon-btn" data-action="delete-set" data-id="${set.id}" aria-label="Usuń zestaw ${escapeHtml(set.name)}">${icons.trash}</button></div>
    <h3>${escapeHtml(set.name)}</h3>
    <div class="meta">${set.cards.length} ${plural(set.cards.length, "fiszka", "fiszki", "fiszek")}</div>
    <div class="card-footer" style="display:block">
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
      <div class="set-stats"><span><span class="stat-dot good" style="display:inline-block"></span> ${known} umiem</span><span><span class="stat-dot bad" style="display:inline-block"></span> ${unknown} do powtórki</span>${answered === 0 ? `<span>Jeszcze nieprzerobione</span>` : ""}</div>
    </div>
  </article>`;
}

function renderSetDetails() {
  const folder = getFolder();
  const set = getSet(folder);
  if (!folder || !set) { state.route = { page: "home", folderId: null, setId: null }; return renderHome(); }
  const { known, unknown } = stats(set);
  return `<main class="page">
    <nav class="page-nav" aria-label="Nawigacja">
      <button class="btn btn-secondary" data-action="go-home">${icons.fish} Menu główne</button>
      <button class="btn btn-secondary" data-action="back-folder">${icons.back} Wróć do folderu „${escapeHtml(folder.name)}”</button>
    </nav>
    <section class="hero">
      <div><p class="eyebrow">Zestaw fiszek</p><h1>${escapeHtml(set.name)}</h1><p class="hero-copy">Przejrzyj swoje słówka i sprawdź postępy w nauce.</p></div>
      <div class="hero-actions"><button class="btn btn-primary btn-large" data-action="open-study" ${set.cards.length ? "" : "disabled"}>${icons.play}<span>Rozpocznij naukę</span></button></div>
    </section>
    <div class="detail-layout">
      <section class="panel list-panel">
        <div class="list-toolbar"><h2>Lista słówek <span class="count">${set.cards.length}</span></h2><button class="btn btn-secondary" data-action="open-card-modal">${icons.plus}<span>Dodaj słówko</span></button></div>
        ${set.cards.length ? `<ul class="word-list">${set.cards.map(wordRow).join("")}</ul>` : `<div class="empty-state" style="border:0"><div class="empty-illustration">${icons.cards}</div><h3>Dodaj pierwszą fiszkę</h3><p>Wpisz słowo i jego tłumaczenie, aby zacząć budować ten zestaw.</p><button class="btn btn-primary" data-action="open-card-modal">${icons.plus} Dodaj słówko</button></div>`}
      </section>
      <aside class="panel side-panel">
        <h3>Twój postęp</h3><p>Wyniki aktualizują się po każdej odpowiedzi podczas nauki.</p>
        <div class="summary-stat"><span>Wszystkie fiszki</span><strong>${set.cards.length}</strong></div>
        <div class="summary-stat"><span>Umiem</span><strong style="color:var(--green)">${known}</strong></div>
        <div class="summary-stat"><span>Do powtórki</span><strong style="color:var(--coral)">${unknown}</strong></div>
        <div class="side-divider"></div>
        <button class="btn btn-secondary" data-action="clear-results" ${known + unknown ? "" : "disabled"}>Wyczyść wszystko</button>
      </aside>
    </div>
  </main>`;
}

function wordRow(card) {
  const statusClass = card.status === "known" ? "status-known" : card.status === "unknown" ? "status-unknown" : "status-new";
  const statusIcon = card.status === "known" ? icons.check : card.status === "unknown" ? icons.close : icons.circle;
  const label = card.status === "known" ? "Umiem" : card.status === "unknown" ? "Do powtórki" : "Jeszcze nieprzerobione";
  return `<li class="word-row">
    <span class="status-icon ${statusClass}" title="${label}" aria-label="${label}">${statusIcon}</span>
    <span class="word-primary">${escapeHtml(card.front)}</span><span class="word-secondary">${escapeHtml(card.back)}</span>
    <button class="icon-btn" data-action="delete-card" data-id="${card.id}" aria-label="Usuń fiszkę">${icons.trash}</button>
  </li>`;
}

function emptyState(type) {
  const isFolder = type === "folder";
  return `<div class="empty-state"><div class="empty-illustration">${isFolder ? icons.folder : icons.cards}</div><h3>${isFolder ? "Tu pojawią się Twoje foldery" : "Ten folder czeka na pierwszy zestaw"}</h3><p>${isFolder ? "Utwórz folder, na przykład „Hiszpański”, i uporządkuj w nim wszystkie swoje zestawy." : "Dodaj zestaw, nazwij go i wpisz pierwsze słówka z tłumaczeniami."}</p><button class="btn btn-primary" data-action="${isFolder ? "open-folder-modal" : "open-set-modal"}">${icons.plus} ${isFolder ? "Utwórz folder" : "Utwórz zestaw"}</button></div>`;
}

function renderModal() {
  if (!state.modal) return "";
  if (state.modal === "folder") return nameModal("Nowy folder", "Jak chcesz nazwać folder?", "Np. Hiszpański", "create-folder", "Utwórz folder");
  if (state.modal === "set") return nameModal("Nowy zestaw", "Nadaj zestawowi krótką, łatwą do rozpoznania nazwę.", "Np. Jedzenie i restauracja", "start-set", "Dalej");
  if (state.modal === "cards-wizard") return cardsWizard();
  if (state.modal === "card") return cardModal();
  if (state.modal === "study-mode") return studyModeModal();
  if (state.modal === "finish") return finishModal();
  return "";
}

function nameModal(title, copy, placeholder, action, button) {
  return modalWrap(`<div class="modal-head"><div><h2>${title}</h2><p class="modal-copy">${copy}</p></div><button class="icon-btn close-btn" data-action="close-modal" aria-label="Zamknij">${icons.close}</button></div>
    <form data-form="${action}"><div class="field"><label for="name-input">Nazwa</label><input class="input" id="name-input" name="name" maxlength="60" placeholder="${placeholder}" autocomplete="off" autofocus /></div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Anuluj</button><button class="btn btn-primary" type="submit">${button}</button></div></form>`);
}

function cardsWizard() {
  return modalWrap(`<div class="modal-head"><div><p class="eyebrow">Nowy zestaw</p><h2>${escapeHtml(state.pendingSetName || "")}</h2><p class="modal-copy">Dodaj słowo i jego tłumaczenie. Możesz od razu wpisać kolejne.</p></div><button class="icon-btn close-btn" data-action="cancel-wizard" aria-label="Zamknij">${icons.close}</button></div>
    <form data-form="add-draft-card">
      <div class="field"><label for="front-input">Słowo</label><input class="input" id="front-input" name="front" maxlength="120" placeholder="Np. la ventana" autocomplete="off" autofocus /></div>
      <div class="field"><label for="back-input">Tłumaczenie</label><input class="input" id="back-input" name="back" maxlength="120" placeholder="Np. okno" autocomplete="off" /></div>
      <div class="modal-actions"><button class="btn btn-secondary" type="submit">${icons.plus} Dodaj nowe słówko</button><button class="btn btn-primary" type="button" data-action="create-set" ${state.draftCards.length ? "" : "disabled"}>Utwórz zestaw fiszek</button></div>
    </form>
    ${state.draftCards.length ? `<div class="draft-list">${state.draftCards.map((card, index) => `<div class="draft-row"><strong>${escapeHtml(card.front)}</strong><span class="draft-arrow">→</span><span>${escapeHtml(card.back)}</span><button class="icon-btn" data-action="delete-draft" data-index="${index}" aria-label="Usuń">${icons.trash}</button></div>`).join("")}</div>` : ""}`,
    "modal-wide");
}

function cardModal() {
  return modalWrap(`<div class="modal-head"><div><h2>Dodaj nowe słówko</h2><p class="modal-copy">Utwórz kolejną fiszkę w tym zestawie.</p></div><button class="icon-btn close-btn" data-action="close-modal" aria-label="Zamknij">${icons.close}</button></div>
    <form data-form="create-card"><div class="field"><label for="front-input">Słowo</label><input class="input" id="front-input" name="front" maxlength="120" placeholder="Wpisz słowo" autocomplete="off" autofocus /></div><div class="field"><label for="back-input">Tłumaczenie</label><input class="input" id="back-input" name="back" maxlength="120" placeholder="Wpisz tłumaczenie" autocomplete="off" /></div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Anuluj</button><button class="btn btn-primary" type="submit">Dodaj fiszkę</button></div></form>`);
}

function studyModeModal() {
  return modalWrap(`<div class="modal-head"><div><h2>Jak chcesz się uczyć?</h2><p class="modal-copy">Wybierz, co zobaczysz jako pierwsze na fiszce.</p></div><button class="icon-btn close-btn" data-action="close-modal" aria-label="Zamknij">${icons.close}</button></div>
    <div class="mode-options">
      ${modeOption("front", "A", "Najpierw słówko", "Odgadujesz tłumaczenie")}
      ${modeOption("back", "文", "Najpierw tłumaczenie", "Odgadujesz słowo")}
      ${modeOption("mixed", "↕", "Tryb mieszany", "Strony zmieniają się losowo")}
    </div>
    <div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Anuluj</button><button class="btn btn-primary" data-action="start-study">${icons.play} Rozpocznij naukę</button></div>`);
}

function modeOption(value, letter, title, copy) {
  const selected = (state.studyMode || "front") === value;
  return `<div class="mode-option ${selected ? "selected" : ""}" data-action="select-mode" data-mode="${value}" role="radio" aria-checked="${selected}"><span class="mode-icon">${letter}</span><span><strong>${title}</strong><small>${copy}</small></span><span class="radio"></span></div>`;
}

function modalWrap(content, className = "") {
  return `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${className}" role="dialog" aria-modal="true">${content}</section></div>`;
}

function renderStudy() {
  const study = state.study;
  if (!study) return "";
  const card = study.cards[study.index];
  const showFront = study.sides[study.index] === "front";
  const first = showFront ? card.front : card.back;
  const second = showFront ? card.back : card.front;
  const modeLabels = { front: "Najpierw słówko", back: "Najpierw tłumaczenie", mixed: "Tryb mieszany" };
  return `<main class="study-shell">
    <header class="study-top">
      <button class="icon-btn" data-action="exit-study" aria-label="Zakończ naukę">${icons.close}</button>
      <div><div class="study-progress-text">Fiszka ${study.index + 1} z ${study.cards.length}</div><div class="progress-track"><div class="progress-fill" style="width:${((study.index + 1) / study.cards.length) * 100}%"></div></div></div>
      <span class="study-mode">${modeLabels[study.mode]}</span>
    </header>
    <section class="study-main">
      <div class="study-kicker">${study.flipped ? "Oceń swoją odpowiedź" : "Spróbuj odpowiedzieć i odwróć fiszkę"}</div>
      <div class="flashcard ${study.flipped ? "flipped" : ""}" data-action="flip-card" tabindex="0" role="button" aria-label="Odwróć fiszkę">
        <div class="flashcard-inner">
          <div class="flash-face flash-front"><span class="flash-label">${showFront ? "Słówko" : "Tłumaczenie"}</span><span class="flash-text">${escapeHtml(first)}</span><span class="flip-hint">${icons.flip} Kliknij, aby odwrócić</span></div>
          <div class="flash-face flash-back"><span class="flash-label">${showFront ? "Tłumaczenie" : "Słówko"}</span><span class="flash-text">${escapeHtml(second)}</span><span class="flip-hint">${icons.flip} Kliknij, aby odwrócić</span></div>
        </div>
      </div>
      <div class="rating-actions">${study.flipped ? `<button class="rate-btn rate-wrong" data-action="rate" data-rating="unknown" aria-label="Nie wiedziałam">${icons.close}</button><button class="rate-btn rate-right" data-action="rate" data-rating="known" aria-label="Wiedziałam">${icons.check}</button>` : `<span class="reveal-note">Najpierw odwróć fiszkę, żeby zobaczyć odpowiedź</span>`}</div>
    </section>
    ${state.modal === "finish" ? finishModal() : ""}
  </main>`;
}

function finishModal() {
  const study = state.study;
  const wrong = study.roundWrong.length;
  const right = study.cards.length - wrong;
  return modalWrap(`<div class="finish-modal"><div class="finish-icon">${icons.spark}</div><h2>Runda ukończona!</h2><p class="modal-copy">Świetna robota. Każda powtórka przybliża Cię do celu.</p><div class="finish-stats"><div class="finish-stat"><strong style="color:var(--green)">${right}</strong><span>poprawnie</span></div><div class="finish-stat"><strong style="color:var(--coral)">${wrong}</strong><span>do powtórki</span></div></div><div class="modal-actions">${wrong ? `<button class="btn btn-secondary" data-action="repeat-wrong">Powtórz te, których nie wiedziałam</button>` : ""}<button class="btn btn-primary" data-action="finish-study">Zakończ naukę</button></div></div>`);
}

function plural(number, one, few, many) {
  if (number === 1) return one;
  if (number % 10 >= 2 && number % 10 <= 4 && !(number % 100 >= 12 && number % 100 <= 14)) return few;
  return many;
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", handleAction);
    if (element.matches("[tabindex='0']")) element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); element.click(); }
    });
  });
  document.querySelectorAll("form[data-form]").forEach((form) => form.addEventListener("submit", handleForm));
  const autofocus = document.querySelector("[autofocus]");
  if (autofocus) setTimeout(() => autofocus.focus(), 0);
}

function handleAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (action === "backdrop" && target !== event.target) return;
  if (["delete-folder", "delete-set", "delete-card", "delete-draft"].includes(action)) event.stopPropagation();
  if (action === "go-home") state.route = { page: "home", folderId: null, setId: null };
  if (action === "open-folder") state.route = { page: "folder", folderId: target.dataset.id, setId: null };
  if (action === "back-folder") state.route = { page: "folder", folderId: state.route.folderId, setId: null };
  if (action === "open-set") state.route = { ...state.route, page: "set", setId: target.dataset.id };
  if (action === "open-folder-modal") state.modal = "folder";
  if (action === "open-set-modal") state.modal = "set";
  if (action === "open-card-modal") state.modal = "card";
  if (action === "close-modal" || action === "backdrop") state.modal = null;
  if (action === "cancel-wizard") { state.modal = null; state.draftCards = []; state.pendingSetName = ""; }
  if (action === "delete-folder") deleteFolder(target.dataset.id);
  if (action === "delete-set") deleteSet(target.dataset.id);
  if (action === "delete-card") deleteCard(target.dataset.id);
  if (action === "delete-draft") state.draftCards.splice(Number(target.dataset.index), 1);
  if (action === "create-set") createSet();
  if (action === "clear-results") clearResults();
  if (action === "open-study") { state.studyMode = "front"; state.modal = "study-mode"; }
  if (action === "select-mode") state.studyMode = target.dataset.mode;
  if (action === "start-study") startStudy();
  if (action === "flip-card") { state.study.flipped = !state.study.flipped; }
  if (action === "rate") rateCard(target.dataset.rating);
  if (action === "repeat-wrong") repeatWrong();
  if (action === "finish-study" || action === "exit-study") finishStudy();
  render();
}

function handleForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const type = form.dataset.form;
  if (type === "create-folder") {
    if (!values.name.trim()) return showFormError(form, "Wpisz nazwę folderu.");
    state.data.folders.push({ id: id(), name: values.name.trim(), sets: [] });
    saveData(); state.modal = null; toast("Folder został utworzony");
  }
  if (type === "start-set") {
    if (!values.name.trim()) return showFormError(form, "Wpisz nazwę zestawu.");
    state.pendingSetName = values.name.trim(); state.draftCards = []; state.modal = "cards-wizard";
  }
  if (type === "add-draft-card") {
    if (!values.front.trim() || !values.back.trim()) return showFormError(form, "Uzupełnij słowo i tłumaczenie.");
    state.draftCards.push({ id: id(), front: values.front.trim(), back: values.back.trim(), status: null });
    form.reset();
  }
  if (type === "create-card") {
    if (!values.front.trim() || !values.back.trim()) return showFormError(form, "Uzupełnij słowo i tłumaczenie.");
    getSet().cards.push({ id: id(), front: values.front.trim(), back: values.back.trim(), status: null });
    saveData(); state.modal = null; toast("Fiszka została dodana");
  }
  render();
}

function showFormError(form, message) {
  form.querySelector(".form-error")?.remove();
  const error = document.createElement("p");
  error.className = "form-error"; error.textContent = message;
  form.querySelector(".modal-actions").before(error);
}

function createSet() {
  if (!state.draftCards.length) return;
  const set = { id: id(), name: state.pendingSetName, cards: [...state.draftCards] };
  getFolder().sets.push(set); saveData();
  state.route = { ...state.route, page: "set", setId: set.id };
  state.modal = null; state.draftCards = []; state.pendingSetName = ""; toast("Zestaw fiszek jest gotowy");
}

function deleteFolder(folderId) {
  const folder = state.data.folders.find((item) => item.id === folderId);
  if (folder && confirm(`Usunąć folder „${folder.name}” razem ze wszystkimi zestawami?`)) {
    state.data.folders = state.data.folders.filter((item) => item.id !== folderId); saveData(); toast("Folder został usunięty");
  }
}

function deleteSet(setId) {
  const folder = getFolder(); const set = getSet(folder, setId);
  if (set && confirm(`Usunąć zestaw „${set.name}”?`)) { folder.sets = folder.sets.filter((item) => item.id !== setId); saveData(); toast("Zestaw został usunięty"); }
}

function deleteCard(cardId) {
  const set = getSet(); const card = set.cards.find((item) => item.id === cardId);
  if (card && confirm(`Usunąć fiszkę „${card.front}”?`)) { set.cards = set.cards.filter((item) => item.id !== cardId); saveData(); toast("Fiszka została usunięta"); }
}

function clearResults() {
  if (!confirm("Wyczyścić wszystkie wyniki w tym zestawie i zacząć od początku?")) return;
  getSet().cards.forEach((card) => card.status = null); saveData(); toast("Wyniki zostały wyczyszczone");
}

function startStudy() {
  const mode = state.studyMode || "front";
  const cards = shuffle([...getSet().cards]);
  state.study = { cards, index: 0, mode, sides: cards.map(() => mode === "mixed" ? (Math.random() < .5 ? "front" : "back") : mode), flipped: false, roundWrong: [] };
  state.modal = null; state.route.page = "study";
}

function rateCard(rating) {
  if (!state.study.flipped) return;
  const card = state.study.cards[state.study.index];
  const original = getSet().cards.find((item) => item.id === card.id);
  if (original) original.status = rating;
  if (rating === "unknown" && !state.study.roundWrong.some((item) => item.id === card.id)) state.study.roundWrong.push(card);
  if (rating === "known") state.study.roundWrong = state.study.roundWrong.filter((item) => item.id !== card.id);
  saveData();
  if (state.study.index + 1 >= state.study.cards.length) state.modal = "finish";
  else { state.study.index++; state.study.flipped = false; }
}

function repeatWrong() {
  const cards = shuffle([...state.study.roundWrong]);
  const mode = state.study.mode;
  state.study = { cards, index: 0, mode, sides: cards.map(() => mode === "mixed" ? (Math.random() < .5 ? "front" : "back") : mode), flipped: false, roundWrong: [] };
  state.modal = null;
}

function finishStudy() {
  state.route = { page: "set", folderId: state.route.folderId, setId: state.route.setId };
  state.modal = null; state.study = null;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  return items;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (state.route.page === "study") finishStudy(); else state.modal = null;
    render();
  }
});

render();
