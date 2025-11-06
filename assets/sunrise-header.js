/**
 * Sunrise Pro - Header Functionality
 * Handles header interactions, mobile menu, and navigation
 */

class SunriseHeader {
  constructor() {
    this.header = null;
    this.mobileMenu = null;
    this.mobileToggle = null;
    this.searchButton = null;
    this.searchInput = null;
    this.cartButton = null;
    this.isMobileMenuOpen = false;
    this.isSearchOpen = false;
    this.lastScrollY = 0;
    this.init();
  }

  init() {
    this.setupElements();
    this.bindEvents();
    this.setupStickyHeader();
    this.setupMobileMenu();
    this.setupSearch();
    this.setupCart();
  }

  setupElements() {
    this.header = document.querySelector('.sunrise-header');
    this.mobileMenu = document.querySelector('.sunrise-header__mobile-menu');
    this.mobileToggle = document.querySelector('.sunrise-header__mobile-toggle');
    this.searchButton = document.querySelector('.sunrise-header__search-button');
    this.searchInput = document.querySelector('.sunrise-header__search-input');
    this.cartButton = document.querySelector('#cart-icon-bubble') || document.querySelector('.sunrise-header__cart');
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Mobile menu close
    const mobileMenuClose = document.querySelector('.sunrise-header__mobile-menu-close');
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Search functionality
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => {
        this.toggleSearch();
      });
    }

    // Cart functionality - handle both cart button and cart icon
    if (this.cartButton) {
      this.cartButton.addEventListener('click', (e) => {
        this.openCartDrawer(e);
      });
    }
    
    // Also handle cart icon clicks directly
    const cartIcon = document.querySelector('#cart-icon-bubble');
    if (cartIcon) {
      cartIcon.addEventListener('click', (e) => {
        this.openCartDrawer(e);
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMobileMenuOpen && !this.header.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMobileMenuOpen) {
          this.closeMobileMenu();
        }
        if (this.isSearchOpen) {
          this.closeSearch();
        }
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  setupStickyHeader() {
    if (!this.header) return;

    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 100) {
        this.header.classList.add('sunrise-header--scrolled');
      } else {
        this.header.classList.remove('sunrise-header--scrolled');
      }

      // Hide/show header on scroll
      if (scrollY > this.lastScrollY && scrollY > 200) {
        this.header.style.transform = 'translateY(-100%)';
      } else {
        this.header.style.transform = 'translateY(0)';
      }

      this.lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });
  }

  setupMobileMenu() {
    if (!this.mobileMenu) return;

    // Add click handlers to mobile menu links
    const mobileMenuLinks = this.mobileMenu.querySelectorAll('.sunrise-header__mobile-menu-nav-link');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Handle dropdown menus in mobile
    const mobileMenuItems = this.mobileMenu.querySelectorAll('.sunrise-header__mobile-menu-nav-item');
    mobileMenuItems.forEach(item => {
      const hasDropdown = item.querySelector('.sunrise-header__mobile-menu-dropdown');
      if (hasDropdown) {
        const link = item.querySelector('.sunrise-header__mobile-menu-nav-link');
        if (link) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            item.classList.toggle('sunrise-header__mobile-menu-nav-item--open');
          });
        }
      }
    });
  }

  setupSearch() {
    if (!this.searchInput) return;

    // Handle search input focus
    this.searchInput.addEventListener('focus', () => {
      this.openSearch();
    });

    // Handle search input blur
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!this.searchInput.matches(':focus')) {
          this.closeSearch();
        }
      }, 200);
    });

    // Handle search form submission
    const searchForm = this.searchInput.closest('form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }
  }

  setupCart() {
    // Update cart count
    this.updateCartCount();

    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      this.updateCartCount();
    });
    
    // Ensure cart icon is bound (in case it wasn't found initially)
    if (!this.cartButton) {
      this.cartButton = document.querySelector('#cart-icon-bubble') || document.querySelector('.sunrise-header__cart');
    }
    
    // Bind cart icon click if not already bound
    if (this.cartButton && !this.cartButton.hasAttribute('data-cart-bound')) {
      this.cartButton.addEventListener('click', (e) => {
        this.openCartDrawer(e);
      });
      this.cartButton.setAttribute('data-cart-bound', 'true');
    }
  }

  toggleMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    if (!this.mobileMenu) return;

    this.isMobileMenuOpen = true;
    this.mobileMenu.classList.add('sunrise-header__mobile-menu--open');
    document.body.classList.add('sunrise-mobile-menu-open');
    
    // Update toggle button
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute('aria-expanded', 'true');
    }

    // Focus first focusable element
    const firstFocusable = this.mobileMenu.querySelector('button, a, input, select, textarea');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  closeMobileMenu() {
    if (!this.mobileMenu) return;

    this.isMobileMenuOpen = false;
    this.mobileMenu.classList.remove('sunrise-header__mobile-menu--open');
    document.body.classList.remove('sunrise-mobile-menu-open');
    
    // Update toggle button
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  toggleSearch() {
    if (this.isSearchOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch() {
    this.isSearchOpen = true;
    this.header.classList.add('sunrise-header--search-open');
    
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.header.classList.remove('sunrise-header--search-open');
    
    if (this.searchInput) {
      this.searchInput.blur();
    }
  }

  performSearch() {
    const query = this.searchInput?.value.trim();
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  openCartDrawer(e) {
    if (e) {
      e.preventDefault();
    }
    
    // Find the cart-drawer custom element
    const cartDrawer = document.querySelector('cart-drawer') || document.querySelector('#CartDrawer');
    
    if (cartDrawer) {
      // If it's a custom element with an open method, use it
      if (typeof cartDrawer.open === 'function') {
        cartDrawer.open();
      } else {
        // Fallback to class-based approach
        cartDrawer.classList.add('sunrise-cart-drawer--open');
        cartDrawer.setAttribute('open', '');
        document.body.classList.add('sunrise-cart-drawer-open');
      }
    }
  }

  updateCartCount() {
    // This would typically fetch the current cart count from Shopify
    // For now, we'll use a placeholder
    const cartCount = document.querySelector('.sunrise-header__cart-count');
    if (cartCount) {
      // In a real implementation, you'd get this from the cart object
      const count = window.Shopify?.cart?.item_count || 0;
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }

    // Close search on mobile
    if (window.innerWidth <= 768 && this.isSearchOpen) {
      this.closeSearch();
    }
  }

  // Public methods
  openMobileMenu() {
    this.openMobileMenu();
  }

  closeMobileMenu() {
    this.closeMobileMenu();
  }

  openSearch() {
    this.openSearch();
  }

  closeSearch() {
    this.closeSearch();
  }

  updateCartCount() {
    this.updateCartCount();
  }
}

// Initialize header when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseHeader = new SunriseHeader();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseHeader) {
    window.SunriseHeader.init();
  }
});
