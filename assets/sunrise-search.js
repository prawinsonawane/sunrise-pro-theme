/**
 * Sunrise Pro - Search Functionality
 * Handles search input, suggestions, and results
 */

class SunriseSearch {
  constructor() {
    this.searchInput = null;
    this.searchResults = null;
    this.searchSuggestions = null;
    this.isLoading = false;
    this.debounceTimer = null;
    this.currentQuery = '';
    this.init();
  }

  init() {
    this.setupSearchInput();
    this.setupSearchResults();
    this.setupSearchSuggestions();
    this.bindEvents();
  }

  setupSearchInput() {
    this.searchInput = document.querySelector('.sunrise-search__input');
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    this.searchInput.addEventListener('focus', () => {
      this.showSuggestions();
    });

    this.searchInput.addEventListener('blur', (e) => {
      // Delay hiding suggestions to allow clicking on them
      setTimeout(() => {
        this.hideSuggestions();
      }, 200);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  }

  setupSearchResults() {
    this.searchResults = document.querySelector('.sunrise-search-results');
    if (!this.searchResults) return;

    // Initialize with empty state if no results
    if (!this.searchResults.querySelector('.sunrise-search-results__item')) {
      this.showEmptyState();
    }
  }

  setupSearchSuggestions() {
    this.searchSuggestions = document.querySelector('.sunrise-search-suggestions');
    if (!this.searchSuggestions) {
      this.createSuggestionsContainer();
    }
  }

  createSuggestionsContainer() {
    if (!this.searchInput) return;

    const container = document.createElement('div');
    container.className = 'sunrise-search-suggestions';
    container.style.display = 'none';
    
    this.searchInput.parentNode.appendChild(container);
    this.searchSuggestions = container;
  }

  bindEvents() {
    // Listen for search form submission
    const searchForm = document.querySelector('.sunrise-search__form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch(this.searchInput.value);
      });
    }

    // Listen for search button clicks
    const searchButton = document.querySelector('.sunrise-search__button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.performSearch(this.searchInput.value);
      });
    }

    // Listen for URL changes (for SPA-like behavior)
    window.addEventListener('popstate', () => {
      this.handleUrlChange();
    });
  }

  handleSearchInput(query) {
    this.currentQuery = query.trim();
    
    if (this.currentQuery.length === 0) {
      this.hideSuggestions();
      this.clearResults();
      return;
    }

    if (this.currentQuery.length < 2) {
      this.hideSuggestions();
      return;
    }

    // Debounce the search
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetchSuggestions(this.currentQuery);
    }, 300);
  }

  async fetchSuggestions(query) {
    try {
      this.showLoading();
      
      const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`);
      const data = await response.json();
      
      this.displaySuggestions(data.resources.results.products || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.hideSuggestions();
    } finally {
      this.hideLoading();
    }
  }

  displaySuggestions(products) {
    if (!this.searchSuggestions || products.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.searchSuggestions.innerHTML = products.map(product => `
      <div class="sunrise-search-suggestions__item" data-product-id="${product.id}">
        <div class="sunrise-search-suggestions__title">${product.title}</div>
        <div class="sunrise-search-suggestions__price">${this.formatPrice(product.price)}</div>
      </div>
    `).join('');

    // Add click handlers to suggestions
    this.searchSuggestions.querySelectorAll('.sunrise-search-suggestions__item').forEach(item => {
      item.addEventListener('click', () => {
        const productId = item.dataset.productId;
        this.navigateToProduct(productId);
      });
    });

    this.showSuggestions();
  }

  showSuggestions() {
    if (this.searchSuggestions && this.searchSuggestions.children.length > 0) {
      this.searchSuggestions.style.display = 'block';
    }
  }

  hideSuggestions() {
    if (this.searchSuggestions) {
      this.searchSuggestions.style.display = 'none';
    }
  }

  async performSearch(query) {
    if (!query.trim()) return;

    try {
      this.showLoading();
      this.hideSuggestions();
      
      const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const html = await response.text();
      
      // Parse the response and update the page
      this.updateSearchResults(html, query);
      
      // Update URL
      this.updateUrl(query);
      
    } catch (error) {
      console.error('Error performing search:', error);
      this.showError();
    } finally {
      this.hideLoading();
    }
  }

  updateSearchResults(html, query) {
    // Create a temporary container to parse the HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    
    // Find the search results in the parsed HTML
    const newResults = tempContainer.querySelector('.sunrise-search-results');
    
    if (newResults && this.searchResults) {
      this.searchResults.innerHTML = newResults.innerHTML;
    } else {
      this.showEmptyState(query);
    }
  }

  showEmptyState(query = '') {
    if (!this.searchResults) return;

    this.searchResults.innerHTML = `
      <div class="sunrise-search-results__empty">
        <svg class="sunrise-search-results__empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <h3 class="sunrise-search-results__empty-title">
          ${query ? `No results found for "${query}"` : 'No results found'}
        </h3>
        <p class="sunrise-search-results__empty-description">
          Try adjusting your search terms or browse our categories.
        </p>
        <a href="/collections/all" class="sunrise-search-results__empty-button">
          Browse All Products
        </a>
      </div>
    `;
  }

  showError() {
    if (!this.searchResults) return;

    this.searchResults.innerHTML = `
      <div class="sunrise-search-results__empty">
        <svg class="sunrise-search-results__empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <h3 class="sunrise-search-results__empty-title">Search Error</h3>
        <p class="sunrise-search-results__empty-description">
          There was an error performing your search. Please try again.
        </p>
        <button class="sunrise-search-results__empty-button" onclick="location.reload()">
          Retry Search
        </button>
      </div>
    `;
  }

  showLoading() {
    this.isLoading = true;
    
    if (this.searchInput) {
      this.searchInput.classList.add('sunrise-search__input--loading');
    }
    
    // Add loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'sunrise-search__loading';
    loadingSpinner.id = 'search-loading';
    
    if (this.searchInput && this.searchInput.parentNode) {
      this.searchInput.parentNode.appendChild(loadingSpinner);
    }
  }

  hideLoading() {
    this.isLoading = false;
    
    if (this.searchInput) {
      this.searchInput.classList.remove('sunrise-search__input--loading');
    }
    
    const loadingSpinner = document.getElementById('search-loading');
    if (loadingSpinner) {
      loadingSpinner.remove();
    }
  }

  clearResults() {
    if (this.searchResults) {
      this.searchResults.innerHTML = '';
    }
  }

  handleKeydown(e) {
    if (!this.searchSuggestions || this.searchSuggestions.style.display === 'none') {
      return;
    }

    const suggestions = this.searchSuggestions.querySelectorAll('.sunrise-search-suggestions__item');
    const currentActive = this.searchSuggestions.querySelector('.sunrise-search-suggestions__item--active');
    let activeIndex = -1;

    if (currentActive) {
      activeIndex = Array.from(suggestions).indexOf(currentActive);
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
        this.setActiveSuggestion(suggestions[activeIndex]);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, -1);
        if (activeIndex === -1) {
          this.clearActiveSuggestion();
        } else {
          this.setActiveSuggestion(suggestions[activeIndex]);
        }
        break;
      
      case 'Enter':
        e.preventDefault();
        if (currentActive) {
          currentActive.click();
        } else {
          this.performSearch(this.searchInput.value);
        }
        break;
      
      case 'Escape':
        this.hideSuggestions();
        this.searchInput.blur();
        break;
    }
  }

  setActiveSuggestion(suggestion) {
    this.clearActiveSuggestion();
    if (suggestion) {
      suggestion.classList.add('sunrise-search-suggestions__item--active');
    }
  }

  clearActiveSuggestion() {
    const activeSuggestion = this.searchSuggestions?.querySelector('.sunrise-search-suggestions__item--active');
    if (activeSuggestion) {
      activeSuggestion.classList.remove('sunrise-search-suggestions__item--active');
    }
  }

  navigateToProduct(productId) {
    window.location.href = `/products/${productId}`;
  }

  updateUrl(query) {
    const url = new URL(window.location);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url);
  }

  handleUrlChange() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query && this.searchInput) {
      this.searchInput.value = query;
      this.performSearch(query);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(price / 100);
  }

  // Public methods
  search(query) {
    if (this.searchInput) {
      this.searchInput.value = query;
      this.performSearch(query);
    }
  }

  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.clearResults();
    this.hideSuggestions();
  }

  focus() {
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseSearch = new SunriseSearch();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseSearch) {
    window.SunriseSearch.init();
  }
});
