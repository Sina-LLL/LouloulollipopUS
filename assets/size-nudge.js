/* Size nudge: when the theme flags a missing size ("Choose a Size" in red), give the size buttons a short shake.
   Replays on every Add to cart click, waits until the picker is on screen, skips motion for reduced-motion users. */
(function () {
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function shake(target) {
    target.classList.remove('ll-size-nudge');
    void target.offsetWidth; // restart the animation
    target.classList.add('ll-size-nudge');
  }

  function nudge(selector) {
    if (reduce.matches) return;
    var target = selector.querySelector('.option-selector__btns, .custom-select') || selector;
    var r = target.getBoundingClientRect();
    var onScreen = r.top >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (onScreen || !('IntersectionObserver' in window)) { shake(target); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); setTimeout(function () { shake(target); }, 150); }
    }, { threshold: 0.9 });
    io.observe(target);
    setTimeout(function () { io.disconnect(); }, 3000);
  }

  function watch(picker) {
    if (picker.__llSizeNudge) return;
    picker.__llSizeNudge = true;
    new MutationObserver(function (records) {
      var hit = [];
      records.forEach(function (rec) {
        var el = rec.target;
        if (el.classList && el.classList.contains('label--contains-error')) {
          var sel = el.closest('.option-selector');
          if (sel && hit.indexOf(sel) === -1) hit.push(sel);
        }
      });
      hit.forEach(nudge);
    }).observe(picker, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function init(root) { (root || document).querySelectorAll('variant-picker').forEach(watch); }

  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'll-size-nudge') e.target.classList.remove('ll-size-nudge');
  });

  init();
  // Pickers added later (quick buy etc.)
  new MutationObserver(function (records) {
    records.forEach(function (rec) {
      rec.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches('variant-picker')) watch(n); else if (n.querySelectorAll) init(n);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
