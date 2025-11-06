/**
 * Sunrise Pro - Localization System
 * Handles multi-language support and RTL layouts
 */

class SunriseLocalization {
  constructor() {
    this.currentLanguage = document.documentElement.lang || 'en';
    this.currentDirection = document.documentElement.dir || 'ltr';
    this.translations = {};
    this.init();
  }

  init() {
    this.loadTranslations();
    this.setupLanguageSwitcher();
    this.setupDirectionSwitcher();
    this.bindEvents();
  }

  loadTranslations() {
    // Load translations from Shopify's localization system
    this.translations = window.Shopify?.locales || {};
  }

  setupLanguageSwitcher() {
    const languageSwitchers = document.querySelectorAll('[data-language-switcher]');
    
    languageSwitchers.forEach(switcher => {
      switcher.addEventListener('change', (e) => {
        this.switchLanguage(e.target.value);
      });
    });
  }

  setupDirectionSwitcher() {
    const directionSwitchers = document.querySelectorAll('[data-direction-switcher]');
    
    directionSwitchers.forEach(switcher => {
      switcher.addEventListener('change', (e) => {
        this.switchDirection(e.target.value);
      });
    });
  }

  bindEvents() {
    // Listen for language changes
    document.addEventListener('language:changed', (e) => {
      this.handleLanguageChange(e.detail);
    });

    // Listen for direction changes
    document.addEventListener('direction:changed', (e) => {
      this.handleDirectionChange(e.detail);
    });
  }

  switchLanguage(languageCode) {
    if (languageCode === this.currentLanguage) return;

    // Update document language
    document.documentElement.lang = languageCode;
    this.currentLanguage = languageCode;

    // Update meta tags
    this.updateMetaTags(languageCode);

    // Update page content
    this.updatePageContent(languageCode);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('language:changed', {
      detail: { language: languageCode }
    }));

    // Save preference
    this.saveLanguagePreference(languageCode);
  }

  switchDirection(direction) {
    if (direction === this.currentDirection) return;

    // Update document direction
    document.documentElement.dir = direction;
    this.currentDirection = direction;

    // Update CSS classes
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(direction);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('direction:changed', {
      detail: { direction: direction }
    }));

    // Save preference
    this.saveDirectionPreference(direction);
  }

  updateMetaTags(languageCode) {
    // Update HTML lang attribute
    document.documentElement.lang = languageCode;

    // Update meta description if exists
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && this.translations[languageCode]?.meta?.description) {
      metaDescription.content = this.translations[languageCode].meta.description;
    }

    // Update Open Graph language
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.content = this.getLocaleCode(languageCode);
    }
  }

  updatePageContent(languageCode) {
    // Update text content
    this.updateTextContent(languageCode);

    // Update form labels
    this.updateFormLabels(languageCode);

    // Update button text
    this.updateButtonText(languageCode);

    // Update navigation
    this.updateNavigation(languageCode);
  }

  updateTextContent(languageCode) {
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
      const key = element.dataset.translate;
      const translation = this.getTranslation(key, languageCode);
      
      if (translation) {
        element.textContent = translation;
      }
    });
  }

  updateFormLabels(languageCode) {
    const labels = document.querySelectorAll('label[data-translate]');
    
    labels.forEach(label => {
      const key = label.dataset.translate;
      const translation = this.getTranslation(key, languageCode);
      
      if (translation) {
        label.textContent = translation;
      }
    });
  }

  updateButtonText(languageCode) {
    const buttons = document.querySelectorAll('button[data-translate], input[type="submit"][data-translate]');
    
    buttons.forEach(button => {
      const key = button.dataset.translate;
      const translation = this.getTranslation(key, languageCode);
      
      if (translation) {
        button.textContent = translation;
      }
    });
  }

  updateNavigation(languageCode) {
    const navItems = document.querySelectorAll('.sunrise-nav__item[data-translate]');
    
    navItems.forEach(item => {
      const key = item.dataset.translate;
      const translation = this.getTranslation(key, languageCode);
      
      if (translation) {
        item.textContent = translation;
      }
    });
  }

  getTranslation(key, languageCode = null) {
    const lang = languageCode || this.currentLanguage;
    const keys = key.split('.');
    let translation = this.translations[lang];

    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return null;
      }
    }

    return translation;
  }

  getLocaleCode(languageCode) {
    const localeMap = {
      'en': 'en_US',
      'es': 'es_ES',
      'fr': 'fr_FR',
      'de': 'de_DE',
      'it': 'it_IT',
      'pt': 'pt_PT',
      'nl': 'nl_NL',
      'sv': 'sv_SE',
      'da': 'da_DK',
      'no': 'no_NO',
      'fi': 'fi_FI',
      'pl': 'pl_PL',
      'cs': 'cs_CZ',
      'sk': 'sk_SK',
      'hu': 'hu_HU',
      'ro': 'ro_RO',
      'bg': 'bg_BG',
      'hr': 'hr_HR',
      'sl': 'sl_SI',
      'et': 'et_EE',
      'lv': 'lv_LV',
      'lt': 'lt_LT',
      'el': 'el_GR',
      'tr': 'tr_TR',
      'ru': 'ru_RU',
      'uk': 'uk_UA',
      'ar': 'ar_SA',
      'he': 'he_IL',
      'fa': 'fa_IR',
      'ur': 'ur_PK',
      'hi': 'hi_IN',
      'bn': 'bn_BD',
      'ta': 'ta_IN',
      'te': 'te_IN',
      'ml': 'ml_IN',
      'kn': 'kn_IN',
      'gu': 'gu_IN',
      'pa': 'pa_IN',
      'or': 'or_IN',
      'as': 'as_IN',
      'ne': 'ne_NP',
      'si': 'si_LK',
      'my': 'my_MM',
      'th': 'th_TH',
      'lo': 'lo_LA',
      'km': 'km_KH',
      'vi': 'vi_VN',
      'id': 'id_ID',
      'ms': 'ms_MY',
      'tl': 'tl_PH',
      'zh': 'zh_CN',
      'zh-TW': 'zh_TW',
      'ja': 'ja_JP',
      'ko': 'ko_KR',
      'mn': 'mn_MN',
      'ka': 'ka_GE',
      'hy': 'hy_AM',
      'az': 'az_AZ',
      'kk': 'kk_KZ',
      'ky': 'ky_KG',
      'uz': 'uz_UZ',
      'tg': 'tg_TJ',
      'tk': 'tk_TM',
      'af': 'af_ZA',
      'sw': 'sw_KE',
      'am': 'am_ET',
      'ha': 'ha_NG',
      'ig': 'ig_NG',
      'yo': 'yo_NG',
      'zu': 'zu_ZA',
      'xh': 'xh_ZA',
      'st': 'st_ZA',
      'tn': 'tn_ZA',
      'ss': 'ss_ZA',
      've': 've_ZA',
      'ts': 'ts_ZA',
      'nr': 'nr_ZA',
      'nso': 'nso_ZA',
      'zu': 'zu_ZA'
    };

    return localeMap[languageCode] || 'en_US';
  }

  handleLanguageChange(detail) {
    // Update UI elements
    this.updateLanguageSwitchers(detail.language);
    
    // Update currency if needed
    this.updateCurrency(detail.language);
    
    // Update date format
    this.updateDateFormat(detail.language);
  }

  handleDirectionChange(detail) {
    // Update direction switchers
    this.updateDirectionSwitchers(detail.direction);
    
    // Update layout
    this.updateLayout(detail.direction);
  }

  updateLanguageSwitchers(languageCode) {
    const switchers = document.querySelectorAll('[data-language-switcher]');
    
    switchers.forEach(switcher => {
      switcher.value = languageCode;
    });
  }

  updateDirectionSwitchers(direction) {
    const switchers = document.querySelectorAll('[data-direction-switcher]');
    
    switchers.forEach(switcher => {
      switcher.value = direction;
    });
  }

  updateCurrency(languageCode) {
    const currencyMap = {
      'en': 'USD',
      'es': 'EUR',
      'fr': 'EUR',
      'de': 'EUR',
      'it': 'EUR',
      'pt': 'EUR',
      'nl': 'EUR',
      'sv': 'SEK',
      'da': 'DKK',
      'no': 'NOK',
      'fi': 'EUR',
      'pl': 'PLN',
      'cs': 'CZK',
      'sk': 'EUR',
      'hu': 'HUF',
      'ro': 'RON',
      'bg': 'BGN',
      'hr': 'HRK',
      'sl': 'EUR',
      'et': 'EUR',
      'lv': 'EUR',
      'lt': 'EUR',
      'el': 'EUR',
      'tr': 'TRY',
      'ru': 'RUB',
      'uk': 'UAH',
      'ar': 'SAR',
      'he': 'ILS',
      'fa': 'IRR',
      'ur': 'PKR',
      'hi': 'INR',
      'bn': 'BDT',
      'ta': 'INR',
      'te': 'INR',
      'ml': 'INR',
      'kn': 'INR',
      'gu': 'INR',
      'pa': 'INR',
      'or': 'INR',
      'as': 'INR',
      'ne': 'NPR',
      'si': 'LKR',
      'my': 'MMK',
      'th': 'THB',
      'lo': 'LAK',
      'km': 'KHR',
      'vi': 'VND',
      'id': 'IDR',
      'ms': 'MYR',
      'tl': 'PHP',
      'zh': 'CNY',
      'zh-TW': 'TWD',
      'ja': 'JPY',
      'ko': 'KRW',
      'mn': 'MNT',
      'ka': 'GEL',
      'hy': 'AMD',
      'az': 'AZN',
      'kk': 'KZT',
      'ky': 'KGS',
      'uz': 'UZS',
      'tg': 'TJS',
      'tk': 'TMT',
      'af': 'ZAR',
      'sw': 'KES',
      'am': 'ETB',
      'ha': 'NGN',
      'ig': 'NGN',
      'yo': 'NGN',
      'zu': 'ZAR',
      'xh': 'ZAR',
      'st': 'ZAR',
      'tn': 'ZAR',
      'ss': 'ZAR',
      've': 'ZAR',
      'ts': 'ZAR',
      'nr': 'ZAR',
      'nso': 'ZAR',
      'zu': 'ZAR'
    };

    const currency = currencyMap[languageCode] || 'USD';
    
    // Update currency display
    const currencyElements = document.querySelectorAll('[data-currency]');
    currencyElements.forEach(element => {
      element.textContent = currency;
    });
  }

  updateDateFormat(languageCode) {
    const dateFormatMap = {
      'en': 'MM/DD/YYYY',
      'es': 'DD/MM/YYYY',
      'fr': 'DD/MM/YYYY',
      'de': 'DD.MM.YYYY',
      'it': 'DD/MM/YYYY',
      'pt': 'DD/MM/YYYY',
      'nl': 'DD-MM-YYYY',
      'sv': 'YYYY-MM-DD',
      'da': 'DD/MM/YYYY',
      'no': 'DD.MM.YYYY',
      'fi': 'DD.MM.YYYY',
      'pl': 'DD.MM.YYYY',
      'cs': 'DD.MM.YYYY',
      'sk': 'DD.MM.YYYY',
      'hu': 'YYYY.MM.DD',
      'ro': 'DD.MM.YYYY',
      'bg': 'DD.MM.YYYY',
      'hr': 'DD.MM.YYYY',
      'sl': 'DD.MM.YYYY',
      'et': 'DD.MM.YYYY',
      'lv': 'DD.MM.YYYY',
      'lt': 'YYYY-MM-DD',
      'el': 'DD/MM/YYYY',
      'tr': 'DD.MM.YYYY',
      'ru': 'DD.MM.YYYY',
      'uk': 'DD.MM.YYYY',
      'ar': 'DD/MM/YYYY',
      'he': 'DD/MM/YYYY',
      'fa': 'YYYY/MM/DD',
      'ur': 'DD/MM/YYYY',
      'hi': 'DD/MM/YYYY',
      'bn': 'DD/MM/YYYY',
      'ta': 'DD/MM/YYYY',
      'te': 'DD/MM/YYYY',
      'ml': 'DD/MM/YYYY',
      'kn': 'DD/MM/YYYY',
      'gu': 'DD/MM/YYYY',
      'pa': 'DD/MM/YYYY',
      'or': 'DD/MM/YYYY',
      'as': 'DD/MM/YYYY',
      'ne': 'YYYY/MM/DD',
      'si': 'YYYY/MM/DD',
      'my': 'DD/MM/YYYY',
      'th': 'DD/MM/YYYY',
      'lo': 'DD/MM/YYYY',
      'km': 'DD/MM/YYYY',
      'vi': 'DD/MM/YYYY',
      'id': 'DD/MM/YYYY',
      'ms': 'DD/MM/YYYY',
      'tl': 'MM/DD/YYYY',
      'zh': 'YYYY/MM/DD',
      'zh-TW': 'YYYY/MM/DD',
      'ja': 'YYYY/MM/DD',
      'ko': 'YYYY/MM/DD',
      'mn': 'YYYY/MM/DD',
      'ka': 'DD.MM.YYYY',
      'hy': 'DD.MM.YYYY',
      'az': 'DD.MM.YYYY',
      'kk': 'DD.MM.YYYY',
      'ky': 'DD.MM.YYYY',
      'uz': 'DD.MM.YYYY',
      'tg': 'DD.MM.YYYY',
      'tk': 'DD.MM.YYYY',
      'af': 'DD/MM/YYYY',
      'sw': 'DD/MM/YYYY',
      'am': 'DD/MM/YYYY',
      'ha': 'DD/MM/YYYY',
      'ig': 'DD/MM/YYYY',
      'yo': 'DD/MM/YYYY',
      'zu': 'DD/MM/YYYY',
      'xh': 'DD/MM/YYYY',
      'st': 'DD/MM/YYYY',
      'tn': 'DD/MM/YYYY',
      'ss': 'DD/MM/YYYY',
      've': 'DD/MM/YYYY',
      'ts': 'DD/MM/YYYY',
      'nr': 'DD/MM/YYYY',
      'nso': 'DD/MM/YYYY',
      'zu': 'DD/MM/YYYY'
    };

    const dateFormat = dateFormatMap[languageCode] || 'MM/DD/YYYY';
    
    // Update date format
    const dateElements = document.querySelectorAll('[data-date-format]');
    dateElements.forEach(element => {
      element.dataset.dateFormat = dateFormat;
    });
  }

  updateLayout(direction) {
    // Update CSS classes
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(direction);

    // Update specific layout elements
    this.updateLayoutElements(direction);
  }

  updateLayoutElements(direction) {
    // Update grid direction
    const grids = document.querySelectorAll('.sunrise-grid');
    grids.forEach(grid => {
      grid.style.direction = direction;
    });

    // Update flex direction
    const flexElements = document.querySelectorAll('.sunrise-flex');
    flexElements.forEach(element => {
      if (direction === 'rtl') {
        element.style.flexDirection = 'row-reverse';
      } else {
        element.style.flexDirection = 'row';
      }
    });
  }

  saveLanguagePreference(languageCode) {
    try {
      localStorage.setItem('sunrise_language', languageCode);
    } catch (e) {
      console.error('Error saving language preference:', e);
    }
  }

  saveDirectionPreference(direction) {
    try {
      localStorage.setItem('sunrise_direction', direction);
    } catch (e) {
      console.error('Error saving direction preference:', e);
    }
  }

  loadPreferences() {
    try {
      const savedLanguage = localStorage.getItem('sunrise_language');
      const savedDirection = localStorage.getItem('sunrise_direction');

      if (savedLanguage && savedLanguage !== this.currentLanguage) {
        this.switchLanguage(savedLanguage);
      }

      if (savedDirection && savedDirection !== this.currentDirection) {
        this.switchDirection(savedDirection);
      }
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
  }

  // Public methods
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getCurrentDirection() {
    return this.currentDirection;
  }

  translate(key, params = {}) {
    let translation = this.getTranslation(key);
    
    if (!translation) {
      return key; // Return key if translation not found
    }

    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });

    return translation;
  }
}

// Initialize localization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseLocalization = new SunriseLocalization();
  window.SunriseLocalization.loadPreferences();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseLocalization) {
    window.SunriseLocalization.loadPreferences();
  }
});
