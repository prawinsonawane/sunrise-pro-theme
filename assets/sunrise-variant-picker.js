/**
 * Sunrise Pro - Variant Selects Component
 * Handles variant selection and updates product form
 * Based on Dawn theme patterns
 */

if (!customElements.get('variant-picker')) {
  customElements.define('variant-picker', class VariantPicker extends HTMLElement {
    constructor() {
      super();
      this.form = null;
      this.variantData = null;
      this.currentOptions = [];
    }

    connectedCallback() {
      // Find the form using the form attribute from variant inputs
      const formId = this.querySelector('input[type="radio"]')?.getAttribute('form');
      if (formId) {
        this.form = document.getElementById(formId);
      } else {
        // Fallback: find closest form
        this.form = this.closest('form');
      }
      
      if (!this.form) {
        console.warn('Form not found for variant-picker');
        return;
      }
      
      this.variantData = this.getVariantData();
      this.onVariantChange();
      
      this.querySelectorAll('input[type="radio"]').forEach((radio) =>
        radio.addEventListener('change', this.onVariantChange.bind(this))
      );
    }


    getVariantData() {
      this.variantData = this.variantData || {};
      const script = this.querySelector('script[type="application/json"]');
      if (script) {
        try {
          this.variantData = JSON.parse(script.textContent);
        } catch (e) {
          console.error('Error parsing variant data:', e);
        }
      }
      return this.variantData;
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();
      this.updateMedia();
      this.updatePrice();
      this.updateAvailability();
      this.updateURL();
    }

    updateOptions() {
      const fieldsets = this.querySelectorAll('fieldset');
      const options = Array.from(fieldsets, (fieldset) => {
        return Array.from(fieldset.querySelectorAll('input[type="radio"]:checked')).map((radio) => radio.value);
      });

      this.currentOptions = options;
    }

    updateMasterId() {
      const selectedVariant = this.getVariantFromOptions();
      const input = this.form.querySelector('input[name="id"]');
      
      if (input) {
        input.value = selectedVariant.id;
        input.disabled = false;
      }
    }

    getVariantFromOptions() {
      this.variantData = this.getVariantData();
      this.updateOptions();
      
      return this.variantData.find((variant) => {
        return !variant.options.map((option, index) => {
          return this.currentOptions[index] === option;
        }).includes(false);
      });
    }

    updateMedia() {
      if (!this.dataset.updateUrl) return;
      
      const selectedVariant = this.getVariantFromOptions();
      if (!selectedVariant?.featured_media) return;
      
      const mediaId = selectedVariant.featured_media.id;
      const mediaElement = document.querySelector(`[data-media-id="${mediaId}"]`);
      if (mediaElement) {
        mediaElement.scrollIntoView({ behavior: 'smooth' });
      }
    }

    updatePrice() {
      const selectedVariant = this.getVariantFromOptions();
      if (!selectedVariant) return;
      
      const priceElement = document.querySelector('.sunrise-price-item--regular');
      if (priceElement) {
        priceElement.textContent = this.formatMoney(selectedVariant.price);
      }
      
      const comparePriceElement = document.querySelector('.sunrise-price-item--sale');
      if (comparePriceElement && selectedVariant.compare_at_price > selectedVariant.price) {
        comparePriceElement.textContent = this.formatMoney(selectedVariant.compare_at_price);
        comparePriceElement.style.display = 'inline';
      } else if (comparePriceElement) {
        comparePriceElement.style.display = 'none';
      }
    }

    updateAvailability() {
      const selectedVariant = this.getVariantFromOptions();
      if (!selectedVariant) return;
      
      const submitButton = this.form.querySelector('[type="submit"]');
      if (!submitButton) return;
      
      if (selectedVariant.available) {
        submitButton.removeAttribute('disabled');
        submitButton.textContent = 'Add to cart';
      } else {
        submitButton.setAttribute('disabled', 'disabled');
        submitButton.textContent = 'Sold out';
      }
    }

    updateURL() {
      if (!this.dataset.updateUrl) return;
      
      const selectedVariant = this.getVariantFromOptions();
      if (!selectedVariant) return;
      
      const url = new URL(window.location.href);
      url.searchParams.set('variant', selectedVariant.id);
      window.history.replaceState({ path: url.href }, '', url.href);
    }

    formatMoney(cents) {
      return new Intl.NumberFormat(document.documentElement.lang, {
        style: 'currency',
        currency: 'USD'
      }).format(cents / 100);
    }
  });
}

