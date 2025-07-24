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
      // Save note input with debounce
      this.addEventListener('input', this.debouncedHandleNoteChange);
    }

    handleNoteChange(evt) {
      if (this.cartNoteToggle) {
        const label = evt.target.value ? theme.strings.editCartNote : theme.strings.addCartNote;
        if (this.cartNoteToggle.textContent !== label) {
          this.cartNoteToggle.textContent = label;
        }
      }

      // Include GiftOption with the note
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
  const giftMessageWrapper = document.getElementById('GiftMessageWrapper');

  if (!checkbox) return;

  // Handle checkbox state and gift message visibility
  const toggleGiftMessage = () => {
    if (!giftMessageWrapper) return;

    if (checkbox.checked) {
      giftMessageWrapper.style.display = 'block';
    } else {
      giftMessageWrapper.style.display = 'none';
      const messageInput = document.getElementById('GiftMessage');
      if (messageInput) messageInput.value = '';
    }
  };

  // Restore checkbox state from cart
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const isGift = cart.attributes && cart.attributes.GiftOption === 'Yes';
      checkbox.checked = isGift;
      toggleGiftMessage();
    });

  // On checkbox change, update cart and toggle textarea
  checkbox.addEventListener('change', function () {
    const isGift = this.checked ? 'Yes' : 'No';
    toggleGiftMessage();

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
