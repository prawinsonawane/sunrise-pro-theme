/**
 * Sunrise Pro - Utility Functions
 * Common utility functions used throughout the theme
 */

window.SunriseUtils = {
  // Format money
  formatMoney: function(cents, format = 'money_with_currency_format') {
    if (typeof cents === 'string') {
      cents = parseInt(cents);
    }
    
    const value = cents / 100;
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(value);
  },

  // Debounce function
  debounce: function(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  // Throttle function
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Get URL parameters
  getUrlParameter: function(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  // Set URL parameter
  setUrlParameter: function(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
  },

  // Remove URL parameter
  removeUrlParameter: function(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  },

  // Check if element is in viewport
  isInViewport: function(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Smooth scroll to element
  scrollToElement: function(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  // Copy text to clipboard
  copyToClipboard: function(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  },

  // Generate random ID
  generateId: function(prefix = 'id') {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Check if device is mobile
  isMobile: function() {
    return window.innerWidth <= 768;
  },

  // Check if device is tablet
  isTablet: function() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  // Check if device is desktop
  isDesktop: function() {
    return window.innerWidth > 1024;
  },

  // Get device type
  getDeviceType: function() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  },

  // Local storage helpers
  storage: {
    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
      }
    },

    get: function(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return defaultValue;
      }
    },

    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('Error removing from localStorage:', e);
        return false;
      }
    }
  },

  // Animation helpers
  animation: {
    fadeIn: function(element, duration = 300) {
      element.style.opacity = '0';
      element.style.display = 'block';
      
      let start = performance.now();
      
      function animate(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;
        
        element.style.opacity = progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      requestAnimationFrame(animate);
    },

    fadeOut: function(element, duration = 300) {
      let start = performance.now();
      let initialOpacity = parseFloat(getComputedStyle(element).opacity);
      
      function animate(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;
        
        element.style.opacity = initialOpacity * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = 'none';
        }
      }
      
      requestAnimationFrame(animate);
    }
  }
};
