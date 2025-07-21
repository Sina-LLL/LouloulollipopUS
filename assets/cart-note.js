/* global debounce */
if (!customElements.get('cart-note')) {
  class CartNote extends HTMLElement {
    constructor() {
      super();
      this.disclosure = this.closest('details');

      if (this.disclosure && this.disclosure.matches('.cart-note-disclosure')) {
        this.cartNoteToggle = this.disclosure.querySelector('.js-show-note');
      }

      this.fetchRequestOpts = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      };

      this.init();
    }

      init() {
        this.debouncedHandleNoteChange = debounce(this.handleNoteChange.bind(this), 300);
        // Save as soon as possible, avoid link-click not providing time to save
        this.addEventListener('input', this.debouncedHandleNoteChange);
      }

     handleNoteChange(evt) {
      if (this.cartNoteToggle) {
        const label = evt.target.value ? theme.strings.editCartNote : theme.strings.addCartNote;
        if (this.cartNoteToggle.textContent !== label) {
          this.cartNoteToggle.textContent = label;
        }
      }
    
      // Read the gift checkbox
      const isGiftChecked = document.getElementById('GiftCheckbox')?.checked;
      const giftValue = isGiftChecked ? 'Yes' : 'No';
    
      this.fetchRequestOpts.body = JSON.stringify({
        note: evt.target.value,
        attributes: {
          GiftOption: giftValue
        }
      });
    
      fetch(theme.routes.cartUpdate, this.fetchRequestOpts);
    }

  }

  customElements.define('cart-note', CartNote);
}

document.addEventListener('DOMContentLoaded', function () {
  const checkbox = document.getElementById('GiftCheckbox');
  if (!checkbox) return;

  checkbox.addEventListener('change', function () {
    const isGift = this.checked ? 'Yes' : 'No';

    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        attributes: {
          GiftOption: isGift
        }
      })
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const checkbox = document.getElementById('GiftCheckbox');
  const giftMessageWrapper = document.getElementById('GiftMessageWrapper');

  if (!checkbox) return;

  // Show/hide the gift message textarea
  const toggleGiftMessage = () => {
    if (checkbox.checked) {
      giftMessageWrapper.style.display = 'block';
    } else {
      giftMessageWrapper.style.display = 'none';
      // Optionally clear gift message if unchecked
      const messageInput = document.getElementById('GiftMessage');
      if (messageInput) messageInput.value = '';
    }
  };

  checkbox.addEventListener('change', function () {
    const isGift = this.checked ? 'Yes' : 'No';

    // Toggle textarea visibility
    toggleGiftMessage();

    // Update gift option on cart
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        attributes: {
          GiftOption: isGift
        }
      })
    });
  });

  // On load, show/hide gift message based on current checkbox state
  toggleGiftMessage();
});


