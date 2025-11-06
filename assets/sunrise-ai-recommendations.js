/**
 * Sunrise Pro - AI Product Recommendations Component
 * Handles AI-powered product recommendations with behavioral tracking
 */

class SunriseAIRecommendations extends HTMLElement {
  constructor() {
    super();
    this.recommendationType = this.dataset.recommendationType || 'related';
    this.maxProducts = parseInt(this.dataset.maxProducts) || 4;
    this.context = this.dataset.context || 'product';
    this.productId = this.dataset.productId || '';
    this.customerId = this.dataset.customerId || '';
    this.isLoading = false;
    this.recommendations = [];
    this.userBehavior = this.getUserBehavior();
    this.recommendationCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadRecommendations();
    this.startBehavioralTracking();
  }

  bindEvents() {
    // Track user interactions
    this.addEventListener('click', (e) => {
      this.trackInteraction('click', e.target);
    });

    // Track product views
    this.addEventListener('mouseenter', (e) => {
      if (e.target.closest('.sunrise-ai-recommendations__product-card')) {
        this.trackInteraction('hover', e.target);
      }
    });

    // Listen for cart updates
    document.addEventListener('cart:updated', (e) => {
      this.handleCartUpdate(e.detail);
    });

    // Listen for product page views
    document.addEventListener('product:viewed', (e) => {
      this.handleProductView(e.detail);
    });
  }

  async loadRecommendations() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      // Check cache first
      const cacheKey = this.getCacheKey();
      const cachedRecommendations = this.getCachedRecommendations(cacheKey);
      
      if (cachedRecommendations) {
        this.displayRecommendations(cachedRecommendations);
        this.isLoading = false;
        return;
      }

      // Load recommendations based on type
      let recommendations = [];
      
      switch (this.recommendationType) {
        case 'related':
          recommendations = await this.getRelatedProducts();
          break;
        case 'complementary':
          recommendations = await this.getComplementaryProducts();
          break;
        case 'trending':
          recommendations = await this.getTrendingProducts();
          break;
        case 'personalized':
          recommendations = await this.getPersonalizedRecommendations();
          break;
        case 'frequently_bought':
          recommendations = await this.getFrequentlyBoughtTogether();
          break;
        case 'recently_viewed':
          recommendations = await this.getRecentlyViewed();
          break;
        default:
          recommendations = await this.getRelatedProducts();
      }

      // Apply AI filtering and ranking
      recommendations = await this.applyAIFiltering(recommendations);
      
      // Cache the results
      this.cacheRecommendations(cacheKey, recommendations);
      
      // Display recommendations
      this.displayRecommendations(recommendations);
      
      // Track recommendation load
      this.trackRecommendationLoad(recommendations);

    } catch (error) {
      console.error('AI Recommendations error:', error);
      this.showError();
    } finally {
      this.isLoading = false;
    }
  }

  async getRelatedProducts() {
    if (!this.productId) {
      return await this.getFallbackRecommendations();
    }

    try {
      const response = await fetch(`/recommendations/products.json?product_id=${this.productId}&limit=${this.maxProducts}`);
      if (response.ok) {
        const data = await response.json();
        return data.products || [];
      }
    } catch (error) {
      console.error('Related products API error:', error);
    }

    return await this.getFallbackRecommendations();
  }

  async getComplementaryProducts() {
    // Get products from the same collection or similar categories
    try {
      const response = await fetch(`/collections.json?limit=${this.maxProducts * 2}`);
      if (response.ok) {
        const data = await response.json();
        const collections = data.collections || [];
        
        // Get products from random collections
        const products = [];
        for (const collection of collections.slice(0, 3)) {
          const collectionResponse = await fetch(`/collections/${collection.handle}/products.json?limit=2`);
          if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            products.push(...(collectionData.products || []));
          }
        }
        
        return this.shuffleArray(products).slice(0, this.maxProducts);
      }
    } catch (error) {
      console.error('Complementary products API error:', error);
    }

    return await this.getFallbackRecommendations();
  }

  async getTrendingProducts() {
    // Get products sorted by popularity (views, sales, etc.)
    try {
      const response = await fetch(`/products.json?limit=${this.maxProducts}&sort_by=best-selling`);
      if (response.ok) {
        const data = await response.json();
        return data.products || [];
      }
    } catch (error) {
      console.error('Trending products API error:', error);
    }

    return await this.getFallbackRecommendations();
  }

  async getPersonalizedRecommendations() {
    // Use user behavior and preferences to recommend products
    const userPreferences = this.getUserPreferences();
    const behaviorData = this.getUserBehavior();
    
    try {
      // Combine multiple recommendation strategies
      const strategies = [
        this.getRelatedProducts(),
        this.getTrendingProducts(),
        this.getComplementaryProducts()
      ];
      
      const results = await Promise.all(strategies);
      const allProducts = results.flat();
      
      // Apply personalization scoring
      const personalizedProducts = this.scoreProductsForUser(allProducts, userPreferences, behaviorData);
      
      return personalizedProducts.slice(0, this.maxProducts);
    } catch (error) {
      console.error('Personalized recommendations error:', error);
    }

    return await this.getFallbackRecommendations();
  }

  async getFrequentlyBoughtTogether() {
    // Get products that are frequently bought with the current product
    if (!this.productId) {
      return await this.getFallbackRecommendations();
    }

    try {
      // This would typically use a more sophisticated algorithm
      // For now, we'll use related products as a proxy
      return await this.getRelatedProducts();
    } catch (error) {
      console.error('Frequently bought together error:', error);
    }

    return await this.getFallbackRecommendations();
  }

  async getRecentlyViewed() {
    // Get products from user's recently viewed history
    const recentlyViewed = this.getRecentlyViewedProducts();
    
    if (recentlyViewed.length > 0) {
      return recentlyViewed.slice(0, this.maxProducts);
    }

    return await this.getFallbackRecommendations();
  }

  async getFallbackRecommendations() {
    // Fallback to general product recommendations
    try {
      const response = await fetch(`/products.json?limit=${this.maxProducts}`);
      if (response.ok) {
        const data = await response.json();
        return data.products || [];
      }
    } catch (error) {
      console.error('Fallback recommendations error:', error);
    }

    return [];
  }

  async applyAIFiltering(products) {
    // Apply AI-based filtering and ranking
    const filteredProducts = products.filter(product => {
      // Filter out current product
      if (product.id.toString() === this.productId) {
        return false;
      }
      
      // Filter out out-of-stock products (optional)
      if (!product.available) {
        return false;
      }
      
      return true;
    });

    // Apply AI scoring
    const scoredProducts = filteredProducts.map(product => ({
      ...product,
      aiScore: this.calculateAIScore(product)
    }));

    // Sort by AI score
    scoredProducts.sort((a, b) => b.aiScore - a.aiScore);

    return scoredProducts.slice(0, this.maxProducts);
  }

  calculateAIScore(product) {
    let score = 0;
    
    // Base score
    score += 1;
    
    // Popularity score (based on views, sales, etc.)
    if (product.tags && product.tags.includes('popular')) {
      score += 2;
    }
    
    // Price attractiveness
    if (product.price && product.compare_at_price) {
      const discount = (product.compare_at_price - product.price) / product.compare_at_price;
      score += discount * 3;
    }
    
    // User behavior alignment
    const userPreferences = this.getUserPreferences();
    if (userPreferences.priceRange) {
      const productPrice = parseFloat(product.price) / 100;
      if (productPrice >= userPreferences.priceRange.min && productPrice <= userPreferences.priceRange.max) {
        score += 1.5;
      }
    }
    
    // Category preference
    if (userPreferences.categories && product.product_type) {
      if (userPreferences.categories.includes(product.product_type)) {
        score += 1;
      }
    }
    
    return score;
  }

  displayRecommendations(products) {
    const grid = this.querySelector('#RecommendationsGrid');
    const loading = this.querySelector('#RecommendationsLoading');
    const empty = this.querySelector('#RecommendationsEmpty');
    const error = this.querySelector('#RecommendationsError');

    // Hide all states
    loading?.classList.add('hidden');
    empty?.classList.add('hidden');
    error?.classList.add('hidden');

    if (!products || products.length === 0) {
      empty?.classList.remove('hidden');
      return;
    }

    // Generate product cards HTML
    const productCardsHTML = products.map((product, index) => {
      return this.generateProductCard(product, index);
    }).join('');

    // Update grid
    if (grid) {
      grid.innerHTML = productCardsHTML;
      grid.classList.remove('hidden');
    }

    // Track display
    this.trackRecommendationDisplay(products);
  }

  generateProductCard(product, index) {
    const image = product.featured_image || product.images?.[0];
    const imageUrl = image ? image.url : '';
    const imageAlt = image ? image.alt : product.title;
    
    const price = this.formatPrice(product.price);
    const comparePrice = product.compare_at_price ? this.formatPrice(product.compare_at_price) : '';
    const isOnSale = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
    
    const rating = this.generateRating(product);
    
    return `
      <div class="sunrise-ai-recommendations__item sunrise-grid__item" data-product-id="${product.id}">
        <div class="sunrise-ai-recommendations__product-card sunrise-card">
          ${isOnSale ? '<div class="sunrise-ai-recommendations__product-badge">Sale</div>' : ''}
          <div class="sunrise-ai-recommendations__ai-badge">AI</div>
          
          <div class="sunrise-ai-recommendations__product-image">
            <a href="/products/${product.handle}" class="sunrise-ai-recommendations__product-link">
              ${imageUrl ? 
                `<img src="${imageUrl}" alt="${imageAlt}" class="sunrise-ai-recommendations__product-img" loading="lazy">` :
                `<div class="sunrise-ai-recommendations__product-placeholder">${product.title.charAt(0)}</div>`
              }
            </a>
          </div>
          
          <div class="sunrise-ai-recommendations__product-content">
            <h3 class="sunrise-ai-recommendations__product-title">
              <a href="/products/${product.handle}" class="sunrise-ai-recommendations__product-title-link">
                ${product.title}
              </a>
            </h3>
            
            <div class="sunrise-ai-recommendations__product-price">
              <span class="sunrise-ai-recommendations__product-price--regular${isOnSale ? ' sunrise-ai-recommendations__product-price--sale' : ''}">
                ${price}
              </span>
              ${comparePrice ? `<span class="sunrise-ai-recommendations__product-price--compare">${comparePrice}</span>` : ''}
            </div>
            
            ${rating ? `
              <div class="sunrise-ai-recommendations__product-rating">
                <div class="sunrise-ai-recommendations__product-stars">
                  ${rating.stars}
                </div>
                <span class="sunrise-ai-recommendations__product-rating-text">${rating.text}</span>
              </div>
            ` : ''}
            
            <div class="sunrise-ai-recommendations__product-actions">
              <a href="/products/${product.handle}" class="sunrise-ai-recommendations__product-button">
                View Product
              </a>
              <button class="sunrise-ai-recommendations__product-button sunrise-ai-recommendations__product-button--secondary" 
                      onclick="SunriseAIRecommendations.addToCart(${product.id})">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateRating(product) {
    // Mock rating generation - in real implementation, this would use actual review data
    const rating = Math.random() * 2 + 3; // Random rating between 3-5
    const stars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
      if (i < stars) {
        starsHTML += '<svg class="sunrise-ai-recommendations__product-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      } else if (i === stars && hasHalfStar) {
        starsHTML += '<svg class="sunrise-ai-recommendations__product-star sunrise-ai-recommendations__product-star--empty" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      } else {
        starsHTML += '<svg class="sunrise-ai-recommendations__product-star sunrise-ai-recommendations__product-star--empty" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      }
    }
    
    return {
      stars: starsHTML,
      text: `${rating.toFixed(1)} (${Math.floor(Math.random() * 100 + 10)} reviews)`
    };
  }

  showLoading() {
    const loading = this.querySelector('#RecommendationsLoading');
    const grid = this.querySelector('#RecommendationsGrid');
    const empty = this.querySelector('#RecommendationsEmpty');
    const error = this.querySelector('#RecommendationsError');

    loading?.classList.remove('hidden');
    grid?.classList.add('hidden');
    empty?.classList.add('hidden');
    error?.classList.add('hidden');
  }

  showError() {
    const loading = this.querySelector('#RecommendationsLoading');
    const grid = this.querySelector('#RecommendationsGrid');
    const empty = this.querySelector('#RecommendationsEmpty');
    const error = this.querySelector('#RecommendationsError');

    loading?.classList.add('hidden');
    grid?.classList.add('hidden');
    empty?.classList.add('hidden');
    error?.classList.remove('hidden');
  }

  // Behavioral tracking methods
  startBehavioralTracking() {
    // Track page views
    this.trackPageView();
    
    // Track scroll behavior
    this.trackScrollBehavior();
    
    // Track time on page
    this.trackTimeOnPage();
  }

  trackInteraction(type, element) {
    const productCard = element.closest('.sunrise-ai-recommendations__product-card');
    if (!productCard) return;

    const productId = productCard.closest('.sunrise-ai-recommendations__item')?.dataset.productId;
    if (!productId) return;

    const interaction = {
      type: type,
      productId: productId,
      timestamp: Date.now(),
      context: this.context,
      recommendationType: this.recommendationType
    };

    this.saveInteraction(interaction);
  }

  trackPageView() {
    const pageView = {
      type: 'page_view',
      page: window.location.pathname,
      timestamp: Date.now(),
      context: this.context
    };

    this.saveInteraction(pageView);
  }

  trackScrollBehavior() {
    let scrollDepth = 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const newScrollDepth = Math.round((currentScroll / maxScroll) * 100);
      
      if (newScrollDepth > scrollDepth && newScrollDepth % 25 === 0) {
        scrollDepth = newScrollDepth;
        this.saveInteraction({
          type: 'scroll',
          depth: scrollDepth,
          timestamp: Date.now()
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  trackTimeOnPage() {
    const startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.saveInteraction({
        type: 'time_on_page',
        duration: timeOnPage,
        timestamp: Date.now()
      });
    });
  }

  // Utility methods
  getUserBehavior() {
    const behavior = localStorage.getItem('sunrise_user_behavior');
    return behavior ? JSON.parse(behavior) : [];
  }

  getUserPreferences() {
    const preferences = localStorage.getItem('sunrise_user_preferences');
    return preferences ? JSON.parse(preferences) : {};
  }

  getRecentlyViewedProducts() {
    const recentlyViewed = localStorage.getItem('sunrise_recently_viewed');
    return recentlyViewed ? JSON.parse(recentlyViewed) : [];
  }

  saveInteraction(interaction) {
    const behavior = this.getUserBehavior();
    behavior.push(interaction);
    
    // Keep only last 100 interactions
    if (behavior.length > 100) {
      behavior.splice(0, behavior.length - 100);
    }
    
    localStorage.setItem('sunrise_user_behavior', JSON.stringify(behavior));
  }

  getCacheKey() {
    return `${this.recommendationType}_${this.context}_${this.productId}_${this.customerId}`;
  }

  getCachedRecommendations(key) {
    const cached = this.recommendationCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  cacheRecommendations(key, data) {
    this.recommendationCache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  formatPrice(price) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(price / 100);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Public methods
  reload() {
    this.loadRecommendations();
  }

  async addToCart(productId) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          quantity: 1
        })
      });

      if (response.ok) {
        // Track add to cart
        this.trackInteraction('add_to_cart', { productId });
        
        // Dispatch cart update event
        document.dispatchEvent(new CustomEvent('cart:updated'));
        
        // Show success message
        this.showAddToCartSuccess();
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  }

  showAddToCartSuccess() {
    // Create temporary success message
    const success = document.createElement('div');
    success.className = 'sunrise-ai-recommendations__success';
    success.textContent = 'Added to cart!';
    success.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 1000;
      font-weight: 600;
    `;
    
    document.body.appendChild(success);
    
    setTimeout(() => {
      document.body.removeChild(success);
    }, 3000);
  }

  trackRecommendationLoad(recommendations) {
    this.saveInteraction({
      type: 'recommendation_load',
      count: recommendations.length,
      recommendationType: this.recommendationType,
      timestamp: Date.now()
    });
  }

  trackRecommendationDisplay(recommendations) {
    this.saveInteraction({
      type: 'recommendation_display',
      count: recommendations.length,
      recommendationType: this.recommendationType,
      timestamp: Date.now()
    });
  }

  handleCartUpdate(cartData) {
    // Update recommendations based on cart changes
    if (this.recommendationType === 'complementary' || this.recommendationType === 'frequently_bought') {
      setTimeout(() => {
        this.loadRecommendations();
      }, 1000);
    }
  }

  handleProductView(productData) {
    // Update recently viewed
    const recentlyViewed = this.getRecentlyViewedProducts();
    const productIndex = recentlyViewed.findIndex(p => p.id === productData.id);
    
    if (productIndex > -1) {
      recentlyViewed.splice(productIndex, 1);
    }
    
    recentlyViewed.unshift(productData);
    
    // Keep only last 20 products
    if (recentlyViewed.length > 20) {
      recentlyViewed.splice(20);
    }
    
    localStorage.setItem('sunrise_recently_viewed', JSON.stringify(recentlyViewed));
  }
}

customElements.define('sunrise-ai-recommendations', SunriseAIRecommendations);

// Global instance for external access
window.SunriseAIRecommendations = {
  reload: () => {
    const element = document.querySelector('sunrise-ai-recommendations');
    if (element) {
      element.reload();
    }
  },
  addToCart: (productId) => {
    const element = document.querySelector('sunrise-ai-recommendations');
    if (element) {
      element.addToCart(productId);
    }
  }
};
