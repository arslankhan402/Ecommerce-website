(function() {
    var searchBox = document.getElementById('search-box');
    var searchInput = document.getElementById('product-search');
    var clearBtn = document.querySelector('.search-clear');
    var toggleBtn = document.querySelector('.search-toggle');
    var productCards = Array.from(document.querySelectorAll('.product-grid .card'));
    var noResults = document.querySelector('.search-no-results');
    var hasCards = productCards.length > 0;

    function ensureNoResults() {
        if (noResults || !hasCards) return;
        var container = document.querySelector('main') || document.body;
        noResults = document.createElement('div');
        noResults.className = 'search-no-results';
        noResults.setAttribute('aria-live', 'polite');
        noResults.textContent = 'Item Not Found';
        if (container.firstElementChild) {
            container.insertBefore(noResults, container.firstElementChild);
        } else {
            container.appendChild(noResults);
        }
    }

    function refreshCards() {
        productCards = Array.from(document.querySelectorAll('.product-grid .card'));
        hasCards = productCards.length > 0;
    }

    function applyFilter() {
        refreshCards();
        if (!hasCards) return;
        ensureNoResults();
        var rawQuery = (searchInput && searchInput.value ? searchInput.value : '').trim();
        var q = rawQuery.toLowerCase();
        var qExact = rawQuery.replace(/\s+/g, ' ').trim().toLowerCase();
        var matches = 0;
        var sectionMatchMap = new Map();
        var firstVisibleCard = null;

        function setSectionMatch(section, hit) {
            if (!section) return;
            var current = sectionMatchMap.get(section) || 0;
            sectionMatchMap.set(section, current + (hit ? 1 : 0));
        }

        productCards.forEach(function(card) {
            var baseText = (card.dataset.product || '').toLowerCase();
            var baseExact = (card.dataset.product || '').replace(/\s+/g, ' ').trim().toLowerCase();
            var tags = (card.dataset.tags || '').toLowerCase();
            var category = (card.dataset.category || '').toLowerCase();
            var grid = card.closest('.product-grid');
            var gridSection = grid ? (grid.dataset.section || '') : '';
            var section = card.closest('section');
            var sectionId = section ? (section.id || '') : '';
            var sectionHeading = '';
            if (section) {
                var heading = section.querySelector('h2');
                sectionHeading = heading ? heading.textContent : '';
            }
            var title = '';
            var titleEl = card.querySelector('h3');
            if (titleEl) { title = titleEl.textContent; }
            var text = (baseText + ' ' + tags + ' ' + category + ' ' + gridSection + ' ' + sectionId + ' ' + sectionHeading + ' ' + title).toLowerCase();
            var isExtra = card.dataset.extra === 'true';
            var exactMatch = qExact && baseExact && qExact === baseExact;
            var hit = q ? (exactMatch || text.indexOf(q) !== -1) : !isExtra;
            card.classList.toggle('hidden', !hit);
            if (hit) { matches += 1; }
            setSectionMatch(section, hit);
            if (!firstVisibleCard && hit) { firstVisibleCard = card; }
        });

        var qActive = q.length > 0;
        document.querySelectorAll('section').forEach(function(section) {
            var hasGrid = section.querySelector('.product-grid');
            if (!qActive) {
                section.style.display = '';
                return;
            }
            if (!hasGrid) {
                section.style.display = 'none';
                return;
            }
            var hits = sectionMatchMap.get(section) || 0;
            section.style.display = hits ? '' : 'none';
        });

        ['.features', '.testimonials', '.trust', '.cta'].forEach(function(selector) {
            var block = document.querySelector(selector);
            if (!block) return;
            block.style.display = qActive ? 'none' : '';
        });

        if (noResults) { noResults.style.display = matches ? 'none' : 'block'; }
        if (qActive && matches && firstVisibleCard) {
            firstVisibleCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function redirectToExplore(query) {
        if (!query) return;
        var target = 'explore.html?q=' + encodeURIComponent(query);
        if (window.location.pathname.indexOf('explore.html') === -1) {
            window.location.href = target;
        } else {
            window.location.search = 'q=' + encodeURIComponent(query);
        }
    }

    function handleSearch() {
        var query = (searchInput && searchInput.value ? searchInput.value : '').trim();
        if (!query) { return; }
        if (window.location.pathname.indexOf('explore.html') !== -1) {
            applyFilter();
            return;
        }
        redirectToExplore(query);
    }

    if (toggleBtn && searchBox) {
        toggleBtn.addEventListener('click', function() {
            if (!searchBox.classList.contains('open')) {
                searchBox.classList.add('open');
                if (searchInput) { searchInput.focus(); }
                return;
            }
            if (searchInput && searchInput.value.trim()) {
                handleSearch();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
        searchInput.addEventListener('change', applyFilter);
        searchInput.addEventListener('search', applyFilter);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (searchBox) { searchBox.classList.remove('open'); }
                searchInput.value = '';
                applyFilter();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    if (searchBox) {
        searchBox.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSearch();
        });
    }

    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            applyFilter();
            searchInput.focus();
        });
    }

    try {
        var params = new URLSearchParams(window.location.search || '');
        var paramQuery = params.get('q');
        if (paramQuery && searchInput) {
            if (searchBox) { searchBox.classList.add('open'); }
            searchInput.value = paramQuery;
            applyFilter();
        }
    } catch (e) {}

    applyFilter();
})();
