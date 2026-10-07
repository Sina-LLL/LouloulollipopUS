// Video feature section: hides the video app's own title when the section's
// "Hide the video app's own title" setting is on. Novel Shoppable Video renders
// inside a shadow root, which page CSS can't reach, so the style is injected there.
(function () {
  var STYLE_ID = 'video-feature-hide-app-title';
  var CSS = '.journey-title, [class*="HeadlineColumn"] { display: none !important; }';

  function patch(container) {
    container.querySelectorAll('*').forEach(function (el) {
      var root = el.shadowRoot;
      if (root && !root.getElementById(STYLE_ID)) {
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        root.appendChild(style);
      }
    });
  }

  function init() {
    document.querySelectorAll('.video-feature--hide-app-title .video-feature__media').forEach(function (media) {
      patch(media);
      new MutationObserver(function () { patch(media); }).observe(media, { childList: true, subtree: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
