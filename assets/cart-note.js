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

document.addEventListener('DOMContentLoaded', function () {
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
    });

  // Update cart when checkbox changes
  checkbox.addEventListener('change', function () {
    updateCartAttributes({
      GiftOption: this.checked ? 'Yes' : 'No',
      GiftMessage: giftMessageInput?.value || ''
    });
    toggleGiftMessage();
  });

  // Update cart when gift message changes
  if (giftMessageInput) {
    giftMessageInput.addEventListener('input', function () {
      updateCartAttributes({
        GiftOption: checkbox.checked ? 'Yes' : 'No',
        GiftMessage: this.value
      });
    });
  }
});

/* ---------------------------
   Helper: merge cart attributes
---------------------------- */
async function updateCartAttributes(newAttributes, note) {
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

  return fetch('/cart/update.js', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}
