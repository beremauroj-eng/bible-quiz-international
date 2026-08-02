
(() => {
  "use strict";

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  toggle?.addEventListener("click", () => {
    if (!nav) return;
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const results = document.querySelector("[data-search-results]");
  if (!results) return;

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  const language = document.documentElement.lang.startsWith("es") ? "es" : "en";
  const input = document.querySelector("[name=q]");
  if (input) input.value = query;

  const normalise = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character]);

  if (!query) {
    results.innerHTML = `<div class="notice">${
      language === "es"
        ? "Escribe un libro, persona, lugar o tema para buscar."
        : "Enter a book, person, place or topic to search."
    }</div>`;
    return;
  }

  fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
      return response.json();
    })
    .then((items) => {
      const term = normalise(query);
      const matches = items
        .filter((item) => item.lang === language)
        .filter((item) =>
          normalise(`${item.title} ${item.description} ${item.keywords || ""}`).includes(term),
        )
        .slice(0, 40);

      results.innerHTML = matches.length
        ? matches
            .map(
              (item) =>
                `<a class="result" href="${escapeHtml(item.url)}"><strong>${escapeHtml(
                  item.title,
                )}</strong><p>${escapeHtml(item.description)}</p></a>`,
            )
            .join("")
        : `<div class="notice">${
            language === "es"
              ? "No encontramos resultados. Prueba con otro libro, persona o tema."
              : "No results found. Try another book, person or topic."
          }</div>`;
    })
    .catch(() => {
      results.innerHTML = `<div class="notice">${
        language === "es"
          ? "La búsqueda no está disponible temporalmente."
          : "Search is temporarily unavailable."
      }</div>`;
    });
})();
