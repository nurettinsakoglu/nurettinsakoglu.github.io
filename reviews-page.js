(() => {
  if (!Array.isArray(window.REVIEWS) || !window.I18N) return;

  const pageSize = 18;
  const searchInput = document.getElementById("review-search");
  const yearFilter = document.getElementById("year-filter");
  const reviewCount = document.getElementById("review-count");
  const reviewGrid = document.getElementById("all-reviews");
  const pagination = document.getElementById("pagination");
  const noResults = document.getElementById("no-results");
  let currentPage = 1;

  const years = [...new Set(window.REVIEWS.map((review) => review.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.append(option);
  });

  function normalized(value) {
    return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function filteredReviews() {
    const query = normalized(searchInput.value.trim());
    const selectedYear = yearFilter.value;
    return window.REVIEWS.filter((review) => {
      const yearMatches = selectedYear === "all" || review.date.startsWith(selectedYear);
      const textMatches = !query || normalized(`${review.name} ${review.text} ${review.topics}`).includes(query);
      return yearMatches && textMatches;
    });
  }

  function makePageButton(label, page, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = Boolean(options.disabled);
    if (options.current) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => {
      currentPage = page;
      render();
      document.getElementById("review-list").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  }

  function renderPagination(totalPages) {
    pagination.replaceChildren();
    if (totalPages <= 1) return;
    const dictionary = window.I18N.dictionary;
    pagination.append(makePageButton(dictionary.previous, Math.max(1, currentPage - 1), { disabled: currentPage === 1 }));
    for (let page = 1; page <= totalPages; page += 1) {
      pagination.append(makePageButton(String(page), page, { current: page === currentPage }));
    }
    pagination.append(makePageButton(dictionary.next, Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages }));
  }

  function render() {
    const results = filteredReviews();
    const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visible = results.slice(start, start + pageSize);
    reviewGrid.replaceChildren(...visible.map((review) => window.I18N.makeReviewCard(review, true)));
    reviewCount.textContent = window.I18N.dictionary.resultCount.replace("{count}", String(results.length));
    noResults.hidden = results.length !== 0;
    renderPagination(totalPages);
  }

  function localizePage() {
    const dictionary = window.I18N.dictionary;
    const titleByLanguage = {
      tr: "Nurettin Sakoğlu Müşteri Yorumları | 304 Gerçek Deneyim",
      en: "Nurettin Sakoğlu Client Reviews | 304 Experiences",
      de: "Nurettin Sakoğlu Kundenbewertungen | 304 Erfahrungen",
      ar: "تقييمات عملاء نور الدين ساك أوغلو | 304 تجارب"
    };
    document.title = titleByLanguage[window.I18N.language];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = dictionary.reviewsPageLead;
    searchInput.placeholder = dictionary.searchPlaceholder;
    yearFilter.options[0].textContent = dictionary.yearAll;
    render();
  }

  searchInput.addEventListener("input", () => { currentPage = 1; render(); });
  yearFilter.addEventListener("change", () => { currentPage = 1; render(); });
  window.addEventListener("site-language-change", localizePage);
  localizePage();
})();
