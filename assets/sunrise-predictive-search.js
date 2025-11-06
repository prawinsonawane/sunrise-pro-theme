/**
 * Sunrise Pro - Predictive Search Component
 * Handles instant search functionality with live results
 */

class SunrisePredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('#predictive-search-results');
    this.loading = this.querySelector('.sunrise-predictive-search__loading');
    this.content = this.querySelector('.sunrise-predictive-search__content');
    this.debounceTimer = null;
    this.searchTimeout = null;
    this.isSearching = false;
    this.minSearchLength = 2;
    this.debounceDelay = 300;
    this.searchDelay = 100;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    if (this.input) {
      this.input.addEventListener('input', (e) => {
        this.handleInput(e);
      });

      this.input.addEventListener('focus', () => {
        this.handleFocus();
      });

      this.input.addEventListener('blur', () => {
        this.handleBlur();
      });

      this.input.addEventListener('keydown', (e) => {
        this.handleKeydown(e);
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.closeResults();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeResults();
        this.input?.focus();
      }
    });
  }

  setupAccessibility() {
    if (this.input) {
      this.input.setAttribute('aria-expanded', 'false');
      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('role', 'combobox');
    }

    if (this.results) {
      this.results.setAttribute('role', 'listbox');
      this.results.setAttribute('aria-live', 'polite');
    }
  }

  handleInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce the search
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, this.debounceDelay);
  }

  handleFocus() {
    const query = this.input.value.trim();
    if (query.length >= this.minSearchLength) {
      this.showResults();
    }
  }

  handleBlur() {
    // Delay closing to allow for clicks on results
    setTimeout(() => {
      this.closeResults();
    }, 200);
  }

  handleKeydown(e) {
    const results = this.querySelectorAll('[role="option"]');
    const currentIndex = Array.from(results).findIndex(item => 
      item.classList.contains('sunrise-predictive-search__item--focused')
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusResult(currentIndex + 1, results);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusResult(currentIndex - 1, results);
        break;
      case 'Enter':
        e.preventDefault();
        const focusedResult = this.querySelector('.sunrise-predictive-search__item--focused');
        if (focusedResult) {
          const link = focusedResult.querySelector('a');
          if (link) {
            link.click();
          }
        } else {
          this.submitSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.closeResults();
        this.input?.focus();
        break;
    }
  }

  focusResult(index, results) {
    // Remove previous focus
    results.forEach(item => {
      item.classList.remove('sunrise-predictive-search__item--focused');
      item.setAttribute('aria-selected', 'false');
    });

    // Focus new result
    if (index >= 0 && index < results.length) {
      const result = results[index];
      result.classList.add('sunrise-predictive-search__item--focused');
      result.setAttribute('aria-selected', 'true');
      result.scrollIntoView({ block: 'nearest' });
    }
  }

  async performSearch(query) {
    if (query.length < this.minSearchLength) {
      this.closeResults();
      return;
    }

    this.showLoading();
    this.isSearching = true;

    try {
      const response = await fetch(
        `${routes.predictive_search_url}?q=${encodeURIComponent(query)}&section_id=predictive-search`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const resultsContainer = doc.querySelector('#predictive-search-results');

      if (resultsContainer) {
        this.displayResults(resultsContainer.innerHTML);
      } else {
        this.showNoResults();
      }
    } catch (error) {
      console.error('Predictive search error:', error);
      this.showError();
    } finally {
      this.isSearching = false;
    }
  }

  showLoading() {
    if (this.loading && this.content) {
      this.loading.style.display = 'flex';
      this.content.style.display = 'none';
    }
    this.showResults();
  }

  displayResults(html) {
    if (this.content) {
      this.content.innerHTML = html;
      this.content.style.display = 'block';
      if (this.loading) {
        this.loading.style.display = 'none';
      }
    }
    this.showResults();
    this.setupResultAccessibility();
  }

  showNoResults() {
    if (this.content) {
      this.content.innerHTML = `
        <div class="sunrise-predictive-search__no-results sunrise-text-center">
          <p>No results found for "${this.input.value}"</p>
          <button type="submit" class="sunrise-predictive-search__view-all">
            Search for "${this.input.value}"
          </button>
        </div>
      `;
      this.content.style.display = 'block';
      if (this.loading) {
        this.loading.style.display = 'none';
      }
    }
    this.showResults();
  }

  showError() {
    if (this.content) {
      this.content.innerHTML = `
        <div class="sunrise-predictive-search__error sunrise-text-center">
          <p>Search temporarily unavailable. Please try again.</p>
        </div>
      `;
      this.content.style.display = 'block';
      if (this.loading) {
        this.loading.style.display = 'none';
      }
    }
    this.showResults();
  }

  showResults() {
    if (this.results) {
      this.results.classList.remove('hidden');
      this.results.style.display = 'block';
    }
    if (this.input) {
      this.input.setAttribute('aria-expanded', 'true');
    }
  }

  closeResults() {
    if (this.results) {
      this.results.classList.add('hidden');
      this.results.style.display = 'none';
    }
    if (this.input) {
      this.input.setAttribute('aria-expanded', 'false');
    }
  }

  setupResultAccessibility() {
    const results = this.querySelectorAll('.sunrise-predictive-search__product, .sunrise-predictive-search__article, .sunrise-predictive-search__page');
    results.forEach((result, index) => {
      result.setAttribute('role', 'option');
      result.setAttribute('aria-posinset', index + 1);
      result.setAttribute('aria-setsize', results.length);
    });
  }

  submitSearch() {
    const form = this.querySelector('form');
    if (form) {
      form.submit();
    }
  }

  // Public methods for external control
  search(query) {
    if (this.input) {
      this.input.value = query;
      this.performSearch(query);
    }
  }

  clear() {
    if (this.input) {
      this.input.value = '';
    }
    this.closeResults();
  }

  focus() {
    this.input?.focus();
  }
}

customElements.define('predictive-search', SunrisePredictiveSearch);
