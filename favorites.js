(function() {
    var favCountEl = document.querySelector('.favorites-count');
    var favToggle = document.querySelector('.favorites-toggle');
    var favPanel = document.querySelector('.favorites-panel');
    var favList = document.querySelector('.favorites-list');
    var favClear = document.querySelector('.favorites-clear');
    var FAVORITES_KEY = 'vybe_favorites';
    var favorites = [];

    function loadFavorites() {
        try {
            var raw = localStorage.getItem(FAVORITES_KEY);
            if (!raw) return;
            var data = JSON.parse(raw);
            if (Array.isArray(data)) {
                favorites = data.filter(function(item) { return typeof item === 'string' && item.trim(); });
            }
        } catch (e) {}
    }

    function saveFavorites() {
        try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch (e) {}
    }

    function renderCount() {
        if (!favCountEl) return;
        favCountEl.textContent = favorites.length;
    }

    function isFavorite(name) {
        return favorites.indexOf(name) !== -1;
    }

    function toggleFavorite(name) {
        if (!name) return;
        if (isFavorite(name)) {
            favorites = favorites.filter(function(item) { return item !== name; });
        } else {
            favorites.push(name);
        }
        saveFavorites();
        renderCount();
        renderList();
        updateButtons(name);
    }

    function updateButtons(name) {
        var buttons = Array.from(document.querySelectorAll('.favorite-btn'));
        buttons.forEach(function(btn) {
            var card = btn.closest('.card');
            if (!card) return;
            var product = card.dataset.product || '';
            if (name && product !== name) return;
            var icon = btn.querySelector('i');
            if (isFavorite(product)) {
                btn.classList.add('active');
                if (icon) { icon.className = 'bi bi-heart-fill'; }
                btn.setAttribute('aria-label', 'Remove from favorites');
            } else {
                btn.classList.remove('active');
                if (icon) { icon.className = 'bi bi-heart'; }
                btn.setAttribute('aria-label', 'Add to favorites');
            }
        });
    }

    function ensureFavButton(card) {
        if (!card || card.querySelector('.favorite-btn')) return;
        var name = card.dataset.product || '';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'favorite-btn';
        btn.setAttribute('aria-label', 'Add to favorites');
        btn.innerHTML = '<i class="bi bi-heart"></i>';
        if (isFavorite(name)) {
            btn.classList.add('active');
            btn.querySelector('i').className = 'bi bi-heart-fill';
            btn.setAttribute('aria-label', 'Remove from favorites');
        }
        btn.addEventListener('click', function() {
            toggleFavorite(name);
        });
        card.appendChild(btn);
    }

    function renderList() {
        if (!favList) return;
        if (!favorites.length) {
            favList.innerHTML = '<div class="favorites-empty">No favorites yet.</div>';
            return;
        }
        favList.innerHTML = '';
        favorites.forEach(function(name) {
            var row = document.createElement('div');
            row.className = 'favorites-item';
            row.innerHTML = '<strong>' + name + '</strong><button class="favorites-remove" type="button" data-name="' + name + '">Remove</button>';
            favList.appendChild(row);
        });
    }

    function togglePanel(forceOpen) {
        if (!favPanel || !favToggle) return;
        var isOpen = favPanel.classList.contains('open');
        var next = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
        favPanel.classList.toggle('open', next);
        favPanel.setAttribute('aria-hidden', next ? 'false' : 'true');
        favToggle.setAttribute('aria-expanded', next ? 'true' : 'false');
    }

    function bindPanel() {
        if (favToggle && favPanel) {
            favToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                togglePanel();
            });
        }
        if (favPanel) {
            favPanel.addEventListener('click', function(e) { e.stopPropagation(); });
        }
        document.addEventListener('click', function() { togglePanel(false); });
        if (favClear) {
            favClear.addEventListener('click', function() {
                favorites = [];
                saveFavorites();
                renderCount();
                renderList();
                updateButtons();
            });
        }
        if (favList) {
            favList.addEventListener('click', function(e) {
                var btn = e.target.closest('.favorites-remove');
                if (!btn) return;
                var name = btn.getAttribute('data-name') || '';
                if (!name) return;
                favorites = favorites.filter(function(item) { return item !== name; });
                saveFavorites();
                renderCount();
                renderList();
                updateButtons(name);
            });
        }
    }

    function initFavorites() {
        var cards = Array.from(document.querySelectorAll('.product-grid .card'));
        cards.forEach(function(card) { ensureFavButton(card); });
        renderCount();
        renderList();
        bindPanel();
    }

    loadFavorites();
    initFavorites();
})();
