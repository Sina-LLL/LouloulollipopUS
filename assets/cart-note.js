/* global debounce */
if (!customElements.get('cart-note')) {
  class CartNote extends HTMLElement {
    constructor() {
      super();
      this.disclosure = this.closest('details');

      if (this.disclosure && this.disclosure.matches('.cart-note-disclosure')) {
        this.cartNoteToggle = this.disclosure.querySelector('.js-show-note');
      }

      this.init();
    }

    init() {
      this.debouncedHandleNoteChange = debounce(this.handleNoteChange.bind(this), 300);
      this.addEventListener('input', this.debouncedHandleNoteChange);
    }

    async handleNoteChange(evt) {
      // Skip if this is the gift message textarea
      if (evt.target.id === 'GiftMessage') {
        return;
      }

      if (this.cartNoteToggle) {
        const label = evt.target.value ? theme.strings.editCartNote : theme.strings.addCartNote;
        if (this.cartNoteToggle.textContent !== label) {
          this.cartNoteToggle.textContent = label;
        }
      }

      const checkbox = document.getElementById('GiftCheckbox');
      const giftMessageInput = document.getElementById('GiftMessage');

      await updateCartAttributes(
        {
          GiftOption: checkbox?.checked ? 'Yes' : 'No',
          GiftMessage: giftMessageInput?.value || ''
        },
        evt.target.value
      );
    }
  }

  customElements.define('cart-note', CartNote);
}

// Initialize gift functionality
function initGiftFeature() {
  const checkbox = document.getElementById('GiftCheckbox');
  const giftMessageWrapper = document.getElementById('GiftMessageWrapper');
  const giftMessageInput = document.getElementById('GiftMessage');

  if (!checkbox) return;

  // Toggle wrapper visibility
  const toggleGiftMessage = () => {
    if (!giftMessageWrapper) return;
    giftMessageWrapper.style.display = checkbox.checked ? 'block' : 'none';
    if (!checkbox.checked && giftMessageInput) {
      giftMessageInput.value = '';
    }
  };

  // Restore state from cart
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const isGift = cart.attributes?.GiftOption === 'Yes';
      checkbox.checked = isGift;

      if (giftMessageInput && cart.attributes?.GiftMessage) {
        giftMessageInput.value = cart.attributes.GiftMessage;
      }

      toggleGiftMessage();
    })
    .catch(err => console.error('Error loading cart state:', err));

  // Update cart when checkbox changes
  checkbox.addEventListener('change', function () {
    const newAttributes = {
      GiftOption: this.checked ? 'Yes' : 'No',
      GiftMessage: this.checked ? (giftMessageInput?.value || '') : ''
    };
    
    updateCartAttributes(newAttributes);
    toggleGiftMessage();
  });

  // Update cart when gift message changes (debounced)
  if (giftMessageInput) {
    const debouncedUpdate = debounce(function() {
      if (checkbox.checked) {
        updateCartAttributes({
          GiftOption: 'Yes',
          GiftMessage: giftMessageInput.value
        });
      }
    }, 500);

    giftMessageInput.addEventListener('input', debouncedUpdate);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGiftFeature);
} else {
  // DOM already loaded
  initGiftFeature();
}

/* ---------------------------
   Helper: merge cart attributes
---------------------------- */
async function updateCartAttributes(newAttributes, note) {
  try {
    const cart = await fetch('/cart.js').then(r => r.json());

    const mergedAttributes = {
      ...cart.attributes,
      ...newAttributes
    };

    const body = {
      attributes: mergedAttributes
    };

    if (note !== undefined) {
      body.note = note;
    }

    const response = await fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to update cart attributes');
    }

    return response;
  } catch (error) {
    console.error('Error updating cart attributes:', error);
    throw error;
  }
}